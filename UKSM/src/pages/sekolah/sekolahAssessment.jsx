import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { Activity, CheckCircle, Clock, Upload, Link as LinkIcon, ChevronDown, ChevronUp, Lock, Pencil, AlertTriangle } from "lucide-react";
import {
    getSekolahLevelsApi,
    getPertanyaanLevelApi,
    saveJawabanApi,
    submitFinalLevelApi,
    uploadBuktiApi,
} from "../../api/sekolah";
import { useToast } from "../../components/Toast";
import { validateFile } from "../../utils/fileValidation";

export default function SekolahAssessment() {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [levels, setLevels] = useState([]);
    const [openLevel, setOpenLevel] = useState(null);
    const [pertanyaan, setPertanyaan] = useState({});
    const [jawaban, setJawaban] = useState({});
    const [periodInfo, setPeriodInfo] = useState(null);
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
                const raw = res.data?.data ?? res.data ?? [];
                const list = (Array.isArray(raw) ? raw : []).slice().sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0));
                setLevels(list);

                if (res.data?.period) {
                    setPeriodInfo(res.data.period);
                }

                // Buka level yang punya soal ditolak (draft) atau level pertama yang belum selesai
                const firstRejected = list.find(l => l.status === "draft");
                const firstOpen = firstRejected || list.find(l => l.status !== "submitted" && l.status !== "verified" && l.status !== "final");
                if (firstRejected || firstOpen) setOpenLevel((firstRejected || firstOpen).id);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchLevels(); }, [fetchLevels]);

    // Apakah level sedang dalam mode edit
    function isEditing(levelId) {
        return !!editingLevels[levelId];
    }

    function handleStartEdit(levelId) {
        setEditingLevels(prev => ({ ...prev, [levelId]: true }));
        setOpenLevel(levelId);
    }

    function handleCancelEdit(levelId) {
        setEditingLevels(prev => ({ ...prev, [levelId]: false }));
    }

    // Fetch pertanyaan per level (on demand)
    async function handleOpenLevel(level) {
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
                const j = p.jawabans?.[0];
                if (j) {
                    const isMemenuhi = j.jawaban_teks === "ya";
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
                        is_final: !!j.is_final,
                        is_rejected: !!j.is_rejected,
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
        return jawaban[`${levelId}_${pertId}`] || { memenuhi: null, bukti_links: [], bukti_files: [], is_final: false, is_rejected: false };
    }

    /**
     * A question is editable if:
     *  - Level is in draft (has rejections) and this specific question is rejected
     *  - OR level is not final/verified at all (normal filling mode)
     *  - OR user clicked "Revisi" (editingLevels)
     *  - AND deadline not passed
     */
    function isQuestionReadOnly(level, pertId, editing) {
        const j = getJawaban(level.id, pertId);
        const isFinalOrVerified = level.status === "final" || level.status === "verified";
        const isDeadlinePassed = !!periodInfo?.is_deadline_passed;

        if (isDeadlinePassed) return true;

        // Draft mode = some questions rejected by admin
        if (level.status === "draft") {
            // If this question was approved (is_final=true, is_rejected=false), lock it
            if (j.is_final && !j.is_rejected) return true;
            // If this question was rejected, allow editing
            return false;
        }

        // For final/verified, lock unless editing
        if (isFinalOrVerified && !editing) return true;

        return false;
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

        if (getJawaban(levelId, pertId).bukti_links.length >= 1) {
            showToast("Hanya diperbolehkan memasukkan 1 file bukti atau 1 link gdrive.", "error");
            return;
        }

        const validation = await validateFile(file, ['jpg', 'png', 'pdf'], 1);
        if (!validation.valid) {
            showToast(validation.error, "error");
            return;
        }

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
            showToast(err?.response?.data?.message || "Gagal upload file", "error");
        }
    }

    /**
     * Check completeness:
     * - In draft mode: only check rejected questions
     * - In normal mode: check all questions
     */
    function isTierComplete(levelId, level) {
        const perts = pertanyaan[levelId] || [];
        if (perts.length === 0) return false;

        if (level?.status === "draft") {
            // Only require rejected questions to be answered
            const rejectedPerts = perts.filter(p => {
                const j = getJawaban(levelId, p.id);
                return j.is_rejected;
            });
            if (rejectedPerts.length === 0) {
                // No specific rejections found in state yet, require all
                return perts.every(p => {
                    const j = getJawaban(levelId, p.id);
                    return j.memenuhi !== null && j.memenuhi !== undefined;
                });
            }
            return rejectedPerts.every(p => {
                const j = getJawaban(levelId, p.id);
                return j.memenuhi !== null && j.memenuhi !== undefined;
            });
        }

        return perts.every(p => {
            const j = getJawaban(levelId, p.id);
            return j.memenuhi !== null && j.memenuhi !== undefined;
        });
    }

    // Build jawabans – in draft mode only send the rejected (editable) ones
    function buildJawabans(levelId, level) {
        const perts = pertanyaan[levelId] || [];

        if (level?.status === "draft") {
            // Only include questions that are rejected (editable)
            const editablePerts = perts.filter(p => {
                const j = getJawaban(levelId, p.id);
                return j.is_rejected || !j.is_final;
            });
            return editablePerts.map(p => {
                const j = getJawaban(levelId, p.id);
                return { pertanyaan_id: p.id, memenuhi: j.memenuhi, bukti_links: j.bukti_links || [] };
            });
        }

        return perts.map(p => {
            const j = getJawaban(levelId, p.id);
            return { pertanyaan_id: p.id, memenuhi: j.memenuhi, bukti_links: j.bukti_links || [] };
        });
    }

    // Simpan jawaban saja (tidak mengunci level)
    async function handleSaveLevel(level) {
        if (!isTierComplete(level.id, level)) {
            showToast("Pilih Memenuhi atau Belum untuk setiap pertanyaan yang ditolak", "error");
            return;
        }
        setSaving(true);
        try {
            await saveJawabanApi(level.id, buildJawabans(level.id, level));
            showToast(`Jawaban Level ${level.nama || level.name} berhasil disimpan!`);
            fetchLevels();
        } catch (err) {
            showToast(err?.response?.data?.message || "Gagal menyimpan jawaban", "error");
        } finally {
            setSaving(false);
        }
    }

    // Simpan + Submit Final (mengunci level)
    async function handleSubmitLevel(level) {
        if (!isTierComplete(level.id, level)) {
            showToast("Pilih Memenuhi atau Belum untuk setiap pertanyaan yang ditolak", "error");
            return;
        }
        setSubmitting(true);
        try {
            await saveJawabanApi(level.id, buildJawabans(level.id, level));
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
                    const isDraft = level.status === "draft";

                    const isOpen = openLevel === level.id;
                    const editing = isEditing(level.id);
                    const isDeadlinePassed = !!periodInfo?.is_deadline_passed;
                    const perts = pertanyaan[level.id] || [];

                    // Count rejected questions from current jawaban state
                    const rejectedPerts = perts.filter(p => {
                        const j = getJawaban(level.id, p.id);
                        return j.is_rejected;
                    });
                    const hasRejections = rejectedPerts.length > 0;

                    const complete = isTierComplete(level.id, level);

                    return (
                        <div key={level.id} style={{
                            ...tierCard,
                            opacity: isLocked ? 0.5 : 1,
                            marginBottom: "16px",
                            border: isDraft && hasRejections ? "1.5px solid #FCA5A5" : "1px solid var(--border)",
                        }}>
                            {/* HEADER */}
                            <div
                                onClick={() => !isLocked && handleOpenLevel(level)}
                                style={{ ...tierHeader, cursor: isLocked ? "not-allowed" : "pointer" }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    {isLocked && <Lock size={16} color="var(--text-muted)" />}
                                    <div style={{
                                        background: isSubmitted ? (isFinalOrVerified ? "#DCFCE7" : "#DBEAFE") : isDraft ? "#FEE2E2" : "#EEF2FF",
                                        color: isSubmitted ? (isFinalOrVerified ? "#16A34A" : "#1D4ED8") : isDraft ? "#B91C1C" : "#4338CA",
                                        padding: "5px 12px", borderRadius: 999, fontWeight: 700, fontSize: 12,
                                    }}>
                                        {idx + 1}. {level.nama || level.name}
                                    </div>
                                    {level.status === "submitted" && <span style={{ color: "#1D4ED8", fontSize: 12, fontWeight: 600 }}>✓ Draft Tersimpan (Bisa Edit)</span>}
                                    {isFinalOrVerified && !editing && <span style={{ color: "#16A34A", fontSize: 12, fontWeight: 600 }}>🔒 Terkunci (Selesai)</span>}
                                    {editing && <span style={{ color: "#D97706", fontSize: 12, fontWeight: 600 }}>✏️ Mode Revisi</span>}

                                    {/* Rejection notice */}
                                    {isDraft && hasRejections && (
                                        <span style={{
                                            display: "flex", alignItems: "center", gap: 4,
                                            background: "#FEE2E2", color: "#B91C1C",
                                            padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                                        }}>
                                            <AlertTriangle size={12} />
                                            {rejectedPerts.length} Soal Ditolak Admin
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                                    {/* Rejection notice banner */}
                                    {isDraft && hasRejections && perts.length > 0 && (
                                        <div style={{
                                            padding: "12px 22px",
                                            background: "#FEF2F2",
                                            borderBottom: "1px solid #FECACA",
                                            fontSize: 13, color: "#B91C1C",
                                            display: "flex", alignItems: "flex-start", gap: 8,
                                        }}>
                                            <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                                            <div>
                                                <strong>Admin menolak {rejectedPerts.length} soal.</strong> Soal yang ditolak ditandai dengan garis merah di sebelah kiri. Isi ulang soal tersebut, lalu klik <strong>Submit &amp; Kunci</strong>.
                                                Soal yang tidak ditolak (dikunci admin) tidak dapat diubah.
                                            </div>
                                        </div>
                                    )}

                                    {isFinalOrVerified && !editing && perts.length > 0 && (
                                        <div style={{ padding: "12px 22px", background: "#F0FDF4", borderBottom: "1px solid var(--border)", fontSize: 13, color: "#15803D", display: "flex", alignItems: "center", gap: 8 }}>
                                            <CheckCircle size={14} /> Jawaban sudah disubmit. Klik tombol <strong>Revisi</strong> untuk mengubah.
                                        </div>
                                    )}
                                    {!!periodInfo?.is_deadline_passed && (
                                        <div style={{ padding: "12px 22px", background: "#FEF2F2", borderBottom: "1px solid var(--border)", fontSize: 13, color: "#991B1B", display: "flex", alignItems: "center", gap: 8 }}>
                                            <Activity size={14} /> Batas waktu assessment telah berakhir pada {new Date(periodInfo.tanggal_selesai).toLocaleDateString("id-ID")}. Anda hanya dapat melihat jawaban.
                                        </div>
                                    )}
                                    {loadingPert && perts.length === 0 && (
                                        <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>Memuat pertanyaan...</div>
                                    )}

                                    {perts.map((q, i) => {
                                        const j = getJawaban(level.id, q.id);
                                        const key = `${level.id}_${q.id}`;
                                        const isReadOnly = isQuestionReadOnly(level, q.id, editing) || isDeadlinePassed;
                                        const isRejected = j.is_rejected;

                                        return (
                                            <div
                                                key={q.id}
                                                style={{
                                                    ...questionCard,
                                                    background: isRejected
                                                        ? "#FFF5F5"
                                                        : "transparent",
                                                    borderLeft: isRejected
                                                        ? "3px solid #F87171"
                                                        : j.is_final && !isRejected && isDraft
                                                            ? "3px solid #86EFAC"
                                                            : "3px solid transparent",
                                                    paddingLeft: 20,
                                                    transition: "background 0.2s",
                                                }}
                                            >
                                                {/* Rejection warning per question */}
                                                {isRejected && !isReadOnly && (
                                                    <div style={{
                                                        display: "flex", alignItems: "center", gap: 6,
                                                        background: "#FEE2E2", borderRadius: 8,
                                                        padding: "6px 12px", marginBottom: 10,
                                                        fontSize: 12, color: "#B91C1C", fontWeight: 600,
                                                    }}>
                                                        <AlertTriangle size={13} />
                                                        Jawaban ini ditolak admin. Silakan isi ulang.
                                                    </div>
                                                )}

                                                {/* Locked (approved by admin) info */}
                                                {j.is_final && !isRejected && isDraft && (
                                                    <div style={{
                                                        display: "flex", alignItems: "center", gap: 6,
                                                        background: "#F0FDF4", borderRadius: 8,
                                                        padding: "6px 12px", marginBottom: 10,
                                                        fontSize: 12, color: "#15803D", fontWeight: 600,
                                                    }}>
                                                        <Lock size={12} />
                                                        Dikunci oleh admin (jawaban ini disetujui).
                                                    </div>
                                                )}

                                                <div style={questionText}>
                                                    {i + 1}. {q.teks_pertanyaan || q.pertanyaan || q.teks || q.text}
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

                                                        {j.bukti_links.map((l, li) => (
                                                            <div key={li} style={fileItem}>
                                                                <a href={l} target="_blank" rel="noreferrer" style={{ color: "#185FA5", fontSize: 13 }}>{l}</a>
                                                                <button onClick={() => removeLink(level.id, q.id, li)} style={removeBtn}>×</button>
                                                            </div>
                                                        ))}

                                                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 8 }}>
                                                            <div style={{ background: "#EAF2FD", color: "#185FA5", padding: "7px 14px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                                                                <Upload size={14} /> Upload File
                                                            </div>
                                                            <input type="file" hidden accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileUpload(e, level.id, q.id)} />
                                                        </label>

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
                                    {perts.length > 0 && !periodInfo?.is_deadline_passed && (
                                        <>
                                            {/* Draft mode (partial rejection) */}
                                            {isDraft && hasRejections && (
                                                <div style={{ padding: "16px 0 8px", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
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
                                                        {submitting ? "Mengunci..." : `🔒 Submit & Kunci Level ${level.nama || level.name}`}
                                                    </button>
                                                </div>
                                            )}

                                            {/* Normal mode (not draft or no rejections) */}
                                            {!isDraft && !isFinalOrVerified && (
                                                <div style={{ padding: "16px 0 8px", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
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
                                                            : `🔒 Submit & Kunci Level ${level.nama || level.name}`}
                                                    </button>
                                                </div>
                                            )}

                                            {/* Editing (revisi) mode */}
                                            {editing && (
                                                <div style={{ padding: "16px 0 8px", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
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
                                                        {submitting ? "Mengunci..." : `🔒 Simpan & Kunci Level ${level.nama || level.name}`}
                                                    </button>
                                                </div>
                                            )}
                                        </>
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