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
  X,
  ShieldCheck,
  Award,
  School,
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
  verifikasiSekolahApi,
  getSekolahAssessmentDetailApi,
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

const PREDIKAT_LIST = [
  { key: "minimal", label: "Minimal", deskripsi: "Memenuhi syarat minimal", color: "#6B7280", bg: "#F3F4F6" },
  { key: "standar", label: "Standar", deskripsi: "Memenuhi standar dasar", color: "#3B82F6", bg: "#DBEAFE" },
  { key: "optimal", label: "Optimal", deskripsi: "Melampaui standar", color: "#F59E0B", bg: "#FEF3C7" },
  { key: "paripurna", label: "Paripurna", deskripsi: "Tingkat tertinggi", color: "#16A34A", bg: "#DCFCE7" },
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

  /* ── Detail state ─────────────────────────────────────── */
  const [detailSchool, setDetailSchool] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  /* ── Verification modal state ─────────────────────────── */
  const [modalVerif, setModalVerif] = useState(null);
  const [selPredikat, setSelPred] = useState("standar");
  const [catatan, setCatatan] = useState("");
  const [confirming, setConfirming] = useState(false);

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

  /* ── Handlers ─────────────────────────────────────────── */
  const fetchData = () => {
    setLoadingSchools(true);
    getSuperadminMonitoringApi()
      .then((res) => {
        const raw = res?.data?.data ?? res?.data ?? res ?? [];
        setSchools(Array.isArray(raw) ? raw : []);
      })
      .catch(console.error)
      .finally(() => setLoadingSchools(false));
  };

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

  async function handleVerify(schoolId, levelId, status = "disetujui") {
    if (!schoolId) return;
    setConfirming(true);
    try {
      await verifikasiSekolahApi(schoolId, levelId || 1, {
        predikat: null,
        catatan: catatan,
        status: status,
      });
      setModalVerif(null);
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
                            onClick={() => handleShowDetail(row)}
                            className="btn btn-outline"
                            style={{
                              padding: "6px 14px",
                              borderRadius: "10px",
                              fontSize: "13px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              cursor: "pointer",
                              border: "1px solid var(--border)",
                              background: "white"
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

      {/* ═══════════════════ MODAL DETAIL ═══════════════════ */}
      {detailSchool && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "var(--card-bg)", borderRadius: "28px", width: "100%", maxWidth: "900px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
                <div style={{ width: 48, height: 48, borderRadius: "16px", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                  <School size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>Detail Jawaban: {detailSchool.nama}</h2>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Progres: {detailData ? detailData.stats.progress : detailSchool.progress}%</div>
                </div>
              </div>
              <button onClick={() => setDetailSchool(null)} style={{ background: "rgba(0,0,0,0.05)", border: "none", width: 40, height: 40, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={20} />
              </button>
            </div>

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
                              <div style={{ fontSize: "13px", color: q.jawaban === 'Memenuhi' ? "#16A34A" : "#DC2626", fontWeight: 700 }}>{q.jawaban}</div>
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

            <div style={{ padding: "24px 32px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: "12px", background: "var(--bg-light)" }}>
              <button onClick={() => setDetailSchool(null)} style={{ padding: "0 24px", height: "46px", borderRadius: "12px", border: "1px solid var(--border)", background: "white", fontWeight: 600, cursor: "pointer" }}>
                Tutup
              </button>
              {detailData && !detailData.stats.is_verified && (
                <button
                  onClick={() => { setModalVerif(detailSchool); setSelPred("standar"); setCatatan(""); }}
                  style={{ padding: "0 24px", height: "46px", borderRadius: "12px", border: "none", background: "var(--primary)", color: "white", fontWeight: 700, cursor: "pointer" }}
                >
                  Verifikasi
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ MODAL VERIFIKASI ═══════════════ */}
      {modalVerif && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "var(--card-bg)", borderRadius: "28px", padding: "32px", maxWidth: "520px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: "22px" }}>
              <div className="flex items-center gap-3">
                <div style={{ width: 44, height: 44, borderRadius: "14px", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShieldCheck size={22} color="#16A34A" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "18px" }}>Konfirmasi Verifikasi</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{modalVerif.nama}</div>
                </div>
              </div>
              <button onClick={() => setModalVerif(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={22} />
              </button>
            </div>

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
              <button onClick={() => setModalVerif(null)} style={{ flex: 1, height: "48px", borderRadius: "14px", border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-main)", fontWeight: 600, cursor: "pointer" }}>
                Batal
              </button>
              <button
                onClick={() => handleVerify(modalVerif.id, 1, "ditolak")}
                disabled={confirming}
                style={{ flex: 1, height: "48px", borderRadius: "14px", border: "1px solid #FECACA", background: "#FEE2E2", color: "#B91C1C", fontWeight: 700, cursor: confirming ? "not-allowed" : "pointer", opacity: confirming ? 0.7 : 1 }}
              >
                {confirming ? "..." : "Tolak"}
              </button>
              <button
                onClick={() => handleVerify(modalVerif.id, 1, "disetujui")}
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