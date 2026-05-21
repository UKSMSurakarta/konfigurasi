import { useState } from "react";
import { GALERI_LIST, KATEGORI_KONTEN } from "../../data/questions";
import { Image, Video, Trash2, Eye, Upload, Search } from "lucide-react";

export default function KontenGaleriMedia() {
  const [search, setSearch]   = useState("");
  const [filterKat, setFilter] = useState("");

  const filtered = GALERI_LIST.filter((g) => {
    const q = search.toLowerCase();
    const mS = g.judul.toLowerCase().includes(q);
    const mK = !filterKat || g.kategori === filterKat;
    return mS && mK;
  });

  const totalFoto  = GALERI_LIST.filter((g) => g.kategori === "Foto").length;
  const totalVideo = GALERI_LIST.filter((g) => g.kategori === "Video").length;
  const aktif      = GALERI_LIST.filter((g) => g.status === "Aktif").length;

  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 mb-6" style={{ flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 700, marginBottom: 6, lineHeight: 1.2 }}>Galeri & Media</h1>
          <p className="text-muted" style={{ fontSize: "14px" }}>Kelola foto dan video dokumentasi kegiatan UKS</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg,var(--primary),var(--secondary))", color: "white", fontWeight: 700, cursor: "pointer" }}>
          <Upload size={18} /> Upload Media
        </button>
      </div>

      {/* STAT */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
        <MiniStat label="Total Media" value={String(GALERI_LIST.length)} color="var(--primary)"   bg="var(--bg-light)" />
        <MiniStat label="Foto"        value={String(totalFoto)}          color="#BE185D"           bg="#FCE7F3" />
        <MiniStat label="Video"       value={String(totalVideo)}         color="#7C3AED"           bg="#EDE9FE" />
        <MiniStat label="Aktif"       value={String(aktif)}              color="#16A34A"           bg="#DCFCE7" />
      </div>

      {/* FILTER */}
      <div className="card glass-panel mb-5" style={{ padding: "14px 18px", borderRadius: "18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "12px" }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input type="text" placeholder="Cari media..." value={search} onChange={(e) => setSearch(e.target.value)} style={inp} />
          </div>
          <select style={inp} value={filterKat} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Semua Tipe</option>
            <option value="Foto">Foto</option>
            <option value="Video">Video</option>
          </select>
        </div>
      </div>

      {/* GRID GALERI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "18px" }}>
        {filtered.map((g) => (
          <div key={g.id} className="card glass-panel" style={{ borderRadius: "20px", overflow: "hidden" }}>
            {/* PREVIEW */}
            <div style={{ height: "160px", background: "var(--bg-light)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              {g.kategori === "Video"
                ? <Video size={48} color="var(--text-muted)" />
                : <Image size={48} color="var(--text-muted)" />}
              <div style={{ position: "absolute", top: "10px", right: "10px", padding: "4px 10px", borderRadius: "999px", background: g.status === "Aktif" ? "#DCFCE7" : "#F3F4F6", color: g.status === "Aktif" ? "#16A34A" : "#9CA3AF", fontSize: "11px", fontWeight: 700 }}>
                {g.status}
              </div>
              <div style={{ position: "absolute", top: "10px", left: "10px", padding: "4px 10px", borderRadius: "999px", background: g.kategori === "Video" ? "#EDE9FE" : "#FCE7F3", color: g.kategori === "Video" ? "#7C3AED" : "#BE185D", fontSize: "11px", fontWeight: 700 }}>
                {g.kategori}
              </div>
            </div>
            {/* INFO */}
            <div style={{ padding: "16px" }}>
              <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>{g.judul}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                <span>{g.tanggal}</span>
                <span>{g.ukuran}</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={iconBtn("#1D4ED8","#DBEAFE")}><Eye size={14} /></button>
                <button style={iconBtn("#DC2626","#FEE2E2")}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color, bg }) {
  return (
    <div className="card" style={{ padding: "18px 20px", borderRadius: "18px", border: "1px solid var(--border)" }}>
      <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px" }}>{label}</div>
      <div style={{ fontSize: "26px", fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
const inp = { width: "100%", height: "42px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--card-bg)", paddingLeft: "38px", paddingRight: "14px", outline: "none", fontSize: "14px", color: "var(--text-main)" };
const iconBtn = (color, bg) => ({ width: "34px", height: "34px", borderRadius: "10px", border: "none", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" });