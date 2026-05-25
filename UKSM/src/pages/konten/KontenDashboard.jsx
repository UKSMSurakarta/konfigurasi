import { useState, useEffect, useCallback } from "react";
import {
  Edit2,
  Trash2,
  Plus,
  Search,
  RefreshCw,
  Globe,
  EyeOff,
  Eye,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  getKontensApi,
  deleteKontenApi,
  togglePublishKontenApi,
} from "../../api/admin";
import { useToast } from "../../components/Toast";

/* ───────────────────────── helpers ───────────────────────── */

function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
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

export default function KontenDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [kontens, setKontens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTipe, setFilterTipe] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [selectedKonten, setSelectedKonten] = useState(null);

  const getExcerpt = (html) => {
    if (!html) return "Tidak ada konten...";
    const temp = document.createElement("div");
    temp.innerHTML = html;
    let txt = temp.textContent || temp.innerText || "";
    txt = txt.trim();
    if (!txt) return "Tidak ada konten...";
    return txt.length > 100 ? txt.substring(0, 100) + "..." : txt;
  };

  const getTagClassAndStyle = (tipe) => {
    switch (tipe) {
      case "berita":
        return { className: "tag-success", style: {} };
      case "agenda":
        return { className: "tag-primary", style: {} };
      case "pengumuman":
        return { className: "tag-warning", style: {} };
      case "galeri":
      default:
        return { 
          className: "", 
          style: { background: "#F3E8FF", color: "#9333EA" } 
        };
    }
  };

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

  /* client-side search fallback ----------------------------- */
  const filtered = kontens.filter((k) => {
    const q = search.toLowerCase();
    const matchS =
      k.judul?.toLowerCase().includes(q) ||
      k.author?.name?.toLowerCase().includes(q);
    const matchT = !filterTipe || k.tipe === filterTipe;
    return matchS && matchT;
  });

  const currentSelection = filtered.find(k => k.id === selectedKonten?.id) || filtered[0] || null;

  const diterbitkan = kontens.filter((k) => k.is_published).length;
  const draft = kontens.filter((k) => !k.is_published).length;

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
    <div style={{ width: "100%", overflowX: "hidden" }}>
      <style>{`
        @keyframes kd-spin { to { transform:rotate(360deg); } }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (min-width: 1025px) {
          .dashboard-grid {
            grid-template-columns: 1fr 340px;
          }
        }

        .preview-column {
          position: relative;
        }

        @media (min-width: 1025px) {
          .preview-column {
            position: sticky;
            top: 90px;
          }
        }

        .preview-detail-btn:hover {
          background: var(--border) !important;
        }

        /* PREVIEW CARD STYLES */
        .news-card {
          background: var(--card-bg, #fff);
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid var(--border, #edf1f5);
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
          transition: 0.3s;
          display: flex;
          flex-direction: column;
          width: 100%;
          text-align: left;
        }

        .news-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.06);
        }

        .news-img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }

        .news-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .news-tag {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 12px;
          align-self: flex-start;
        }

        .tag-success {
          background: #dcfce7;
          color: #15803d;
        }

        .tag-primary {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .tag-warning {
          background: #fef3c7;
          color: #b45309;
        }

        .news-excerpt {
          color: var(--text-muted, #6c757d);
          line-height: 1.6;
          font-size: 0.85rem;
          margin-bottom: 14px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .news-meta {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted, #94a3b8);
          border-top: 1px solid var(--border, #edf1f5);
          padding-top: 12px;
        }
      `}</style>

      {/* ── HEADER ── */}
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
              lineHeight: 1.2,
            }}
          >
            Dashboard Konten
          </h1>
          <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
            Kelola artikel, berita, dan konten edukasi website SI-UKS
          </p>
        </div>

        <Link
          to="/konten/desain"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 14,
            border: "none",
            background:
              "linear-gradient(135deg,var(--primary),var(--secondary))",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          <Plus size={18} /> Konten Baru
        </Link>
      </div>

      {/* ── STAT CARDS ── */}
      <div
        className="grid gap-5 mb-6"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}
      >
        <MiniStat
          label="Total Konten"
          value={loading ? "..." : String(kontens.length)}
          color="var(--primary)"
          bg="var(--bg-light)"
        />
        <MiniStat
          label="Diterbitkan"
          value={loading ? "..." : String(diterbitkan)}
          color="#16A34A"
          bg="#DCFCE7"
        />
        <MiniStat
          label="Draft"
          value={loading ? "..." : String(draft)}
          color="#D97706"
          bg="#FEF3C7"
        />
        <MiniStat
          label="Total Tayangan"
          value="0"
          color="var(--secondary)"
          bg="var(--accent-glow)"
        />
      </div>

      {/* ── FILTER BAR ── */}
      <div
        className="card glass-panel mb-5"
        style={{ padding: "16px 20px", borderRadius: 20 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: 12,
          }}
        >
          {/* search */}
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 13,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Cari judul / penulis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inp}
            />
          </div>

          {/* tipe filter */}
          <select
            value={filterTipe}
            onChange={(e) => setFilterTipe(e.target.value)}
            style={{ ...inp, paddingLeft: 14 }}
          >
            <option value="">Semua Tipe</option>
            {Object.entries(TIPE_CONFIG).map(([val, cfg]) => (
              <option key={val} value={val}>
                {cfg.label}
              </option>
            ))}
          </select>

          {/* refresh */}
          <button
            onClick={loadKontens}
            disabled={loading}
            style={{
              height: 42,
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--card-bg)",
              color: "var(--text-main)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* ── LAYOUT GRID ── */}
      <div className="dashboard-grid">
        {/* LEFT COLUMN: TABLE */}
        <div
          className="card glass-panel"
          style={{ padding: 24, borderRadius: 24, overflowX: "auto" }}
        >
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}
          >
            <thead>
              <tr style={{ background: "var(--bg-light)" }}>
                {[
                  "Judul",
                  "Kategori",
                  "Penulis",
                  "Tanggal",
                  "Status",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: "center" }}>
                    <Spinner />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
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
                    Tidak ada konten ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((k) => {
                  const tipe = TIPE_CONFIG[k.tipe] || {
                    label: k.tipe || "-",
                    bg: "#F3F4F6",
                    color: "#6B7280",
                  };
                  const statusC = k.is_published
                    ? { bg: "#DCFCE7", color: "#16A34A", label: "Terbit" }
                    : { bg: "#FEF3C7", color: "#D97706", label: "Draft" };
                  const isSelected = currentSelection?.id === k.id;
                  return (
                    <tr
                      key={k.id}
                      onClick={() => setSelectedKonten(k)}
                      style={{ 
                        borderBottom: "1px solid var(--border)",
                        background: isSelected ? "var(--accent-glow, rgba(15, 110, 86, 0.05))" : "transparent",
                        cursor: "pointer",
                        transition: "background 0.2s"
                      }}
                    >
                      {/* judul */}
                      <td style={td}>
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

                      {/* kategori badge */}
                      <td style={td}>
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
                      <td style={td}>{k.author?.name || "-"}</td>

                      {/* tanggal */}
                      <td style={td}>{formatDate(k.created_at)}</td>

                      {/* status */}
                      <td style={td}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: statusC.bg,
                            color: statusC.color,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {statusC.label}
                        </span>
                      </td>

                      {/* aksi */}
                      <td style={td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <IconBtn
                            icon={
                              k.is_published ? (
                                <EyeOff size={14} />
                              ) : (
                                <Globe size={14} />
                              )
                            }
                            color="#16A34A"
                            title={k.is_published ? "Unpublish" : "Publish"}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggle(k.id);
                            }}
                            disabled={toggling === k.id}
                          />
                          <IconBtn
                            icon={<Eye size={14} />}
                            color="var(--primary)"
                            title="Preview"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedKonten(k);
                            }}
                          />
                          <IconBtn
                            icon={<Edit2 size={14} />}
                            color="#D97706"
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/konten/desain?edit=${k.id}`);
                            }}
                          />
                          <IconBtn
                            icon={<Trash2 size={14} />}
                            color="#DC2626"
                            title="Hapus"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(k.id);
                            }}
                            disabled={deleting === k.id}
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

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="preview-column">
          <div className="card glass-panel" style={{ padding: 24, borderRadius: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Preview Konten</h3>
            
            {currentSelection ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="news-card">
                  {currentSelection.thumbnail_url ? (
                    <img src={currentSelection.thumbnail_url} alt={currentSelection.judul} className="news-img" />
                  ) : (
                    <div 
                      className="news-img" 
                      style={{ 
                        background: "linear-gradient(135deg, var(--primary), var(--secondary))", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        color: "white",
                        fontSize: "14px",
                        fontWeight: 600,
                        height: "180px"
                      }}
                    >
                      Belum ada Cover
                    </div>
                  )}
                  
                  <div className="news-content">
                    <span className={`news-tag ${getTagClassAndStyle(currentSelection.tipe).className}`} style={getTagClassAndStyle(currentSelection.tipe).style}>
                      {TIPE_CONFIG[currentSelection.tipe]?.label || currentSelection.tipe}
                    </span>
                    
                    <h5 className="news-title" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)", marginBottom: 8, lineHeight: 1.4 }}>
                      {currentSelection.judul}
                    </h5>
                    
                    <p className="news-excerpt">
                      {getExcerpt(currentSelection.isi)}
                    </p>
                    
                    <div className="news-meta">
                      <span>{formatDate(currentSelection.created_at)}</span>
                      <span>Oleh: {currentSelection.author?.name || "Admin"}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/konten/preview/${currentSelection.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "var(--bg-light)",
                    border: "1px solid var(--border)",
                    color: "var(--text-main)",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "none",
                    fontSize: 14,
                    transition: '0.2s'
                  }}
                  className="preview-detail-btn"
                >
                  <Eye size={16} /> Lihat Detail Halaman
                </Link>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                Pilih artikel untuk melihat preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── sub-components ──────────────────────── */

function MiniStat({ label, value, color, bg }) {
  return (
    <div
      className="card"
      style={{
        padding: 20,
        borderRadius: 20,
        border: "1px solid var(--border)",
        background: bg,
      }}
    >
      <div
        style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}
      >
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function IconBtn({ icon, color, onClick, disabled, title }) {
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
        background: "var(--card-bg)",
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

function Spinner() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        border: "3px solid var(--border)",
        borderTop: "3px solid var(--primary)",
        borderRadius: "50%",
        animation: "kd-spin 0.8s linear infinite",
        display: "inline-block",
      }}
    />
  );
}

const inp = {
  width: "100%",
  height: 42,
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card-bg)",
  paddingLeft: 38,
  paddingRight: 14,
  outline: "none",
  fontSize: 14,
  color: "var(--text-main)",
};

const td = { padding: "14px 16px", fontSize: 14, verticalAlign: "middle" };
