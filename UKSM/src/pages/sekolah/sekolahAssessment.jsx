import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { Activity, CheckCircle, Clock, Upload, Link as LinkIcon, ChevronDown, ChevronUp, Lock, Pencil } from "lucide-react";
import {
    getSekolahLevelsApi,
    getPertanyaanLevelApi,
    saveJawabanApi,
    submitFinalLevelApi,
    uploadBuktiApi,
} from "../../api/sekolah";
import { useToast } from "../../components/Toast";

export default function SekolahAssessment() {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [levels, setLevels] = useState([]);
    const [openLevel, setOpenLevel] = useState(null);
    const [pertanyaan, setPertanyaan] = useState({});
    const [jawaban, setJawaban] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingPert, setLoadingPert] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [linkInput, setLinkInput] = useState({});
    // Track which submitted levels are being edited/revised
    const [editingLevels, setEditingLevels] = useState({});

    // Fetch semua levels + status
    const fetchLevels = useCallback(() => {
        setLoading(true);
        getSekolahLevelsApi()
            .then(res => {
                const list = res.data?.data ?? res.data ?? [];
                setLevels(Array.isArray(list) ? list : []);
                // Buka level pertama yang belum disubmit secara permanen
                const firstOpen = (Array.isArray(list) ? list : []).find(l => l.status !== "submitted" && l.status !== "verified" && l.status !== "final");
                if (firstOpen) setOpenLevel(firstOpen.id);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchLevels(); }, [fetchLevels]);

    // Apakah level sedang dalam mode edit
    function isEditing(levelId) {
        return !!editingLevels[levelId];
    }

    // Toggle mode edit untuk level yang sudah disubmit
    function handleStartEdit(levelId) {
        setEditingLevels(prev => ({ ...prev, [levelId]: true }));
        setOpenLevel(levelId);
    }

    function handleCancelEdit(levelId) {
        setEditingLevels(prev => ({ ...prev, [levelId]: false }));
    }

    // Fetch pertanyaan per level (on demand)
    async function handleOpenLevel(level) {
        const isSubmitted = level.status === "submitted" || level.status === "verified" || level.status === "final";
        if (level.status === "locked") {
            showToast("Selesaikan level sebelumnya terlebih dahulu untuk membuka level ini.", "error");
            return;
        }
        const id = level.id;
        setOpenLevel(prev => prev === id ? null : id);
        if (pertanyaan[id]) return; // already loaded
        setLoadingPert(true);
        try {
            const res = await getPertanyaanLevelApi(id);
            const list = res.data?.pertanyaans ?? res.data?.data ?? res.data ?? [];
            const pertList = Array.isArray(list) ? list : [];
            const jawabanMap = {};

            pertList.forEach(p => {
                const j = p.jawabans?.[0]; // Ambil jawaban pertama (seharusnya hanya ada 1 per periode)
                if (j) {
                    // Map jawaban_teks ('ya'/'tidak') ke boolean memenuhi
                    const isMemenuhi = j.jawaban_teks === "ya";

                    // Map file_path (JSON string) ke array bukti_links
                    let links = [];
                    if (j.file_path) {
                        try {
                            const parsed = JSON.parse(j.file_path);
                            links = Array.isArray(parsed) ? parsed : [j.file_path];
                        } catch (err) {
                            links = [j.file_path];
                        }
                    }

                    jawabanMap[`${id}_${p.id}`] = {
                        memenuhi: isMemenuhi,
                        bukti_links: links,
                        bukti_files: [],
                    };
                }
            });

            setPertanyaan(prev => ({ ...prev, [id]: pertList }));
            setJawaban(prev => ({ ...prev, ...jawabanMap }));
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingPert(false);
        }
    }

    function getJawaban(levelId, pertId) {
        return jawaban[`${levelId}_${pertId}`] || { memenuhi: null, bukti_links: [], bukti_files: [] };
    }

    function setMemenuhi(levelId, pertId, val) {
        const key = `${levelId}_${pertId}`;
        setJawaban(prev => ({
            ...prev,
            [key]: { ...getJawaban(levelId, pertId), memenuhi: val },
        }));
    }

    function addLink(levelId, pertId) {
        const k = `${levelId}_${pertId}`;
        const link = (linkInput[k] || "").trim();
        if (!link) return;
        if (!link.startsWith("http")) { showToast("Link harus diawali https://", "error"); return; }

        // Batasi maksimal 1 bukti
        if (getJawaban(levelId, pertId).bukti_links.length >= 1) {
            showToast("Hanya diperbolehkan memasukkan 1 file bukti atau 1 link gdrive.", "error");
            return;
        }

        setJawaban(prev => ({
            ...prev,
            [k]: { ...getJawaban(levelId, pertId), bukti_links: [...getJawaban(levelId, pertId).bukti_links, link] },
        }));
        setLinkInput(prev => ({ ...prev, [k]: "" }));
    }

    function removeLink(levelId, pertId, idx) {
        const k = `${levelId}_${pertId}`;
        const j = getJawaban(levelId, pertId);
        setJawaban(prev => ({ ...prev, [k]: { ...j, bukti_links: j.bukti_links.filter((_, i) => i !== idx) } }));
    }

    async function handleFileUpload(e, levelId, pertId) {
        const file = e.target.files[0];
        if (!file) return;

        // Batasi file ke 1 item bukti saja
        if (getJawaban(levelId, pertId).bukti_links.length >= 1) {
            showToast("Hanya diperbolehkan memasukkan 1 file bukti atau 1 link gdrive.", "error");
            return;
        }

        if (!["image/jpeg", "image/png", "image/jpg", "application/pdf"].includes(file.type)) {
            showToast("Hanya JPG, PNG, atau PDF", "error"); return;
        }
        if (file.size > 1 * 1024 * 1024) { showToast("File Max 1MB", "error"); return; }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("pertanyaan_id", pertId);
        formData.append("level_id", levelId);

        try {
            const res = await uploadBuktiApi(formData);
            const url = res.data?.url || res.url;
            if (url) {
                const k = `${levelId}_${pertId}`;
                setJawaban(prev => {
                    const j = getJawaban(levelId, pertId);
                    return { ...prev, [k]: { ...j, bukti_links: [...j.bukti_links, url] } };
                });
                showToast("File berhasil diupload");
            }
        } catch (err) {
            showToast("Gagal upload file", "error");
        }
    }

    // Cek apakah semua pertanyaan di level sudah dijawab (memenuhi tidak null)
    // Bukti TIDAK wajib
    function isTierComplete(levelId) {
        const perts = pertanyaan[levelId] || [];
        return perts.length > 0 && perts.every(p => {
            const j = getJawaban(levelId, p.id);
            return j.memenuhi !== null && j.memenuhi !== undefined;
        });
    }

    // Bangun array jawabans dari state
    function buildJawabans(levelId) {
        const perts = pertanyaan[levelId] || [];
        return perts.map(p => {
            const j = getJawaban(levelId, p.id);
            return { pertanyaan_id: p.id, memenuhi: j.memenuhi, bukti_links: j.bukti_links || [] };
        });
    }

    // Simpan jawaban saja (tidak mengunci level)
    async function handleSaveLevel(level) {
        if (!isTierComplete(level.id)) {
            showToast("Pilih Memenuhi atau Belum untuk setiap pertanyaan", "error");
            return;
        }
        setSaving(true);
        try {
            await saveJawabanApi(level.id, buildJawabans(level.id));
            showToast(`Jawaban Level ${level.nama || level.name} berhasil disimpan!`);
            fetchLevels(); // Refresh status to 'submitted'
        } catch (err) {
            showToast(err?.response?.data?.message || "Gagal menyimpan jawaban", "error");
        } finally {
            setSaving(false);
        }
    }

    // Simpan + Submit Final (mengunci level)
    async function handleSubmitLevel(level) {
        if (!isTierComplete(level.id)) {
            showToast("Pilih Memenuhi atau Belum untuk setiap pertanyaan", "error");
            return;
        }
        setSubmitting(true);
        try {
            await saveJawabanApi(level.id, buildJawabans(level.id));
            await submitFinalLevelApi(level.id);
            showToast(`Level ${level.nama || level.name} berhasil disubmit & dikunci!`);
            setEditingLevels(prev => ({ ...prev, [level.id]: false }));
            fetchLevels();
            setOpenLevel(null);
        } catch (err) {
            showToast(err?.response?.data?.message || "Gagal submit level", "error");
        } finally {
            setSubmitting(false);
        }
    }

    // Hitung total progress
    const totalLevels = levels.length;
    const doneLevels = levels.filter(l => l.status === "submitted" || l.status === "verified" || l.status === "final").length;
    const totalPerts = Object.values(pertanyaan).flat().length;
    const answeredPerts = Object.keys(jawaban).filter(k => jawaban[k].memenuhi !== null && jawaban[k].memenuhi !== undefined).length;

    if (loading) return <LoadingSpinner />;

    return (
        <div style={{ minHeight: "100vh" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px 40px" }}>
                {/* HERO */}
                <div style={heroCard}>
                    <div>
                        <div style={heroTitle}>Self Assessment</div>
                        <div style={heroSubtitle}>Progres Penilaian UKS Sekolah</div>
                    </div>
                    <div style={heroStatsWrap}>
                        <div style={dashboardCard}>
                            <div style={{ ...iconWrap, background: "#E8F7F0", color: "#1D9E75" }}><Activity size={24} /></div>
                            <div>
                                <div style={cardLabel}>Status</div>
                                <div style={cardValue}>{doneLevels === totalLevels && totalLevels > 0 ? "Selesai" : "Proses"}</div>
                            </div>
                        </div>
                        <div style={dashboardCard}>
                            <div style={{ ...iconWrap, background: "#EAF2FD", color: "#185FA5" }}><CheckCircle size={24} /></div>
                            <div>
                                <div style={cardLabel}>Level Selesai</div>
                                <div style={cardValue}>{doneLevels}/{totalLevels}</div>
                            </div>
                        </div>
                        <div style={dashboardCard}>
                            <div style={{ ...iconWrap, background: "#FFF4E5", color: "#f59e0b" }}><Clock size={24} /></div>
                            <div>
                                <div style={cardLabel}>Jawaban Terisi</div>
                                <div style={cardValue}>{answeredPerts}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LEVEL LIST */}
                {levels.map((level, idx) => {
                    const isLocked = level.status === "locked";
                    const isFinalOrVerified = level.status === "final" || level.status === "verified";
                    const isSubmitted = level.status === "submitted" || isFinalOrVerified;

                    const isOpen = openLevel === level.id;
                    const editing = isEditing(level.id);
                    const isReadOnly = isFinalOrVerified && !editing;
                    const complete = isTierComplete(level.id);
                    const perts = pertanyaan[level.id] || [];

                    return (
                        <div key={level.id} style={{ ...tierCard, opacity: isLocked ? 0.5 : 1, marginBottom: "16px" }}>
                            {/* HEADER */}
                            <div
                                onClick={() => !isLocked && handleOpenLevel(level)}
                                style={{ ...tierHeader, cursor: isLocked ? "not-allowed" : "pointer" }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    {isLocked && <Lock size={16} color="var(--text-muted)" />}
                                    <div style={{ background: isSubmitted ? (isFinalOrVerified ? "#DCFCE7" : "#DBEAFE") : "#EEF2FF", color: isSubmitted ? (isFinalOrVerified ? "#16A34A" : "#1D4ED8") : "#4338CA", padding: "5px 12px", borderRadius: 999, fontWeight: 700, fontSize: 12 }}>
                                        {idx + 1}. {level.nama || level.name}
                                    </div>
                                    {level.status === "submitted" && <span style={{ color: "#1D4ED8", fontSize: 12, fontWeight: 600 }}>✓ Draft Tersimpan (Bisa Edit)</span>}
                                    {isFinalOrVerified && !editing && <span style={{ color: "#16A34A", fontSize: 12, fontWeight: 600 }}>🔒 Terkunci (Selesai)</span>}
                                    {editing && <span style={{ color: "#D97706", fontSize: 12, fontWeight: 600 }}>✏️ Mode Revisi</span>}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {/* Tombol Revisi hanya untuk level yang sudah DIKUNCI (final/verified) */}
                                    {isFinalOrVerified && !editing && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleStartEdit(level.id); }}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 5,
                                                background: "#FEF3C7", color: "#D97706",
                                                border: "1px solid #FCD34D", borderRadius: 10,
                                                padding: "5px 12px", fontSize: 12, fontWeight: 600,
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Pencil size={13} /> Revisi
                                        </button>
                                    )}
                                    {editing && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleCancelEdit(level.id); setOpenLevel(null); }}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 5,
                                                background: "#FEE2E2", color: "#DC2626",
                                                border: "1px solid #FECACA", borderRadius: 10,
                                                padding: "5px 12px", fontSize: 12, fontWeight: 600,
                                                cursor: "pointer",
                                            }}
                                        >
                                            Batal Edit
                                        </button>
                                    )}
                                    <div style={{ color: "var(--text-muted)" }}>
                                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                            </div>

                            {/* QUESTIONS */}
                            {isOpen && !isLocked && (
                                <div style={{ padding: "0 8px 8px" }}>
                                    {isReadOnly && perts.length > 0 && (
                                        <div style={{ padding: "12px 22px", background: "#F0FDF4", borderBottom: "1px solid var(--border)", fontSize: 13, color: "#15803D", display: "flex", alignItems: "center", gap: 8 }}>
                                            <CheckCircle size={14} /> Jawaban sudah disubmit. Klik tombol <strong>Revisi</strong> untuk mengubah.
                                        </div>
                                    )}
                                    {loadingPert && perts.length === 0 && (
                                        <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>Memuat pertanyaan...</div>
                                    )}
                                    {perts.map((q, i) => {
                                        const j = getJawaban(level.id, q.id);
                                        const key = `${level.id}_${q.id}`;

                                        return (
                                            <div key={q.id} style={questionCard}>
                                                <div style={questionText}>
                                                    {i + 1}. {q.pertanyaan || q.teks || q.text}
                                                </div>

                                                {/* TOMBOL YA/TIDAK */}
                                                <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                                                    <button
                                                        onClick={() => !isReadOnly && setMemenuhi(level.id, q.id, true)}
                                                        style={toggleBtn(j.memenuhi === true, "#1D9E75", "#E1F5EE")}
                                                        disabled={isReadOnly}
                                                    >
                                                        ✓ Memenuhi
                                                    </button>
                                                    <button
                                                        onClick={() => !isReadOnly && setMemenuhi(level.id, q.id, false)}
                                                        style={toggleBtn(j.memenuhi === false, "#E24B4A", "#FCEBEB")}
                                                        disabled={isReadOnly}
                                                    >
                                                        ✕ Belum
                                                    </button>
                                                </div>

                                                {/* BUKTI - opsional, tampil saat tidak readonly */}
                                                {!isReadOnly && (
                                                    <div style={evidenceBox}>
                                                        <div style={evidenceTitle}>Bukti Dukung <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(opsional)</span></div>

                                                        {/* Links yang sudah ditambahkan */}
                                                        {j.bukti_links.map((l, li) => (
                                                            <div key={li} style={fileItem}>
                                                                <a href={l} target="_blank" rel="noreferrer" style={{ color: "#185FA5", fontSize: 13 }}>{l}</a>
                                                                <button onClick={() => removeLink(level.id, q.id, li)} style={removeBtn}>×</button>
                                                            </div>
                                                        ))}

                                                        {/* Upload File */}
                                                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 8 }}>
                                                            <div style={{ background: "#EAF2FD", color: "#185FA5", padding: "7px 14px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                                                                <Upload size={14} /> Upload File
                                                            </div>
                                                            <input type="file" hidden accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileUpload(e, level.id, q.id)} />
                                                        </label>

                                                        {/* Tambah Link */}
                                                        <div style={{ display: "flex", gap: 8 }}>
                                                            <input
                                                                type="url"
                                                                placeholder="Tambah link bukti... (opsional)"
                                                                value={linkInput[key] || ""}
                                                                onChange={(e) => setLinkInput(prev => ({ ...prev, [key]: e.target.value }))}
                                                                style={{ flex: 1, borderRadius: 10, border: "1px solid #e5e7eb", padding: "8px 12px", fontSize: 13, outline: "none" }}
                                                            />
                                                            <button onClick={() => addLink(level.id, q.id)} style={{ background: "#185FA5", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>
                                                                <LinkIcon size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Tampilkan bukti yang ada saat readonly */}
                                                {isReadOnly && j.bukti_links.length > 0 && (
                                                    <div style={{ ...evidenceBox, background: "#F9FAFB" }}>
                                                        <div style={evidenceTitle}>Bukti Dukung</div>
                                                        {j.bukti_links.map((l, li) => (
                                                            <div key={li} style={fileItem}>
                                                                <a href={l} target="_blank" rel="noreferrer" style={{ color: "#185FA5", fontSize: 13 }}>{l}</a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* TOMBOL AKSI */}
                                    {!isReadOnly && perts.length > 0 && (
                                        <div style={{ padding: "16px 0 8px", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                                            {/* Simpan Jawaban (tanpa kunci - tidak perlu bukti) */}
                                            <button
                                                onClick={() => handleSaveLevel(level)}
                                                disabled={saving || submitting || !complete}
                                                style={{
                                                    background: complete ? "#EAF2FD" : "#e5e7eb",
                                                    color: complete ? "#185FA5" : "#9ca3af",
                                                    border: `2px solid ${complete ? "#185FA5" : "#e5e7eb"}`,
                                                    borderRadius: 14, padding: "12px 24px",
                                                    fontWeight: 700, fontSize: 14,
                                                    cursor: complete && !saving && !submitting ? "pointer" : "not-allowed",
                                                    opacity: saving ? 0.7 : 1,
                                                    transition: "0.3s",
                                                }}
                                            >
                                                {saving ? "Menyimpan..." : "💾 Simpan Jawaban"}
                                            </button>
                                            {/* Submit & Kunci (memerlukan validasi backend) */}
                                            <button
                                                onClick={() => handleSubmitLevel(level)}
                                                disabled={submitting || saving || !complete}
                                                style={{
                                                    background: complete ? "linear-gradient(135deg,#1D9E75,#185FA5)" : "#e5e7eb",
                                                    color: complete ? "white" : "#9ca3af",
                                                    border: "none", borderRadius: 14, padding: "12px 24px",
                                                    fontWeight: 700, fontSize: 14,
                                                    cursor: complete && !submitting && !saving ? "pointer" : "not-allowed",
                                                    opacity: submitting ? 0.7 : 1,
                                                    transition: "0.3s",
                                                }}
                                            >
                                                {submitting
                                                    ? "Mengunci..."
                                                    : editing
                                                        ? `🔒 Simpan & Kunci Level ${level.nama || level.name}`
                                                        : `🔒 Submit & Kunci Level ${level.nama || level.name}`
                                                }
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px" }}>
            <div style={{ width: 44, height: 44, border: "3px solid #e5e7eb", borderTop: "3px solid var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ── styles ──
const heroCard = { background: "linear-gradient(135deg, #042C53 0%, #0F6E56 100%)", borderRadius: 24, padding: "28px 32px", color: "white", marginBottom: 28, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20 };
const heroTitle = { fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, marginBottom: 4 };
const heroSubtitle = { opacity: 0.8, fontSize: 15 };
const heroStatsWrap = { display: "flex", gap: 14, flexWrap: "wrap" };
const dashboardCard = { background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", borderRadius: 16, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, minWidth: 130 };
const iconWrap = { width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const cardLabel = { fontSize: 12, opacity: 0.75, marginBottom: 2 };
const cardValue = { fontSize: 20, fontWeight: 800 };
const tierCard = { background: "var(--card-bg)", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden" };
const tierHeader = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", userSelect: "none" };
const questionCard = { padding: "18px 22px", borderTop: "1px solid var(--border)" };
const questionText = { fontSize: 14, fontWeight: 600, lineHeight: 1.6, marginBottom: 14, color: "var(--text-main)" };
const evidenceBox = { background: "var(--bg-light)", borderRadius: 12, padding: "14px 16px", marginTop: 4, display: "flex", flexDirection: "column", gap: 8 };
const evidenceTitle = { fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 };
const fileItem = { display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", borderRadius: 8, padding: "8px 10px", fontSize: 13 };
const removeBtn = { background: "none", border: "none", cursor: "pointer", color: "#E24B4A", fontWeight: 700, fontSize: 16, padding: "0 4px" };
const toggleBtn = (active, color, bg) => ({
    padding: "9px 20px", borderRadius: 10, border: `2px solid ${active ? color : "#e5e7eb"}`,
    background: active ? bg : "white", color: active ? color : "#9ca3af",
    fontWeight: active ? 700 : 600, fontSize: 14, cursor: "pointer", transition: "0.2s",
});