import { useState, useEffect } from "react";
import {
    FileSpreadsheet, Download, Eye, School,
    CheckCircle2, Clock3, AlertTriangle, PieChart, BarChart3,
} from "lucide-react";
import { getRekapSekolahApi } from "../../api/admin";

export default function AdminAnalisisLaporan() {
    const [data, setData]       = useState(null);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRekapSekolahApi()
            .then(res => {
                const body = res.data ?? res;
                const schoolsList = body.data ?? body.sekolah?.data ?? body.sekolah ?? (Array.isArray(body) ? body : []);
                setData(body.stats ?? {});
                setSchools(Array.isArray(schoolsList) ? schoolsList : []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    const stats    = data || {};
    const total    = stats.total_sekolah ?? schools.length;
    const selesai  = stats.terverifikasi  ?? 0;
    const menunggu = stats.menunggu_verifikasi ?? 0;
    const belum    = stats.belum_selesai  ?? 0;
    const avg      = stats.rata_rata_progress ?? 0;
    const predikat = stats.rekap_predikat || [];

    return (
        <div style={{ width: "100%", overflowX: "hidden", display: "flex", flexDirection: "column", gap: "22px" }}>
            {/* HEADER */}
            <div className="flex items-start justify-between" style={{ flexWrap: "wrap", gap: "16px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{ fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 700, lineHeight: 1.2, marginBottom: 6 }}>
                        Analisis &amp; Laporan
                    </h1>
                    <p className="text-muted" style={{ fontSize: "14px", lineHeight: 1.6 }}>
                        Monitoring data assessment, progres verifikasi, serta laporan sekolah binaan.
                    </p>
                </div>
                <div className="badge badge-glow" style={{ whiteSpace: "nowrap" }}>{stats.periode || "Periode Aktif"}</div>
            </div>

            {/* STATISTIK */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
                <StatCard icon={<School size={22} />}       title="Total Sekolah"       value={String(total)}    color="var(--secondary)" bg="var(--accent-glow)" />
                <StatCard icon={<CheckCircle2 size={22} />}  title="Terverifikasi"       value={String(selesai)}  color="#16A34A"          bg="#DCFCE7" />
                <StatCard icon={<Clock3 size={22} />}         title="Menunggu Verifikasi" value={String(menunggu)} color="#D97706"          bg="#FEF3C7" />
                <StatCard icon={<AlertTriangle size={22} />}  title="Belum Selesai"       value={String(belum)}    color="#DC2626"          bg="#FEE2E2" />
            </div>

            {/* ANALISIS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" }}>
                {/* ANALISIS STRATA */}
                <div className="card glass-panel" style={{ padding: "24px", borderRadius: "24px" }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: "22px" }}>
                        <PieChart size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Analisis Strata</h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {predikat.length === 0 && <p className="text-muted" style={{ fontSize: "13px" }}>Belum ada data predikat.</p>}
                        {predikat.map((p) => {
                            const pct = total > 0 ? Math.min(100, ((p.jumlah ?? 0) / total) * 100) : 0;
                            return (
                                <ProgressItem key={p.label} title={p.label} value={`${p.jumlah ?? 0} Sekolah`} width={`${pct}%`} color={p.color || "var(--primary)"} />
                            );
                        })}
                    </div>
                </div>

                {/* ANALISIS PROGRES */}
                <div className="card glass-panel" style={{ padding: "24px", borderRadius: "24px" }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: "22px" }}>
                        <BarChart3 size={20} color="var(--secondary)" />
                        <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Progress Assessment</h3>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "14px" }}>
                        <MiniCard title="Rata-rata Progress" value={`${avg}%`} />
                        <MiniCard title="Terverifikasi"       value={String(selesai)} />
                        <MiniCard title="Belum Selesai"       value={String(belum)} />
                        <MiniCard title="Menunggu Verifikasi" value={String(menunggu)} />
                    </div>
                </div>
            </div>

            {/* TABEL REKAP SEKOLAH */}
            <div className="card glass-panel" style={{ padding: "24px", borderRadius: "24px" }}>
                <div className="flex items-center justify-between" style={{ flexWrap: "wrap", gap: "14px", marginBottom: "20px" }}>
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet size={20} color="#16A34A" />
                        <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Rekap Sekolah Binaan</h3>
                    </div>
                </div>
                <div style={{ overflowX: "auto", borderRadius: "18px", border: "1px solid var(--border)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "720px" }}>
                        <thead style={{ background: "var(--bg-light)" }}>
                            <tr>
                                {["Nama Sekolah", "Status", "Progress", "Predikat", "Verifikasi"].map(h => (
                                    <th key={h} style={{ textAlign: "left", padding: "14px", fontSize: "13px", fontWeight: 700, borderBottom: "1px solid var(--border)" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {schools.length === 0 && (
                                <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>Belum ada data.</td></tr>
                            )}
                            {schools.slice(0, 20).map(s => (
                                <tr key={s.id}>
                                    <td style={tdStyle}>{s.nama || s.name}</td>
                                    <td style={tdStyle}>{s.status || "–"}</td>
                                    <td style={tdStyle}>{s.progress ?? s.progress_persen ?? 0}%</td>
                                    <td style={tdStyle}>{s.predikat || "–"}</td>
                                    <td style={tdStyle}>{s.verifikasi_status || (s.status === "Terverifikasi" ? "Terverifikasi" : "Belum")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
function StatCard({ icon, title, value, color, bg }) {
    return (
        <div className="card" style={{ padding: "22px", borderRadius: "22px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "54px", height: "54px", borderRadius: "18px", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
            <div>
                <div className="text-muted" style={{ fontSize: "13px", marginBottom: "4px" }}>{title}</div>
                <div style={{ fontSize: "28px", fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
            </div>
        </div>
    );
}
function MiniCard({ title, value }) {
    return (
        <div style={{ padding: "14px", borderRadius: "16px", background: "var(--bg-light)", border: "1px solid var(--border)" }}>
            <div className="text-muted" style={{ fontSize: "12px", marginBottom: "6px" }}>{title}</div>
            <div style={{ fontSize: "18px", fontWeight: 700, lineHeight: 1.3 }}>{value}</div>
        </div>
    );
}
function ProgressItem({ title, value, width, color }) {
    return (
        <div>
            <div className="flex items-center justify-between" style={{ marginBottom: "8px", gap: "10px" }}>
                <span style={{ fontSize: "14px", fontWeight: 600 }}>{title}</span>
                <span className="text-muted" style={{ fontSize: "13px" }}>{value}</span>
            </div>
            <div style={{ width: "100%", height: "10px", borderRadius: "999px", background: "var(--border)", overflow: "hidden" }}>
                <div style={{ width, height: "100%", borderRadius: "999px", background: color }} />
            </div>
        </div>
    );
}
const tdStyle = { padding: "14px", fontSize: "13px", borderBottom: "1px solid var(--border)" };