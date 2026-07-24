import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Activity, CheckCircle, Clock, Bell, CalendarDays, ClipboardCheck, ArrowRight } from "lucide-react";
import { getSekolahLevelsApi } from "../../api/sekolah";
import axiosInstance from "../../api/axios";

export default function SekolahDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [levels, setLevels] = useState([]);
    const [pengumuman, setPengumuman] = useState([]);
    const [periode, setPeriode] = useState(null);
    const [sertifikatStatus, setSertifikatStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getSekolahLevelsApi(),
            axiosInstance.get("/notifications").then(r => r.data).catch(() => ({ data: [] })),
        ]).then(([levelsRes, notifRes]) => {
            const lvList = levelsRes.data?.data ?? levelsRes.data ?? [];
            setLevels(Array.isArray(lvList) ? lvList : []);
            setSertifikatStatus(levelsRes.data?.sertifikat_status ?? null);

            // Extract period info from levelsRes.data.period
            const periodData = levelsRes.data?.period;
            if (periodData) {
                // Format: "Hingga 31/12/2025"
                const date = new Date(periodData.tanggal_selesai);
                const formattedDate = date.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                });
                setPeriode(`Hingga ${formattedDate}`);
            }

            const notifList = notifRes.data?.data ?? notifRes.data ?? [];
            // Tampilkan notif sebagai pengumuman
            setPengumuman(Array.isArray(notifList) ? notifList.slice(0, 3) : []);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    // Hitung progress dari levels
    const totalLevels = levels.length;
    const doneLevels = levels.filter(l => l.status === "submitted" || l.status === "verified" || l.status === "final").length;
    const progressPct = totalLevels > 0 ? Math.round((doneLevels / totalLevels) * 100) : 0;
    const isVerified = levels.length > 0 && levels.every(l => l.status === "verified");
    const certificateReady = sertifikatStatus === "published";
    const statusLabel = isVerified ? "Terverifikasi ✓" : progressPct === 100 ? "Menunggu Verifikasi" : "Dalam Proses";

    if (loading) return <LoadingSpinner />;

    return (
        <div style={{ paddingTop: "6px" }}>
            {/* HEADER */}
            <div className="flex items-center justify-between" style={{ marginBottom: "24px", gap: "14px", flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ fontSize: "1.35rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>
                        Dashboard Penilaian UKS
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                        Selamat datang, {user?.name || user?.username || "Kepala Sekolah"}
                    </p>
                </div>
                {periode && (
                    <div className="badge badge-glow" style={{ padding: "8px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" }}>
                        {periode}
                    </div>
                )}
            </div>

            {/* SERTIFIKAT BANNER */}
            {certificateReady && (
                <div onClick={() => navigate("/sekolah/hasil")}
                    style={{ padding: "16px 20px", borderRadius: "18px", background: "linear-gradient(135deg,#0f4c75,#1b9e6e)", color: "white", cursor: "pointer", marginBottom: "22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}
                >
                    <div>
                        <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>🎉 Sertifikat UKS Tersedia!</div>
                        <div style={{ fontSize: "13px", opacity: 0.9 }}>Sekolah Anda telah terverifikasi. Klik untuk mengunduh sertifikat.</div>
                    </div>
                    <ArrowRight size={22} />
                </div>
            )}

            {/* TOP CARDS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginBottom: "22px" }}>
                <TopCard icon={<Activity size={26} />} label="Status Pengisian" value={statusLabel} iconBg="var(--accent-glow)" iconColor="var(--secondary)" />
                <TopCard icon={<CheckCircle size={26} />} label="Level Selesai" value={`${doneLevels} / ${totalLevels}`} iconBg="var(--bg-light)" iconColor="var(--primary)" />
                <TopCard icon={<Clock size={26} />} label="Progress" value={`${progressPct}%`} iconBg="var(--bg-light)" iconColor="var(--text-main)" />
                <TopCard icon={<CalendarDays size={26} />} label="Deadline Asesmen" value={periode || "–"} iconBg="rgba(255,99,71,0.12)" iconColor="#ff5b45" valueColor="#ff5b45" />
            </div>

            {/* GRID PROGRES + PENGUMUMAN */}
            <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px" }}>
                {/* PROGRESS PER LEVEL */}
                <div className="card glass-panel" style={{ padding: "24px", borderRadius: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                        <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: "var(--accent-glow)", color: "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ClipboardCheck size={22} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: "700", color: "var(--text-main)" }}>Progres Level Assessment</h3>
                            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>Status per level</p>
                        </div>
                    </div>
                    <div style={{ display: "grid", gap: "18px" }}>
                        {levels.length === 0 && <p className="text-muted" style={{ fontSize: "13px" }}>Belum ada level assessment.</p>}
                        {levels.map(level => {
                            const done = level.status === "submitted" || level.status === "verified" || level.status === "final";
                            const pct = done ? 100 : (level.progress_persen ?? level.answered_pct ?? 0);
                            const color = done ? "#16A34A" : pct > 50 ? "#F59E0B" : "var(--primary)";
                            return (
                                <div key={level.id}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                        <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>{level.nama || level.name}</span>
                                        <span style={{ fontSize: "14px", fontWeight: "700", color }}>
                                            {done ? "✓ Selesai" : `${pct}%`}
                                        </span>
                                    </div>
                                    <div style={{ height: "10px", background: "var(--border)", borderRadius: "999px", overflow: "hidden" }}>
                                        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "999px", transition: "0.4s" }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => navigate("/sekolah/kuesioner")}
                        style={{ marginTop: "20px", width: "100%", padding: "12px", borderRadius: "14px", border: "none", background: "var(--primary)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}
                    >
                        Mulai / Lanjutkan Assessment →
                    </button>
                </div>

                {/* PENGUMUMAN */}
                <div className="card glass-panel" style={{ padding: "24px", borderRadius: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                        <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: "rgba(255,193,7,0.12)", color: "#f4a100", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Bell size={22} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: "700", color: "var(--text-main)" }}>Notifikasi</h3>
                            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>Informasi terbaru</p>
                        </div>
                    </div>
                    <div style={{ display: "grid", gap: "12px" }}>
                        {pengumuman.length === 0 && <p className="text-muted" style={{ fontSize: "13px" }}>Belum ada notifikasi.</p>}
                        {pengumuman.map((p) => {
                            let title = p.judul || p.data?.judul || p.type;
                            let body = p.isi || p.data?.isi || "";
                            if (p.type && p.type.includes("LevelVerifiedNotification")) {
                                title = p.data?.status === "disetujui" ? "✅ Verifikasi Level Disetujui" : "❌ Verifikasi Level Ditolak";
                                body = p.data?.message || "";
                                // Jika ada catatan khusus dari admin yang belum tergabung, tambahkan:
                                if (p.data?.catatan && !body.includes(p.data.catatan)) {
                                    body += `\nCatatan : ${p.data.catatan}`;
                                }
                            }
                            return (
                                <div key={p.id} style={{ padding: "14px 16px", borderRadius: "16px", background: "var(--bg-light)", border: "1px solid var(--border)" }}>
                                    <div style={{ fontWeight: "600", marginBottom: "4px", color: "var(--text-main)", fontSize: "14px" }}>{title}</div>
                                    <div style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--text-muted)" }}>{(body || "")?.substring(0, 150)}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style>{`@media (max-width: 950px) { .dashboard-grid { grid-template-columns: 1fr !important; } }`}</style>
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

function TopCard({ icon, label, value, iconBg, iconColor, valueColor }) {
    return (
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px", borderRadius: "22px" }}>
            <div style={{ width: "58px", height: "58px", borderRadius: "50%", background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>{label}</div>
                <div style={{ fontWeight: "700", fontSize: "1.05rem", color: valueColor || "var(--text-main)" }}>{value}</div>
            </div>
        </div>
    );
}