import { useState, useEffect, useCallback, useRef } from "react";
import {
  Building2,
  Search,
  Plus,
  Pencil,
  Trash2,
  School,
  MapPin,
  Users,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  getOpdsApi,
  createOpdApi,
  updateOpdApi,
  deleteOpdApi,
} from "../../api/superadmin";

/* ================================================================ */
/* HELPERS                                                           */
/* ================================================================ */
function emptyForm() {
  return { nama: "", kode: "", alamat: "" };
}

/* ================================================================ */
/* MAIN COMPONENT                                                    */
/* ================================================================ */
export default function SuperadminManajemenOPD() {
  /* ---------- data state ---------- */
  const [opds, setOpds] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------- search ---------- */
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

  /* ---------- modal ---------- */
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);

  /* ---------- delete confirm ---------- */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

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
  /* SEARCH (debounced)                                                */
  /* ================================================================ */
  function handleSearchInput(e) {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
    }, 450);
  }

  /* ================================================================ */
  /* FETCH                                                             */
  /* ================================================================ */
  const fetchOpds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOpdsApi({ search });
      /* handle both {data: [...]} and {data: {data: [...]}} */
      const items = res?.data?.data ?? res?.data ?? res ?? [];
      setOpds(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(err);
      showToast("error", "Gagal memuat data OPD.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchOpds();
  }, [fetchOpds]);

  /* ================================================================ */
  /* DERIVED STATS                                                     */
  /* ================================================================ */
  const totalOPD = opds.length;
  const totalSekolah = opds.reduce(
    (sum, o) => sum + (Number(o.sekolahs_count) || 0),
    0,
  );
  const totalAdmin = opds.reduce(
    (sum, o) => sum + (Number(o.users_count) || 0),
    0,
  );

  /* ================================================================ */
  /* MODAL HELPERS                                                     */
  /* ================================================================ */
  function openAdd() {
    setEditTarget(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(opd) {
    setEditTarget(opd);
    setForm({
      nama: opd.nama ?? "",
      kode: opd.kode ?? "",
      alamat: opd.alamat ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditTarget(null);
    setForm(emptyForm());
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  /* ================================================================ */
  /* SUBMIT (ADD / EDIT)                                               */
  /* ================================================================ */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nama.trim()) {
      showToast("error", "Nama OPD wajib diisi.");
      return;
    }
    if (!form.kode.trim()) {
      showToast("error", "Kode OPD wajib diisi.");
      return;
    }
    setSubmitting(true);
    try {
      if (editTarget) {
        await updateOpdApi(editTarget.id, form);
        showToast("success", "Data OPD berhasil diperbarui.");
      } else {
        await createOpdApi(form);
        showToast("success", "OPD baru berhasil ditambahkan.");
      }
      closeModal();
      fetchOpds();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ??
        (editTarget ? "Gagal memperbarui OPD." : "Gagal menambahkan OPD.");
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  }

  /* ================================================================ */
  /* DELETE                                                            */
  /* ================================================================ */
  function openDelete(opd) {
    setDeleteTarget(opd);
    setDeleteError("");
  }

  function closeDelete() {
    setDeleteTarget(null);
    setDeleteError("");
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteOpdApi(deleteTarget.id);
      showToast("success", `OPD "${deleteTarget.nama}" berhasil dihapus.`);
      closeDelete();
      fetchOpds();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message ?? "Gagal menghapus OPD.";
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  }

  /* ================================================================ */
  /* RENDER                                                            */
  /* ================================================================ */
  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      {/* ========================= TOAST ========================= */}
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
            maxWidth: "420px",
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

      {/* ========================= DELETE CONFIRM ========================= */}
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
          onClick={closeDelete}
        >
          <div
            style={{
              background: "var(--card-bg)",
              borderRadius: "24px",
              padding: "32px",
              maxWidth: "460px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* icon */}
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
              Hapus OPD
            </h3>
            <p
              className="text-muted"
              style={{
                fontSize: "14px",
                lineHeight: 1.7,
                marginBottom: "20px",
              }}
            >
              Anda yakin ingin menghapus{" "}
              <strong style={{ color: "var(--text-main)" }}>
                {deleteTarget.nama}
              </strong>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>

            {/* error banner (e.g. OPD still has schools) */}
            {deleteError && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#991B1B",
                  fontSize: "13px",
                  lineHeight: 1.6,
                  marginBottom: "20px",
                }}
              >
                <AlertCircle
                  size={16}
                  style={{ flexShrink: 0, marginTop: "2px" }}
                />
                <span>{deleteError}</span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={closeDelete}
                className="btn"
                style={{
                  background: "var(--bg-light)",
                  color: "var(--text-main)",
                  border: "1px solid var(--border)",
                }}
                disabled={deleteLoading}
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
                  opacity: deleteLoading ? 0.7 : 1,
                }}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================= ADD / EDIT MODAL ========================= */}
      {modalOpen && (
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
              background: "var(--card-bg)",
              borderRadius: "28px",
              padding: "32px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "28px",
                gap: "12px",
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
                  {editTarget ? "Edit OPD" : "Tambah OPD"}
                </h3>
                <p className="text-muted" style={{ fontSize: "13px" }}>
                  {editTarget
                    ? "Perbarui informasi OPD yang ada"
                    : "Isi data untuk menambahkan OPD baru"}
                </p>
              </div>

              {/* close button */}
              <button
                onClick={closeModal}
                style={{
                  background: "var(--bg-light)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  width: "36px",
                  height: "36px",
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

            {/* form */}
            <form onSubmit={handleSubmit}>
              {/* Nama OPD */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "var(--text-main)",
                  }}
                >
                  Nama OPD <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={form.nama}
                  onChange={handleFormChange}
                  placeholder="Contoh: Dinas Kesehatan Kota ..."
                  required
                  style={{
                    width: "100%",
                    height: "48px",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-light)",
                    padding: "0 16px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Kode OPD */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "var(--text-main)",
                  }}
                >
                  Kode OPD <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input
                  type="text"
                  name="kode"
                  value={form.kode}
                  onChange={handleFormChange}
                  placeholder="Contoh: DINKES, DISDIK, DISKOMINFO"
                  required
                  style={{
                    width: "100%",
                    height: "48px",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-light)",
                    padding: "0 16px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                />
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    marginTop: "6px",
                  }}
                >
                  Kode unik singkatan OPD (huruf kapital, tanpa spasi).
                </p>
              </div>

              {/* Alamat */}
              <div style={{ marginBottom: "28px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "var(--text-main)",
                  }}
                >
                  Alamat{" "}
                  <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                    (opsional)
                  </span>
                </label>
                <textarea
                  name="alamat"
                  value={form.alamat}
                  onChange={handleFormChange}
                  placeholder="Alamat lengkap kantor OPD..."
                  rows={3}
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-light)",
                    padding: "12px 16px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: 1.6,
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* action buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
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
                  className="btn btn-primary"
                  style={{ opacity: submitting ? 0.7 : 1 }}
                  disabled={submitting}
                >
                  {submitting
                    ? editTarget
                      ? "Menyimpan..."
                      : "Menambahkan..."
                    : editTarget
                      ? "Simpan Perubahan"
                      : "Tambah OPD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================= HEADER ========================= */}
      <div
        className="flex items-start justify-between mb-6"
        style={{ gap: "18px", flexWrap: "wrap" }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(24px,4vw,32px)",
              fontWeight: 800,
              marginBottom: "8px",
              lineHeight: 1.2,
            }}
          >
            Manajemen OPD
          </h1>
          <p
            className="text-muted"
            style={{ fontSize: "14px", lineHeight: 1.7, maxWidth: "760px" }}
          >
            Kelola data Organisasi Perangkat Daerah (OPD), jumlah sekolah
            binaan, serta informasi wilayah monitoring UKS.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={18} />
          Tambah OPD
        </button>
      </div>

      {/* ========================= STAT CARDS ========================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: "22px",
          marginBottom: "28px",
        }}
      >
        <StatCard
          icon={<Building2 size={24} />}
          title="Total OPD"
          value={loading ? "—" : totalOPD.toLocaleString("id-ID")}
          bg="var(--accent-glow)"
          color="var(--secondary)"
        />

        <StatCard
          icon={<School size={24} />}
          title="Total Sekolah Terdaftar"
          value={loading ? "—" : totalSekolah.toLocaleString("id-ID")}
          bg="#EEF2FF"
          color="#4338CA"
        />

        <StatCard
          icon={<Users size={24} />}
          title="Total Admin User"
          value={loading ? "—" : totalAdmin.toLocaleString("id-ID")}
          bg="#ECFDF5"
          color="#059669"
        />
      </div>

      {/* ========================= TABLE CARD ========================= */}
      <div
        className="card glass-panel"
        style={{ padding: "28px", borderRadius: "28px", overflow: "hidden" }}
      >
        {/* table header */}
        <div
          className="flex items-start justify-between mb-6"
          style={{ gap: "18px", flexWrap: "wrap" }}
        >
          <div>
            <h3
              style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}
            >
              Data OPD
            </h3>
            <p className="text-muted" style={{ fontSize: "13px" }}>
              Monitoring dan pengelolaan seluruh OPD terdaftar
            </p>
          </div>

          {/* search */}
          <div
            style={{ position: "relative", width: "100%", maxWidth: "320px" }}
          >
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Cari nama OPD..."
              value={searchInput}
              onChange={handleSearchInput}
              style={{
                width: "100%",
                height: "48px",
                borderRadius: "14px",
                border: "1px solid var(--border)",
                background: "var(--card-bg)",
                paddingLeft: "48px",
                paddingRight: "18px",
                outline: "none",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* loading spinner */}
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 0",
              gap: "16px",
              color: "var(--text-muted)",
              fontSize: "14px",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: "spin 0.9s linear infinite",
                color: "var(--primary)",
              }}
            >
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Memuat data OPD...
          </div>
        ) : opds.length === 0 ? (
          /* empty state */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 0",
              gap: "16px",
              color: "var(--text-muted)",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "20px",
                background: "var(--bg-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
              }}
            >
              <Building2 size={32} />
            </div>
            <p style={{ fontSize: "15px", fontWeight: 600 }}>
              {search ? "OPD tidak ditemukan" : "Belum ada data OPD"}
            </p>
            <p style={{ fontSize: "13px" }}>
              {search
                ? `Tidak ada OPD yang cocok dengan "${search}"`
                : "Klik Tambah OPD untuk menambahkan data pertama."}
            </p>
          </div>
        ) : (
          /* table */
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "900px",
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-light)" }}>
                  <TableHead>Kode OPD</TableHead>
                  <TableHead>Nama OPD</TableHead>
                  <TableHead>Total Sekolah</TableHead>
                  <TableHead>Total Admin</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Aksi</TableHead>
                </tr>
              </thead>

              <tbody>
                {opds.map((opd) => (
                  <OpdRow
                    key={opd.id}
                    opd={opd}
                    onEdit={() => openEdit(opd)}
                    onDelete={() => openDelete(opd)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================ */
/* OPD TABLE ROW                                                     */
/* ================================================================ */
function OpdRow({ opd, onEdit, onDelete }) {
  return (
    <tr style={{ borderBottom: "1px solid var(--border)" }}>
      {/* Kode OPD */}
      <td style={tdStyle}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "6px 12px",
            borderRadius: "8px",
            background: "var(--accent-glow)",
            color: "var(--secondary)",
            fontWeight: 700,
            fontSize: "12px",
            whiteSpace: "nowrap",
            letterSpacing: "0.5px",
          }}
        >
          {opd.kode || "—"}
        </div>
      </td>

      {/* Nama OPD */}
      <td style={tdStyle}>
        <div style={{ fontWeight: 600, minWidth: "200px" }}>{opd.nama}</div>
      </td>

      {/* Total Sekolah */}
      <td style={tdStyle}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "999px",
            background: "#EEF2FF",
            color: "#4338CA",
            fontWeight: 700,
            fontSize: "13px",
            whiteSpace: "nowrap",
          }}
        >
          <School size={14} />
          {Number(opd.sekolahs_count) || 0} Sekolah
        </div>
      </td>

      {/* Total Admin */}
      <td style={tdStyle}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "999px",
            background: "#ECFDF5",
            color: "#059669",
            fontWeight: 700,
            fontSize: "13px",
            whiteSpace: "nowrap",
          }}
        >
          <Users size={14} />
          {Number(opd.users_count) || 0} Admin
        </div>
      </td>

      {/* Alamat */}
      <td style={tdStyle}>
        {opd.alamat ? (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              minWidth: "220px",
              maxWidth: "300px",
              lineHeight: 1.6,
            }}
          >
            <MapPin
              size={14}
              style={{
                color: "var(--text-muted)",
                flexShrink: 0,
                marginTop: "3px",
              }}
            />
            <span>{opd.alamat}</span>
          </div>
        ) : (
          <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            —
          </span>
        )}
      </td>

      {/* Aksi */}
      <td style={tdStyle}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "nowrap" }}>
          <button
            className="btn btn-outline"
            onClick={onEdit}
            style={{ whiteSpace: "nowrap" }}
          >
            <Pencil size={15} />
            Edit
          </button>

          <button
            className="btn"
            onClick={onDelete}
            style={{
              background: "#FEF2F2",
              color: "#DC2626",
              border: "1px solid #FECACA",
              whiteSpace: "nowrap",
            }}
          >
            <Trash2 size={15} />
            Hapus
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ================================================================ */
/* STAT CARD                                                         */
/* ================================================================ */
function StatCard({ icon, title, value, bg, color }) {
  return (
    <div
      className="card"
      style={{
        padding: "24px",
        borderRadius: "26px",
        border: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: bg,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "18px",
        }}
      >
        {icon}
      </div>

      <div
        className="text-muted"
        style={{ fontSize: "13px", marginBottom: "8px", fontWeight: 500 }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "30px",
          fontWeight: 800,
          lineHeight: 1.1,
          color: "var(--text-main)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ================================================================ */
/* TABLE HEAD                                                        */
/* ================================================================ */
function TableHead({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "16px 18px",
        fontSize: "13px",
        fontWeight: 700,
        color: "var(--text-main)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

/* ================================================================ */
/* TD STYLE                                                          */
/* ================================================================ */
const tdStyle = {
  padding: "16px 18px",
  fontSize: "14px",
  verticalAlign: "middle",
};
