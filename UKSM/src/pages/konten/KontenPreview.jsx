import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Layout, Loader2 } from "lucide-react";
import { getKontenDetailApi } from "../../api/admin";
import { useToast } from "../../components/Toast";

export default function KontenPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKontenDetailApi(id)
      .then((r) => {
        const d = r.data?.data || r.data;
        setData(d);
      })
      .catch(() => {
        showToast("Gagal memuat artikel", "error");
        navigate(-1);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-primary mb-4" />
        <p className="text-muted font-medium">Memuat preview artikel...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ paddingBottom: "40px" }}>
      <style>{`
        .preview-container {
          max-width: 800px;
          margin: 0 auto;
          background: var(--card-bg, #fff);
          border-radius: 24px;
          border: 1px solid var(--border, #e2e8f0);
          overflow: hidden;
        }

        .preview-cover {
          width: 100%;
          height: 350px;
          object-fit: cover;
          background: #f1f5f9;
        }

        .preview-header {
          padding: 32px 32px 0 32px;
        }

        .preview-title {
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 800;
          line-height: 1.3;
          margin-bottom: 16px;
          color: var(--text-main, #1e293b);
        }

        .preview-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border, #e2e8f0);
          margin-bottom: 32px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--text-muted, #64748b);
          font-weight: 500;
        }

        .preview-content {
          padding: 0 32px 32px 32px;
          font-size: 16px;
          line-height: 1.9;
          color: var(--text-main, #334155);
        }

        .preview-content img {
          max-width: 100%;
          border-radius: 12px;
          margin: 24px auto;
          display: block;
        }

        .preview-content h1, .preview-content h2, .preview-content h3 {
          margin-top: 32px;
          margin-bottom: 16px;
          color: var(--text-main, #1e293b);
          font-weight: 700;
        }

        .preview-content p {
          margin-bottom: 16px;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 12px;
          background: var(--bg-light, #f8fafc);
          border: 1px solid var(--border, #e2e8f0);
          color: var(--text-main, #475569);
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 24px;
          transition: 0.2s;
        }

        .back-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }
      `}</style>

      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        Kembali
      </button>

      <div className="preview-container">
        {data.thumbnail_url ? (
          <img
            src={data.thumbnail_url}
            alt="Cover"
            className="preview-cover"
          />
        ) : (
          <div className="preview-cover flex items-center justify-center flex-col text-slate-400">
            <Layout size={40} className="mb-2" />
            <span>Tidak ada cover</span>
          </div>
        )}

        <div className="preview-header">
          <div style={{ marginBottom: "12px" }}>
            <span
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: "8px",
                background: "var(--accent-glow)",
                color: "var(--primary)",
                fontWeight: 600,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              {data.tipe}
            </span>
            <span
              style={{
                marginLeft: "12px",
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: "8px",
                background: data.is_published ? "#dcfce7" : "#fef3c7",
                color: data.is_published ? "#166534" : "#92400e",
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              {data.is_published ? "Dipublikasikan" : "Draft"}
            </span>
          </div>
          
          <h1 className="preview-title">{data.judul}</h1>
          
          <div className="preview-meta">
            <div className="meta-item">
              <User size={16} />
              {data.author?.name || "Anonim"}
            </div>
            <div className="meta-item">
              <Calendar size={16} />
              {data.published_at ? data.published_at.split(' ')[0] : data.created_at.split(' ')[0]}
            </div>
          </div>
        </div>

        <div
          className="preview-content"
          dangerouslySetInnerHTML={{ __html: data.isi }}
        />
      </div>
    </div>
  );
}
