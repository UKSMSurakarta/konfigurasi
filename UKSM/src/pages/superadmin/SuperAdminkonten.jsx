import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Pencil,
  Trash2,
  CalendarDays,
  Newspaper,
  RefreshCw,
  BookOpen,
  Megaphone,
  Globe,
  EyeOff,
  Eye,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  getKontensApi,
  deleteKontenApi,
  togglePublishKontenApi,
} from "../../api/superadmin";
import { useToast } from "../../components/Toast";

/* ───────────────────────── helpers ───────────────────────── */

function timeAgo(dateStr) {
  if (!dateStr) return "-";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} hari lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID");
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const TIPE_CONFIG = {
  berita: { label: "Berita", bg: "#DCFCE7", color: "#15803D" },
  pengumuman: { label: "Pengumuman", bg: "#FEF3C7", color: "#B45309" },
  agenda: { label: "Agenda", bg: "#DBEAFE", color: "#1D4ED8" },
  galeri: { label: "Galeri", bg: "#F3E8FF", color: "#9333EA" },
};

/* ────────────────────────── main ─────────────────────────── */

export default function SuperAdminkonten() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [kontens, setKontens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTipe, setFilterTipe] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);

  /* load ---------------------------------------------------- */
  const loadKontens = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getKontensApi({ tipe: filterTipe, page: 1 });
      let list = [];
      if (res?.data?.data && Array.isArray(res.data.data)) list = res.data.data;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res)) list = res;
      setKontens(list);
    } catch {
      showToast("Gagal memuat konten", "error");
    } finally {
      setLoading(false);
    }
  }, [filterTipe]); // eslint-disable-line

  useEffect(() => {
    loadKontens();
  }, [loadKontens]);

  /* derived ------------------------------------------------- */
  const published = kontens.filter((k) => k.is_published);
  const drafts = kontens.filter((k) => !k.is_published);
  const beritas = kontens.filter((k) => k.tipe === "berita");
  const pengumumans = kontens.filter((k) => k.tipe === "pengumuman");
  const recentDrafts = drafts.slice(0, 5);

  /* handlers ------------------------------------------------ */
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus konten ini?")) return;
    setDeleting(id);
    try {
      await deleteKontenApi(id);
      showToast("Konten berhasil dihapus", "success");
      loadKontens();
    } catch {
      showToast("Gagal menghapus konten", "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      await togglePublishKontenApi(id);
      showToast("Status publikasi diperbarui", "success");
      loadKontens();
    } catch {
      showToast("Gagal mengubah status publikasi", "error");
    } finally {
      setToggling(null);
    }
  };

  /* render -------------------------------------------------- */
  return (
    <div
      style={{
        width: "100%",
        overflowX: "hidden",
        paddingBottom: "30px",
      }}
    >
      {/* ── styles ── */}
      <style>{`
        .sa-dash-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        .sa-draft-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        @keyframes sa-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes sa-spin   { to { transform:rotate(360deg); } }
        @media(max-width:768px){
          .sa-mobile-stack {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .sa-mobile-full { width: 100%; }
          .sa-btn-pair {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            width: 100%;
          }
          .sa-section-card {
            padding: 18px !important;
            border-radius: 22px !important;
          }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div
        className="flex items-start justify-between mb-6 sa-mobile-stack"
        style={{ gap: 18 }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(24px,4vw,30px)",
              fontWeight: 700,
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            Dashboard Pengelola Publikasi
          </h1>
          <p
            className="text-muted"
            style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 700 }}
          >
            Manajemen berita, galeri, artikel, dan pengumuman sistem SI-UKS
            DIGITAL secara terintegrasi.
          </p>
        </div>

        <Link
          to="/superadmin/konten-desain"
          className="btn btn-primary sa-mobile-full"
          style={{ whiteSpace: "nowrap", justifyContent: "center" }}
        >
          + Buat Artikel Baru
        </Link>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="sa-dash-grid mb-6">
        <StatCard
          icon={<Newspaper size={24} />}
          title="Artikel Terbit"
          value={loading ? "..." : published.length}
          bg="var(--accent-glow)"
          color="var(--secondary)"
        />
        <StatCard
          icon={<FileText size={24} />}
          title="Draft"
          value={loading ? "..." : drafts.length}
          bg="#FEF3C7"
          color="#B45309"
        />
        <StatCard
          icon={<BookOpen size={24} />}
          title="Berita"
          value={loading ? "..." : beritas.length}
          bg="var(--bg-light)"
          color="var(--primary)"
        />
        <StatCard
          icon={<Megaphone size={24} />}
          title="Pengumuman"
          value={loading ? "..." : pengumumans.length}
          bg="#EEF2FF"
          color="#4338CA"
        />
      </div>

      {/* ── DRAFT TERBARU ── */}
      <div
        className="card glass-panel sa-section-card mb-6"
        style={{ padding: 26, borderRadius: 28 }}
      >
        {/* header */}
        <div
          className="flex items-center justify-between mb-5 sa-mobile-stack"
          style={{ gap: 18, alignItems: "flex-start" }}
        >
          <div className="flex items-center gap-3" style={{ flexWrap: "wrap" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: "var(--bg-light)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CalendarDays size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                Draft Terbaru
              </h3>
              <p className="text-muted" style={{ fontSize: 13 }}>
                Artikel yang masih dalam proses editing
              </p>
            </div>
          </div>

          <button
            className="btn btn-outline"
            onClick={loadKontens}
            disabled={loading}
            style={{ gap: 8, opacity: loading ? 0.6 : 1 }}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* body */}
        {loading ? (
          <LoadingSkeletons count={3} />
        ) : recentDrafts.length === 0 ? (
          <EmptyState label="Tidak ada draft saat ini" />
        ) : (
          <div className="sa-draft-list">
            {recentDrafts.map((k) => (
              <DraftItem
                key={k.id}
                konten={k}
                isDeleting={deleting === k.id}
                onEdit={() =>
                  navigate(`/superadmin/konten-desain?edit=${k.id}`)
                }
                onDelete={() => handleDelete(k.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── KONTEN TERBIT (table) ── */}
      <div
        className="card glass-panel sa-section-card"
        style={{ padding: 26, borderRadius: 28 }}
      >
        {/* header */}
        <div
          className="flex items-center justify-between mb-5 sa-mobile-stack"
          style={{ gap: 18, alignItems: "flex-start" }}
        >
          <div className="flex items-center gap-3" style={{ flexWrap: "wrap" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: "var(--accent-glow)",
                color: "var(--secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Newspaper size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                Konten Terbit
              </h3>
              <p className="text-muted" style={{ fontSize: 13 }}>
                Semua konten yang sudah dipublikasikan
              </p>
            </div>
          </div>

          {/* filter by tipe */}
          <select
            value={filterTipe}
            onChange={(e) => setFilterTipe(e.target.value)}
            style={{
              height: 40,
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--card-bg)",
              padding: "0 14px",
              outline: "none",
              fontSize: 14,
              color: "var(--text-main)",
              cursor: "pointer",
            }}
          >
            <option value="">Semua Tipe</option>
            {Object.entries(TIPE_CONFIG).map(([val, cfg]) => (
              <option key={val} value={val}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>

        {/* table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 720,
            }}
          >
            <thead>
              <tr style={{ background: "var(--bg-light)" }}>
                {["Judul", "Tipe", "Penulis", "Tanggal", "Status", "Aksi"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "13px 16px",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-main)",
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: "center" }}>
                    <Spinner />
                  </td>
                </tr>
              ) : published.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: 32,
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: 14,
                    }}
                  >
                    Belum ada konten yang diterbitkan
                  </td>
                </tr>
              ) : (
                published.map((k) => {
                  const tipe = TIPE_CONFIG[k.tipe] || {
                    label: k.tipe || "-",
                    bg: "#F3F4F6",
                    color: "#6B7280",
                  };
                  return (
                    <tr
                      key={k.id}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      {/* judul */}
                      <td style={tdStyle}>
                        <div
                          style={{
                            fontWeight: 600,
                            maxWidth: 260,
                            wordBreak: "break-word",
                          }}
                        >
                          {k.judul}
                        </div>
                      </td>

                      {/* tipe badge */}
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: tipe.bg,
                            color: tipe.color,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {tipe.label}
                        </span>
                      </td>

                      {/* penulis */}
                      <td style={tdStyle}>{k.author?.name || "-"}</td>

                      {/* tanggal */}
                      <td style={tdStyle}>
                        {formatDate(k.published_at || k.created_at)}
                      </td>

                      {/* status */}
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: "#DCFCE7",
                            color: "#16A34A",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          Terbit
                        </span>
                      </td>

                      {/* aksi */}
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            flexWrap: "nowrap",
                          }}
                        >
                          <ActionBtn
                            title="Preview"
                            icon={<Eye size={13} />}
                            bg="#F0FDF4"
                            color="#16A34A"
                            onClick={() =>
                              navigate(`/superadmin/preview/${k.id}`)
                            }
                          />
                          <ActionBtn
                            title="Edit"
                            icon={<Pencil size={13} />}
                            bg="#EFF6FF"
                            color="#1D4ED8"
                            onClick={() =>
                              navigate(`/superadmin/konten-desain?edit=${k.id}`)
                            }
                          />
                          <ActionBtn
                            title={k.is_published ? "Unpublish" : "Publish"}
                            icon={
                              k.is_published ? (
                                <EyeOff size={13} />
                              ) : (
                                <Globe size={13} />
                              )
                            }
                            bg="#F0FDF4"
                            color="#16A34A"
                            disabled={toggling === k.id}
                            onClick={() => handleToggle(k.id)}
                          />
                          <ActionBtn
                            title="Hapus"
                            icon={<Trash2 size={13} />}
                            bg="#FEF2F2"
                            color="#DC2626"
                            disabled={deleting === k.id}
                            onClick={() => handleDelete(k.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── sub-components ──────────────────────── */

function StatCard({ icon, title, value, bg, color }) {
  return (
    <div
      className="card"
      style={{
        padding: 24,
        borderRadius: 24,
        border: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: bg,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        {icon}
      </div>
      <div className="text-muted" style={{ fontSize: 14, marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>
        {value}
      </div>
    </div>
  );
}

function DraftItem({ konten, onEdit, onDelete, isDeleting }) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 22,
        padding: 20,
        background: "var(--card-bg)",
      }}
    >
      <div
        className="flex items-start justify-between sa-mobile-stack"
        style={{ gap: 16 }}
      >
        {/* left */}
        <div
          className="flex items-center gap-4"
          style={{ minWidth: 0, flex: 1 }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "var(--bg-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileText size={22} color="var(--primary)" />
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                lineHeight: 1.5,
                wordBreak: "break-word",
                fontSize: 15,
                marginBottom: 4,
              }}
            >
              {konten.judul}
            </div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              Diedit {timeAgo(konten.updated_at || konten.created_at)}
            </div>
          </div>
        </div>

        {/* right */}
        <div
          className="sa-btn-pair"
          style={{ display: "flex", gap: 8, flexShrink: 0 }}
        >
          <button
            onClick={onEdit}
            className="btn btn-outline"
            style={{ gap: 6, fontSize: 13 }}
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="btn"
            style={{
              background: "#FEF2F2",
              color: "#DC2626",
              border: "1px solid #FECACA",
              gap: 6,
              fontSize: 13,
              opacity: isDeleting ? 0.6 : 1,
              cursor: isDeleting ? "not-allowed" : "pointer",
            }}
          >
            <Trash2 size={14} /> Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, icon, bg, color, title, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: bg,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {icon}
    </button>
  );
}

function LoadingSkeletons({ count = 3 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 80,
            borderRadius: 18,
            background: "var(--bg-light)",
            animation: "sa-pulse 1.5s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "32px 0",
        color: "var(--text-muted)",
        fontSize: 14,
      }}
    >
      {label}
    </div>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        border: "3px solid var(--border)",
        borderTop: "3px solid var(--primary)",
        borderRadius: "50%",
        animation: "sa-spin 0.8s linear infinite",
        display: "inline-block",
      }}
    />
  );
}

const tdStyle = {
  padding: "13px 16px",
  fontSize: 14,
  verticalAlign: "middle",
};
