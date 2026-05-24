import { useState, useEffect, useCallback } from "react";
import {
    ShieldCheck, Eye, CheckCircle2, Clock3,
    AlertTriangle, School, Search, X, Award,
} from "lucide-react";
import { getVerifikasiListApi, verifikasiSekolahApi, getSekolahAssessmentDetailApi } from "../../api/admin";

const PREDIKAT_LIST = [
    { key: "minimal", label: "Minimal", deskripsi: "Memenuhi syarat minimal", color: "#6B7280", bg: "#F3F4F6" },
    { key: "standar", label: "Standar", deskripsi: "Memenuhi standar dasar", color: "#3B82F6", bg: "#DBEAFE" },
    { key: "optimal", label: "Optimal", deskripsi: "Melampaui standar", color: "#F59E0B", bg: "#FEF3C7" },
    { key: "paripurna", label: "Paripurna", deskripsi: "Tingkat tertinggi", color: "#16A34A", bg: "#DCFCE7" },
];

export default function AdminVerifikasi() {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilter] = useState("");
    const [modalSchool, setModal] = useState(null);
    const [selPredikat, setSelPred] = useState("standar");
    const [catatan, setCatatan] = useState("");
    const [confirming, setConfirming] = useState(false);
    const [detailSchool, setDetailSchool] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const fetchData = useCallback(() => {
        setLoading(true);
        getVerifikasiListApi()
            .then(res => {
                const list = res.data?.data ?? res.data ?? [];
                setSchools(Array.isArray(list) ? list : []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = schools.filter(s => {
        const q = search.toLowerCase();
        const matchSearch = (s.nama || s.name || "").toLowerCase().includes(q)
            || (s.wilayah || s.opd?.nama || "").toLowerCase().includes(q);
        const matchStatus = !filterStatus || s.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const selesai = schools.filter(s => s.status === "Terverifikasi").length;
    const menunggu = schools.filter(s => s.status === "Menunggu Verifikasi").length;
    const belum = schools.filter(s => !["Terverifikasi", "Menunggu Verifikasi"].includes(s.status)).length;

    async function handleVerify(schoolId, levelId, status = "disetujui") {
        if (!schoolId) return;
        setConfirming(true);
        try {
            await verifikasiSekolahApi(schoolId, levelId || 1, {
                predikat: null, // Removed as per request
                catatan: catatan,
                status: status,
            });
            setModal(null);
            setDetailSchool(null);
            setCatatan("");
            setSelPred("standar");
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setConfirming(false);
        }
    }

    async function handleShowDetail(school) {
        setDetailSchool(school);
        setLoadingDetail(true);
        try {
            const json = await getSekolahAssessmentDetailApi(school.id);
            if (json.success) {
                setDetailData(json.data);
            }
        } catch (err) {
            console.error("Gagal ambil detail:", err);
        } finally {
            setLoadingDetail(false);
        }
    }

    if (loading) return <LoadingSpinner />;

    return (
        <div style={{ width: "100%", overflowX: "hidden", display: "flex", flexDirection: "column", gap: "22px" }}>
            {/* HEADER */}
            <div className="flex items-start justify-between" style={{ flexWrap: "wrap", gap: "16px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{ fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 700, lineHeight: 1.2, marginBottom: 6 }}>
                        Verifikasi Assessment
                    </h1>
                    <p className="text-muted" style={{ fontSize: "14px", lineHeight: 1.6 }}>
                        Monitoring progres dan verifikasi hasil assessment sekolah binaan.
                    </p>
                </div>
            </div>

            {/* STATISTIK */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px" }}>
                <StatCard icon={<School size={22} />} title="Total Sekolah" value={String(schools.length)} color="var(--secondary)" bg="var(--accent-glow)" />
                <StatCard icon={<CheckCircle2 size={22} />} title="Terverifikasi" value={String(selesai)} color="#16A34A" bg="#DCFCE7" />
                <StatCard icon={<Clock3 size={22} />} title="Menunggu Verifikasi" value={String(menunggu)} color="#D97706" bg="#FEF3C7" />
                <StatCard icon={<AlertTriangle size={22} />} title="Belum Selesai" value={String(belum)} color="#DC2626" bg="#FEE2E2" />
            </div>

            {/* FILTER */}
            <div className="card glass-panel" style={{ padding: "18px", borderRadius: "22px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                    <div style={{ position: "relative" }}>
                        <Search size={18} style={{ position: "absolute", top: "50%", left: "14px", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input type="text" placeholder="Cari sekolah / wilayah..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "44px" }} />
                    </div>
                    <select style={inputStyle} value={filterStatus} onChange={(e) => setFilter(e.target.value)}>
                        <option value="">Semua Status</option>
                        <option value="Terverifikasi">Terverifikasi</option>
                        <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                        <option value="Proses">Proses</option>
                        <option value="Belum Selesai">Belum Selesai</option>
                    </select>
                </div>
            </div>

            {/* LIST SEKOLAH */}
            {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                    <School size={48} style={{ opacity: 0.3, marginBottom: "12px" }} />
                    <p>Tidak ada sekolah ditemukan.</p>
                </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" }}>
                {filtered.map((school) => {
                    const isVerified = school.status === "Terverifikasi";
                    const progress = school.progress ?? school.progress_persen ?? 0;
                    const canVerify = (school.status === "Menunggu Verifikasi" || progress > 0) && !isVerified;
                    const pred = PREDIKAT_LIST.find(p => p.key === school.predikat);

                    return (
                        <div key={school.id} className="card glass-panel" style={{ padding: "22px", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div className="flex items-start justify-between" style={{ gap: "12px", flexWrap: "wrap" }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ fontSize: "17px", fontWeight: 700, lineHeight: 1.4, marginBottom: "2px", wordBreak: "break-word" }}>{school.nama || school.name}</h3>
                                    <div className="text-muted" style={{ fontSize: "13px" }}>{school.jenjang || "–"} · {school.wilayah || school.opd?.nama || "–"}</div>
                                </div>
                                <StatusBadge status={school.status} />
                            </div>

                            {/* PROGRESS */}
                            <div>
                                <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
                                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Progress Assessment</span>
                                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)" }}>{progress}%</span>
                                </div>
                                <div style={{ width: "100%", height: "10px", background: "var(--border)", borderRadius: "999px", overflow: "hidden" }}>
                                    <div style={{ width: `${progress}%`, height: "100%", borderRadius: "999px", background: progress === 100 ? "#16A34A" : progress > 60 ? "#F59E0B" : "var(--primary)", transition: "0.4s" }} />
                                </div>
                            </div>

                            {isVerified && pred && (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "12px", background: pred.bg }}>
                                    <Award size={16} color={pred.color} />
                                    <span style={{ fontSize: "13px", fontWeight: 700, color: pred.color }}>Predikat: {pred.label}</span>
                                </div>
                            )}

                            {progress < 100 && !isVerified && (
                                <div style={{ padding: "12px 14px", borderRadius: "12px", background: "#FEF2F2", color: "#B91C1C", fontSize: "13px" }}>
                                    Sekolah belum menyelesaikan seluruh assessment.
                                </div>
                            )}

                            {/* BUTTONS */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <button
                                    onClick={() => handleShowDetail(school)}
                                    style={{ ...detailBtn }}
                                >
                                    <Eye size={15} /> Detail
                                </button>
                                {!isVerified ? (
                                    <button
                                        disabled={!canVerify}
                                        onClick={() => { setModal(school); setSelPred("standar"); setCatatan(""); }}
                                        style={{ ...verifBtn, opacity: canVerify ? 1 : 0.45, cursor: canVerify ? "pointer" : "not-allowed" }}
                                    >
                                        <ShieldCheck size={15} /> Verif
                                    </button>
                                ) : (
                                    <div style={{ ...verifBtn, background: "linear-gradient(135deg,#16A34A,#15803D)", cursor: "default", justifyContent: "center" }}>
                                        <CheckCircle2 size={15} /> OK
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL VERIFIKASI */}
            {modalSchool && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                    <div style={{ background: "var(--card-bg)", borderRadius: "28px", padding: "32px", maxWidth: "520px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: "22px" }}>
                            <div className="flex items-center gap-3">
                                <div style={{ width: 44, height: 44, borderRadius: "14px", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <ShieldCheck size={22} color="#1D4ED8" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: "18px" }}>Konfirmasi Verifikasi</div>
                                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{modalSchool.nama || modalSchool.name}</div>
                                </div>
                            </div>
                            <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                                <X size={22} />
                            </button>
                        </div>

                        {/* CATATAN */}
                        <div style={{ marginBottom: "22px" }}>
                            <label style={{ fontSize: "14px", fontWeight: 600, display: "block", marginBottom: "8px" }}>Catatan Verifikasi (opsional)</label>
                            <textarea
                                value={catatan} onChange={(e) => setCatatan(e.target.value)}
                                placeholder="Tambahkan catatan untuk sekolah..."
                                rows={3}
                                style={{ width: "100%", borderRadius: "14px", border: "1px solid var(--border)", background: "var(--card-bg)", padding: "12px 14px", fontSize: "14px", outline: "none", resize: "vertical", color: "var(--text-main)", boxSizing: "border-box" }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button onClick={() => setModal(null)} style={{ flex: 1, height: "48px", borderRadius: "14px", border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-main)", fontWeight: 600, cursor: "pointer" }}>
                                Batal
                            </button>
                            <button
                                onClick={() => handleVerify(modalSchool.id, modalSchool.active_level_id || modalSchool.level_id, "ditolak")}
                                disabled={confirming}
                                style={{ flex: 1, height: "48px", borderRadius: "14px", border: "1px solid #FECACA", background: "#FEE2E2", color: "#B91C1C", fontWeight: 700, cursor: confirming ? "not-allowed" : "pointer", opacity: confirming ? 0.7 : 1 }}
                            >
                                {confirming ? "..." : "Tolak"}
                            </button>
                            <button
                                onClick={() => handleVerify(modalSchool.id, modalSchool.active_level_id || modalSchool.level_id, "disetujui")}
                                disabled={confirming}
                                style={{ flex: 2, height: "48px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg,#2563EB,#1D4ED8)", color: "white", fontWeight: 700, cursor: confirming ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: confirming ? 0.7 : 1 }}
                            >
                                <ShieldCheck size={18} />
                                {confirming ? "Memproses..." : "Verifikasi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DETAIL */}
            {detailSchool && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                    <div style={{ background: "var(--card-bg)", borderRadius: "28px", width: "100%", maxWidth: "900px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
                        {/* HEADER */}
                        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
                                <div style={{ width: 48, height: 48, borderRadius: "16px", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                                    <School size={24} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>Detail Jawaban: {detailSchool.nama || detailSchool.name}</h2>
                                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Progres: {detailData ? detailData.stats.progress : detailSchool.progress}%</div>
                                </div>
                            </div>
                            <button onClick={() => setDetailSchool(null)} style={{ background: "rgba(0,0,0,0.05)", border: "none", width: 40, height: 40, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* CONTENT */}
                        <div style={{ padding: "24px 32px", overflowY: "auto", flex: 1 }}>
                            {loadingDetail ? (
                                <div style={{ textAlign: "center", padding: "40px" }}>
                                    <div style={{ width: 30, height: 30, border: "2px solid #eee", borderTop: "2px solid var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 10px" }} />
                                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Memuat detail jawaban...</p>
                                </div>
                            ) : detailData ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                    {detailData.details.map((lvl) => (
                                        <div key={lvl.level_id} style={{ border: "1px solid var(--border)", borderRadius: "18px", overflow: "hidden" }}>
                                            <div style={{ background: "var(--bg-light)", padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <div style={{ fontWeight: 700, fontSize: "15px" }}>{lvl.level_nama}</div>
                                                <div style={{ fontSize: "12px", background: lvl.status === 'verified' ? '#DCFCE7' : '#FEF3C7', color: lvl.status === 'verified' ? '#16A34A' : '#B45309', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>
                                                    {lvl.status.toUpperCase()}
                                                </div>
                                            </div>
                                            <div style={{ padding: "0" }}>
                                                {lvl.questions.length === 0 ? (
                                                    <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>Belum ada jawaban.</div>
                                                ) : lvl.questions.map((q, qidx) => (
                                                    <div key={q.id} style={{ padding: "16px 20px", borderBottom: qidx === lvl.questions.length - 1 ? "none" : "1px solid var(--bg-light)" }}>
                                                        <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>{qidx + 1}. {q.pertanyaan}</div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                                            <div style={{ fontSize: "13px", color: q.jawaban === 'Memenuhi' ? "#16A34A" : "#DC2626", fontWeight: 700 }}>
                                                                {q.jawaban}
                                                            </div>
                                                            {q.bukti_links && q.bukti_links.length > 0 && (
                                                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                                    {q.bukti_links.map((link, lidx) => (
                                                                        <a key={lidx} href={link} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "var(--primary)", background: "var(--primary-light)", padding: "4px 8px", borderRadius: "6px", textDecoration: "none", fontWeight: 600 }}>
                                                                            Bukti {lidx + 1}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "40px", color: "#DC2626" }}>Gagal memuat data.</div>
                            )}
                        </div>

                        {/* FOOTER ACTION */}
                        <div style={{ padding: "24px 32px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: "12px", background: "var(--bg-light)" }}>
                            <button onClick={() => setDetailSchool(null)} style={{ padding: "0 24px", height: "46px", borderRadius: "12px", border: "1px solid var(--border)", background: "white", fontWeight: 600, cursor: "pointer" }}>
                                Tutup
                            </button>
                            {detailData && !detailData.stats.is_verified && (
                                <button
                                    onClick={() => { setModal(detailSchool); setSelPred("standar"); setCatatan(""); }}
                                    style={{ padding: "0 24px", height: "46px", borderRadius: "12px", border: "none", background: "var(--primary)", color: "white", fontWeight: 700, cursor: "pointer" }}
                                >
                                    Lanjut Verifikasi
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const detailBtn = { height: "44px", borderRadius: "13px", border: "1px solid var(--border)", background: "white", color: "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", fontWeight: 600, fontSize: "13px", cursor: "pointer" };

function LoadingSpinner() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px" }}>
            <div style={{ width: 44, height: 44, border: "3px solid #e5e7eb", borderTop: "3px solid var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

function StatusBadge({ status }) {
    const map = {
        "Terverifikasi": { bg: "#DCFCE7", color: "#15803D" },
        "Menunggu Verifikasi": { bg: "#FEF3C7", color: "#B45309" },
        "Proses": { bg: "#DBEAFE", color: "#1D4ED8" },
        "Belum Selesai": { bg: "#FEE2E2", color: "#DC2626" },
    };
    const s = map[status] || { bg: "#F3F4F6", color: "#6B7280" };
    return <div style={{ padding: "6px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>{status || "–"}</div>;
}
function StatCard({ icon, title, value, color, bg }) {
    return (
        <div className="card" style={{ padding: "22px", borderRadius: "22px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
            <div style={{ width: "54px", height: "54px", borderRadius: "18px", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
            <div style={{ minWidth: 0 }}>
                <div className="text-muted" style={{ fontSize: "13px", marginBottom: "4px" }}>{title}</div>
                <div style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
            </div>
        </div>
    );
}

const inputStyle = { width: "100%", height: "46px", borderRadius: "14px", border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-main)", fontSize: "14px", padding: "0 14px", outline: "none", boxSizing: "border-box" };
const verifBtn = { height: "44px", borderRadius: "13px", border: "none", background: "linear-gradient(135deg, #2563EB, #1D4ED8)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", fontWeight: 600, fontSize: "13px" };