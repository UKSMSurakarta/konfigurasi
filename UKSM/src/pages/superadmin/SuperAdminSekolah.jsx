import { useState, useEffect, useCallback, useRef } from "react";
import {
  School,
  Search,
  Plus,
  Pencil,
  Trash2,
  Building2,
  GraduationCap,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  User2,
  AlertCircle,
} from "lucide-react";
import {
  getSekolahsApi,
  createSekolahApi,
  updateSekolahApi,
  deleteSekolahApi,
  getOpdsApi,
} from "../../api/superadmin";

/* ================================================================ */
/* JENJANG CONFIG                                                    */
/* ================================================================ */
const JENJANG_LIST = ["TK", "SD", "SMP", "SMA", "SMK"];

const JENJANG_COLOR = {
  TK: { bg: "#FEF3C7", color: "#D97706" },
  SD: { bg: "#EEF2FF", color: "#4338CA" },
  SMP: { bg: "#ECFDF5", color: "#059669" },
  SMA: { bg: "#FFF1F2", color: "#E11D48" },
  SMK: { bg: "#F0F9FF", color: "#0284C7" },
};

/* ================================================================ */
/* MAIN COMPONENT                                                    */
/* ================================================================ */
export default function SuperadminSekolah() {
  /* -------- data state -------- */
  const [sekolahs, setSekolahs] = useState([]);
  const [opds, setOpds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [opdsLoading, setOpdsLoading] = useState(false);

  /* -------- pagination -------- */
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  /* -------- filters -------- */
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterJenjang, setFilterJenjang] = useState("");

  /* -------- modal -------- */
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add mode
  const [form, setForm] = useState(emptyForm());

  /* -------- delete confirm -------- */
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* -------- submitting -------- */
  const [submitting, setSubmitting] = useState(false);

  /* -------- toast -------- */
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }
  const toastTimer = useRef(null);

  /* ================================================================ */
  /* HELPERS                                                           */
  /* ================================================================ */
  function emptyForm() {
    return {
      nama: "",
      npsn: "",
      jenjang: "SD",
      opd_id: "",
      kepala_sekolah: "",
      alamat: "",
    };
  }

  function showToast(type, message) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  /* ================================================================ */
  /* DEBOUNCED SEARCH                                                  */
  /* ================================================================ */
  const debounceRef = useRef(null);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setCurrentPage(1);
    }, 450);
  };

  /* ================================================================ */
  /* FETCH SEKOLAHS                                                    */
  /* ================================================================ */
  const fetchSekolahs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSekolahsApi({
        search,
        jenjang: filterJenjang,
        page: currentPage,
      });
      /* support both {data:[...], meta:{...}} and Laravel default pagination */
      const items = res?.data?.data ?? res?.data ?? [];
      const meta = res?.data?.meta ?? res?.meta ?? res?.data ?? {};

      setSekolahs(Array.isArray(items) ? items : []);
      setCurrentPage(meta.current_page ?? 1);
      setLastPage(meta.last_page ?? 1);
      setTotal(meta.total ?? (Array.isArray(items) ? items.length : 0));
    } catch (err) {
      console.error(err);
      showToast("error", "Gagal memuat data sekolah.");
    } finally {
      setLoading(false);
    }
  }, [search, filterJenjang, currentPage]);

  /* ================================================================ */
  /* FETCH OPDS (once)                                                 */
  /* ================================================================ */
  const fetchOpds = useCallback(async () => {
    setOpdsLoading(true);
    try {
      const res = await getOpdsApi();
      const items = res?.data?.data ?? res?.data ?? res ?? [];
      setOpds(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(err);
    } finally {
      setOpdsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpds();
  }, [fetchOpds]);
  useEffect(() => {
    fetchSekolahs();
  }, [fetchSekolahs]);

  /* ================================================================ */
  /* DERIVED STATS                                                     */
  /* ================================================================ */
  const uniqueJenjang = [
    ...new Set(sekolahs.map((s) => s.jenjang).filter(Boolean)),
  ].length;

  /* ================================================================ */
  /* MODAL OPEN / CLOSE                                                */
  /* ================================================================ */
  function openAdd() {
    setEditTarget(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(s) {
    setEditTarget(s);
    setForm({
      nama: s.nama ?? "",
      npsn: s.npsn ?? "",
      jenjang: s.jenjang ?? "SD",
      opd_id: s.opd_id ?? "",
      kepala_sekolah: s.kepala_sekolah ?? "",
      alamat: s.alamat ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditTarget(null);
    setForm(emptyForm());
  }

  /* ================================================================ */
  /* SUBMIT (ADD / EDIT)                                               */
  /* ================================================================ */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nama.trim() || !form.npsn.trim()) {
      showToast("error", "Nama Sekolah dan NPSN wajib diisi.");
      return;
    }
    setSubmitting(true);
    try {
      if (editTarget) {
        await updateSekolahApi(editTarget.id, form);
        showToast("success", "Data sekolah berhasil diperbarui.");
      } else {
        await createSekolahApi(form);
        showToast("success", "Sekolah baru berhasil ditambahkan.");
      }
      closeModal();
      fetchSekolahs();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ??
        (editTarget
          ? "Gagal memperbarui sekolah."
          : "Gagal menambahkan sekolah.");
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  }

  /* ================================================================ */
  /* DELETE                                                            */
  /* ================================================================ */
  async function handleDelete() {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteSekolahApi(deleteTarget.id);
      showToast("success", `Sekolah "${deleteTarget.nama}" berhasil dihapus.`);
      setDeleteTarget(null);
      fetchSekolahs();
    } catch (err) {
      console.error(err);
      showToast("error", "Gagal menghapus sekolah.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ================================================================ */
  /* RENDER                                                            */
  /* ================================================================ */
  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      {/* ---- TOAST ---- */}
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

      {/* ---- DELETE CONFIRM DIALOG ---- */}
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
          onClick={() => setDeleteTarget(null)}
        >
          <div
            style={{
              background: "var(--card-bg)",
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
              Hapus Sekolah
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
                {submitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- ADD / EDIT MODAL ---- */}
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
              maxWidth: "560px",
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
                  {editTarget ? "Edit Sekolah" : "Tambah Sekolah"}
                </h3>
                <p className="text-muted" style={{ fontSize: "13px" }}>
                  {editTarget
                    ? "Perbarui data sekolah yang ada"
                    : "Isi data untuk menambahkan sekolah baru"}
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

            {/* form */}
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gap: "18px" }}>
                {/* Nama Sekolah */}
                <div>
                  <label style={labelStyle}>
                    Nama Sekolah <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SDN Sukamaju 01"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>

                {/* NPSN */}
                <div>
                  <label style={labelStyle}>
                    NPSN <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 20100101"
                    value={form.npsn}
                    onChange={(e) => setForm({ ...form, npsn: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Jenjang + OPD side by side */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  {/* Jenjang */}
                  <div>
                    <label style={labelStyle}>Jenjang</label>
                    <select
                      value={form.jenjang}
                      onChange={(e) =>
                        setForm({ ...form, jenjang: e.target.value })
                      }
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      {JENJANG_LIST.map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* OPD */}
                  <div>
                    <label style={labelStyle}>OPD</label>
                    <select
                      value={form.opd_id}
                      onChange={(e) =>
                        setForm({ ...form, opd_id: e.target.value })
                      }
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      <option value="">-- Pilih OPD --</option>
                      {opdsLoading ? (
                        <option disabled>Memuat...</option>
                      ) : (
                        opds.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.nama}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Kepala Sekolah */}
                <div>
                  <label style={labelStyle}>Kepala Sekolah</label>
                  <input
                    type="text"
                    placeholder="Contoh: Drs. Ahmad Fauzi, M.Pd"
                    value={form.kepala_sekolah}
                    onChange={(e) =>
                      setForm({ ...form, kepala_sekolah: e.target.value })
                    }
                    style={inputStyle}
                  />
                </div>

                {/* Alamat */}
                <div>
                  <label style={labelStyle}>Alamat</label>
                  <textarea
                    placeholder="Jl. Merdeka No. 1, Kec. Sukamaju..."
                    value={form.alamat}
                    onChange={(e) =>
                      setForm({ ...form, alamat: e.target.value })
                    }
                    rows={3}
                    style={{
                      width: "100%",
                      borderRadius: "14px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-light)",
                      padding: "14px 16px",
                      outline: "none",
                      fontSize: "14px",
                      resize: "vertical",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
              </div>

              {/* buttons */}
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
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting
                    ? editTarget
                      ? "Menyimpan..."
                      : "Menambahkan..."
                    : editTarget
                      ? "Simpan Perubahan"
                      : "Tambah Sekolah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* PAGE HEADER                                                       */}
      {/* ================================================================ */}
      <div
        className="flex items-start justify-between mb-6"
        style={{ gap: "18px", flexWrap: "wrap" }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(24px, 4vw, 32px)",
              fontWeight: 800,
              marginBottom: "8px",
              lineHeight: 1.2,
            }}
          >
            Manajemen Sekolah
          </h1>
          <p
            className="text-muted"
            style={{ fontSize: "14px", lineHeight: 1.7, maxWidth: "760px" }}
          >
            Kelola data sekolah, jenjang pendidikan, kepala sekolah, serta OPD
            wilayah yang terhubung pada sistem SI-UKS DIGITAL.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={18} />
          Tambah Sekolah
        </button>
      </div>

      {/* ================================================================ */}
      {/* STAT CARDS                                                        */}
      {/* ================================================================ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "22px",
          marginBottom: "28px",
        }}
      >
        <StatCard
          icon={<School size={24} />}
          title="Total Sekolah"
          value={loading ? "..." : total.toLocaleString("id-ID")}
          bg="var(--accent-glow)"
          color="var(--secondary)"
        />
        <StatCard
          icon={<GraduationCap size={24} />}
          title="Jenjang Aktif"
          value={loading ? "..." : `${uniqueJenjang} Jenjang`}
          bg="#EEF2FF"
          color="#4338CA"
        />
        <StatCard
          icon={<Building2 size={24} />}
          title="Total OPD"
          value={opdsLoading ? "..." : opds.length.toString()}
          bg="#FEF3C7"
          color="#D97706"
        />
      </div>

      {/* ================================================================ */}
      {/* TABLE CARD                                                        */}
      {/* ================================================================ */}
      <div
        className="card glass-panel"
        style={{ padding: "28px", borderRadius: "28px", overflow: "hidden" }}
      >
        {/* --- table header row --- */}
        <div
          className="flex items-start justify-between mb-6"
          style={{ gap: "18px", flexWrap: "wrap" }}
        >
          <div>
            <h3
              style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}
            >
              Data Sekolah
            </h3>
            <p className="text-muted" style={{ fontSize: "13px" }}>
              {loading
                ? "Memuat data..."
                : `Menampilkan ${sekolahs.length} dari ${total} sekolah`}
            </p>
          </div>

          {/* Search + Filter */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {/* search */}
            <div
              style={{ position: "relative", width: "100%", maxWidth: "280px" }}
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
                placeholder="Cari nama sekolah..."
                value={searchInput}
                onChange={handleSearchInput}
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "16px",
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

            {/* jenjang filter */}
            <select
              value={filterJenjang}
              onChange={(e) => {
                setFilterJenjang(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                height: "48px",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                background: "var(--card-bg)",
                padding: "0 16px",
                outline: "none",
                fontSize: "14px",
                cursor: "pointer",
                color: "var(--text-main)",
              }}
            >
              <option value="">Semua Jenjang</option>
              {JENJANG_LIST.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          {loading ? (
            <LoadingSpinner />
          ) : sekolahs.length === 0 ? (
            <EmptyState search={search} filterJenjang={filterJenjang} />
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "1000px",
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-light)" }}>
                  <TableHead>NPSN</TableHead>
                  <TableHead>Nama Sekolah</TableHead>
                  <TableHead>Jenjang</TableHead>
                  <TableHead>OPD</TableHead>
                  <TableHead>Kepala Sekolah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </tr>
              </thead>
              <tbody>
                {sekolahs.map((s) => (
                  <SekolahRow
                    key={s.id}
                    sekolah={s}
                    onEdit={() => openEdit(s)}
                    onDelete={() => setDeleteTarget(s)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* --- PAGINATION --- */}
        {!loading && lastPage > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "24px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <p className="text-muted" style={{ fontSize: "13px" }}>
              Halaman{" "}
              <strong style={{ color: "var(--text-main)" }}>
                {currentPage}
              </strong>{" "}
              dari{" "}
              <strong style={{ color: "var(--text-main)" }}>{lastPage}</strong>{" "}
              — Total{" "}
              <strong style={{ color: "var(--text-main)" }}>
                {total.toLocaleString("id-ID")}
              </strong>{" "}
              sekolah
            </p>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="btn"
                style={{
                  background: "var(--bg-light)",
                  border: "1px solid var(--border)",
                  color: "var(--text-main)",
                  opacity: currentPage <= 1 ? 0.4 : 1,
                  cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                  padding: "0 14px",
                  height: "40px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ChevronLeft size={16} />
                Sebelumnya
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                disabled={currentPage >= lastPage}
                className="btn"
                style={{
                  background: "var(--bg-light)",
                  border: "1px solid var(--border)",
                  color: "var(--text-main)",
                  opacity: currentPage >= lastPage ? 0.4 : 1,
                  cursor: currentPage >= lastPage ? "not-allowed" : "pointer",
                  padding: "0 14px",
                  height: "40px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Berikutnya
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================ */
/* SUB-COMPONENTS                                                    */
/* ================================================================ */

/* ---- StatCard ---- */
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
          width: "60px",
          height: "60px",
          borderRadius: "18px",
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
        style={{ fontSize: "14px", marginBottom: "8px" }}
      >
        {title}
      </div>
      <div style={{ fontSize: "30px", fontWeight: 800, lineHeight: 1.1 }}>
        {value}
      </div>
    </div>
  );
}

/* ---- TableHead ---- */
function TableHead({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "18px",
        fontSize: "14px",
        fontWeight: 700,
        color: "var(--text-main)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

/* ---- SekolahRow ---- */
function SekolahRow({ sekolah, onEdit, onDelete }) {
  const jc = JENJANG_COLOR[sekolah.jenjang] ?? {
    bg: "#F3F4F6",
    color: "#374151",
  };

  return (
    <tr
      style={{ borderBottom: "1px solid var(--border)" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--bg-light)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* NPSN */}
      <td style={tdStyle}>
        <div
          style={{
            fontWeight: 700,
            color: "var(--primary)",
            whiteSpace: "nowrap",
          }}
        >
          {sekolah.npsn ?? "-"}
        </div>
      </td>

      {/* Nama Sekolah */}
      <td style={tdStyle}>
        <div style={{ fontWeight: 600, minWidth: "200px" }}>{sekolah.nama}</div>
      </td>

      {/* Jenjang */}
      <td style={tdStyle}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "999px",
            background: jc.bg,
            color: jc.color,
            fontWeight: 700,
            fontSize: "13px",
            whiteSpace: "nowrap",
          }}
        >
          <GraduationCap size={14} />
          {sekolah.jenjang ?? "-"}
        </div>
      </td>

      {/* OPD */}
      <td style={tdStyle}>
        <div style={{ minWidth: "180px", lineHeight: 1.6, fontSize: "13px" }}>
          {sekolah.opd?.nama ?? "-"}
        </div>
      </td>

      {/* Kepala Sekolah */}
      <td style={tdStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minWidth: "200px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--bg-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary)",
              flexShrink: 0,
            }}
          >
            <User2 size={16} />
          </div>
          <div style={{ fontWeight: 600, fontSize: "13px" }}>
            {sekolah.kepala_sekolah ?? "-"}
          </div>
        </div>
      </td>

      {/* Status */}
      <td style={tdStyle}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "999px",
            background: sekolah.is_active ? "#ECFDF5" : "#FEF2F2",
            color: sekolah.is_active ? "#059669" : "#DC2626",
            fontWeight: 600,
            fontSize: "12px",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: sekolah.is_active ? "#059669" : "#DC2626",
              display: "inline-block",
            }}
          />
          {sekolah.is_active ? "Aktif" : "Nonaktif"}
        </div>
      </td>

      {/* Aksi */}
      <td style={tdStyle}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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

/* ---- LoadingSpinner ---- */
function LoadingSpinner() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          border: "4px solid var(--border)",
          borderTopColor: "var(--primary)",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p className="text-muted" style={{ fontSize: "14px" }}>
        Memuat data sekolah...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ---- EmptyState ---- */
function EmptyState({ search, filterJenjang }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "18px",
          background: "var(--bg-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
        }}
      >
        <School size={28} />
      </div>
      <p style={{ fontWeight: 700, fontSize: "16px" }}>
        Tidak ada data sekolah
      </p>
      <p
        className="text-muted"
        style={{ fontSize: "13px", textAlign: "center" }}
      >
        {search || filterJenjang
          ? "Tidak ada hasil untuk filter yang dipilih. Coba ubah kriteria pencarian."
          : 'Belum ada sekolah yang terdaftar. Klik "Tambah Sekolah" untuk memulai.'}
      </p>
    </div>
  );
}

/* ================================================================ */
/* SHARED STYLES                                                     */
/* ================================================================ */
const tdStyle = {
  padding: "16px 18px",
  fontSize: "14px",
  verticalAlign: "middle",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  marginBottom: "8px",
  color: "var(--text-main)",
};

const inputStyle = {
  width: "100%",
  height: "48px",
  borderRadius: "14px",
  border: "1px solid var(--border)",
  background: "var(--bg-light)",
  padding: "0 16px",
  outline: "none",
  fontSize: "14px",
  boxSizing: "border-box",
  color: "var(--text-main)",
};
