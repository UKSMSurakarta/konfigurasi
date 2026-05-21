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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getSuperadminMonitoringApi } from "../../api/superadmin";
import {
  getAdminLevelsApi,
  createPertanyaanApi,
  updatePertanyaanApi,
  deletePertanyaanApi,
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
  /* ── Monitoring state ──────────────────────────────────── */
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /* ── Levels / Questionnaire state ─────────────────────── */
  const [levels, setLevels] = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [openLevel, setOpenLevel] = useState({});
  const [editDraft, setEditDraft] = useState({}); // { [pertanyaanId]: draftText }
  const [newQuestion, setNewQuestion] = useState({}); // { [levelId]: text }
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [addingId, setAddingId] = useState(null);

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

  /* ── Fetch levels + pertanyaans ───────────────────────── */
  useEffect(() => {
    setLoadingLevels(true);
    getAdminLevelsApi()
      .then((res) => {
        const raw = res?.data ?? res ?? [];
        const arr = Array.isArray(raw) ? raw : [];
        setLevels(arr);

        // seed editDraft from existing pertanyaans
        const drafts = {};
        arr.forEach((lv) =>
          (lv.pertanyaans || []).forEach((p) => {
            drafts[p.id] = p.teks_pertanyaan ?? "";
          }),
        );
        setEditDraft(drafts);

        // auto-open first level
        if (arr.length > 0) setOpenLevel({ [arr[0].id]: true });
      })
      .catch(console.error)
      .finally(() => setLoadingLevels(false));
  }, []);

  /* ── Action: toggle accordion ─────────────────────────── */
  function toggleLevel(id) {
    setOpenLevel((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  /* ── Action: save edited question ────────────────────── */
  async function handleSave(pertanyaanId) {
    const text = (editDraft[pertanyaanId] ?? "").trim();
    if (!text) return;
    setSavingId(pertanyaanId);
    try {
      await updatePertanyaanApi(pertanyaanId, { teks_pertanyaan: text });
      setLevels((prev) =>
        prev.map((lv) => ({
          ...lv,
          pertanyaans: (lv.pertanyaans || []).map((p) =>
            p.id === pertanyaanId ? { ...p, teks_pertanyaan: text } : p,
          ),
        })),
      );
    } catch (err) {
      alert(
        "Gagal menyimpan: " + (err?.response?.data?.message ?? err.message),
      );
    } finally {
      setSavingId(null);
    }
  }

  /* ── Action: delete question ──────────────────────────── */
  async function handleDelete(levelId, pertanyaanId) {
    if (!window.confirm("Yakin ingin menghapus pertanyaan ini?")) return;
    setDeletingId(pertanyaanId);
    try {
      await deletePertanyaanApi(pertanyaanId);
      setLevels((prev) =>
        prev.map((lv) =>
          lv.id === levelId
            ? {
                ...lv,
                pertanyaans: (lv.pertanyaans || []).filter(
                  (p) => p.id !== pertanyaanId,
                ),
              }
            : lv,
        ),
      );
      setEditDraft((prev) => {
        const next = { ...prev };
        delete next[pertanyaanId];
        return next;
      });
    } catch (err) {
      alert(
        "Gagal menghapus: " + (err?.response?.data?.message ?? err.message),
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* ── Action: add new question ─────────────────────────── */
  async function handleAdd(levelId) {
    const text = (newQuestion[levelId] ?? "").trim();
    if (!text) return;
    setAddingId(levelId);
    try {
      const res = await createPertanyaanApi(levelId, {
        teks_pertanyaan: text,
        tipe_pertanyaan: "ya_tidak",
      });
      const newP = res?.data ?? res;
      setLevels((prev) =>
        prev.map((lv) =>
          lv.id === levelId
            ? { ...lv, pertanyaans: [...(lv.pertanyaans || []), newP] }
            : lv,
        ),
      );
      setEditDraft((prev) => ({
        ...prev,
        [newP.id]: newP.teks_pertanyaan ?? "",
      }));
      setNewQuestion((prev) => ({ ...prev, [levelId]: "" }));
    } catch (err) {
      alert(
        "Gagal menambah pertanyaan: " +
          (err?.response?.data?.message ?? err.message),
      );
    } finally {
      setAddingId(null);
    }
  }

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

  const totalPertanyaan = levels.reduce(
    (acc, lv) => acc + (lv.pertanyaans?.length ?? 0),
    0,
  );

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

      {/* ═══════════════════ MANAJEMEN KUISIONER ═══════════════════ */}
      <div
        className="card glass-panel"
        style={{ padding: "28px", borderRadius: "28px" }}
      >
        {/* SECTION HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "28px",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}
            >
              Manajemen Kuisioner
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Tambah, edit, dan hapus pertanyaan untuk setiap level UKS.
            </p>
          </div>
          <div
            style={{
              background:
                "linear-gradient(135deg,var(--primary),var(--secondary))",
              color: "white",
              padding: "10px 20px",
              borderRadius: "14px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <ClipboardList size={18} />
            {loadingLevels ? "…" : totalPertanyaan} Pertanyaan
          </div>
        </div>

        {/* LOADING */}
        {loadingLevels ? (
          <div
            style={{
              textAlign: "center",
              padding: "52px 0",
              color: "var(--text-muted)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                border: "3px solid #e5e7eb",
                borderTop: "3px solid var(--primary)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 14px",
              }}
            />
            <p style={{ fontSize: "14px" }}>Memuat data kuisioner…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : levels.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "52px 0",
              color: "var(--text-muted)",
            }}
          >
            <ClipboardList
              size={40}
              style={{ margin: "0 auto 12px", opacity: 0.35 }}
            />
            <p style={{ fontSize: "14px" }}>Belum ada level tersedia.</p>
          </div>
        ) : (
          /* ACCORDION LIST */
          levels.map((lv) => {
            const palette = getLevelColor(lv.urutan ?? 1);
            const isOpen = !!openLevel[lv.id];
            const pertanyaans = lv.pertanyaans ?? [];

            return (
              <div
                key={lv.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "22px",
                  overflow: "hidden",
                  marginBottom: "20px",
                }}
              >
                {/* ── ACCORDION HEADER ── */}
                <div
                  onClick={() => toggleLevel(lv.id)}
                  style={{
                    padding: "18px 22px",
                    background: "var(--bg-light)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        background: palette.bg,
                        color: palette.color,
                        padding: "6px 16px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: 700,
                      }}
                    >
                      {lv.nama}
                    </span>
                    {lv.kode && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          background: "var(--border)",
                          padding: "3px 10px",
                          borderRadius: "999px",
                        }}
                      >
                        {lv.kode}
                      </span>
                    )}
                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        fontSize: "14px",
                      }}
                    >
                      {pertanyaans.length} Pertanyaan
                    </span>
                  </div>
                  <div style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                    {isOpen ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </div>

                {/* ── ACCORDION BODY ── */}
                {isOpen && (
                  <div style={{ padding: "24px" }}>
                    {/* DESCRIPTION */}
                    {lv.deskripsi && (
                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--text-muted)",
                          marginBottom: "20px",
                          paddingLeft: "4px",
                        }}
                      >
                        {lv.deskripsi}
                      </p>
                    )}

                    {/* PERTANYAAN LIST */}
                    {pertanyaans.length === 0 && (
                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--text-muted)",
                          marginBottom: "16px",
                          fontStyle: "italic",
                        }}
                      >
                        Belum ada pertanyaan untuk level ini.
                      </p>
                    )}

                    {pertanyaans.map((p, idx) => (
                      <div
                        key={p.id}
                        style={{
                          background: "#FAFAFA",
                          border: "1px solid #EBEBEB",
                          borderRadius: "18px",
                          padding: "18px",
                          marginBottom: "14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "16px",
                            flexWrap: "wrap",
                            alignItems: "flex-start",
                          }}
                        >
                          {/* TEXTAREA SIDE */}
                          <div style={{ flex: 1, minWidth: "220px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "10px",
                              }}
                            >
                              <Pencil
                                size={13}
                                style={{ color: palette.color }}
                              />
                              <span
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  color: palette.color,
                                }}
                              >
                                Pertanyaan {idx + 1}
                              </span>
                            </div>
                            <textarea
                              value={editDraft[p.id] ?? p.teks_pertanyaan ?? ""}
                              onChange={(e) =>
                                setEditDraft((prev) => ({
                                  ...prev,
                                  [p.id]: e.target.value,
                                }))
                              }
                              rows={3}
                              style={{
                                width: "100%",
                                minHeight: "86px",
                                borderRadius: "14px",
                                border: "1px solid #ddd",
                                padding: "12px 14px",
                                outline: "none",
                                resize: "vertical",
                                fontSize: "14px",
                                lineHeight: 1.6,
                                boxSizing: "border-box",
                                fontFamily: "inherit",
                                background: "white",
                              }}
                            />
                          </div>

                          {/* ACTION BUTTONS */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                              flexShrink: 0,
                            }}
                          >
                            <button
                              onClick={() => handleSave(p.id)}
                              disabled={savingId === p.id}
                              title="Simpan perubahan"
                              style={{
                                width: "42px",
                                height: "42px",
                                border: "none",
                                borderRadius: "12px",
                                background: "#DBEAFE",
                                color: "#2563EB",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: savingId === p.id ? "wait" : "pointer",
                                opacity: savingId === p.id ? 0.55 : 1,
                                transition: "opacity 0.2s",
                              }}
                            >
                              <Save size={17} />
                            </button>
                            <button
                              onClick={() => handleDelete(lv.id, p.id)}
                              disabled={deletingId === p.id}
                              title="Hapus pertanyaan"
                              style={{
                                width: "42px",
                                height: "42px",
                                border: "none",
                                borderRadius: "12px",
                                background: "#FEE2E2",
                                color: "#DC2626",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor:
                                  deletingId === p.id ? "wait" : "pointer",
                                opacity: deletingId === p.id ? 0.55 : 1,
                                transition: "opacity 0.2s",
                              }}
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* ADD NEW QUESTION */}
                    <div
                      style={{
                        marginTop: "18px",
                        border: "2px dashed #D1D5DB",
                        borderRadius: "18px",
                        padding: "20px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "14px",
                          marginBottom: "14px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Plus size={16} style={{ color: palette.color }} />
                        Tambah Pertanyaan Baru
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <input
                          type="text"
                          value={newQuestion[lv.id] ?? ""}
                          onChange={(e) =>
                            setNewQuestion((prev) => ({
                              ...prev,
                              [lv.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAdd(lv.id);
                          }}
                          placeholder="Masukkan pertanyaan baru…"
                          style={{
                            flex: 1,
                            minWidth: "240px",
                            height: "50px",
                            borderRadius: "14px",
                            border: "1px solid #D1D5DB",
                            padding: "0 16px",
                            outline: "none",
                            fontSize: "14px",
                            fontFamily: "inherit",
                            background: "white",
                            boxSizing: "border-box",
                          }}
                        />
                        <button
                          onClick={() => handleAdd(lv.id)}
                          disabled={addingId === lv.id}
                          style={{
                            height: "50px",
                            padding: "0 24px",
                            border: "none",
                            borderRadius: "14px",
                            background: palette.color,
                            color: "white",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: addingId === lv.id ? "wait" : "pointer",
                            opacity: addingId === lv.id ? 0.7 : 1,
                            whiteSpace: "nowrap",
                            transition: "opacity 0.2s",
                            fontSize: "14px",
                          }}
                        >
                          <Plus size={17} />
                          {addingId === lv.id ? "Menyimpan…" : "Tambah"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
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
  background: "var(--bg-light)",
  paddingLeft: pl,
  paddingRight: "14px",
  outline: "none",
  fontSize: "14px",
  color: "var(--text-main)",
  boxSizing: "border-box",
});
