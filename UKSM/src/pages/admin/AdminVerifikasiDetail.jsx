import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft, School, ShieldCheck, CheckCircle2, XCircle,
    Clock3, AlertTriangle, ChevronDown, ChevronUp,
    ExternalLink, RefreshCw, FileText, X, Info,
} from "lucide-react";
import { getSekolahAssessmentDetailApi, verifikasiSekolahApi } from "../../api/admin";

// ─── Status config per level ────────────────────────────────────────────────
const LEVEL_STATUS_MAP = {
    verified:      { label: "Terverifikasi",       bg: "#DCFCE7", color: "#15803D" },
    final:         { label: "Menunggu Verifikasi",  bg: "#FEF3C7", color: "#B45309" },
    submitted:     { label: "Tersubmit",            bg: "#DBEAFE", color: "#1D4ED8" },
    draft:         { label: "Draft",                bg: "#F3F4F6", color: "#6B7280" },
    "Belum Mulai": { label: "Belum Mulai",          bg: "#F3F4F6", color: "#9CA3AF" },
    locked:        { label: "Terkunci",             bg: "#F3F4F6", color: "#9CA3AF" },
};
const getLevelStatus = (status) =>
    LEVEL_STATUS_MAP[status] ?? { label: status ?? "–", bg: "#F3F4F6", color: "#6B7280" };

// ─── Helper: format date string ──────────────────────────────────────────────
function fmtDate(str) {
    if (!str) return null;
    try {
        return new Date(str).toLocaleString("id-ID", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    } catch { return str; }
}

// ────────────────────────────────────────────────────────────────────────────
export default function AdminVerifikasiDetail() {
    const { sekolahId } = useParams();
    const navigate      = useNavigate();
    const location      = useLocation();

    const [data,              setData]              = useState(null);
    const [loading,           setLoading]           = useState(true);
    const [error,             setError]             = useState(null);
    const [openLevels,        setOpenLevels]        = useState({});
    const [catatanMap,        setCatatanMap]        = useState({});
    const [confirmModal,      setConfirmModal]      = useState(null); // { level, action }
    const [verifyAllModal,    setVerifyAllModal]    = useState(false);
    const [confirming,        setConfirming]        = useState(false);
    // { [levelId]: Set of question ids marked for rejection }
    const [rejectedQuestions, setRejectedQuestions] = useState({});

    // Toggle a question's rejection marking for a given level
    const toggleQuestionRejection = (levelId, questionId) => {
        setRejectedQuestions(prev => {
            const list = prev[levelId] || [];
            if (list.includes(questionId)) {
                return { ...prev, [levelId]: list.filter(id => id !== questionId) };
            } else {
                return { ...prev, [levelId]: [...list, questionId] };
            }
        });
    };

    // Detect base path for back-navigation (admin vs superadmin)
    const basePath = location.pathname.startsWith("/superadmin")
        ? "/superadmin/verifikasi"
        : "/admin/verifikasi";

    // ── Fetch ────────────────────────────────────────────────────────────────
    const fetchDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const json = await getSekolahAssessmentDetailApi(sekolahId);
            if (json.success) {
                if (json.data && Array.isArray(json.data.details)) {
                    json.data.details.sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0));
                    json.data.details.forEach(lvl => {
                        if (Array.isArray(lvl.questions)) {
                            lvl.questions.sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0));
                        }
                    });
                }
                setData(json.data);
                const all = {};
                json.data.details.forEach((lvl) => { all[lvl.level_id] = true; });
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

    // ── Verify single level ──────────────────────────────────────────────────
    const handleVerify = async (levelId, status) => {
        setConfirming(true);
        try {
            await verifikasiSekolahApi(sekolahId, levelId, {
                catatan: catatanMap[levelId] ?? "",
                status,
                rejected_pertanyaan_ids: status === "ditolak"
                    ? (rejectedQuestions[levelId] || [])
                    : [],
            });
            setConfirmModal(null);
            // Clear rejected state for this level
            setRejectedQuestions(prev => {
                const copy = { ...prev };
                delete copy[levelId];
                return copy;
            });
            await fetchDetail();
        } catch (err) {
            console.error(err);
        } finally {
            setConfirming(false);
        }
    };

    // ── Verify all pending levels ────────────────────────────────────────────
    const handleVerifyAll = async () => {
        if (!data) return;
        const pending = data.details.filter(
            (lvl) => lvl.status === "final" || lvl.status === "submitted"
        );
        setConfirming(true);
        try {
            for (const lvl of pending) {
                await verifikasiSekolahApi(sekolahId, lvl.level_id, {
                    catatan: catatanMap[lvl.level_id] ?? "",
                    status: "disetujui",
                    rejected_pertanyaan_ids: [],
                });
            }
            setVerifyAllModal(false);
            await fetchDetail();
        } catch (err) {
            console.error(err);
        } finally {
            setConfirming(false);
        }
    };

    const toggleLevel = (id) =>
        setOpenLevels((prev) => ({ ...prev, [id]: !prev[id] }));

    // ── Loading / Error states ────────────────────────────────────────────────
    if (loading) return (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", gap:"16px" }}>
            <div style={{ width:44, height:44, border:"3px solid var(--border)", borderTop:"3px solid var(--primary)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
            <p style={{ color:"var(--text-muted)", fontSize:"14px" }}>Memuat data assessment...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    if (error) return (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"40vh", gap:"16px" }}>
            <AlertTriangle size={48} color="#DC2626" style={{ opacity:0.6 }} />
            <p style={{ color:"#DC2626", fontWeight:600 }}>{error}</p>
            <button onClick={fetchDetail} style={{ padding:"10px 24px", borderRadius:"12px", border:"none", background:"var(--primary)", color:"white", fontWeight:600, cursor:"pointer" }}>
                Coba Lagi
            </button>
        </div>
    );

    if (!data) return null;

    const { sekolah, details, stats } = data;
    const schoolName    = sekolah?.nama || sekolah?.name || "Sekolah";
    const pendingLevels  = details.filter((l) => l.status === "final" || l.status === "submitted");
    const verifiedLevels = details.filter((l) => l.status === "verified");

    return (
        <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:"24px" }}>

            {/* ── HEADER ─────────────────────────────────────────────────────── */}
            <div style={{ display:"flex", alignItems:"flex-start", gap:"14px", flexWrap:"wrap" }}>
                <button
                    onClick={() => navigate(basePath)}
                    style={{
                        display:"flex", alignItems:"center", gap:"8px",
                        padding:"9px 18px", borderRadius:"12px",
                        border:"1px solid var(--border)", background:"var(--card-bg)",
                        color:"var(--text-main)", fontWeight:600, fontSize:"14px",
                        cursor:"pointer", flexShrink:0, marginTop:"2px",
                    }}
                >
                    <ArrowLeft size={16} /> Kembali
                </button>

                <div style={{ flex:1, minWidth:0 }}>
                    <h1 style={{ fontSize:"clamp(20px,3vw,28px)", fontWeight:700, lineHeight:1.2, marginBottom:4 }}>
                        Detail Assessment
                    </h1>
                    <p style={{ fontSize:"14px", color:"var(--text-muted)", lineHeight:1.6 }}>
                        <strong>{schoolName}</strong>
                        {sekolah?.jenjang ? ` · ${sekolah.jenjang}` : ""}
                        {(sekolah?.opd?.nama || sekolah?.wilayah) ? ` · ${sekolah?.opd?.nama || sekolah?.wilayah}` : ""}
                    </p>
                </div>

                <button
                    onClick={fetchDetail}
                    title="Refresh"
                    style={{ padding:"9px", borderRadius:"10px", border:"1px solid var(--border)", background:"var(--card-bg)", cursor:"pointer", display:"flex", alignItems:"center", color:"var(--text-muted)", flexShrink:0 }}
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* ── STATS ROW ──────────────────────────────────────────────────── */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:"14px" }}>
                <MiniStatCard icon={<CheckCircle2 size={19}/>} label="Terverifikasi"       value={`${verifiedLevels.length} / ${details.length}`} color="#16A34A" bg="#DCFCE7" />
                <MiniStatCard icon={<Clock3 size={19}/>}        label="Menunggu Verifikasi" value={String(pendingLevels.length)}                   color="#B45309" bg="#FEF3C7" />
                <MiniStatCard icon={<School size={19}/>}        label="Progress"            value={`${stats.progress}%`}                           color="var(--primary)" bg="var(--accent-glow,#EFF6FF)" />
                <MiniStatCard icon={<FileText size={19}/>}      label="Indikator Terisi"    value={stats.indikator_terisi ?? "–"}                   color="#7C3AED" bg="#EDE9FE" />
            </div>

            {/* ── VERIFY-ALL BANNER ──────────────────────────────────────────── */}
            {pendingLevels.length > 0 && (
                <div className="card" style={{
                    padding:"16px 20px", borderRadius:"18px",
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    gap:"12px", flexWrap:"wrap",
                    background:"linear-gradient(135deg,#EFF6FF,#DBEAFE)",
                    border:"1px solid #BFDBFE",
                }}>
                    <div>
                        <div style={{ fontWeight:700, fontSize:"15px", color:"#1E40AF" }}>
                            {pendingLevels.length} level menunggu verifikasi
                        </div>
                        <div style={{ fontSize:"13px", color:"#3B82F6", marginTop:"2px" }}>
                            Verifikasi semua sekaligus atau lakukan per-level di bawah.
                        </div>
                    </div>
                    <button
                        onClick={() => setVerifyAllModal(true)}
                        style={{
                            display:"flex", alignItems:"center", gap:"8px",
                            padding:"10px 20px", borderRadius:"12px", border:"none",
                            background:"linear-gradient(135deg,#2563EB,#1D4ED8)",
                            color:"white", fontWeight:700, fontSize:"14px",
                            cursor:"pointer", flexShrink:0,
                        }}
                    >
                        <ShieldCheck size={17}/> Verifikasi Semua ({pendingLevels.length})
                    </button>
                </div>
            )}

            {/* ── LEVEL LIST ─────────────────────────────────────────────────── */}
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                {details.map((lvl) => {
                    const isOpen    = !!openLevels[lvl.level_id];
                    const canVerify = lvl.status === "final" || lvl.status === "submitted";
                    const st        = getLevelStatus(lvl.status);
                    const answered  = lvl.questions.filter((q) => q.jawaban !== "Belum Dijawab").length;
                    const memenuhi  = lvl.questions.filter((q) => q.jawaban === "Memenuhi").length;
                    const markedCount = (rejectedQuestions[lvl.level_id] || []).length;

                    return (
                        <div
                            key={lvl.level_id}
                            className="card"
                            style={{
                                borderRadius:"20px", overflow:"hidden",
                                border: lvl.status === "verified"
                                    ? "1px solid #BBF7D0"
                                    : canVerify ? "1px solid #FDE68A"
                                    : "1px solid var(--border)",
                            }}
                        >
                            {/* Level accordion header */}
                            <div
                                onClick={() => toggleLevel(lvl.level_id)}
                                style={{
                                    padding:"16px 20px",
                                    display:"flex", alignItems:"center", justifyContent:"space-between",
                                    cursor:"pointer", userSelect:"none",
                                    background: lvl.status === "verified" ? "#F0FDF4"
                                        : canVerify ? "#FFFBEB"
                                        : "var(--bg-light,var(--card-bg))",
                                    borderBottom: isOpen ? "1px solid var(--border)" : "none",
                                }}
                            >
                                <div style={{ display:"flex", alignItems:"center", gap:"12px", flex:1, minWidth:0 }}>
                                    <div style={{
                                        width:38, height:38, borderRadius:"11px", flexShrink:0,
                                        background: st.bg,
                                        display:"flex", alignItems:"center", justifyContent:"center",
                                    }}>
                                        {lvl.status === "verified"
                                            ? <CheckCircle2 size={18} color="#16A34A"/>
                                            : <FileText size={18} color={st.color}/>}
                                    </div>

                                    <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontWeight:700, fontSize:"15px", lineHeight:1.3 }}>
                                            {lvl.level_nama}
                                        </div>
                                        <div style={{ fontSize:"12px", color:"var(--text-muted)", marginTop:"2px" }}>
                                            {answered}/{lvl.questions.length} dijawab &nbsp;·&nbsp; {memenuhi} Memenuhi
                                            {lvl.verified_at && ` · Diverifikasi ${fmtDate(lvl.verified_at)}`}
                                            {markedCount > 0 && (
                                                <span style={{ marginLeft:8, color:"#B91C1C", fontWeight:700 }}>
                                                    · {markedCount} soal akan ditolak
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
                                    <span style={{
                                        fontSize:"11px", fontWeight:700, padding:"4px 10px",
                                        borderRadius:"8px", background:st.bg, color:st.color,
                                        whiteSpace:"nowrap",
                                    }}>
                                        {st.label.toUpperCase()}
                                    </span>
                                    {isOpen
                                        ? <ChevronUp  size={17} color="var(--text-muted)"/>
                                        : <ChevronDown size={17} color="var(--text-muted)"/>}
                                </div>
                            </div>

                            {/* Level content */}
                            {isOpen && (
                                <div>
                                    {/* Hint banner when pending */}
                                    {canVerify && (
                                        <div style={{
                                            padding:"10px 20px",
                                            background:"#FFFBEB",
                                            borderBottom:"1px solid #FDE68A",
                                            fontSize:"12px", color:"#92400E",
                                            display:"flex", alignItems:"center", gap:"6px",
                                        }}>
                                            <Info size={13}/> Klik tombol <strong>Tolak</strong> di setiap soal untuk menandai soal yang perlu diisi ulang oleh sekolah. Soal yang tidak ditandai akan terkunci otomatis.
                                        </div>
                                    )}

                                    {/* Question list */}
                                    {lvl.questions.length === 0 ? (
                                        <div style={{ padding:"28px", textAlign:"center", color:"var(--text-muted)", fontSize:"14px" }}>
                                            Belum ada jawaban untuk level ini.
                                        </div>
                                    ) : lvl.questions.map((q, idx) => {
                                        const isMemenuhi   = q.jawaban === "Memenuhi";
                                        const isBelum      = q.jawaban === "Belum Memenuhi";
                                        const jawabanBg    = isMemenuhi ? "#DCFCE7" : isBelum ? "#FEE2E2" : "#F3F4F6";
                                        const jawabanColor = isMemenuhi ? "#16A34A" : isBelum ? "#DC2626" : "#9CA3AF";
                                        const isMarkedForRejection = (rejectedQuestions[lvl.level_id] || []).includes(q.id);
                                        const wasPreviouslyRejected = !!q.is_rejected;

                                        return (
                                            <div
                                                key={q.id}
                                                style={{
                                                    padding:"14px 20px",
                                                    borderBottom: idx < lvl.questions.length - 1
                                                        ? "1px solid var(--bg-light,#F3F4F6)"
                                                        : "none",
                                                    display:"flex", alignItems:"flex-start", gap:"14px",
                                                    background: isMarkedForRejection
                                                        ? "#FFF5F5"
                                                        : wasPreviouslyRejected && canVerify
                                                            ? "#FFFDF0"
                                                            : "transparent",
                                                    transition:"background 0.2s ease",
                                                    borderLeft: isMarkedForRejection
                                                        ? "3px solid #F87171"
                                                        : wasPreviouslyRejected && canVerify
                                                            ? "3px solid #FCD34D"
                                                            : "3px solid transparent",
                                                }}
                                            >
                                                {/* Number badge */}
                                                <div style={{
                                                    width:28, height:28, borderRadius:"50%", flexShrink:0,
                                                    background:jawabanBg, color:jawabanColor,
                                                    display:"flex", alignItems:"center", justifyContent:"center",
                                                    fontSize:"12px", fontWeight:700,
                                                }}>
                                                    {idx + 1}
                                                </div>

                                                <div style={{ flex:1, minWidth:0 }}>
                                                    <div style={{ fontSize:"13px", fontWeight:600, lineHeight:1.5, marginBottom:"7px" }}>
                                                        {q.teks_pertanyaan ||
                                                         (typeof q.pertanyaan === "object" ? q.pertanyaan?.teks_pertanyaan || q.pertanyaan?.pertanyaan : q.pertanyaan) ||
                                                         q.teks || q.text || "Teks pertanyaan tidak tersedia"}
                                                    </div>
                                                    <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
                                                        {/* Jawaban badge */}
                                                        <span style={{
                                                            fontSize:"12px", fontWeight:700,
                                                            padding:"3px 10px", borderRadius:"7px",
                                                            background:jawabanBg, color:jawabanColor,
                                                        }}>
                                                            {q.jawaban}
                                                        </span>

                                                        {/* Bukti links */}
                                                        {q.bukti_links?.length > 0 && q.bukti_links.map((link, li) => (
                                                            <a
                                                                key={li}
                                                                href={link}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                style={{
                                                                    display:"flex", alignItems:"center", gap:"4px",
                                                                    fontSize:"11px", color:"var(--primary)",
                                                                    background:"var(--accent-glow,#EFF6FF)",
                                                                    padding:"3px 9px", borderRadius:"6px",
                                                                    textDecoration:"none", fontWeight:600,
                                                                }}
                                                            >
                                                                <ExternalLink size={10}/> Bukti {li + 1}
                                                            </a>
                                                        ))}

                                                        {/* "Akan Ditolak" badge */}
                                                        {isMarkedForRejection && (
                                                            <span style={{
                                                                fontSize:"11px", fontWeight:700,
                                                                padding:"2px 9px", borderRadius:"6px",
                                                                background:"#FEE2E2", color:"#B91C1C",
                                                                display:"inline-flex", alignItems:"center", gap:"3px",
                                                            }}>
                                                                <XCircle size={10}/> Akan Ditolak
                                                            </span>
                                                        )}

                                                        {/* "Ditolak Sebelumnya" badge – shown to help admin notice previously rejected items */}
                                                        {!isMarkedForRejection && wasPreviouslyRejected && canVerify && (
                                                            <span style={{
                                                                fontSize:"11px", fontWeight:700,
                                                                padding:"2px 9px", borderRadius:"6px",
                                                                background:"#FEF3C7", color:"#92400E",
                                                                display:"inline-flex", alignItems:"center", gap:"3px",
                                                            }}>
                                                                <AlertTriangle size={10}/> Ditolak Sebelumnya
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Per-question Tolak / Batal Tolak button */}
                                                {canVerify && (
                                                    <button
                                                        onClick={() => toggleQuestionRejection(lvl.level_id, q.id)}
                                                        style={{
                                                            flexShrink:0, alignSelf:"center",
                                                            padding:"5px 14px", borderRadius:"8px",
                                                            border: isMarkedForRejection ? "1px solid #FECACA" : "1px solid var(--border)",
                                                            background: isMarkedForRejection ? "#FEE2E2" : "var(--card-bg)",
                                                            color: isMarkedForRejection ? "#B91C1C" : "var(--text-muted)",
                                                            fontSize:"12px", fontWeight:700,
                                                            cursor:"pointer",
                                                            display:"flex", alignItems:"center", gap:"4px",
                                                            transition:"all 0.2s ease",
                                                        }}
                                                    >
                                                        {isMarkedForRejection
                                                            ? <><X size={11}/> Batal</>
                                                            : <><XCircle size={11}/> Tolak</>
                                                        }
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Catatan verifikator (already verified) */}
                                    {lvl.catatan_verifikator && (
                                        <div style={{
                                            padding:"12px 20px",
                                            borderTop:"1px solid var(--border)",
                                            background:"#FFFBEB",
                                            display:"flex", alignItems:"flex-start", gap:"10px",
                                        }}>
                                            <Info size={15} color="#B45309" style={{ flexShrink:0, marginTop:2 }}/>
                                            <div>
                                                <div style={{ fontSize:"12px", fontWeight:700, color:"#B45309", marginBottom:"3px" }}>
                                                    Catatan Verifikator
                                                </div>
                                                <div style={{ fontSize:"13px", color:"#92400E", lineHeight:1.5 }}>
                                                    {lvl.catatan_verifikator}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Verify action area (only for pending levels) ── */}
                                    {canVerify && (
                                        <div style={{
                                            padding:"16px 20px",
                                            borderTop:"1px solid var(--border)",
                                            background:"var(--bg-light,#F9FAFB)",
                                        }}>
                                            {/* Summary of rejection selections */}
                                            {markedCount > 0 && (
                                                <div style={{
                                                    padding:"10px 14px", borderRadius:"10px",
                                                    background:"#FEF2F2", border:"1px solid #FECACA",
                                                    marginBottom:"12px",
                                                    fontSize:"13px", color:"#B91C1C",
                                                    display:"flex", alignItems:"center", gap:"8px",
                                                }}>
                                                    <XCircle size={14}/>
                                                    <span>
                                                        <strong>{markedCount} soal</strong> ditandai untuk ditolak.
                                                        Soal lainnya ({lvl.questions.length - markedCount}) akan terkunci otomatis.
                                                    </span>
                                                </div>
                                            )}

                                            <label style={{ fontSize:"13px", fontWeight:600, display:"block", marginBottom:"8px" }}>
                                                Catatan Verifikasi <span style={{ fontWeight:400, color:"var(--text-muted)" }}>(opsional)</span>
                                            </label>
                                            <textarea
                                                value={catatanMap[lvl.level_id] ?? ""}
                                                onChange={(e) =>
                                                    setCatatanMap((p) => ({ ...p, [lvl.level_id]: e.target.value }))
                                                }
                                                placeholder="Tambahkan catatan untuk level ini..."
                                                rows={2}
                                                style={{
                                                    width:"100%", borderRadius:"10px",
                                                    border:"1px solid var(--border)",
                                                    background:"var(--card-bg)",
                                                    padding:"10px 14px",
                                                    fontSize:"13px", outline:"none", resize:"vertical",
                                                    color:"var(--text-main)", boxSizing:"border-box",
                                                    marginBottom:"12px",
                                                }}
                                            />
                                            <div style={{ display:"flex", gap:"10px" }}>
                                                <button
                                                    onClick={() => setConfirmModal({ level: lvl, action: "ditolak" })}
                                                    style={{
                                                        flex:1, height:"40px", borderRadius:"10px",
                                                        border:"1px solid #FECACA", background:"#FEE2E2",
                                                        color:"#B91C1C", fontWeight:700, cursor:"pointer",
                                                        fontSize:"13px", display:"flex", alignItems:"center",
                                                        justifyContent:"center", gap:"6px",
                                                    }}
                                                >
                                                    <XCircle size={15}/>
                                                    {markedCount > 0 ? `Tolak ${markedCount} Soal` : "Tolak Semua Soal"}
                                                </button>
                                                <button
                                                    onClick={() => setConfirmModal({ level: lvl, action: "disetujui" })}
                                                    style={{
                                                        flex:2, height:"40px", borderRadius:"10px",
                                                        border:"none",
                                                        background:"linear-gradient(135deg,#2563EB,#1D4ED8)",
                                                        color:"white", fontWeight:700, cursor:"pointer",
                                                        fontSize:"13px", display:"flex", alignItems:"center",
                                                        justifyContent:"center", gap:"6px",
                                                    }}
                                                >
                                                    <ShieldCheck size={15}/> Verifikasi Level Ini
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── ALL VERIFIED MESSAGE ───────────────────────────────────────── */}
            {pendingLevels.length === 0 && verifiedLevels.length === details.length && details.length > 0 && (
                <div style={{
                    padding:"20px 24px", borderRadius:"18px",
                    background:"#F0FDF4", border:"1px solid #BBF7D0",
                    display:"flex", alignItems:"center", gap:"14px",
                }}>
                    <CheckCircle2 size={28} color="#16A34A"/>
                    <div>
                        <div style={{ fontWeight:700, fontSize:"16px", color:"#15803D" }}>Semua Level Telah Terverifikasi</div>
                        <div style={{ fontSize:"13px", color:"#16A34A", marginTop:"3px" }}>
                            Assessment sekolah ini telah selesai diverifikasi seluruhnya.
                        </div>
                    </div>
                </div>
            )}

            {/* ── CONFIRM MODAL (per level) ──────────────────────────────────── */}
            {confirmModal && (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
                    <div style={{ background:"var(--card-bg)", borderRadius:"24px", padding:"28px 32px", maxWidth:"520px", width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
                        {/* Header */}
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                                <div style={{
                                    width:44, height:44, borderRadius:"12px", flexShrink:0,
                                    background: confirmModal.action === "disetujui" ? "#DBEAFE" : "#FEE2E2",
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                }}>
                                    {confirmModal.action === "disetujui"
                                        ? <ShieldCheck size={22} color="#1D4ED8"/>
                                        : <XCircle    size={22} color="#DC2626"/>}
                                </div>
                                <div>
                                    <div style={{ fontWeight:700, fontSize:"17px" }}>
                                        {confirmModal.action === "disetujui" ? "Konfirmasi Verifikasi" : "Konfirmasi Penolakan"}
                                    </div>
                                    <div style={{ fontSize:"13px", color:"var(--text-muted)" }}>
                                        {confirmModal.level.level_nama}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setConfirmModal(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", padding:"4px" }}>
                                <X size={20}/>
                            </button>
                        </div>

                        {confirmModal.action === "ditolak" && (
                            <>
                                {/* Show which questions will be rejected */}
                                {(rejectedQuestions[confirmModal.level.level_id] || []).length > 0 ? (
                                    <div style={{ marginBottom:"18px" }}>
                                        <div style={{ fontSize:"13px", fontWeight:600, color:"var(--text-muted)", marginBottom:"8px" }}>
                                            Soal yang akan ditolak ({(rejectedQuestions[confirmModal.level.level_id] || []).length} soal):
                                        </div>
                                        <div style={{ border:"1px solid #FECACA", borderRadius:"10px", overflow:"hidden" }}>
                                            {confirmModal.level.questions
                                                .filter(q => (rejectedQuestions[confirmModal.level.level_id] || []).includes(q.id))
                                                .map((q, i, arr) => (
                                                    <div key={q.id} style={{
                                                        padding:"9px 14px",
                                                        borderBottom: i < arr.length - 1 ? "1px solid #FEE2E2" : "none",
                                                        fontSize:"13px",
                                                        display:"flex", alignItems:"center", gap:"8px",
                                                    }}>
                                                        <XCircle size={13} color="#DC2626" style={{ flexShrink:0 }}/>
                                                        <span style={{ color:"#B91C1C" }}>
                                                            {q.teks_pertanyaan ||
                                                             (typeof q.pertanyaan === "object" ? q.pertanyaan?.teks_pertanyaan || q.pertanyaan?.pertanyaan : q.pertanyaan) ||
                                                             q.teks || q.text || `Soal #${q.id}`}
                                                        </span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                        <div style={{ fontSize:"12px", color:"var(--text-muted)", marginTop:"8px" }}>
                                            Soal yang <strong>tidak</strong> ditandai akan terkunci otomatis (tidak bisa diubah sekolah).
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ fontSize:"14px", color:"var(--text-muted)", lineHeight:1.7, marginBottom:"18px" }}>
                                        Tidak ada soal yang ditandai. Semua soal di level <em>{confirmModal.level.level_nama}</em> akan ditolak dan sekolah diminta mengisi ulang seluruhnya.
                                    </p>
                                )}
                            </>
                        )}

                        {confirmModal.action === "disetujui" && (
                            <p style={{ fontSize:"14px", color:"var(--text-muted)", lineHeight:1.7, marginBottom:"22px" }}>
                                Yakin ingin <strong>memverifikasi</strong> level <em>{confirmModal.level.level_nama}</em>? Level ini akan ditandai sebagai <strong>Terverifikasi</strong> dan semua jawaban dikunci.
                            </p>
                        )}

                        <div style={{ display:"flex", gap:"10px" }}>
                            <button
                                onClick={() => setConfirmModal(null)}
                                style={{ flex:1, height:"44px", borderRadius:"12px", border:"1px solid var(--border)", background:"var(--card-bg)", color:"var(--text-main)", fontWeight:600, cursor:"pointer" }}
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleVerify(confirmModal.level.level_id, confirmModal.action)}
                                disabled={confirming}
                                style={{
                                    flex:2, height:"44px", borderRadius:"12px", border:"none",
                                    background: confirmModal.action === "disetujui"
                                        ? "linear-gradient(135deg,#2563EB,#1D4ED8)"
                                        : "linear-gradient(135deg,#DC2626,#B91C1C)",
                                    color:"white", fontWeight:700,
                                    cursor: confirming ? "not-allowed" : "pointer",
                                    opacity: confirming ? 0.7 : 1,
                                    display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                                }}
                            >
                                {confirming
                                    ? "Memproses..."
                                    : confirmModal.action === "disetujui" ? "Ya, Verifikasi" : "Ya, Tolak"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── VERIFY ALL MODAL ───────────────────────────────────────────── */}
            {verifyAllModal && (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
                    <div style={{ background:"var(--card-bg)", borderRadius:"24px", padding:"28px 32px", maxWidth:"480px", width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                                <div style={{ width:44, height:44, borderRadius:"12px", background:"#DBEAFE", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                    <ShieldCheck size={22} color="#1D4ED8"/>
                                </div>
                                <div>
                                    <div style={{ fontWeight:700, fontSize:"17px" }}>Verifikasi Semua Level</div>
                                    <div style={{ fontSize:"13px", color:"var(--text-muted)" }}>{schoolName}</div>
                                </div>
                            </div>
                            <button onClick={() => setVerifyAllModal(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", padding:"4px" }}>
                                <X size={20}/>
                            </button>
                        </div>

                        <p style={{ fontSize:"14px", color:"var(--text-muted)", lineHeight:1.7, marginBottom:"16px" }}>
                            Yakin ingin memverifikasi <strong>{pendingLevels.length} level</strong> yang sedang menunggu? Semua level akan ditandai sebagai <strong>Terverifikasi</strong>.
                        </p>

                        <div style={{ marginBottom:"22px", border:"1px solid var(--border)", borderRadius:"12px", overflow:"hidden" }}>
                            {pendingLevels.map((lvl, i) => (
                                <div
                                    key={lvl.level_id}
                                    style={{
                                        padding:"10px 14px",
                                        borderBottom: i < pendingLevels.length - 1 ? "1px solid var(--border)" : "none",
                                        display:"flex", alignItems:"center", gap:"10px",
                                        fontSize:"13px",
                                    }}
                                >
                                    <CheckCircle2 size={15} color="#16A34A"/>
                                    <span style={{ fontWeight:600 }}>{lvl.level_nama}</span>
                                    <span style={{ marginLeft:"auto", fontSize:"11px", color:"#B45309", background:"#FEF3C7", padding:"2px 8px", borderRadius:"6px", fontWeight:700 }}>
                                        {getLevelStatus(lvl.status).label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display:"flex", gap:"10px" }}>
                            <button
                                onClick={() => setVerifyAllModal(false)}
                                style={{ flex:1, height:"44px", borderRadius:"12px", border:"1px solid var(--border)", background:"var(--card-bg)", color:"var(--text-main)", fontWeight:600, cursor:"pointer" }}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleVerifyAll}
                                disabled={confirming}
                                style={{
                                    flex:2, height:"44px", borderRadius:"12px", border:"none",
                                    background:"linear-gradient(135deg,#2563EB,#1D4ED8)",
                                    color:"white", fontWeight:700,
                                    cursor: confirming ? "not-allowed" : "pointer",
                                    opacity: confirming ? 0.7 : 1,
                                    display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                                }}
                            >
                                <ShieldCheck size={16}/>
                                {confirming ? "Memproses..." : `Verifikasi ${pendingLevels.length} Level`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Mini stat card ──────────────────────────────────────────────────────────
function MiniStatCard({ icon, label, value, color, bg }) {
    return (
        <div className="card" style={{ padding:"16px 18px", borderRadius:"16px", border:"1px solid var(--border)", display:"flex", alignItems:"center", gap:"14px" }}>
            <div style={{ width:40, height:40, borderRadius:"12px", background:bg, color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {icon}
            </div>
            <div style={{ minWidth:0 }}>
                <div style={{ fontSize:"12px", color:"var(--text-muted)", marginBottom:"2px" }}>{label}</div>
                <div style={{ fontSize:"20px", fontWeight:700, lineHeight:1.2, color }}>{value}</div>
            </div>
        </div>
    );
}
