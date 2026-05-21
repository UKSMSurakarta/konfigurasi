import { useState, useEffect } from "react";
import {
    ShieldCheck,
    Users,
    AlertTriangle,
    Clock3,
    School,
    BellRing,
    CheckCircle2,
} from "lucide-react";

import { getAdminDashboardApi } from "../../api/admin";

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminDashboardApi()
            .then((res) => setData(res.data || res))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    // ==========================
    // DATA DASHBOARD
    // ==========================

    const stats = data?.stats || {};

    const pengumuman =
        data?.pengumuman ||
        data?.recent_pengumuman ||
        [];

    const belumSelesai =
        data?.belum_selesai ||
        data?.sekolah_perlu_perhatian ||
        [];

    const predikat =
        data?.rekap_predikat ||
        [];

    // ==========================
    // STATISTIK
    // ==========================

    const selesai =
        Number(stats.terverifikasi) || 0;

    const menunggu =
        Number(stats.menunggu_verifikasi) || 0;

    const belum =
        Number(stats.belum_selesai) || 0;

    // fallback jika total dari backend kosong
    const total =
        Number(stats.total_sekolah) ||
        (selesai + menunggu + belum);

    // ==========================
    // PERSENTASE PIE CHART
    // ==========================

    const persenSelesai =
        total > 0
            ? ((selesai / total) * 100).toFixed(1)
            : 0;

    const persenMenunggu =
        total > 0
            ? (((selesai + menunggu) / total) * 100).toFixed(1)
            : 0;

    return (
        <div style={{ width: "100%", overflowX: "hidden" }}>
            {/* HEADER */}

            <div
                className="flex items-start justify-between gap-4 mb-6"
                style={{ flexWrap: "wrap" }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: "clamp(22px,4vw,30px)",
                            fontWeight: 700,
                            marginBottom: 6,
                        }}
                    >
                        Dashboard Koordinator Wilayah
                    </h1>

                    <p
                        className="text-muted"
                        style={{
                            fontSize: "14px",
                            lineHeight: 1.6,
                        }}
                    >
                        Monitoring progres penilaian UKS sekolah binaan
                    </p>
                </div>

                <div className="badge badge-glow">
                    {data?.periode || "Periode Aktif"}
                </div>
            </div>

            {/* STAT CARD */}

            <div
                className="grid gap-5 mb-6"
                style={{
                    gridTemplateColumns:
                        "repeat(auto-fit,minmax(200px,1fr))",
                }}
            >
                <StatCard
                    icon={<Users size={24} />}
                    title="Total Sekolah"
                    value={String(total)}
                    color="var(--secondary)"
                    bg="var(--accent-glow)"
                />

                <StatCard
                    icon={<ShieldCheck size={24} />}
                    title="Terverifikasi"
                    value={String(selesai)}
                    color="var(--primary)"
                    bg="var(--bg-light)"
                />

                <StatCard
                    icon={<AlertTriangle size={24} />}
                    title="Menunggu Verifikasi"
                    value={String(menunggu)}
                    color="#D97706"
                    bg="#FEF3C7"
                />

                <StatCard
                    icon={<Clock3 size={24} />}
                    title="Belum Selesai"
                    value={String(belum)}
                    color="#EF4444"
                    bg="#FEE2E2"
                />
            </div>

            {/* PIE + PENGUMUMAN */}

            <div
                className="grid gap-6 mb-6"
                style={{
                    gridTemplateColumns:
                        "repeat(auto-fit,minmax(320px,1fr))",
                }}
            >
                {/* PIE */}

                <div
                    className="card glass-panel"
                    style={{
                        padding: "24px",
                        borderRadius: "24px",
                    }}
                >
                    <div
                        className="flex items-center gap-2 mb-5"
                    >
                        <CheckCircle2
                            size={22}
                            color="var(--primary)"
                        />

                        <h3
                            style={{
                                fontSize: "20px",
                                fontWeight: 700,
                            }}
                        >
                            Progres Sekolah Binaan
                        </h3>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: "24px",
                        }}
                    >
                        <div
                            style={{
                                width: "200px",
                                height: "200px",
                                borderRadius: "50%",
                                position: "relative",

                                background:
                                    total > 0
                                        ? `conic-gradient(
                                            #10B981 0% ${persenSelesai}%,
                                            #F59E0B ${persenSelesai}% ${persenMenunggu}%,
                                            #EF4444 ${persenMenunggu}% 100%
                                        )`
                                        : "#e5e7eb",
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    inset: "28px",
                                    background: "white",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexDirection: "column",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "28px",
                                        fontWeight: 700,
                                    }}
                                >
                                    {total}
                                </div>

                                <div
                                    className="text-muted"
                                    style={{
                                        fontSize: "12px",
                                    }}
                                >
                                    Total Sekolah
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >
                        <LegendItem
                            color="#10B981"
                            label="Terverifikasi"
                            value={`${selesai} Sekolah`}
                        />

                        <LegendItem
                            color="#F59E0B"
                            label="Menunggu Verifikasi"
                            value={`${menunggu} Sekolah`}
                        />

                        <LegendItem
                            color="#EF4444"
                            label="Belum Selesai"
                            value={`${belum} Sekolah`}
                        />
                    </div>
                </div>

                {/* PENGUMUMAN */}

                <div
                    className="card glass-panel"
                    style={{
                        padding: "24px",
                        borderRadius: "24px",
                    }}
                >
                    <div
                        className="flex items-center gap-2 mb-5"
                    >
                        <BellRing
                            size={22}
                            color="#F59E0B"
                        />

                        <h3
                            style={{
                                fontSize: "20px",
                                fontWeight: 700,
                            }}
                        >
                            Pengumuman Terbaru
                        </h3>
                    </div>

                    {pengumuman.length === 0 && (
                        <p className="text-muted">
                            Belum ada pengumuman
                        </p>
                    )}

                    {pengumuman.slice(0,3).map((p)=>(
                        <div
                            key={p.id}
                            style={{
                                padding:"16px",
                                borderRadius:"16px",
                                marginBottom:"12px",
                                background:"#DBEAFE",
                            }}
                        >
                            <div
                                style={{
                                    fontWeight:700,
                                }}
                            >
                                {p.judul}
                            </div>

                            <div
                                style={{
                                    fontSize:"13px",
                                    marginTop:"6px",
                                }}
                            >
                                {p.isi?.substring(0,120)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div
            style={{
                minHeight:"60vh",
                display:"flex",
                justifyContent:"center",
                alignItems:"center"
            }}
        >
            Loading...
        </div>
    );
}

function StatCard({
    icon,
    title,
    value,
    color,
    bg
}) {
    return (
        <div
            className="card"
            style={{
                padding:"22px",
                borderRadius:"22px",
                display:"flex",
                gap:"16px",
            }}
        >
            <div
                style={{
                    width:"56px",
                    height:"56px",
                    borderRadius:"18px",
                    background:bg,
                    color,
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center"
                }}
            >
                {icon}
            </div>

            <div>
                <div
                    className="text-muted"
                    style={{
                        fontSize:"13px"
                    }}
                >
                    {title}
                </div>

                <div
                    style={{
                        fontSize:"30px",
                        fontWeight:700
                    }}
                >
                    {value}
                </div>
            </div>
        </div>
    );
}

function LegendItem({
    color,
    label,
    value
}) {
    return (
        <div
            className="flex items-center justify-between"
        >
            <div
                className="flex items-center gap-2"
            >
                <div
                    style={{
                        width:"14px",
                        height:"14px",
                        borderRadius:"50%",
                        background:color
                    }}
                />

                <span>{label}</span>
            </div>

            <span>{value}</span>
        </div>
    );
}