import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, School, CheckCircle2, XCircle, Award,
    AlertTriangle, ChevronDown, ChevronUp,
    ExternalLink, RefreshCw, FileText, Upload
} from "lucide-react";
import {
    getSuperadminCertificateDetailApi,
    issueSuperadminCertificateApi,
    rejectSuperadminCertificateApi
} from "../../api/admin";

const getLevelStatus = (status) => {
    const map = {
        verified: { label: "Terverifikasi", bg: "#DCFCE7", color: "#15803D" },
        final: { label: "Menunggu Verifikasi", bg: "#FEF3C7", color: "#B45309" },
        draft: { label: "Draft", bg: "#F3F4F6", color: "#6B7280" },
    };
    return map[status] ?? { label: status ?? "–", bg: "#F3F4F6", color: "#6B7280" };
};

export default function SuperadminSertifikatDetail() {
    const { sekolahId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openLevels, setOpenLevels] = useState({});

    // Modals
    const [issueModal, setIssueModal] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Form Data
    const [file, setFile] = useState(null);
    const [nomorSurat, setNomorSurat] = useState("");
    const [predikat, setPredikat] = useState("");
    const [catatan, setCatatan] = useState("");

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const json = await getSuperadminCertificateDetailApi(sekolahId);
            if (json.success) {
                if (json.data && Array.isArray(json.data.levels)) {
                    json.data.levels.sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0));
                    json.data.levels.forEach(lvl => {
                        if (Array.isArray(lvl.questions)) {
                            lvl.questions.sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0));
                        }
                    });
                }
                setData(json.data);
                const all = {};
                json.data.levels.forEach((lvl) => { all[lvl.level_id] = true; });
                setOpenLevels(all);
            } else {
                setError("Gagal memuat data assessment.");
            }
        } catch (err) {
            console.error(err);
            setError("Terjadi kesalahan saat memuat data.");
        } finally {
            setLoading(false);
        }
    }, [sekolahId]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    const handleIssue = async (e) => {
        e.preventDefault();
        if (!file) return alert("Pilih file sertifikat terlebih dahulu!");

        setProcessing(true);
        const fw = new FormData();
        fw.append("file", file);
        if (nomorSurat) fw.append("nomor_surat", nomorSurat);
        if (predikat) fw.append("predikat", predikat);

        try {
            await issueSuperadminCertificateApi(sekolahId, fw);
            setIssueModal(false);
            setFile(null);
            await fetchDetail();
        } catch (err) {
            alert(err?.response?.data?.message || "Terjadi kesalahan saat menerbitkan sertifikat.");
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (e) => {
        e.preventDefault();
        if (!catatan) return alert("Catatan penolakan harus diisi!");

        setProcessing(true);
        try {
            await rejectSuperadminCertificateApi(sekolahId, { catatan });
            setRejectModal(false);
            setCatatan("");
            await fetchDetail();
            // Go back or just show updated status
            navigate("/superadmin/sertifikat");
        } catch (err) {
            alert(err?.response?.data?.message || "Terjadi kesalahan saat menolak sertifikat.");
        } finally {
            setProcessing(false);
        }
    };

    const toggleLevel = (id) => setOpenLevels((prev) => ({ ...prev, [id]: !prev[id] }));

    if (loading) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px" }}>
            <div style={{ width: 44, height: 44, border: "3px solid var(--border)", borderTop: "3px solid var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Memuat detail...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    if (error) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: "16px" }}>
            <AlertTriangle size={48} color="#DC2626" style={{ opacity: 0.6 }} />
            <p style={{ color: "#DC2626", fontWeight: 600 }}>{error}</p>
            <button onClick={fetchDetail} style={{ padding: "10px 24px", borderRadius: "12px", border: "none", background: "var(--primary)", color: "white", fontWeight: 600, cursor: "pointer" }}>
                Coba Lagi
            </button>
        </div>
    );

    if (!data) return null;

    const { sekolah, levels, sertifikat } = data;
    const schoolName = sekolah?.nama || sekolah?.name || "Sekolah";

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", padding: "0 24px", maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flexWrap: "wrap", marginTop: 24 }}>
                <button
                    onClick={() => navigate("/superadmin/sertifikat")}
                    style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "9px 18px", borderRadius: "12px",
                        border: "1px solid var(--border)", background: "var(--card-bg)",
                        color: "var(--text-main)", fontWeight: 600, fontSize: "14px",
                        cursor: "pointer", flexShrink: 0
                    }}
                >
                    <ArrowLeft size={16} /> Kembali
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 700, lineHeight: 1.2, marginBottom: 4 }}>
                        Tinjauan Sertifikat
                    </h1>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                        <strong>{schoolName}</strong>
                        {sekolah?.jenjang ? ` · ${sekolah.jenjang}` : ""}
                        {(sekolah?.opd?.nama || sekolah?.wilayah) ? ` · ${sekolah?.opd?.nama || sekolah?.wilayah}` : ""}
                    </p>
                </div>
                <button onClick={fetchDetail} title="Refresh" style={{ padding: "9px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--card-bg)", cursor: "pointer", display: "flex", alignItems: "center", color: "var(--text-muted)", flexShrink: 0 }}>
                    <RefreshCw size={16} />
                </button>
            </div>

            {sertifikat?.status === 'published' && (
                <div style={{ padding: "16px 20px", borderRadius: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", gap: "12px", alignItems: "center" }}>
                    <Award size={24} color="#15803d" />
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, color: "#166534", fontSize: 15, fontWeight: 700 }}>Sertifikat Telah Diterbitkan</h4>
                    </div>
                </div>
            )}

            {sertifikat?.status === 'rejected' && (
                <div style={{ padding: "16px 20px", borderRadius: "12px", background: "#fef2f2", border: "1px solid #fecaca", display: "flex", gap: "12px", alignItems: "center" }}>
                    <XCircle size={24} color="#b91c1c" />
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, color: "#991b1b", fontSize: 15, fontWeight: 700 }}>Sertifikat Ditolak</h4>
                        <p style={{ margin: "4px 0 0", color: "#991b1b", fontSize: 13 }}>Alasan: {sertifikat.catatan_superadmin}</p>
                    </div>
                </div>
            )}

            {/* Content List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {levels.map((lvl) => {
                    const st = getLevelStatus(lvl.status_submission);
                    const isOpen = !!openLevels[lvl.level_id];

                    return (
                        <div key={lvl.level_id} style={{ background: "white", borderRadius: "16px", border: "1px solid var(--border)", overflow: "hidden" }}>
                            <div
                                onClick={() => toggleLevel(lvl.level_id)}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "16px 24px", cursor: "pointer", background: isOpen ? "#FAFBFB" : "white",
                                    borderBottom: isOpen ? "1px solid var(--border)" : "none",
                                    transition: "background 0.2s"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                                        {lvl.level_name}
                                    </h3>
                                    <span style={{ fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px", background: st.bg, color: st.color }}>
                                        {st.label}
                                    </span>
                                </div>
                                <div style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px" }}>
                                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {isOpen && (
                                <div style={{ padding: "20px 24px" }}>
                                    {lvl.catatan_opd && (
                                        <div style={{ padding: 12, borderRadius: 8, background: "#FFFBEB", border: "1px solid #FEF3C7", marginBottom: 20 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: "#D97706", marginBottom: 4 }}>Catatan Verifikator OPD</div>
                                            <div style={{ fontSize: 13, color: "#92400E" }}>{lvl.catatan_opd}</div>
                                        </div>
                                    )}

                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        {lvl.questions && lvl.questions.map((q, idx) => {
                                            const jawabanBg = q.is_rejected ? "#FEE2E2" : (q.jawaban ? "#EFF6FF" : "#F3F4F6");
                                            const jawabanColor = q.is_rejected ? "#B91C1C" : (q.jawaban ? "#1D4ED8" : "#9CA3AF");

                                            return (
                                                <div key={q.id} style={{ display: "flex", gap: "14px", alignItems: "flex-start", paddingBottom: "16px", borderBottom: "1px dashed var(--border)" }}>
                                                    <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: jawabanBg, color: jawabanColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>
                                                        {idx + 1}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.5, marginBottom: "7px" }}>{q.pertanyaan}</div>
                                                        {q.tipe === "isian" || (q.jawaban && q.jawaban.length > 30) ? (
                                                            <div style={{ fontSize: "13px", color: "var(--text-main)", background: "#F9FAFB", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", marginTop: "4px", width: "100%" }}>
                                                                {q.jawaban}
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontSize: "12px", fontWeight: 700, padding: "3px 10px", borderRadius: "7px", background: jawabanBg, color: jawabanColor }}>
                                                                {q.jawaban}
                                                            </span>
                                                        )}

                                                        {q.bukti_links?.length > 0 && q.bukti_links.map((link, li) => {
                                                            const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '');
                                                            let href = typeof link === 'string' ? link : (link.url || link.path);
                                                            if (href && href.startsWith('/storage/')) {
                                                                href = API_BASE + href;
                                                            }

                                                            const isImage = href && href.match(/\.(jpeg|jpg|gif|png)(\?.*)?$/i);
                                                            if (isImage) {
                                                                return (
                                                                    <div key={li} style={{ marginTop: "8px", width: "100%", display: "block" }}>
                                                                        <a href={href} target="_blank" rel="noreferrer" style={{ display: "inline-block" }}>
                                                                            <img src={href} alt="Bukti" style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "8px", border: "1px solid var(--border)", objectFit: "cover" }} />
                                                                        </a>
                                                                    </div>
                                                                );
                                                            }

                                                            const isStr = typeof link === 'string';
                                                            const label = (isStr && href.startsWith('http') && !href.includes('/storage/'))
                                                                ? (href.length > 55 ? href.substring(0, 50) + '...' : href)
                                                                : (link.name || `File Bukti ${li + 1}`);

                                                            return (
                                                                <a key={li} href={href} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--primary)", background: "var(--accent-glow,#EFF6FF)", padding: "3px 9px", borderRadius: "6px", textDecoration: "none", fontWeight: 600, marginTop: "6px" }}>
                                                                    <ExternalLink size={10} /> {label}
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ACTION BOTTOM BAR */}
            {sertifikat?.status !== 'published' && (
                <div style={{ display: "flex", gap: 16, marginTop: 10, justifyContent: "flex-end" }}>
                    <button
                        onClick={() => setRejectModal(true)}
                        style={{
                            padding: "12px 24px", borderRadius: 12, border: "2px solid #ef4444",
                            background: "transparent", color: "#ef4444", fontWeight: 700, cursor: "pointer"
                        }}
                    >
                        Tolak
                    </button>
                    <button
                        onClick={() => setIssueModal(true)}
                        style={{
                            padding: "12px 32px", borderRadius: 12, border: "none",
                            background: "var(--primary)", color: "white", fontWeight: 700, cursor: "pointer"
                        }}
                    >
                        Terbitkan Sertifikat
                    </button>
                </div>
            )}

            {/* MODAL ISSUE */}
            {issueModal && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "white", borderRadius: 16, width: 440, padding: 24, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
                        <h3 style={{ margin: "0 0 16px", fontSize: 18 }}>Penerbitan Sertifikat</h3>
                        <form onSubmit={handleIssue}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Upload File Sertifikat (PDF/JPG/PNG) *</label>
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={e => setFile(e.target.files[0])}
                                    style={{ width: "100%", padding: 10, border: "1px dashed var(--border)", borderRadius: 8, fontSize: 13 }}
                                />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Nomor Surat (Opsi)</label>
                                <input
                                    type="text"
                                    value={nomorSurat}
                                    onChange={e => setNomorSurat(e.target.value)}
                                    style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, fontSize: 14 }}
                                    placeholder="Contoh: 123/UKSM/2026"
                                />
                            </div>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Predikat / Mendali (Opsi)</label>
                                <select
                                    value={predikat}
                                    onChange={e => setPredikat(e.target.value)}
                                    style={{ width: "100%", padding: 10, border: "1px solid var(--border)", borderRadius: 8, fontSize: 14 }}
                                >
                                    <option value="">Pilih Predikat...</option>
                                    <option value="Utama">Utama</option>
                                    <option value="Madya">Madya</option>
                                    <option value="Paripurna">Paripurna</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                                <button type="button" onClick={() => setIssueModal(false)} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#F3F4F6", color: "#4B5563", fontWeight: 600, cursor: "pointer" }}>Batal</button>
                                <button type="submit" disabled={processing} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "var(--primary)", color: "white", fontWeight: 600, cursor: processing ? "not-allowed" : "pointer" }}>
                                    {processing ? "Memproses..." : "Terbitkan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL REJECT */}
            {rejectModal && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "white", borderRadius: 16, width: 440, padding: 24, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
                        <h3 style={{ margin: "0 0 16px", fontSize: 18, color: "#DC2626" }}>Tolak & Kembalikan ke Draft</h3>
                        <p style={{ fontSize: 13, color: "#4b5563", marginBottom: 16 }}>
                            Sekolah akan dikembalikan ke status draft dan sertifikat akan ditandai gagal. Harap berikan alasan penolakan.
                        </p>
                        <form onSubmit={handleReject}>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Alasan Penolakan *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={catatan}
                                    onChange={e => setCatatan(e.target.value)}
                                    placeholder="Jelaskan alasan penolakan secara spesifik..."
                                    style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, outline: "none", resize: "vertical" }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                                <button type="button" onClick={() => setRejectModal(false)} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#F3F4F6", color: "#4B5563", fontWeight: 600, cursor: "pointer" }}>Batal</button>
                                <button type="submit" disabled={processing} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#DC2626", color: "white", fontWeight: 600, cursor: processing ? "not-allowed" : "pointer" }}>
                                    {processing ? "Memproses..." : "Ya, Tolak"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
