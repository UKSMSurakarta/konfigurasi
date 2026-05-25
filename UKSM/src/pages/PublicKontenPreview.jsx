import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Layout, Loader2 } from "lucide-react";
import { getPublicBeritaDetailApi } from "../api/public";
import { useToast } from "../components/Toast";

export default function PublicKontenPreview() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicBeritaDetailApi(slug)
      .then((r) => {
        const d = r.data?.data || r.data;
        setData(d);
      })
      .catch(() => {
        showToast("Gagal memuat artikel atau artikel tidak ditemukan", "error");
        navigate(-1);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-primary mb-4" />
        <p className="text-muted font-medium">Memuat artikel...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ backgroundColor: "#F8FAFC", minHeight: "100vh", paddingBottom: "100px" }}>
      {/* Header / Navbar simple */}
      <header style={{
        background: "white", padding: "20px", display: "flex", alignItems: "center",
        borderBottom: "1px solid #E5E7EB", position: "sticky", top: 0, zIndex: 10
      }}>
        <div style={{ maxWidth: "800px", margin: "auto", width: "100%", display: "flex", gap: "20px", alignItems: "center" }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              background: "none", border: "none", color: "#0F6E56", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "16px"
            }}
          >
            <ArrowLeft size={20} />
            Kembali
          </button>
        </div>
      </header>

      <div style={{ padding: "40px 20px" }}>
        <style>{`
          .preview-container {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            border-radius: 24px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.03);
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
            color: #1e293b;
          }

          .preview-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            padding-bottom: 24px;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 32px;
          }

          .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
          }

          .preview-content {
            padding: 0 32px 32px 32px;
            font-size: 16px;
            line-height: 1.9;
            color: #334155;
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
            color: #1e293b;
            font-weight: 700;
          }

          .preview-content p {
            margin-bottom: 16px;
          }
        `}</style>

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
                  background: "#EAF7F2",
                  color: "#0F6E56",
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                {data.tipe}
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
                {data.published_at ? data.published_at.split(' ')[0] : (data.created_at ? data.created_at.split(' ')[0] : '')}
              </div>
            </div>
          </div>

          <div
            className="preview-content"
            dangerouslySetInnerHTML={{ __html: data.isi }}
          />
        </div>
      </div>
    </div>
  );
}
