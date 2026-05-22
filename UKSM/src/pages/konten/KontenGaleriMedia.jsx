import { useState, useEffect } from "react";
import { getKontensApi } from "../../api/admin";
import { Image, Video, Trash2, Eye, Upload, Search } from "lucide-react";

function formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function KontenGaleriMedia() {
    const [media, setMedia] = useState([]);
    const [search, setSearch] = useState("");
    const [filterKat, setFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const extractList = (response) => {
        if (!response) return [];
        if (Array.isArray(response?.data?.data)) return response.data.data;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
    };

    useEffect(() => {
        let active = true;
        const fetchMedia = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getKontensApi({ tipe: "galeri", page: 1 });
                if (!active) return;
                setMedia(extractList(res));
            } catch {
                if (!active) return;
                setError("Gagal memuat media galeri.");
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchMedia();
        return () => {
            active = false;
        };
    }, []);

    const filtered = media.filter((g) => {
        const q = search.toLowerCase();
        const title = String(g.judul || g.title || g.name || "").toLowerCase();
        const kategori = String(g.kategori || g.tipe || "").toLowerCase();
        const matchSearch = title.includes(q);
        const matchFilter = !filterKat || kategori === filterKat.toLowerCase();
        return matchSearch && matchFilter;
    });

    const totalFoto = media.filter((g) => String(g.kategori || g.tipe).toLowerCase() === "foto").length;
    const totalVideo = media.filter((g) => String(g.kategori || g.tipe).toLowerCase() === "video").length;
    const aktif = media.filter((g) => g.is_published || String(g.status).toLowerCase() === "aktif").length;

    return (
        <div style={{ width: "100%", overflowX: "hidden" }}>
            {/* HEADER */}
            <div className="flex items-start justify-between gap-4 mb-6" style={{ flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 700, marginBottom: 6, lineHeight: 1.2 }}>
                        Galeri & Media
                    </h1>
                    <p className="text-muted" style={{ fontSize: "14px" }}>
                        Kelola foto dan video dokumentasi kegiatan UKS
                    </p>
                </div>
                <button
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 20px",
                        borderRadius: "14px",
                        border: "none",
                        background: "linear-gradient(135deg,var(--primary),var(--secondary))",
                        color: "white",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    <Upload size={18} /> Upload Media
                </button>
            </div>

            {/* STAT */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
                <MiniStat label="Total Media" value={String(media.length)} color="var(--primary)" bg="var(--bg-light)" />
                <MiniStat label="Foto" value={String(totalFoto)} color="#BE185D" bg="#FCE7F3" />
                <MiniStat label="Video" value={String(totalVideo)} color="#7C3AED" bg="#EDE9FE" />
                <MiniStat label="Aktif" value={String(aktif)} color="#16A34A" bg="#DCFCE7" />
            </div>

            {/* FILTER */}
            <div className="card glass-panel mb-5" style={{ padding: "14px 18px", borderRadius: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "12px" }}>
                    <div style={{ position: "relative" }}>
                        <Search
                            size={16}
                            style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                        />
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
                {loading ? (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                        Memuat media galeri...
                    </div>
                ) : error ? (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "var(--text-danger)" }}>
                        {error}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                        Tidak ada media galeri. Coba ubah kata kunci pencarian atau unggah konten galeri baru.
                    </div>
                ) : (
                    filtered.map((g) => {
                        const kategori = String(g.kategori || g.tipe || "");
                        const status = g.is_published ? "Aktif" : g.status || "Draft";
                        const title = g.judul || g.title || g.name || "Media tanpa judul";
                        const date = formatDate(g.created_at || g.published_at || g.tanggal);
                        const size = g.ukuran || g.file_size || "-";
                        const previewImage = g.thumbnail_url || g.cover_url || g.image_url || g.media_url;

                        return (
                            <div key={g.id || title} className="card glass-panel" style={{ borderRadius: "20px", overflow: "hidden" }}>
                                <div
                                    style={{
                                        height: "160px",
                                        background: previewImage ? `url(${previewImage}) center/cover no-repeat` : "var(--bg-light)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        position: "relative",
                                    }}
                                >
                                    {!previewImage && (kategori.toLowerCase() === "video" ? <Video size={48} color="var(--text-muted)" /> : <Image size={48} color="var(--text-muted)" />)}
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "10px",
                                            right: "10px",
                                            padding: "4px 10px",
                                            borderRadius: "999px",
                                            background: status === "Aktif" ? "#DCFCE7" : "#F3F4F6",
                                            color: status === "Aktif" ? "#16A34A" : "#9CA3AF",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {status}
                                    </div>
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "10px",
                                            left: "10px",
                                            padding: "4px 10px",
                                            borderRadius: "999px",
                                            background: kategori.toLowerCase() === "video" ? "#EDE9FE" : "#FCE7F3",
                                            color: kategori.toLowerCase() === "video" ? "#7C3AED" : "#BE185D",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {kategori || "Galeri"}
                                    </div>
                                </div>
                                <div style={{ padding: "16px" }}>
                                    <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>{title}</div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                                        <span>{date}</span>
                                        <span>{size}</span>
                                    </div>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button style={iconBtn("#1D4ED8", "#DBEAFE")}><Eye size={14} /></button>
                                        <button style={iconBtn("#DC2626", "#FEE2E2")}><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

function MiniStat({ label, value, color, bg }) {
    return (
        <div className="card" style={{ padding: "18px 20px", borderRadius: "18px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px" }}>{label}</div>
            <div style={{ fontSize: "26px", fontWeight: 700, color, background: bg, display: "inline-block", padding: "4px 8px", borderRadius: "10px" }}>{value}</div>
        </div>
    );
}

const inp = {
    width: "100%",
    height: "42px",
    borderRadius: "12px",
    border: "1px solid var(--border)",
    background: "var(--card-bg)",
    paddingLeft: "38px",
    paddingRight: "14px",
    outline: "none",
    fontSize: "14px",
    color: "var(--text-main)",
};

const iconBtn = (color, bg) => ({
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    border: "none",
    background: bg,
    color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
});
