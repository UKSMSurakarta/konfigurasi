import React from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

// Utility function to get excerpt from HTML content
function getExcerpt(html) {
  if (!html) return "Tidak ada konten...";
  const temp = document.createElement("div");
  temp.innerHTML = html;
  let txt = temp.textContent || temp.innerText || "";
  txt = txt.trim();
  if (!txt) return "Tidak ada konten...";
  return txt.length > 100 ? txt.substring(0, 100) + "..." : txt;
}

// Helper to map tipe to badge style
function getTagStyle(tipe) {
  switch (tipe) {
    case "berita":
      return { background: "#dcfce7", color: "#16a34a" };
    case "agenda":
      return { background: "#dbeafe", color: "#1d4ed8" };
    case "pengumuman":
      return { background: "#fef3c7", color: "#d97706" };
    case "galeri":
    default:
      return { background: "#f3e8ff", color: "#9333ea" };
  }
}

export default function NewsCard({ konten, isPublic = false }) {
  const tagStyle = getTagStyle(konten.tipe);
  const previewImg = konten.thumbnail_url || null;
  const excerpt = getExcerpt(konten.isi);

  const previewLink = isPublic 
    ? `/artikel/${konten.slug || konten.id}`
    : `/konten/preview/${konten.id}`;

  return (
    <div className="news-card">
      {previewImg ? (
        <img src={previewImg} alt={konten.judul} className="news-img" />
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
            height: "180px",
          }}
        >
          Belum ada Cover
        </div>
      )}

      <div className="news-content">
        <span className="news-tag" style={tagStyle}>
          {konten.tipe?.toUpperCase() || "-"}
        </span>
        <h5 className="news-title">{konten.judul}</h5>
        <p className="news-excerpt">{excerpt}</p>
        <div className="news-meta">
          <span>{new Date(konten.created_at).toLocaleDateString()}</span>
          <span>Oleh: {konten.author?.name || "Admin"}</span>
        </div>
        <Link
          to={previewLink}
          className="preview-detail-btn"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 12,
            background: "var(--bg-light)",
            border: "1px solid var(--border)",
            color: "var(--text-main)",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          <Eye size={16} /> Lihat Detail Halaman
        </Link>
      </div>
    </div>
  );
}
