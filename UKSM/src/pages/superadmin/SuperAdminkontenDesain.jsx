import { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Upload,
  ImagePlus,
  Save,
  Eye,
  Trash2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { createKontenApi, updateKontenApi, uploadKontenImageApi } from "../../api/superadmin";
import axiosInstance from "../../api/axios";
import { useToast } from "../../components/Toast";

const TIPE_OPTIONS = [
  { value: "berita", label: "Berita" },
  { value: "pengumuman", label: "Pengumuman" },
  { value: "agenda", label: "Agenda" },
  { value: "galeri", label: "Galeri" },
];

export default function SuperAdminkontenDesain() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { showToast } = useToast();

  const editorRef = useRef(null);

  const [cover, setCover] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [title, setTitle] = useState("Judul Artikel...");
  const [selectedTipe, setSelectedTipe] = useState("berita");
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [editorText, setEditorText] = useState("");
  const [author, setAuthor] = useState("Admin Konten");

  /* ── load existing konten when in edit mode ─────────────── */
  useEffect(() => {
    if (!editId) return;
    setLoadingEdit(true);
    axiosInstance
      .get(`/user/kontens/${editId}`)
      .then((r) => {
        const d = r.data?.data || r.data;
        if (d) {
          setTitle(d.judul || "Judul Artikel...");
          setSelectedTipe(d.tipe || "berita");
          if (editorRef.current) {
            editorRef.current.innerHTML = d.isi || "";
            setEditorText(d.isi || "");
          }
          if (d.thumbnail_url) setCover(d.thumbnail_url);
          if (d.author?.name) setAuthor(d.author.name);
        }
      })
      .catch(() => showToast("Gagal memuat data artikel", "error"))
      .finally(() => setLoadingEdit(false));
  }, [editId]); // eslint-disable-line

  /* ── editor helpers ────────────────────────────────────────── */
  const handleCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    setEditorText(editorRef.current?.innerHTML || "");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      showToast("Sedang mengunggah gambar...", "info");
      const res = await uploadKontenImageApi(file);
      if (res.success && res.url) {
        handleCommand("insertImage", res.url);
        showToast("Gambar berhasil diunggah", "success");
      }
    } catch (err) {
      showToast("Gagal mengunggah gambar", "error");
    }
    e.target.value = null;
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCover(URL.createObjectURL(file));
  };

  const getExcerpt = () => {
    const html = editorText || (editorRef.current ? editorRef.current.innerHTML : "");
    if (!html) return "Mulai menulis konten artikel...";
    const temp = document.createElement("div");
    temp.innerHTML = html;
    let txt = temp.textContent || temp.innerText || "";
    txt = txt.replace(/Mulai menulis artikel\.\.\./g, "").trim();
    txt = txt.replace(/Anda dapat menambahkan gambar, mengubah warna teks, membuat tulisan bold, italic, underline, serta mengatur layout artikel dengan fleksibel\./g, "").trim();
    txt = txt.replace(/Editor ini mendukung desain artikel modern seperti Microsoft Word\./g, "").trim();
    if (!txt) return "Mulai menulis konten artikel...";
    return txt.length > 120 ? txt.substring(0, 120) + "..." : txt;
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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

  /* ── save handler ─────────────────────────────────────────── */
  const handleSave = async (publishNow) => {
    const editorContent = editorRef.current?.innerHTML?.trim() || "";

    if (!title || title === "Judul Artikel...") {
      showToast("Harap isi judul artikel terlebih dahulu", "error");
      return;
    }
    if (!editorContent) {
      showToast("Harap isi konten artikel", "error");
      return;
    }

    setSaving(true);

    const payload = new FormData();
    payload.append("judul", title);
    payload.append("isi", editorContent);
    payload.append("tipe", selectedTipe);
    payload.append("is_published", publishNow ? "1" : "0");
    if (coverFile) {
      payload.append("thumbnail", coverFile);
    }

    try {
      if (editId) {
        await updateKontenApi(editId, payload);
      } else {
        await createKontenApi(payload);
      }
      showToast(
        publishNow
          ? "Artikel berhasil diterbitkan!"
          : "Draft berhasil disimpan!",
        "success",
      );
      navigate("/superadmin/konten");
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal menyimpan artikel";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── render ───────────────────────────────────────────────── */
  return (
    <div
      style={{
        width: "100%",
        paddingBottom: "40px",
      }}
    >
      {/* ========================= */}
      {/* STYLE */}
      {/* ========================= */}
      <style>{`
        .editor-page *{
          box-sizing:border-box;
        }

        .editor-page{
          width:100%;
        }

        .editor-grid{
          display:grid;
          grid-template-columns:1fr 340px;
          gap:24px;
          align-items:start;
        }

        .editor-card{
          background:var(--card-bg);
          border:1px solid var(--border);
          border-radius:28px;
          padding:24px;
        }

        .editor-toolbar{
          display:flex;
          flex-wrap:wrap;
          gap:10px;
          padding-bottom:18px;
          margin-bottom:18px;
          border-bottom:1px solid var(--border);
        }

        .toolbar-btn{
          width:44px;
          height:44px;
          border:none;
          border-radius:14px;
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          background:var(--bg-light);
          color:var(--text-main);
          transition:0.25s;
        }

        .toolbar-btn:hover{
          background:var(--primary);
          color:white;
        }

        .toolbar-select{
          height:44px;
          border:none;
          border-radius:14px;
          padding:0 14px;
          background:var(--bg-light);
          color:var(--text-main);
          outline:none;
          cursor:pointer;
        }

        .cover-upload{
          width:100%;
          min-height:260px;
          border:2px dashed var(--border);
          border-radius:24px;
          overflow:hidden;
          position:relative;
          background:var(--bg-light);
          display:flex;
          align-items:center;
          justify-content:center;
          margin-bottom:24px;
        }

        .cover-upload img{
          width:100%;
          height:100%;
          object-fit:cover;
        }

        .cover-overlay{
          position:absolute;
          inset:0;
          background:rgba(0,0,0,0.45);
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          color:white;
          gap:12px;
        }

        .upload-btn{
          padding:12px 20px;
          border-radius:14px;
          border:none;
          cursor:pointer;
          background:white;
          color:var(--primary);
          font-weight:600;
        }

        .title-input{
          width:100%;
          border:none;
          outline:none;
          font-size:clamp(28px,5vw,42px);
          font-weight:800;
          margin-bottom:20px;
          background:transparent;
          color:var(--text-main);
        }

        .editor-content{
          min-height:500px;
          outline:none;
          font-size:16px;
          line-height:1.9;
          color:var(--text-main);
        }

        .editor-content img{
          max-width:100%;
          border-radius:18px;
          margin:20px auto;
          display:block;
        }

        .editor-content h1,
        .editor-content h2,
        .editor-content h3{
          margin-top:22px;
          margin-bottom:14px;
        }

        .editor-content p{
          margin-bottom:16px;
        }

        .side-card{
          background:var(--card-bg);
          border:1px solid var(--border);
          border-radius:28px;
          padding:22px;
          position:sticky;
          top:90px;
        }

        .side-title{
          font-size:18px;
          font-weight:700;
          margin-bottom:20px;
          color:var(--text-main);
        }

        .action-btn{
          width:100%;
          border:none;
          border-radius:18px;
          padding:14px 18px;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          cursor:pointer;
          font-weight:600;
          transition:0.25s;
          margin-bottom:14px;
        }

        .action-btn:disabled{
          opacity:0.6;
          cursor:not-allowed;
        }

        .btn-primary-custom{
          background:linear-gradient(
            135deg,
            var(--primary),
            var(--secondary)
          );
          color:white;
        }

        .btn-outline-custom{
          background:var(--bg-light);
          color:var(--text-main);
        }

        .btn-danger-custom{
          background:#FEE2E2;
          color:#DC2626;
        }

        .meta-box{
          margin-top:24px;
          padding:18px;
          border-radius:18px;
          background:var(--bg-light);
          display:flex;
          flex-direction:column;
          gap:14px;
        }

        .meta-item{
          display:flex;
          justify-content:space-between;
          gap:14px;
          font-size:14px;
        }

        .meta-item span:first-child{
          color:var(--text-muted);
        }

        .meta-item span:last-child{
          font-weight:600;
          color:var(--text-main);
        }

        @media(max-width:1100px){
          .editor-grid{
            grid-template-columns:1fr;
          }

          .side-card{
            position:relative;
            top:0;
          }
        }

        @media(max-width:768px){

          .editor-card,
          .side-card{
            padding:18px;
            border-radius:22px;
          }

          .editor-toolbar{
            gap:8px;
          }

          .toolbar-btn{
            width:40px;
            height:40px;
            border-radius:12px;
          }

          .toolbar-select{
            width:100%;
          }

          .cover-upload{
            min-height:220px;
          }

          .editor-content{
            min-height:400px;
            font-size:15px;
          }

          .action-btn{
            padding:13px;
          }
        }

        .editor-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        @media(min-width:1101px){
          .editor-sidebar {
            position: sticky;
            top: 90px;
          }
        }

        /* LIVE PREVIEW CARD STYLES */
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

        .news-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--primary, #042C53);
          margin-bottom: 8px;
          line-height: 1.4;
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

      <div className="editor-page">
        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div
          className="flex items-start justify-between mb-6"
          style={{
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "clamp(24px,4vw,34px)",
                fontWeight: 800,
                marginBottom: "8px",
              }}
            >
              {editId ? "Edit Artikel" : "Editor Artikel"}
            </h1>

            <p
              className="text-muted"
              style={{
                fontSize: "14px",
                lineHeight: 1.7,
              }}
            >
              {editId
                ? "Perbarui konten artikel yang sudah ada."
                : "Buat dan desain artikel berita UKS dengan editor modern seperti Microsoft Word."}
            </p>
          </div>

          <div
            className="badge badge-glow"
            style={{
              whiteSpace: "nowrap",
            }}
          >
            {editId ? "Edit Artikel" : "Artikel Baru"}
          </div>
        </div>

        {/* loading overlay when fetching edit data */}
        {loadingEdit && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 18px",
              borderRadius: 16,
              background: "var(--accent-glow)",
              color: "var(--secondary)",
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            <Loader2
              size={18}
              style={{ animation: "ed-spin 0.8s linear infinite" }}
            />
            Memuat data artikel...
            <style>{`@keyframes ed-spin { to { transform:rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ========================= */}
        {/* CONTENT */}
        {/* ========================= */}

        <div className="editor-grid">
          {/* ========================= */}
          {/* MAIN EDITOR */}
          {/* ========================= */}

          <div className="editor-card">
            {/* COVER */}
            <div className="cover-upload">
              {cover ? (
                <>
                  <img src={cover} alt="Cover" />

                  <div className="cover-overlay">
                    <Upload size={34} />

                    <label className="upload-btn">
                      Ganti Cover
                      <input
                        type="file"
                        hidden
                        accept="image/jpeg, image/jpg, image/png, image/gif"
                        onChange={handleCoverUpload}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "30px",
                  }}
                >
                  <Upload
                    size={50}
                    style={{
                      marginBottom: "14px",
                      color: "var(--primary)",
                    }}
                  />

                  <h3
                    style={{
                      marginBottom: "10px",
                    }}
                  >
                    Upload Cover Artikel
                  </h3>

                  <p
                    className="text-muted"
                    style={{
                      marginBottom: "20px",
                      fontSize: "14px",
                    }}
                  >
                    Gunakan gambar berkualitas tinggi agar artikel terlihat
                    profesional
                  </p>

                  <label className="upload-btn">
                    Pilih Cover
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleCoverUpload}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* TITLE */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="title-input"
              placeholder="Judul Artikel..."
            />

            {/* TOOLBAR */}
            <div className="editor-toolbar">
              <button
                className="toolbar-btn"
                onClick={() => handleCommand("bold")}
                title="Bold"
              >
                <Bold size={18} />
              </button>

              <button
                className="toolbar-btn"
                onClick={() => handleCommand("italic")}
                title="Italic"
              >
                <Italic size={18} />
              </button>

              <button
                className="toolbar-btn"
                onClick={() => handleCommand("underline")}
                title="Underline"
              >
                <Underline size={18} />
              </button>

              <button
                className="toolbar-btn"
                onClick={() => handleCommand("insertUnorderedList")}
                title="Bullet List"
              >
                <List size={18} />
              </button>

              <button
                className="toolbar-btn"
                onClick={() => handleCommand("insertOrderedList")}
                title="Numbered List"
              >
                <ListOrdered size={18} />
              </button>

              <button
                className="toolbar-btn"
                onClick={() => handleCommand("justifyLeft")}
                title="Align Left"
              >
                <AlignLeft size={18} />
              </button>

              <button
                className="toolbar-btn"
                onClick={() => handleCommand("justifyCenter")}
                title="Align Center"
              >
                <AlignCenter size={18} />
              </button>

              <button
                className="toolbar-btn"
                onClick={() => handleCommand("justifyRight")}
                title="Align Right"
              >
                <AlignRight size={18} />
              </button>

              <label className="toolbar-btn" title="Insert Image">
                <ImagePlus size={18} />
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>

              <button
                className="toolbar-btn"
                title="Insert Link"
                onClick={() => {
                  const url = prompt("Masukkan URL:");
                  if (url) handleCommand("createLink", url);
                }}
              >
                <LinkIcon size={18} />
              </button>

              <input
                type="color"
                title="Text Color"
                onChange={(e) => handleCommand("foreColor", e.target.value)}
                style={{
                  width: "44px",
                  height: "44px",
                  border: "none",
                  borderRadius: "14px",
                  cursor: "pointer",
                  overflow: "hidden",
                  background: "transparent",
                }}
              />

              <select
                className="toolbar-select"
                onChange={(e) => handleCommand("fontSize", e.target.value)}
                defaultValue="3"
              >
                <option value="3">Ukuran Font</option>
                <option value="1">Kecil</option>
                <option value="3">Normal</option>
                <option value="5">Besar</option>
                <option value="7">Sangat Besar</option>
              </select>
            </div>

            {/* CONTENT */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="editor-content"
              onInput={() => setEditorText(editorRef.current?.innerHTML || "")}
            >
              <h2>Mulai menulis artikel...</h2>

              <p>
                Anda dapat menambahkan gambar, mengubah warna teks, membuat
                tulisan bold, italic, underline, serta mengatur layout artikel
                dengan fleksibel.
              </p>

              <p>
                Editor ini mendukung desain artikel modern seperti Microsoft
                Word.
              </p>
            </div>
          </div>

          {/* ========================= */}
          {/* SIDEBAR CONTAINER */}
          {/* ========================= */}

          <div className="editor-sidebar">
            <div className="side-card" style={{ position: "static" }}>
              <h3 className="side-title">Publikasi Artikel</h3>

              {/* SIMPAN DRAFT */}
              <button
                className="action-btn btn-outline-custom"
                disabled={saving}
                onClick={() => handleSave(false)}
                style={{
                  background: "linear-gradient(135deg,#F8FAFC,#EEF2FF)",
                  border: "1px solid var(--border)",
                  color: "var(--primary)",
                }}
              >
                {saving ? (
                  <Loader2
                    size={18}
                    style={{
                      animation: "ed-spin 0.8s linear infinite",
                    }}
                  />
                ) : (
                  <Save size={18} />
                )}
                {saving ? "Menyimpan..." : "Simpan Draft"}
              </button>

              {/* POSTING */}
              <button
                className="action-btn btn-primary-custom"
                disabled={saving}
                onClick={() => handleSave(true)}
              >
                {saving ? (
                  <Loader2
                    size={18}
                    style={{
                      animation: "ed-spin 0.8s linear infinite",
                    }}
                  />
                ) : (
                  <Upload size={18} />
                )}
                {saving ? "Memproses..." : "Posting Artikel"}
              </button>

              {/* PREVIEW */}
              <button className="action-btn btn-outline-custom">
                <Eye size={18} />
                Preview Artikel
              </button>

              {/* BATAL / HAPUS */}
              <button
                className="action-btn btn-danger-custom"
                onClick={() => navigate("/superadmin/konten")}
              >
                <Trash2 size={18} />
                {editId ? "Batal Edit" : "Hapus Draft"}
              </button>

              {/* META */}
              <div className="meta-box">
                {/* STATUS */}
                <div className="meta-item">
                  <span>Status</span>
                  <span
                    style={{
                      color: "#F59E0B",
                      fontWeight: 700,
                    }}
                  >
                    {editId ? "Edit" : "Draft"}
                  </span>
                </div>

                {/* TIPE / KATEGORI */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      color: "var(--text-muted)",
                    }}
                  >
                    Tipe Konten
                  </span>

                  <select
                    value={selectedTipe}
                    onChange={(e) => setSelectedTipe(e.target.value)}
                    style={{
                      width: "100%",
                      height: "48px",
                      borderRadius: "14px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-light)",
                      padding: "0 14px",
                      outline: "none",
                      color: "var(--text-main)",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {TIPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PENULIS */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      color: "var(--text-muted)",
                    }}
                  >
                    Penulis
                  </span>

                  <input
                    type="text"
                    placeholder="Masukkan nama penulis..."
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    style={{
                      width: "100%",
                      height: "48px",
                      borderRadius: "14px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-light)",
                      padding: "0 14px",
                      outline: "none",
                      color: "var(--text-main)",
                      fontWeight: 600,
                    }}
                  />
                </div>

                {/* TERAKHIR EDIT */}
                <div className="meta-item">
                  <span>Terakhir Edit</span>
                  <span>Hari Ini</span>
                </div>
              </div>
            </div>

            {/* LIVE PREVIEW CARD */}
            <div className="side-card" style={{ position: "static" }}>
              <h3 className="side-title">Live Preview</h3>
              
              <div className="news-card">
                {cover ? (
                  <img src={cover} alt="Cover Preview" className="news-img" />
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
                  <span className={`news-tag ${getTagClassAndStyle(selectedTipe).className}`} style={getTagClassAndStyle(selectedTipe).style}>
                    {TIPE_OPTIONS.find(t => t.value === selectedTipe)?.label || selectedTipe}
                  </span>
                  
                  <h5 className="news-title">
                    {title && title !== "Judul Artikel..." ? title : "Judul Artikel..."}
                  </h5>
                  
                  <p className="news-excerpt">
                    {getExcerpt()}
                  </p>
                  
                  <div className="news-meta">
                    <span>{getFormattedDate()}</span>
                    <span>Oleh: {author || "Admin Konten"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
