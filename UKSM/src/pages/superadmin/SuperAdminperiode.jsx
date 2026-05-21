import { useState, useEffect, useCallback, useRef } from "react";
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock3,
  X,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
} from "lucide-react";
import {
  getPeriodsApi,
  createPeriodApi,
  updatePeriodApi,
  deletePeriodApi,
  togglePeriodApi,
} from "../../api/superadmin";

/* ================================================================ */
/* HELPERS                                                           */
/* ================================================================ */

/** Convert "YYYY-MM-DD" → "DD/MM/YYYY" */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

function emptyForm() {
  return {
    nama: "",
    tahun: new Date().getFullYear(),
    tanggal_mulai: "",
    tanggal_selesai: "",
    is_active: false,
  };
}

/* shared form input style */
const inputStyle = {
  width: "100%",
  borderRadius: "14px",
  border: "1px solid var(--border)",
  background: "var(--bg-light)",
  padding: "13px 16px",
  outline: "none",
  fontSize: "14px",
  color: "var(--text-main)",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "var(--text-main)",
  marginBottom: "7px",
};

/* ================================================================ */
/* MAIN COMPONENT                                                    */
/* ================================================================ */

export default function SuperAdminperiode() {
  /* ---------- data ---------- */
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------- modal ---------- */
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null); // null = add mode
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);

  /* ---------- delete ---------- */
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ---------- toast ---------- */
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }
  const toastTimer = useRef(null);

  /* ================================================================ */
  /* TOAST                                                             */
  /* ================================================================ */
  function showToast(type, message) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  /* ================================================================ */
  /* FETCH                                                             */
  /* ================================================================ */
  const fetchPeriods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPeriodsApi();
      // handle { data: [...] } or plain array
      const items = res?.data ?? res ?? [];
      setPeriods(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(err);
      showToast("error", "Gagal memuat data periode.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  /* ================================================================ */
  /* DERIVED STATS                                                     */
  /* ================================================================ */
  const totalPeriods = periods.length;
  const activePeriod = periods.find((p) => p.is_active) ?? null;
  const arsipCount = periods.filter((p) => !p.is_active).length;

  /* ================================================================ */
  /* MODAL HELPERS                                                     */
  /* ================================================================ */
  function openAdd() {
    setEditItem(null);
    setForm(emptyForm());
    setShowModal(true);
  }

  function openEdit(p) {
    setEditItem(p);
    setForm({
      nama: p.nama ?? "",
      tahun: p.tahun ?? new Date().getFullYear(),
      tanggal_mulai: p.tanggal_mulai ?? "",
      tanggal_selesai: p.tanggal_selesai ?? "",
      is_active: !!p.is_active,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditItem(null);
    setForm(emptyForm());
  }

  /* ================================================================ */
  /* SUBMIT (ADD / EDIT)                                               */
  /* ================================================================ */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nama.trim()) {
      showToast("error", "Nama periode wajib diisi.");
      return;
    }
    if (!form.tanggal_mulai || !form.tanggal_selesai) {
      showToast("error", "Tanggal mulai dan selesai wajib diisi.");
      return;
    }
    setSubmitting(true);
    try {
      if (editItem) {
        await updatePeriodApi(editItem.id, form);
        showToast("success", "Periode berhasil diperbarui.");
      } else {
        await createPeriodApi(form);
        showToast("success", "Periode baru berhasil ditambahkan.");
      }
      closeModal();
      fetchPeriods();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ??
        (editItem
          ? "Gagal memperbarui periode."
          : "Gagal menambahkan periode.");
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  }

  /* ================================================================ */
  /* TOGGLE ACTIVE                                                     */
  /* ================================================================ */
  async function handleToggle(p) {
    try {
      await togglePeriodApi(p.id);
      showToast(
        "success",
        p.is_active
          ? `"${p.nama}" telah diarsipkan.`
          : `"${p.nama}" dijadikan periode aktif.`,
      );
      fetchPeriods();
    } catch (err) {
      console.error(err);
      showToast(
        "error",
        err?.response?.data?.message ?? "Gagal mengubah status periode.",
      );
    }
  }

  /* ================================================================ */
  /* DELETE                                                            */
  /* ================================================================ */
  async function handleDelete() {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deletePeriodApi(deleteTarget.id);
      showToast("success", `Periode "${deleteTarget.nama}" berhasil dihapus.`);
      setDeleteTarget(null);
      fetchPeriods();
    } catch (err) {
      console.error(err);
      showToast(
        "error",
        err?.response?.data?.message ?? "Gagal menghapus periode.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ================================================================ */
  /* RENDER                                                            */
  /* ================================================================ */
  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      {/* CSS for spinner */}
      <style>{`@keyframes sp { to { transform: rotate(360deg); } }`}</style>

      {/* ============================================================ */}
      {/* TOAST                                                         */}
      {/* ============================================================ */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 20px",
            borderRadius: "16px",
            background: toast.type === "success" ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${toast.type === "success" ? "#6EE7B7" : "#FECACA"}`,
            color: toast.type === "success" ? "#065F46" : "#991B1B",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            fontWeight: 600,
            fontSize: "14px",
            minWidth: "280px",
            maxWidth: "400px",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
          )}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              padding: 0,
              display: "flex",
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* DELETE CONFIRM DIALOG                                         */}
      {/* ============================================================ */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => !submitting && setDeleteTarget(null)}
        >
          <div
            style={{
              background: "var(--card-bg, #fff)",
              borderRadius: "24px",
              padding: "32px",
              maxWidth: "440px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "#FEF2F2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <Trash2 size={24} />
            </div>

            <h3
              style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}
            >
              Hapus Periode
            </h3>
            <p
              className="text-muted"
              style={{
                fontSize: "14px",
                lineHeight: 1.7,
                marginBottom: "28px",
              }}
            >
              Anda yakin ingin menghapus{" "}
              <strong style={{ color: "var(--text-main)" }}>
                {deleteTarget.nama}
              </strong>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn"
                style={{
                  background: "var(--bg-light)",
                  color: "var(--text-main)",
                  border: "1px solid var(--border)",
                }}
                disabled={submitting}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="btn"
                style={{
                  background: "#DC2626",
                  color: "#fff",
                  border: "none",
                  opacity: submitting ? 0.7 : 1,
                }}
                disabled={submitting}
              >
                {submitting ? "Menghapus…" : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD / EDIT MODAL                                              */}
      {/* ============================================================ */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "var(--card-bg, #fff)",
              borderRadius: "28px",
              padding: "32px",
              maxWidth: "520px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "28px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    marginBottom: "4px",
                  }}
                >
                  {editItem ? "Edit Periode" : "Tambah Periode"}
                </h3>
                <p className="text-muted" style={{ fontSize: "13px" }}>
                  {editItem
                    ? "Perbarui informasi periode assessment"
                    : "Isi data untuk membuat periode baru"}
                </p>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: "var(--bg-light)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  flexShrink: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gap: "18px" }}>
                {/* Nama Periode */}
                <div>
                  <label style={labelStyle}>
                    Nama Periode <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Semester Ganjil 2025/2026"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Tahun */}
                <div>
                  <label style={labelStyle}>
                    Tahun <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 2025"
                    value={form.tahun}
                    onChange={(e) =>
                      setForm({ ...form, tahun: e.target.value })
                    }
                    required
                    min="2000"
                    max="2100"
                    style={inputStyle}
                  />
                </div>

                {/* Tanggal Mulai & Selesai */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>
                      Tanggal Mulai <span style={{ color: "#DC2626" }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={form.tanggal_mulai}
                      onChange={(e) =>
                        setForm({ ...form, tanggal_mulai: e.target.value })
                      }
                      required
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Tanggal Selesai{" "}
                      <span style={{ color: "#DC2626" }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={form.tanggal_selesai}
                      onChange={(e) =>
                        setForm({ ...form, tanggal_selesai: e.target.value })
                      }
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Is Active toggle row */}
                <div
                  role="button"
                  tabIndex={0}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    border: `1px solid ${form.is_active ? "#BBF7D0" : "var(--border)"}`,
                    background: form.is_active ? "#F0FDF4" : "var(--bg-light)",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "all 0.2s",
                  }}
                  onClick={() =>
                    setForm({ ...form, is_active: !form.is_active })
                  }
                  onKeyDown={(e) =>
                    e.key === " " &&
                    setForm({ ...form, is_active: !form.is_active })
                  }
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "14px" }}>
                      Status Aktif
                    </div>
                    <div
                      className="text-muted"
                      style={{ fontSize: "12px", marginTop: "2px" }}
                    >
                      Jadikan periode ini sebagai periode aktif saat ini
                    </div>
                  </div>

                  {/* Pill toggle */}
                  <div
                    style={{
                      width: "48px",
                      height: "26px",
                      borderRadius: "999px",
                      background: form.is_active ? "#16A34A" : "#D1D5DB",
                      position: "relative",
                      transition: "background 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "#fff",
                        position: "absolute",
                        top: "3px",
                        left: form.is_active ? "25px" : "3px",
                        transition: "left 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Form footer */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                  marginTop: "28px",
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn"
                  style={{
                    background: "var(--bg-light)",
                    color: "var(--text-main)",
                    border: "1px solid var(--border)",
                  }}
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary), var(--secondary))",
                    color: "#fff",
                    border: "none",
                    opacity: submitting ? 0.7 : 1,
                  }}
                  disabled={submitting}
                >
                  {submitting
                    ? editItem
                      ? "Menyimpan…"
                      : "Menambahkan…"
                    : editItem
                      ? "Simpan Perubahan"
                      : "Tambah Periode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE HEADER                                                   */}
      {/* ============================================================ */}
      <div
        className="flex items-start justify-between mb-6"
        style={{ gap: "16px", flexWrap: "wrap" }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(22px, 4vw, 32px)",
              fontWeight: 800,
              marginBottom: "8px",
            }}
          >
            Periode Assessment
          </h1>
          <p
            className="text-muted"
            style={{ fontSize: "14px", lineHeight: 1.7 }}
          >
            Kelola periode penilaian UKS: buat, aktifkan, dan arsipkan periode
            assessment.
          </p>
        </div>

        <button
          onClick={openAdd}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background:
              "linear-gradient(135deg, var(--primary), var(--secondary))",
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
          <Plus size={18} />
          Tambah Periode
        </button>
      </div>

      {/* ============================================================ */}
      {/* SUMMARY STATS                                                 */}
      {/* ============================================================ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        <StatCard
          icon={<CalendarDays size={22} />}
          label="Total Periode"
          value={loading ? "—" : totalPeriods}
          bg="var(--accent-glow)"
          color="var(--secondary)"
        />
        <StatCard
          icon={<CheckCircle2 size={22} />}
          label="Periode Aktif"
          value={loading ? "—" : activePeriod ? activePeriod.nama : "Tidak ada"}
          valueSm
          bg="#DCFCE7"
          color="#15803D"
        />
        <StatCard
          icon={<Clock3 size={22} />}
          label="Periode Arsip"
          value={loading ? "—" : arsipCount}
          bg="#F3F4F6"
          color="#6B7280"
        />
      </div>

      {/* ============================================================ */}
      {/* PERIOD LIST                                                   */}
      {/* ============================================================ */}
      {loading ? (
        /* Loading spinner */
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 0",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid var(--border)",
              borderTopColor: "var(--secondary)",
              borderRadius: "50%",
              animation: "sp 0.8s linear infinite",
            }}
          />
        </div>
      ) : periods.length === 0 ? (
        /* Empty state */
        <div
          className="card glass-panel"
          style={{
            padding: "60px 28px",
            borderRadius: "24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: "var(--bg-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              color: "var(--text-muted)",
            }}
          >
            <CalendarDays size={30} />
          </div>
          <div
            style={{ fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}
          >
            Belum ada periode
          </div>
          <p
            className="text-muted"
            style={{ fontSize: "14px", marginBottom: "24px" }}
          >
            Mulai dengan menambahkan periode assessment pertama.
          </p>
          <button
            onClick={openAdd}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background:
                "linear-gradient(135deg, var(--primary), var(--secondary))",
              color: "white",
              border: "none",
              padding: "11px 22px",
              borderRadius: "12px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <Plus size={16} />
            Tambah Periode
          </button>
        </div>
      ) : (
        /* Card list */
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {periods.map((p) => (
            <PeriodCard
              key={p.id}
              period={p}
              onEdit={() => openEdit(p)}
              onToggle={() => handleToggle(p)}
              onDelete={() => setDeleteTarget(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/* PERIOD CARD                                                       */
/* ================================================================ */
function PeriodCard({ period, onEdit, onToggle, onDelete }) {
  const isActive = !!period.is_active;

  return (
    <div
      className="card glass-panel"
      style={{
        padding: "26px 28px",
        borderRadius: "24px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap",
        justifyContent: "space-between",
        borderLeft: isActive ? "4px solid #16A34A" : undefined,
      }}
    >
      {/* LEFT — icon + info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          flex: 1,
          minWidth: "220px",
        }}
      >
        {/* Calendar icon */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: isActive ? "#DCFCE7" : "var(--bg-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isActive ? "#15803D" : "var(--text-muted)",
            flexShrink: 0,
          }}
        >
          <CalendarDays size={26} />
        </div>

        {/* Text */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "4px",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "17px" }}>
              {period.nama}
            </span>

            {isActive && (
              <span
                style={{
                  background: "linear-gradient(135deg, #16A34A, #15803D)",
                  color: "#fff",
                  padding: "3px 12px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.4px",
                }}
              >
                PERIODE AKTIF
              </span>
            )}
          </div>

          <div className="text-muted" style={{ fontSize: "13px" }}>
            {formatDate(period.tanggal_mulai)} —{" "}
            {formatDate(period.tanggal_selesai)}
          </div>
        </div>
      </div>

      {/* RIGHT — badge + actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {/* Status badge */}
        <span
          style={{
            background: isActive ? "#DCFCE7" : "#F3F4F6",
            color: isActive ? "#15803D" : "#6B7280",
            padding: "6px 16px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            whiteSpace: "nowrap",
          }}
        >
          {isActive ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
          {isActive ? "Aktif" : "Arsip"}
        </span>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {/* Edit */}
          <button
            onClick={onEdit}
            className="btn btn-outline"
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Pencil size={13} />
            Edit
          </button>

          {/* Toggle active / arsip */}
          <button
            onClick={onToggle}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              background: isActive ? "#FEF3C7" : "#ECFDF5",
              color: isActive ? "#D97706" : "#16A34A",
              border: `1px solid ${isActive ? "#FDE68A" : "#BBF7D0"}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            {isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
            {isActive ? "Arsipkan" : "Aktifkan"}
          </button>

          {/* Delete — only when NOT active */}
          {!isActive && (
            <button
              onClick={onDelete}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                background: "#FEE2E2",
                color: "#DC2626",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Trash2 size={13} />
              Hapus
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/* STAT CARD                                                         */
/* ================================================================ */
function StatCard({ icon, label, value, valueSm = false, bg, color }) {
  return (
    <div
      className="card"
      style={{
        padding: "22px 24px",
        borderRadius: "22px",
        border: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: bg,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "14px",
        }}
      >
        {icon}
      </div>

      <div
        className="text-muted"
        style={{ fontSize: "13px", marginBottom: "6px" }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: valueSm ? "15px" : "28px",
          fontWeight: 800,
          lineHeight: 1.2,
          color: "var(--text-main)",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}
