import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { getPublicBeritaApi } from "../api/public";
import NewsCard from "../components/common/NewsCard";

export default function SemuaArtikel() {
  const [artikel, setArtikel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipe, setFilterTipe] = useState(""); // "" means all

  useEffect(() => {
    loadData();
  }, [filterTipe]);

  const loadData = () => {
    setLoading(true);
    // getPublicBeritaApi might accept params, let's pass tipe if any
    const params = {};
    if (filterTipe) params.tipe = filterTipe;

    getPublicBeritaApi(params)
      .then(res => {
        let list = [];
        if (res?.data?.data && Array.isArray(res.data.data)) {
          list = res.data.data;
        } else if (res?.data && Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        }
        setArtikel(list);
      })
      .catch(err => console.error("Failed to load artikel:", err))
      .finally(() => setLoading(false));
  };

  const filteredArtikel = artikel.filter(item => 
    item.judul?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.isi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: "#F8FAFC", minHeight: "100vh", paddingBottom: "100px" }}>
      {/* Header / Navbar simple */}
      <header style={{
        background: "white", padding: "20px", display: "flex", alignItems: "center",
        borderBottom: "1px solid #E5E7EB", position: "sticky", top: 0, zIndex: 10
      }}>
        <div style={{ maxWidth: "1200px", margin: "auto", width: "100%", display: "flex", gap: "20px", alignItems: "center" }}>
          <Link to="/" style={{ color: "#0F6E56", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
            <ArrowLeft size={20} />
            Kembali ke Beranda
          </Link>
          <h2 style={{ margin: 0, marginLeft: "auto", color: "#042C53", fontSize: "1.2rem", fontWeight: "700" }}>Semua Artikel & Berita</h2>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "auto", padding: "40px 20px" }}>
        
        {/* Filter & Search */}
        <div style={{
          display: "flex", gap: "15px", marginBottom: "40px", flexWrap: "wrap",
          background: "white", padding: "20px", borderRadius: "16px", border: "1px solid #E5E7EB"
        }}>
          <div style={{ flex: "1 1 300px", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#6C757D" }} />
            <input 
              type="text" 
              placeholder="Cari artikel..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%", padding: "12px 15px 12px 45px", borderRadius: "12px",
                border: "1px solid #DCE3EA", outline: "none", fontSize: "14px"
              }}
            />
          </div>
          
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Filter size={18} color="#6C757D" />
            <select 
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
              style={{
                padding: "12px 20px", borderRadius: "12px", border: "1px solid #DCE3EA",
                outline: "none", fontSize: "14px", backgroundColor: "white", cursor: "pointer"
              }}
            >
              <option value="">Semua Tipe</option>
              <option value="berita">Berita</option>
              <option value="pengumuman">Pengumuman</option>
              <option value="agenda">Agenda</option>
              <option value="galeri">Galeri</option>
            </select>
          </div>
        </div>

        {/* Grid Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
             <div style={{
                  width: 40, height: 40, border: "3px solid #e5e7eb", margin: "auto",
                  borderTop: "3px solid #0F6E56", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ marginTop: "20px", color: "#6C757D" }}>Memuat artikel...</p>
          </div>
        ) : filteredArtikel.length > 0 ? (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "30px"
          }}>
            {filteredArtikel.map((item, idx) => (
              <NewsCard key={idx} konten={item} isPublic={true} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#6C757D", background: "white", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
            <h3>Tidak ada artikel yang ditemukan.</h3>
            <p style={{ marginTop: "10px" }}>Coba ubah kata kunci pencarian atau filter tipe artikel.</p>
          </div>
        )}

      </div>
    </div>
  );
}
