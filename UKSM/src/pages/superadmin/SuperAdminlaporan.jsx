import { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import {
  FileBarChart,
  Download,
  TrendingUp,
  School,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  getSuperadminDashboardApi,
  getSuperadminMonitoringApi,
} from "../../api/superadmin";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
export default function SuperAdminlaporan() {
  const navigate = useNavigate();
  const [dash, setDash] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ── Load both APIs concurrently ─────────────────────── */
  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([getSuperadminDashboardApi(), getSuperadminMonitoringApi()])
      .then(([dashRes, monRes]) => {
        /* Dashboard: supports { data: {...} } or flat object */
        setDash(dashRes?.data ?? dashRes ?? {});

        /* Monitoring: supports { data: { data: [] } }, { data: [] }, or [] */
        const raw = monRes?.data?.data ?? monRes?.data ?? monRes ?? [];
        setSchools(Array.isArray(raw) ? raw : []);
      })
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat data laporan. Silakan coba lagi.");
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── Derived values ───────────────────────────────────── */
  const stats = dash ?? {};

  /* Prefer server-aggregated values, fallback to computed */
  const totalSekolah = stats.total_sekolah ?? schools.length;
  const sudahSelesai =
    stats.terverifikasi ??
    schools.filter(
      (s) => s.status === "Terverifikasi" || s.status === "Selesai",
    ).length;
  const progressPct =
    stats.progress_persen ??
    (schools.length > 0
      ? Math.round((sudahSelesai / schools.length) * 100)
      : 0);
  const belumLapor =
    stats.belum_selesai ??
    schools.filter((s) => s.status === "Belum Selesai" || s.status === "Proses")
      .length;

  /* rekap_opd comes from the dashboard API */
  const opdList = stats.rekap_opd ?? stats.opd_progress ?? [];

  const handleExport = async () => {
    const exportData = opdList.map((row, index) => {
      const pct = row.persentase ?? row.persen ?? 0;
      const total = row.total_sekolah ?? row.totalSekolah ?? row.total ?? 0;
      const selesai = row.selesai ?? 0;

      return {
        "No": index + 1,
        "Wilayah / OPD": row.nama ?? row.name ?? "-",
        "Total Sekolah": total,
        "Sudah Selesai": selesai,
        "Progress (%)": pct,
      };
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan_Nasional");
    const columns = Object.keys(exportData[0] ?? {}).map((key) => ({ header: key, key, width: 20 }));
    worksheet.columns = columns;
    exportData.forEach((row) => worksheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Laporan_Nasional_UKS.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  /* ── Render helpers ─────────────────────────────────── */
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div style={{ width: "100%" }}>
      {/* ═══════════════════ HEADER ═══════════════════ */}
      <div
        className="flex items-start justify-between mb-6"
        style={{ gap: "16px", flexWrap: "wrap" }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(22px,4vw,32px)",
              fontWeight: 800,
              marginBottom: "8px",
            }}
          >
            Laporan &amp; Rekap Nasional
          </h1>
          <p
            className="text-muted"
            style={{ fontSize: "14px", lineHeight: 1.7 }}
          >
            Rekap progres assessment UKS per wilayah OPD secara nasional.
            {stats.periode_aktif && (
              <span
                style={{
                  marginLeft: "8px",
                  fontWeight: 600,
                  color: "var(--primary)",
                }}
              >
                •{" "}
                {typeof stats.periode_aktif === "object"
                  ? stats.periode_aktif.nama
                  : stats.periode_aktif}
              </span>
            )}
          </p>
        </div>

        {/* EXPORT BUTTON */}
        <button
          onClick={handleExport}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background:
              "linear-gradient(135deg,var(--primary),var(--secondary))",
            color: "white",
            border: "none",
            padding: "12px 22px",
            borderRadius: "14px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "14px",
            whiteSpace: "nowrap",
          }}
        >
          <Download size={18} />
          Ekspor Laporan
        </button>
      </div>

      {/* ═══════════════════ STAT CARDS ═══════════════ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        {[
          {
            icon: <School size={22} />,
            label: "Total Sekolah",
            value: totalSekolah.toLocaleString("id-ID"),
            color: "var(--primary)",
            bg: "var(--bg-light)",
          },
          {
            icon: <CheckCircle2 size={22} />,
            label: "Sudah Selesai",
            value: sudahSelesai.toLocaleString("id-ID"),
            color: "#15803D",
            bg: "#DCFCE7",
          },
          {
            icon: <TrendingUp size={22} />,
            label: "Progress Nasional",
            value: `${progressPct}%`,
            color: "#4338CA",
            bg: "#EEF2FF",
          },
          {
            icon: <AlertTriangle size={22} />,
            label: "Belum Lapor",
            value: belumLapor.toLocaleString("id-ID"),
            color: "#DC2626",
            bg: "#FEE2E2",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="card"
            style={{
              padding: "22px",
              borderRadius: "22px",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: s.bg,
                color: s.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "14px",
              }}
            >
              {s.icon}
            </div>
            <div
              className="text-muted"
              style={{ fontSize: "13px", marginBottom: "6px" }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: s.color,
                lineHeight: 1.1,
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════ PROGRESS BAR OVERVIEW ═══════════════════ */}
      <div
        className="card glass-panel"
        style={{ padding: "28px", borderRadius: "28px", marginBottom: "24px" }}
      >
        <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "18px" }}>
          Progress Keseluruhan
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              flex: 1,
              height: "14px",
              borderRadius: "999px",
              background: "#E5E7EB",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: "100%",
                borderRadius: "999px",
                background:
                  progressPct >= 80
                    ? "#16A34A"
                    : progressPct >= 60
                      ? "#F59E0B"
                      : "var(--primary)",
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: "20px",
              minWidth: "52px",
              textAlign: "right",
            }}
          >
            {progressPct}%
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "16px",
            flexWrap: "wrap",
          }}
        >
          <Legend color="#16A34A" label="Terverifikasi" value={sudahSelesai} />
          <Legend
            color="#F59E0B"
            label="Menunggu Verifikasi"
            value={stats.menunggu_verifikasi ?? "–"}
          />
          <Legend color="#DC2626" label="Belum Selesai" value={belumLapor} />
        </div>
      </div>

      {/* ═══════════════════ PER-OPD TABLE ═══════════════════ */}
      <div
        className="card glass-panel"
        style={{ padding: "28px", borderRadius: "28px" }}
      >
        <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>
          Rekap Per Wilayah / OPD
        </h3>
        <p
          className="text-muted"
          style={{ fontSize: "13px", marginBottom: "24px" }}
        >
          Progress assessment berdasarkan Dinas / OPD wilayah
        </p>

        {opdList.length === 0 ? (
          /* EMPTY STATE */
          <div
            style={{
              textAlign: "center",
              padding: "52px 0",
              color: "var(--text-muted)",
            }}
          >
            <FileBarChart
              size={44}
              style={{ margin: "0 auto 14px", opacity: 0.3 }}
            />
            <p style={{ fontSize: "14px" }}>
              Belum ada data rekap OPD tersedia.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "640px",
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-light)" }}>
                  {[
                    "Wilayah / OPD",
                    "Total Sekolah",
                    "Sudah Selesai",
                    "Progress",
                    "Aksi",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "16px 18px",
                        fontSize: "13px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {opdList.map((row, i) => {
                  const pct = row.persentase ?? row.persen ?? 0;
                  const barColor =
                    pct >= 80 ? "#16A34A" : pct >= 60 ? "#F59E0B" : "#DC2626";
                  const total =
                    row.total_sekolah ?? row.totalSekolah ?? row.total ?? 0;
                  const selesai = row.selesai ?? 0;

                  return (
                    <tr
                      key={row.id ?? i}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      {/* WILAYAH */}
                      <td style={td}>
                        <div style={{ fontWeight: 600 }}>
                          {row.nama ?? row.name ?? "–"}
                        </div>
                      </td>

                      {/* TOTAL SEKOLAH */}
                      <td style={td}>
                        <span style={{ fontWeight: 500 }}>
                          {total.toLocaleString("id-ID")}
                        </span>
                      </td>

                      {/* SUDAH SELESAI */}
                      <td style={td}>
                        <span style={{ fontWeight: 500, color: "#15803D" }}>
                          {selesai.toLocaleString("id-ID")}
                        </span>
                      </td>

                      {/* PROGRESS BAR */}
                      <td style={td}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            minWidth: "160px",
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              height: "8px",
                              borderRadius: "999px",
                              background: "#E5E7EB",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                borderRadius: "999px",
                                background: barColor,
                                transition: "width 0.4s",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "13px",
                              color: barColor,
                              minWidth: "36px",
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </td>

                      {/* AKSI */}
                      <td style={td}>
                        <button
                          className="btn btn-outline"
                          onClick={() => navigate(`/superadmin/laporan/${row.id ?? i}`)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "10px",
                            fontSize: "13px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            cursor: "pointer",
                          }}
                        >
                          <FileBarChart size={13} /> Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HELPER COMPONENTS
───────────────────────────────────────────────────────────── */
function LoadingState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          border: "3px solid #e5e7eb",
          borderTop: "3px solid var(--primary)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p className="text-muted" style={{ fontSize: "14px" }}>
        Memuat data laporan nasional…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40vh",
        gap: "12px",
        textAlign: "center",
        padding: "32px",
      }}
    >
      <AlertTriangle size={40} style={{ color: "#DC2626", opacity: 0.7 }} />
      <p style={{ fontSize: "16px", fontWeight: 600, color: "#DC2626" }}>
        Terjadi Kesalahan
      </p>
      <p className="text-muted" style={{ fontSize: "14px", maxWidth: "420px" }}>
        {message}
      </p>
    </div>
  );
}

function Legend({ color, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "999px",
          background: color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
        {label}:
      </span>
      <span style={{ fontSize: "13px", fontWeight: 700 }}>
        {typeof value === "number" ? value.toLocaleString("id-ID") : value}
      </span>
    </div>
  );
}

/* ── style helper ── */
const td = { padding: "16px 18px", fontSize: "14px", verticalAlign: "middle" };
