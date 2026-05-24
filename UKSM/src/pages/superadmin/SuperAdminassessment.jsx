import { useState, useEffect } from "react";
import {
  ClipboardList,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Plus,
  Trash2,
  Save,
  Pencil,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getSuperadminMonitoringApi } from "../../api/superadmin";
import { useNavigate } from "react-router-dom";
import {
  getAdminLevelsApi,
  createPertanyaanApi,
  updatePertanyaanApi,
  deletePertanyaanApi,
  createAdminLevelApi,
  updateAdminLevelApi,
  deleteAdminLevelApi,
} from "../../api/admin";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const LEVEL_COLORS = [
  { color: "#2563EB", bg: "#DBEAFE" },
  { color: "#D97706", bg: "#FEF3C7" },
  { color: "#16A34A", bg: "#DCFCE7" },
  { color: "#9333EA", bg: "#F3E8FF" },
  { color: "#0891B2", bg: "#CFFAFE" },
  { color: "#E11D48", bg: "#FFE4E6" },
];

const STATUS_CFG = {
  Terverifikasi: {
    bg: "#DCFCE7",
    text: "#15803D",
    icon: <CheckCircle2 size={14} />,
  },
  Selesai: { bg: "#DCFCE7", text: "#15803D", icon: <CheckCircle2 size={14} /> },
  "Menunggu Verifikasi": {
    bg: "#FEF3C7",
    text: "#B45309",
    icon: <Clock3 size={14} />,
  },
  Proses: { bg: "#DBEAFE", text: "#1D4ED8", icon: <Clock3 size={14} /> },
  "Belum Selesai": {
    bg: "#FEE2E2",
    text: "#DC2626",
    icon: <AlertTriangle size={14} />,
  },
};

function getLevelColor(urutan = 1) {
  return LEVEL_COLORS[(Math.max(1, urutan) - 1) % LEVEL_COLORS.length];
}
function getStatusCfg(st) {
  return STATUS_CFG[st] ?? { bg: "#F3F4F6", text: "#6B7280", icon: null };
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
export default function SuperAdminAssessment() {
  const navigate = useNavigate();

  /* ── Monitoring state ──────────────────────────────────── */
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /* ── Fetch monitoring ─────────────────────────────────── */
  useEffect(() => {
    setLoadingSchools(true);
    getSuperadminMonitoringApi()
      .then((res) => {
        const raw = res?.data?.data ?? res?.data ?? res ?? [];
        setSchools(Array.isArray(raw) ? raw : []);
      })
      .catch(console.error)
      .finally(() => setLoadingSchools(false));
  }, []);

  /* ── Derived monitoring stats ─────────────────────────── */
  const totalSekolah = schools.length;
  const selesaiCount = schools.filter(
    (s) => s.status === "Terverifikasi" || s.status === "Selesai",
  ).length;
  const menungguCount = schools.filter(
    (s) => s.status === "Menunggu Verifikasi",
  ).length;
  const belumCount = schools.filter(
    (s) => s.status === "Belum Selesai" || s.status === "Proses",
  ).length;

  const filtered = schools.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      (s.nama ?? "").toLowerCase().includes(q) ||
      (s.opd ?? "").toLowerCase().includes(q) ||
      (s.jenjang ?? "").toLowerCase().includes(q);
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchStatus;
  });


  /* ── Render ───────────────────────────────────────────── */
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
            Manajemen Assessment
          </h1>
          <p
            className="text-muted"
            style={{ fontSize: "14px", lineHeight: 1.7 }}
          >
            Pantau dan kelola assessment UKS seluruh sekolah serta manajemen
            kuisioner UKS.
          </p>
        </div>
      </div>

      {/* ═══════════════════ STAT CARDS ═══════════════ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        {[
          {
            label: "Total Sekolah",
            value: loadingSchools ? "…" : totalSekolah,
            color: "var(--primary)",
          },
          {
            label: "Selesai",
            value: loadingSchools ? "…" : selesaiCount,
            color: "#16A34A",
          },
          {
            label: "Menunggu Verifikasi",
            value: loadingSchools ? "…" : menungguCount,
            color: "#D97706",
          },
          {
            label: "Belum Selesai",
            value: loadingSchools ? "…" : belumCount,
            color: "#DC2626",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="card"
            style={{
              padding: "20px",
              borderRadius: "20px",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                marginBottom: "8px",
              }}
            >
              {s.label}
            </div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════ MONITORING TABLE ═══════════════════ */}
      <div
        className="card glass-panel"
        style={{ padding: "28px", borderRadius: "28px", marginBottom: "28px" }}
      >
        {/* SECTION TITLE */}
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>
          Monitoring Assessment Sekolah
        </h2>
        <p
          className="text-muted"
          style={{ fontSize: "13px", marginBottom: "22px" }}
        >
          Data progres assessment per sekolah di seluruh wilayah.
        </p>

        {/* FILTERS */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Cari sekolah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inp("46px", "42px")}
            />
          </div>
          <div style={{ position: "relative" }}>
            <Filter
              size={16}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
                pointerEvents: "none",
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                height: "46px",
                borderRadius: "14px",
                border: "1px solid var(--border)",
                background: "var(--bg-light)",
                paddingLeft: "40px",
                paddingRight: "18px",
                outline: "none",
                fontSize: "14px",
                color: "var(--text-main)",
                cursor: "pointer",
              }}
            >
              <option value="">Semua Status</option>
              <option value="Terverifikasi">Terverifikasi</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Proses">Proses</option>
              <option value="Belum Selesai">Belum Selesai</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        {loadingSchools ? (
          <SkeletonTable cols={5} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "760px",
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-light)" }}>
                  {[
                    "Nama Sekolah",
                    "Jenjang",
                    "Progress",
                    "Status",
                    "Aksi",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "16px 18px",
                        fontSize: "13px",
                        fontWeight: 700,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: "48px",
                        color: "var(--text-muted)",
                        fontSize: "14px",
                      }}
                    >
                      Tidak ada data sekolah yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, i) => {
                    const sc = getStatusCfg(row.status);
                    const prog = row.progress ?? 0;
                    const progColor =
                      prog >= 80
                        ? "#16A34A"
                        : prog >= 60
                          ? "#F59E0B"
                          : "#DC2626";
                    return (
                      <tr
                        key={row.id ?? i}
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <td style={td}>
                          <span style={{ fontWeight: 600 }}>
                            {row.nama ?? "–"}
                          </span>
                        </td>
                        <td style={td}>{row.jenjang ?? "–"}</td>
                        <td style={td}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              minWidth: "170px",
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
                                  width: `${prog}%`,
                                  height: "100%",
                                  borderRadius: "999px",
                                  background: progColor,
                                  transition: "width 0.4s",
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: "13px",
                                minWidth: "36px",
                              }}
                            >
                              {prog}%
                            </span>
                          </div>
                        </td>
                        <td style={td}>
                          <span
                            style={{
                              background: sc.bg,
                              color: sc.text,
                              padding: "5px 12px",
                              borderRadius: "999px",
                              fontSize: "12px",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {sc.icon}
                            {row.status ?? "–"}
                          </span>
                        </td>
                        <td style={td}>
                          <button
                            onClick={() => navigate("/superadmin/verifikasi")}
                            className="btn btn-outline"
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
                            <Eye size={13} /> Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
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
function SkeletonTable({ cols = 5 }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <style>{`
        @keyframes shimmer {
          0%   { opacity: 1;   }
          50%  { opacity: 0.38; }
          100% { opacity: 1;   }
        }
      `}</style>
      <table
        style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px" }}
      >
        <tbody>
          {[1, 2, 3, 4].map((r) => (
            <tr key={r} style={{ borderBottom: "1px solid var(--border)" }}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} style={{ padding: "16px 18px" }}>
                  <div
                    style={{
                      height: "14px",
                      borderRadius: "7px",
                      background: "var(--bg-light)",
                      animation: "shimmer 1.4s ease-in-out infinite",
                      animationDelay: `${c * 0.08}s`,
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── style helpers ── */
const td = { padding: "16px 18px", fontSize: "14px", verticalAlign: "middle" };
const inp = (h = "46px", pl = "16px") => ({
  width: "100%",
  height: h,
  borderRadius: "14px",
  border: "1px solid var(--border)",
  padding: `0 ${pl}`,
  outline: "none",
  fontSize: "14px",
  fontFamily: "inherit",
  background: "white",
  boxSizing: "border-box",
});