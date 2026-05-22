import { useState, useEffect, useCallback, useRef } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ShieldCheck,
  ShieldOff,
  Pencil,
  Trash2,
  User2,
  Building2,
  KeyRound,
  GraduationCap,
  X,
  Copy,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getUsersApi,
  getUserRolesApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  toggleUserActiveApi,
  resetUserPasswordApi,
  getOpdsApi,
  getSekolahsApi,
} from "../../api/superadmin";

/* ====================================================================
   CONSTANTS
   ==================================================================== */

const roleColor = {
  superadmin: { bg: "#EEF2FF", text: "#4338CA" },
  admin: { bg: "#DCFCE7", text: "#15803D" },
  sekolah: { bg: "#FEF3C7", text: "#B45309" },
  user: { bg: "#FCE7F3", text: "#BE185D" },
};

const roleLabel = {
  superadmin: "Superadmin",
  admin: "Admin",
  sekolah: "Sekolah",
  user: "Konten",
};

const DEFAULT_ROLES = [
  { key: "superadmin", label: "Superadmin" },
  { key: "admin", label: "Admin" },
  { key: "sekolah", label: "Sekolah" },
  { key: "user", label: "Konten" },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  role: "admin",
  opd_id: "",
  sekolah_id: "",
  password: "",
};

/* ====================================================================
   HELPERS
   ==================================================================== */

/** Normalize any API list response into a plain array. */
const extractList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

/** Pull the total count from a paginated response. */
const extractTotal = (res) => {
  if (typeof res?.total === "number") return res.total;
  if (typeof res?.data?.total === "number") return res.data.total;
  if (Array.isArray(res)) return res.length;
  if (Array.isArray(res?.data)) return res.data.length;
  return 0;
};

/** Pull current_page / last_page / total from a paginated response. */
const extractPagination = (res) => {
  const src = res?.data?.current_page != null ? res.data : res;
  return {
    currentPage: src?.current_page ?? 1,
    lastPage: src?.last_page ?? 1,
    total: src?.total ?? 0,
  };
};

/** Return instansi name + flag for a user object. */
const getInstansi = (user) => {
  if (user?.opd?.nama) return { name: user.opd.nama, isSekolah: false };
  if (user?.sekolah?.nama) return { name: user.sekolah.nama, isSekolah: true };
  return { name: "—", isSekolah: false };
};

/** Pull a human-readable error message from an Axios error. */
const extractErrorMsg = (err) => {
  const data = err?.response?.data;
  if (!data) return "Terjadi kesalahan. Silakan coba lagi.";
  if (data.errors) return Object.values(data.errors).flat().join(", ");
  return data.message ?? "Terjadi kesalahan.";
};

/** Build an array of page numbers with "..." ellipsis markers. */
const buildPageNumbers = (current, last) => {
  const RANGE = 2;
  const set = new Set();
  set.add(1);
  set.add(last);
  for (let i = current - RANGE; i <= current + RANGE; i++) {
    if (i >= 1 && i <= last) set.add(i);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const result = [];
  let prev = null;
  for (const p of sorted) {
    if (prev !== null && p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  }
  return result;
};

/* ====================================================================
   MAIN COMPONENT
   ==================================================================== */

export default function SuperAdminUsers() {
  /* ---------- data ---------- */
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    sekolah: 0,
    user: 0,
  });
  const [opds, setOpds] = useState([]);
  const [sekolahs, setSekolahs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  /* ---------- loading ---------- */
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [togglingIds, setTogglingIds] = useState(new Set());
  const [resetLoadingId, setResetLoadingId] = useState(null);

  /* ---------- filters ---------- */
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const debounceRef = useRef(null);
  const isInitialRender = useRef(true);

  /* ---------- modal ---------- */
  // "add" | "edit" | "delete" | "password" | null
  const [modal, setModal] = useState(null);

  /* ---------- selected / form ---------- */
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdCopied, setPwdCopied] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  /* ====================================================================
     FETCH FUNCTIONS
     ==================================================================== */

  const fetchUsers = useCallback(async (page, s, r) => {
    setLoading(true);
    try {
      const params = { page };
      if (s) params.search = s;
      if (r) params.role = r;
      const res = await getUsersApi(params);
      setUsers(extractList(res));
      setPagination(extractPagination(res));
    } catch (err) {
      console.error("fetchUsers error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [all, admin, sekolah, user] = await Promise.all([
        getUsersApi({}),
        getUsersApi({ role: "admin" }),
        getUsersApi({ role: "sekolah" }),
        getUsersApi({ role: "user" }),
      ]);
      setStats({
        total: extractTotal(all),
        admin: extractTotal(admin),
        sekolah: extractTotal(sekolah),
        user: extractTotal(user),
      });
    } catch (err) {
      console.error("fetchStats error:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [opdRes, sekolahRes, rolesRes] = await Promise.all([
        getOpdsApi(),
        getSekolahsApi({ limit: 1000 }),
        getUserRolesApi(),
      ]);
      setOpds(extractList(opdRes));
      setSekolahs(extractList(sekolahRes));
      setRoles(extractList(rolesRes));
    } catch (err) {
      console.error("fetchDropdowns error:", err);
    }
  }, []);

  /* ====================================================================
     EFFECTS
     ==================================================================== */

  /** On mount: fetch stats, dropdowns, and first page of users. */
  useEffect(() => {
    fetchStats();
    fetchDropdowns();
    fetchUsers(1, "", "");
  }, [fetchStats, fetchDropdowns, fetchUsers]);

  /** Debounced re-fetch when search/role filter changes (skip initial run). */
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers(1, search, roleFilter);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search, roleFilter, fetchUsers]);

  /* ====================================================================
     HANDLERS
     ==================================================================== */

  /* -- Toggle active -- */
  const handleToggle = async (user) => {
    if (togglingIds.has(user.id)) return;
    setTogglingIds((prev) => new Set([...prev, user.id]));
    try {
      await toggleUserActiveApi(user.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_active: !u.is_active } : u,
        ),
      );
    } catch (err) {
      console.error("toggleUser error:", err);
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });
    }
  };

  /* -- Reset password -- */
  const handleResetPassword = async (user) => {
    if (resetLoadingId !== null) return;
    setResetLoadingId(user.id);
    try {
      const res = await resetUserPasswordApi(user.id);
      const pwd = res?.data?.new_password ?? res?.new_password ?? "";
      setNewPassword(pwd);
      setSelectedUser(user);
      setShowPwd(false);
      setPwdCopied(false);
      setModal("password");
    } catch (err) {
      console.error("resetPassword error:", err);
      alert("Gagal mereset password. Silakan coba lagi.");
    } finally {
      setResetLoadingId(null);
    }
  };

  /* -- Copy new password to clipboard -- */
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(newPassword).then(() => {
      setPwdCopied(true);
      setTimeout(() => setPwdCopied(false), 2500);
    });
  };

  /* -- Open modals -- */
  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setFormError("");
    setModal("add");
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name ?? "",
      email: user.email ?? "",
      role: user.role ?? "admin",
      opd_id: user.opd_id ?? "",
      sekolah_id: user.sekolah_id ?? "",
      password: "",
    });
    setFormError("");
    setModal("edit");
  };

  const openDelete = (user) => {
    setSelectedUser(user);
    setModal("delete");
  };

  const closeModal = () => {
    setModal(null);
    setSelectedUser(null);
    setFormError("");
  };

  /* -- Form field change -- */
  const handleFormChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // Clear related ID fields when role changes
      if (field === "role") {
        next.opd_id = "";
        next.sekolah_id = "";
      }
      return next;
    });
  };

  /* -- Client-side validation -- */
  const validateForm = () => {
    if (!formData.name.trim()) return "Nama wajib diisi.";
    if (!formData.email.trim()) return "Email wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return "Format email tidak valid.";
    return "";
  };

  /* -- Submit Add -- */
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }
    setFormLoading(true);
    try {
      // Strip empty strings so the backend uses its defaults
      const payload = Object.fromEntries(
        Object.entries(formData).filter(([, v]) => v !== ""),
      );
      await createUserApi(payload);
      closeModal();
      fetchUsers(1, search, roleFilter);
      fetchStats();
    } catch (err) {
      setFormError(extractErrorMsg(err));
    } finally {
      setFormLoading(false);
    }
  };

  /* -- Submit Edit -- */
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }
    setFormLoading(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(formData).filter(([, v]) => v !== ""),
      );
      await updateUserApi(selectedUser.id, payload);
      closeModal();
      fetchUsers(pagination.currentPage, search, roleFilter);
      fetchStats();
    } catch (err) {
      setFormError(extractErrorMsg(err));
    } finally {
      setFormLoading(false);
    }
  };

  /* -- Delete -- */
  const handleDelete = async () => {
    if (!selectedUser) return;
    setFormLoading(true);
    try {
      await deleteUserApi(selectedUser.id);
      closeModal();
      // If this was the last item on a non-first page, go back one page
      const newPage =
        users.length === 1 && pagination.currentPage > 1
          ? pagination.currentPage - 1
          : pagination.currentPage;
      fetchUsers(newPage, search, roleFilter);
      fetchStats();
    } catch (err) {
      console.error("deleteUser error:", err);
      alert("Gagal menghapus user. Silakan coba lagi.");
    } finally {
      setFormLoading(false);
    }
  };

  /* -- Pagination -- */
  const goToPage = (page) => {
    if (page < 1 || page > pagination.lastPage || loading) return;
    fetchUsers(page, search, roleFilter);
  };

  /* ====================================================================
     RENDER
     ==================================================================== */

  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      {/* ===================== MODALS ===================== */}

      {(modal === "add" || modal === "edit") && (
        <UserFormModal
          isEdit={modal === "edit"}
          formData={formData}
          formError={formError}
          formLoading={formLoading}
          opds={opds}
          sekolahs={sekolahs}
          onChange={handleFormChange}
          onSubmit={modal === "edit" ? handleSubmitEdit : handleSubmitAdd}
          onClose={closeModal}
        />
      )}

      {modal === "delete" && selectedUser && (
        <DeleteModal
          user={selectedUser}
          loading={formLoading}
          onConfirm={handleDelete}
          onClose={closeModal}
        />
      )}

      {modal === "password" && selectedUser && (
        <PasswordRevealModal
          user={selectedUser}
          password={newPassword}
          show={showPwd}
          copied={pwdCopied}
          onToggleShow={() => setShowPwd((v) => !v)}
          onCopy={handleCopyPassword}
          onClose={closeModal}
        />
      )}

      {/* ===================== HEADER ===================== */}

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
            }}
          >
            Manajemen User
          </h1>
          <p
            className="text-muted"
            style={{ fontSize: "14px", lineHeight: 1.7, maxWidth: "760px" }}
          >
            Kelola akun pengguna sistem SI-UKS DIGITAL dari semua role dan
            wilayah.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openAdd}>
          <UserPlus size={18} />
          Tambah User
        </button>
      </div>

      {/* ===================== STAT CARDS ===================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "22px",
          marginBottom: "28px",
        }}
      >
        <StatCard
          icon={<Users size={24} />}
          title="Total User"
          value={statsLoading ? "…" : stats.total}
          bg="var(--accent-glow)"
          color="var(--secondary)"
        />
        <StatCard
          icon={<ShieldCheck size={24} />}
          title="Admin"
          value={statsLoading ? "…" : stats.admin}
          bg="#DCFCE7"
          color="#15803D"
        />
        <StatCard
          icon={<GraduationCap size={24} />}
          title="Sekolah"
          value={statsLoading ? "…" : stats.sekolah}
          bg="#FEF3C7"
          color="#B45309"
        />
        <StatCard
          icon={<Building2 size={24} />}
          title="Konten"
          value={statsLoading ? "…" : stats.user}
          bg="#FCE7F3"
          color="#BE185D"
        />
      </div>

      {/* ===================== TABLE CARD ===================== */}

      <div
        className="card glass-panel"
        style={{ padding: "28px", borderRadius: "28px", overflow: "hidden" }}
      >
        {/* FILTER ROW */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
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
              placeholder="Cari nama / email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                height: "52px",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                background: "var(--card-bg)",
                paddingLeft: "48px",
                paddingRight: "18px",
                outline: "none",
                fontSize: "14px",
                boxSizing: "border-box",
                color: "var(--text-main)",
              }}
            />
          </div>

          {/* Role filter */}
          <div style={{ position: "relative" }}>
            <Filter
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
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                height: "52px",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                background: "var(--card-bg)",
                paddingLeft: "46px",
                paddingRight: "18px",
                outline: "none",
                fontSize: "14px",
                cursor: "pointer",
                color: "var(--text-main)",
              }}
            >
              <option value="">Semua Role</option>
              {(roles.length ? roles : DEFAULT_ROLES).map((role) => (
                <option key={role.key} value={role.key}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1120px",
            }}
          >
            <thead>
              <tr style={{ background: "var(--bg-light)" }}>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Instansi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reset Password</TableHead>
                <TableHead>Aksi</TableHead>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "64px 20px",
                      color: "var(--text-muted)",
                    }}
                  >
                    <LoadingSpinner />
                    <div style={{ marginTop: "14px", fontSize: "14px" }}>
                      Memuat data pengguna…
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "64px 20px",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Users
                      size={44}
                      style={{ opacity: 0.25, marginBottom: "14px" }}
                    />
                    <div style={{ fontSize: "14px" }}>
                      Tidak ada data pengguna ditemukan.
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const rc = roleColor[u.role] ?? {
                    bg: "#F3F4F6",
                    text: "#374151",
                  };
                  const label = roleLabel[u.role] ?? u.role;
                  const instansi = getInstansi(u);
                  const isToggling = togglingIds.has(u.id);
                  const isResetting = resetLoadingId === u.id;
                  const active = !!u.is_active;

                  return (
                    <tr
                      key={u.id}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      {/* NAMA */}
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            minWidth: "200px",
                          }}
                        >
                          <div
                            style={{
                              width: "42px",
                              height: "42px",
                              borderRadius: "14px",
                              background: rc.bg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: rc.text,
                              flexShrink: 0,
                            }}
                          >
                            <User2 size={18} />
                          </div>
                          <div style={{ fontWeight: 600 }}>{u.name}</div>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td style={tdStyle}>
                        <div
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "13px",
                            minWidth: "180px",
                          }}
                        >
                          {u.email}
                        </div>
                      </td>

                      {/* ROLE */}
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px 14px",
                            borderRadius: "999px",
                            background: rc.bg,
                            color: rc.text,
                            fontSize: "13px",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <ShieldCheck size={14} />
                          {label}
                        </div>
                      </td>

                      {/* INSTANSI */}
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
                              width: "38px",
                              height: "38px",
                              borderRadius: "12px",
                              background: "var(--bg-light)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--primary)",
                              flexShrink: 0,
                            }}
                          >
                            {instansi.isSekolah ? (
                              <GraduationCap size={17} />
                            ) : (
                              <Building2 size={17} />
                            )}
                          </div>
                          <div style={{ lineHeight: 1.6, fontSize: "14px" }}>
                            {instansi.name}
                          </div>
                        </div>
                      </td>

                      {/* STATUS TOGGLE */}
                      <td style={tdStyle}>
                        <button
                          onClick={() => handleToggle(u)}
                          disabled={isToggling}
                          title={
                            active
                              ? "Klik untuk nonaktifkan"
                              : "Klik untuk aktifkan"
                          }
                          style={{
                            width: "72px",
                            height: "36px",
                            borderRadius: "999px",
                            border: "none",
                            cursor: isToggling ? "not-allowed" : "pointer",
                            position: "relative",
                            transition:
                              "background 0.3s ease, box-shadow 0.3s ease",
                            background: active ? "#DCFCE7" : "#FEE2E2",
                            boxShadow: active
                              ? "0 4px 14px rgba(22,163,74,0.18)"
                              : "0 4px 14px rgba(220,38,38,0.15)",
                            opacity: isToggling ? 0.55 : 1,
                            flexShrink: 0,
                          }}
                        >
                          {/* Label */}
                          <span
                            style={{
                              position: "absolute",
                              top: "50%",
                              transform: "translateY(-50%)",
                              ...(active ? { left: "10px" } : { right: "7px" }),
                              fontSize: "10px",
                              fontWeight: 700,
                              color: active ? "#15803D" : "#DC2626",
                              transition: "all 0.3s ease",
                              userSelect: "none",
                              lineHeight: 1,
                            }}
                          >
                            {active ? "ON" : "OFF"}
                          </span>

                          {/* Circle indicator */}
                          <div
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "999px",
                              background: active ? "#16A34A" : "#DC2626",
                              position: "absolute",
                              top: "3px",
                              left: active ? "39px" : "3px",
                              transition:
                                "left 0.3s ease, background 0.3s ease",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                            }}
                          >
                            {active ? (
                              <ShieldCheck size={14} />
                            ) : (
                              <ShieldOff size={14} />
                            )}
                          </div>
                        </button>
                      </td>

                      {/* RESET PASSWORD */}
                      <td style={tdStyle}>
                        <button
                          className="btn btn-outline"
                          onClick={() => handleResetPassword(u)}
                          disabled={isResetting || resetLoadingId !== null}
                          title="Reset Password"
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "14px",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: isResetting ? 0.5 : 1,
                            cursor:
                              isResetting || resetLoadingId !== null
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          {isResetting ? (
                            <span style={{ fontSize: "13px", fontWeight: 700 }}>
                              …
                            </span>
                          ) : (
                            <KeyRound size={17} />
                          )}
                        </button>
                      </td>

                      {/* AKSI */}
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            className="btn btn-outline"
                            onClick={() => openEdit(u)}
                          >
                            <Pencil size={16} />
                            Edit
                          </button>
                          <button
                            className="btn"
                            onClick={() => openDelete(u)}
                            style={{
                              background: "#FEF2F2",
                              color: "#DC2626",
                              border: "1px solid #FECACA",
                            }}
                          >
                            <Trash2 size={16} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && pagination.lastPage > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              marginTop: "28px",
              flexWrap: "wrap",
            }}
          >
            <PaginationBtn
              onClick={() => goToPage(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              icon={<ChevronLeft size={18} />}
            />

            {buildPageNumbers(pagination.currentPage, pagination.lastPage).map(
              (item, idx) =>
                item === "..." ? (
                  <span
                    key={`dot-${idx}`}
                    style={{ color: "var(--text-muted)", padding: "0 4px" }}
                  >
                    …
                  </span>
                ) : (
                  <PaginationBtn
                    key={item}
                    label={item}
                    active={item === pagination.currentPage}
                    onClick={() => goToPage(item)}
                  />
                ),
            )}

            <PaginationBtn
              onClick={() => goToPage(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.lastPage}
              icon={<ChevronRight size={18} />}
            />
          </div>
        )}

        {/* PAGE INFO */}
        {!loading && pagination.total > 0 && (
          <div
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "13px",
              marginTop: "12px",
            }}
          >
            Halaman {pagination.currentPage} dari {pagination.lastPage}{" "}
            &nbsp;·&nbsp; {pagination.total} total pengguna
          </div>
        )}
      </div>
    </div>
  );
}

/* ====================================================================
   MODAL WRAPPER
   ==================================================================== */

function Modal({ onClose, title, children, maxWidth = "520px" }) {
  // Close on Escape key
  useEffect(() => {
    const handle = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "var(--card-bg)",
          borderRadius: "24px",
          padding: "32px",
          width: "100%",
          maxWidth,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "12px",
              border: "none",
              background: "var(--bg-light)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

/* ====================================================================
   USER FORM MODAL  (Add / Edit)
   ==================================================================== */

function UserFormModal({
  isEdit,
  formData,
  formError,
  formLoading,
  opds,
  sekolahs,
  onChange,
  onSubmit,
  onClose,
}) {
  const showOpd = formData.role === "admin" || formData.role === "user";
  const showSekolah = formData.role === "sekolah";

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? "Edit Pengguna" : "Tambah Pengguna Baru"}
      maxWidth="540px"
    >
      <form onSubmit={onSubmit}>
        {/* Error banner */}
        {formError && (
          <div
            style={{
              background: "#FEF2F2",
              color: "#DC2626",
              border: "1px solid #FECACA",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "20px",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            {formError}
          </div>
        )}

        {/* Nama */}
        <FormGroup label="Nama Lengkap *">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Masukkan nama lengkap"
            style={inputStyle}
            autoFocus
          />
        </FormGroup>

        {/* Email */}
        <FormGroup label="Email *">
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="email@contoh.com"
            style={inputStyle}
          />
        </FormGroup>

        {/* Role */}
        <FormGroup label="Role *">
          <select
            value={formData.role}
            onChange={(e) => onChange("role", e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            {(roles.length ? roles : DEFAULT_ROLES).map((role) => (
              <option key={role.key} value={role.key}>
                {role.label}
              </option>
            ))}
          </select>
        </FormGroup>

        {/* OPD — shown for admin and user roles */}
        {showOpd && (
          <FormGroup label="OPD">
            <select
              value={formData.opd_id}
              onChange={(e) => onChange("opd_id", e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">— Pilih OPD —</option>
              {opds.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nama}
                </option>
              ))}
            </select>
          </FormGroup>
        )}

        {/* Sekolah — shown for sekolah role */}
        {showSekolah && (
          <FormGroup label="Sekolah">
            <select
              value={formData.sekolah_id}
              onChange={(e) => onChange("sekolah_id", e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">— Pilih Sekolah —</option>
              {sekolahs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama}
                </option>
              ))}
            </select>
          </FormGroup>
        )}

        {/* Password */}
        <FormGroup
          label={
            isEdit
              ? "Password Baru (kosongkan jika tidak diubah)"
              : "Password (kosongkan untuk auto-generate)"
          }
        >
          <input
            type="password"
            value={formData.password}
            onChange={(e) => onChange("password", e.target.value)}
            placeholder={
              isEdit
                ? "Biarkan kosong jika tidak diubah"
                : "Biarkan kosong untuk auto-generate"
            }
            style={inputStyle}
          />
        </FormGroup>

        {/* Footer buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            marginTop: "8px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            disabled={formLoading}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={formLoading}
          >
            {formLoading
              ? "Menyimpan…"
              : isEdit
                ? "Simpan Perubahan"
                : "Tambah User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ====================================================================
   DELETE CONFIRMATION MODAL
   ==================================================================== */

function DeleteModal({ user, loading, onConfirm, onClose }) {
  return (
    <Modal onClose={onClose} title="Konfirmasi Hapus" maxWidth="420px">
      <div style={{ textAlign: "center", padding: "8px 0 28px" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "20px",
            background: "#FEF2F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            color: "#DC2626",
          }}
        >
          <Trash2 size={30} />
        </div>
        <p style={{ fontSize: "16px", fontWeight: 700, marginBottom: "10px" }}>
          Hapus Pengguna Ini?
        </p>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "14px",
            lineHeight: 1.7,
          }}
        >
          Pengguna{" "}
          <strong style={{ color: "var(--text-main)" }}>{user.name}</strong>{" "}
          akan dihapus secara permanen dan tidak dapat dikembalikan.
        </p>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-outline"
          disabled={loading}
          style={{ flex: 1 }}
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="btn"
          disabled={loading}
          style={{
            flex: 1,
            background: "#DC2626",
            color: "white",
            border: "none",
          }}
        >
          {loading ? "Menghapus…" : "Ya, Hapus"}
        </button>
      </div>
    </Modal>
  );
}

/* ====================================================================
   PASSWORD REVEAL MODAL
   ==================================================================== */

function PasswordRevealModal({
  user,
  password,
  show,
  copied,
  onToggleShow,
  onCopy,
  onClose,
}) {
  const dots = "•".repeat(Math.min(password?.length || 8, 20));

  return (
    <Modal onClose={onClose} title="Password Berhasil Direset" maxWidth="460px">
      {/* Icon + subtitle */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "20px",
            background: "#EEF2FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            color: "#4338CA",
          }}
        >
          <KeyRound size={30} />
        </div>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Password baru untuk pengguna{" "}
          <strong style={{ color: "var(--text-main)" }}>{user?.name}</strong>
        </p>
      </div>

      {/* Password display box */}
      <div style={{ position: "relative", marginBottom: "14px" }}>
        <div
          style={{
            padding: "16px 96px 16px 20px",
            borderRadius: "14px",
            background: "var(--bg-light)",
            border: "1px solid var(--border)",
            fontSize: "18px",
            fontFamily: "'Courier New', Courier, monospace",
            fontWeight: 700,
            letterSpacing: "3px",
            minHeight: "58px",
            display: "flex",
            alignItems: "center",
            wordBreak: "break-all",
            color: "var(--text-main)",
          }}
        >
          {show ? password : dots}
        </div>

        {/* Show / hide */}
        <button
          onClick={onToggleShow}
          title={show ? "Sembunyikan" : "Tampilkan"}
          style={{
            position: "absolute",
            right: "52px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            padding: "6px",
          }}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        {/* Copy */}
        <button
          onClick={onCopy}
          title="Salin password"
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: copied ? "#15803D" : "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            padding: "6px",
            transition: "color 0.2s",
          }}
        >
          <Copy size={18} />
        </button>
      </div>

      {/* Copy success */}
      {copied && (
        <div
          style={{
            textAlign: "center",
            color: "#15803D",
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "12px",
          }}
        >
          ✓ Password berhasil disalin ke clipboard!
        </div>
      )}

      {/* Warning */}
      <div
        style={{
          background: "#FEF3C7",
          border: "1px solid #FDE68A",
          borderRadius: "12px",
          padding: "14px 16px",
          fontSize: "13px",
          color: "#92400E",
          marginBottom: "24px",
          lineHeight: 1.65,
        }}
      >
        ⚠️ <strong>Perhatian:</strong> Catat atau salin password ini sekarang.
        Password tidak dapat ditampilkan kembali setelah modal ini ditutup.
      </div>

      <button
        onClick={onClose}
        className="btn btn-primary"
        style={{ width: "100%" }}
      >
        Selesai
      </button>
    </Modal>
  );
}

/* ====================================================================
   STAT CARD
   ==================================================================== */

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
          color,
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

/* ====================================================================
   TABLE HEAD
   ==================================================================== */

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

/* ====================================================================
   PAGINATION BUTTON
   ==================================================================== */

function PaginationBtn({
  onClick,
  disabled = false,
  label,
  active = false,
  icon,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn"
      style={{
        width: "40px",
        height: "40px",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "12px",
        background: active ? "var(--primary)" : "transparent",
        color: active ? "white" : "var(--text-main)",
        border: active ? "none" : "1px solid var(--border)",
        fontWeight: active ? 700 : 400,
        fontSize: "14px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.2s",
      }}
    >
      {icon ?? label}
    </button>
  );
}

/* ====================================================================
   FORM GROUP
   ==================================================================== */

function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 600,
          marginBottom: "8px",
          color: "var(--text-main)",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/* ====================================================================
   LOADING SPINNER
   ==================================================================== */

function LoadingSpinner() {
  return (
    <>
      <style>{`
        @keyframes _spin { to { transform: rotate(360deg); } }
      `}</style>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            border: "3px solid var(--border)",
            borderTopColor: "var(--primary)",
            animation: "_spin 0.75s linear infinite",
          }}
        />
      </div>
    </>
  );
}

/* ====================================================================
   SHARED STYLES
   ==================================================================== */

const tdStyle = {
  padding: "18px",
  fontSize: "14px",
  verticalAlign: "middle",
};

const inputStyle = {
  width: "100%",
  height: "48px",
  borderRadius: "14px",
  border: "1px solid var(--border)",
  background: "var(--card-bg)",
  padding: "0 16px",
  outline: "none",
  fontSize: "14px",
  boxSizing: "border-box",
  color: "var(--text-main)",
};
