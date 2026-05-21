import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  Download,
  Activity,
  HeartPulse,
  Globe,
  PlayCircle,
  Building2,
  Newspaper,
  Building,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="landing-page">

      {/* =========================
          STYLE
      ========================== */}
      <style>{`
        :root{
          --primary:#042C53;
          --secondary:#0F6E56;
          --accent:#EAF7F2;
          --text:#2D3436;
        }

        *{
          margin:0;
          padding:0;
          box-sizing:border-box;
        }

        html{
          scroll-behavior:smooth;
        }

        body{
          font-family:'Inter',sans-serif;
          overflow-x:hidden;
          background:#ffffff;
          color:var(--text);
        }

        .landing-page{
          width:100%;
        }

        section{
          padding:100px 0;
        }

        .container-custom{
          width:100%;
          max-width:1200px;
          margin:auto;
          padding:0 20px;
        }

        /* NAVBAR */
        .navbar-custom{
          position:fixed;
          top:0;
          left:0;
          width:100%;
          z-index:999;
          background:rgba(255,255,255,0.95);
          backdrop-filter:blur(12px);
          border-bottom:1px solid rgba(0,0,0,0.05);
        }

        .navbar-wrapper{
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:18px 0;
        }

        .logo{
          display:flex;
          align-items:center;
          gap:10px;
          text-decoration:none;
          color:var(--primary);
          font-size:1.3rem;
          font-weight:800;
        }

        .nav-menu{
          display:flex;
          align-items:center;
          gap:30px;
        }

        .nav-menu a{
          text-decoration:none;
          color:var(--primary);
          font-weight:500;
          transition:0.3s;
        }

        .nav-menu a:hover{
          color:var(--secondary);
        }

        /* BUTTON */
        .btn-gradient{
          background:linear-gradient(135deg,var(--primary),var(--secondary));
          border:none;
          color:white;
          padding:14px 28px;
          border-radius:16px;
          font-weight:600;
          text-decoration:none;
          display:inline-flex;
          align-items:center;
          gap:10px;
          transition:0.3s;
          cursor:pointer;
        }

        .btn-gradient:hover{
          transform:translateY(-3px);
          color:white;
        }

        .btn-outline{
          border:1px solid #dce3ea;
          color:var(--primary);
          background:white;
          padding:14px 28px;
          border-radius:16px;
          font-weight:600;
          text-decoration:none;
          display:inline-flex;
          align-items:center;
          gap:10px;
          transition:0.3s;
        }

        .btn-outline:hover{
          background:#f7f9fb;
        }

        /* HERO */
        .hero{
          padding-top:170px;
          padding-bottom:120px;
          background:linear-gradient(to right,#f8fbff,#ffffff);
          position:relative;
          overflow:hidden;
        }

        .hero::before{
          content:'';
          position:absolute;
          width:350px;
          height:350px;
          background:var(--accent);
          border-radius:50%;
          filter:blur(90px);
          top:-100px;
          right:-50px;
        }

        .hero-grid{
          display:grid;
          grid-template-columns:1fr 1fr;
          align-items:center;
          gap:50px;
        }

        .badge-custom{
          display:inline-flex;
          align-items:center;
          gap:8px;
          background:var(--accent);
          color:var(--secondary);
          padding:10px 18px;
          border-radius:999px;
          font-weight:600;
          margin-bottom:20px;
        }

        .hero-title{
          font-size:3.5rem;
          line-height:1.2;
          font-weight:800;
          color:var(--primary);
          margin-bottom:25px;
          letter-spacing:-2px;
        }

        .hero-subtitle{
          color:#6c757d;
          line-height:1.9;
          font-size:1.1rem;
          margin-bottom:35px;
        }

        .hero-buttons{
          display:flex;
          gap:20px;
          flex-wrap:wrap;
        }

        .hero-img{
          width:100%;
          border-radius:30px;
          box-shadow:0 20px 50px rgba(0,0,0,0.08);
          object-fit:cover;
        }

        /* SECTION */
        .section-header{
          text-align:center;
          margin-bottom:60px;
        }

        .section-title{
          font-size:2.5rem;
          font-weight:800;
          color:var(--primary);
          margin-bottom:18px;
          letter-spacing:-1px;
        }

        .section-subtitle{
          max-width:760px;
          margin:auto;
          color:#6c757d;
          line-height:1.9;
          font-size:1.05rem;
        }

        /* CARD */
        .card-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:30px;
        }

        .info-card{
          background:white;
          border-radius:30px;
          padding:35px;
          border:1px solid #edf1f5;
          box-shadow:0 15px 40px rgba(0,0,0,0.04);
          transition:0.3s;
          height:100%;
        }

        .info-card:hover{
          transform:translateY(-8px);
        }

        .icon-box{
          width:70px;
          height:70px;
          border-radius:22px;
          background:#F2FBF7;
          display:flex;
          align-items:center;
          justify-content:center;
          margin-bottom:25px;
          color:var(--secondary);
        }

        .info-card h4{
          font-size:1.3rem;
          color:var(--primary);
          margin-bottom:15px;
          font-weight:700;
        }

        .info-card p{
          color:#6c757d;
          line-height:1.9;
        }

        /* NEWS */
        .news-section{
          background:#f8fafc;
        }

        .news-card{
          background:white;
          border-radius:30px;
          overflow:hidden;
          border:1px solid #edf1f5;
          box-shadow:0 15px 40px rgba(0,0,0,0.04);
          transition:0.3s;
        }

        .news-card:hover{
          transform:translateY(-8px);
        }

        .news-img{
          width:100%;
          height:240px;
          object-fit:cover;
        }

        .news-content{
          padding:30px;
        }

        .news-tag{
          display:inline-block;
          padding:8px 14px;
          border-radius:999px;
          font-size:0.85rem;
          font-weight:600;
          margin-bottom:18px;
        }

        .tag-success{
          background:#dcfce7;
          color:#15803d;
        }

        .tag-primary{
          background:#dbeafe;
          color:#1d4ed8;
        }

        .tag-warning{
          background:#fef3c7;
          color:#b45309;
        }

        .news-content h5{
          font-size:1.2rem;
          color:var(--primary);
          margin-bottom:15px;
          line-height:1.5;
        }

        .news-content p{
          color:#6c757d;
          line-height:1.8;
        }

        /* DOWNLOAD */
        .download-wrapper{
          max-width:850px;
          margin:auto;
        }

        .download-item{
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:25px 30px;
          background:white;
          border-radius:24px;
          border:1px solid #edf1f5;
          margin-bottom:20px;
          transition:0.3s;
        }

        .download-item:hover{
          transform:translateY(-5px);
          box-shadow:0 10px 25px rgba(0,0,0,0.05);
        }

        .download-item h5{
          font-size:1.1rem;
          color:var(--primary);
          margin-bottom:6px;
        }

        .download-item small{
          color:#6c757d;
        }

        /* LOGIN */
        .login-box{
          background:linear-gradient(135deg,var(--primary),var(--secondary));
          padding:70px 50px;
          border-radius:40px;
          color:white;
          text-align:center;
          position:relative;
          overflow:hidden;
        }

        .login-box::before{
          content:'';
          position:absolute;
          width:300px;
          height:300px;
          background:rgba(255,255,255,0.08);
          border-radius:50%;
          top:-100px;
          right:-80px;
        }

        .login-box h2{
          font-size:2.7rem;
          margin-bottom:20px;
          font-weight:800;
          position:relative;
          z-index:2;
        }

        .login-box p{
          max-width:700px;
          margin:auto;
          line-height:1.9;
          opacity:0.9;
          margin-bottom:40px;
          position:relative;
          z-index:2;
        }

        .login-buttons{
          display:flex;
          justify-content:center;
          gap:20px;
          flex-wrap:wrap;
          position:relative;
          z-index:2;
        }

        .btn-light-custom{
          background:white;
          color:var(--primary);
          padding:14px 28px;
          border-radius:16px;
          font-weight:600;
          text-decoration:none;
        }

        .btn-outline-light-custom{
          border:1px solid rgba(255,255,255,0.5);
          color:white;
          padding:14px 28px;
          border-radius:16px;
          font-weight:600;
          text-decoration:none;
        }

        /* FOOTER */
        .footer{
          background:#071521;
          color:white;
          padding:80px 0 40px;
        }

        .footer-grid{
          display:grid;
          grid-template-columns:2fr 1fr 1fr;
          gap:40px;
        }

        .footer h3,
        .footer h4{
          margin-bottom:20px;
        }

        .footer p,
        .footer li{
          color:#adb5bd;
          line-height:1.9;
        }

        .footer ul{
          list-style:none;
        }

        .footer a{
          color:#adb5bd;
          text-decoration:none;
        }

        .footer a:hover{
          color:white;
        }

        .footer-bottom{
          border-top:1px solid rgba(255,255,255,0.1);
          margin-top:40px;
          padding-top:30px;
          text-align:center;
          color:#adb5bd;
        }

        /* RESPONSIVE */
        @media(max-width:992px){

          .hero-grid,
          .card-grid,
          .footer-grid{
            grid-template-columns:1fr;
          }

          .hero-title{
            font-size:2.7rem;
          }

        }

        @media(max-width:768px){

          .nav-menu{
            display:none;
          }

          .hero-title{
            font-size:2.3rem;
          }

          .section-title{
            font-size:2rem;
          }

          .download-item{
            flex-direction:column;
            align-items:flex-start;
            gap:20px;
          }

          .login-box{
            padding:50px 30px;
          }

          .login-box h2{
            font-size:2rem;
          }

        }
      `}</style>

      {/* =========================
          NAVBAR
      ========================== */}
      <header className="navbar-custom">
        <div className="container-custom">
          <div className="navbar-wrapper">

            <Link to="/" className="logo">
              <ShieldCheck size={28} />
              SI-UKS DIGITAL
            </Link>

            <nav className="nav-menu">
              <a href="#profil">Profil</a>
              <a href="#berita">Berita</a>
              <a href="#download">Unduhan</a>

              <Link to="/login" className="btn-gradient" style={{ color: "white" }}>
                Login Portal
              </Link>
            </nav>

          </div>
        </div>
      </header>

      {/* =========================
          HERO
      ========================== */}
      <section className="hero">

        <div className="container-custom">

          <div className="hero-grid">

            <div>

              <div className="badge-custom">
                <Activity size={18} />
                Monitoring UKS Digital
              </div>

              <h1 className="hero-title">
                Sistem Informasi UKS Modern
                untuk Sekolah Sehat Indonesia
              </h1>

              <p className="hero-subtitle">
                Platform digital terintegrasi untuk monitoring strata UKS,
                pelaporan kesehatan sekolah, pengelolaan data siswa,
                serta koordinasi lintas OPD secara real-time.
              </p>

              <div className="hero-buttons">

                <Link to="/login" className="btn-gradient">
                  Mulai Assessment
                  <ArrowRight size={18} />
                </Link>

                <a href="#download" className="btn-outline">
                  <PlayCircle size={18} />
                  Video Panduan
                </a>

              </div>

            </div>

            <div>
              <img
                src="/img/hero.png"
                alt="UKS Digital"
                className="hero-img" 
                
              />
            </div>

          </div>

        </div>

      </section>

      {/* =========================
          PROFIL
      ========================== */}
      <section id="profil">

        <div className="container-custom">

          <div className="section-header">

            <div className="badge-custom">
              <Building2 size={18} />
              Profil Sistem
            </div>

            <h2 className="section-title">
              Profil Layanan SI-UKS DIGITAL
            </h2>

            <p className="section-subtitle">
              SI-UKS DIGITAL merupakan platform monitoring kesehatan sekolah
              berbasis digital yang mendukung pengelolaan Unit Kesehatan
              Sekolah secara cepat, transparan, dan terintegrasi.
            </p>

          </div>

          <div className="card-grid">

            <div className="info-card">

              <div className="icon-box">
                <Building size={32} />
              </div>

              <h4>Profil OPD</h4>

              <p>
                Sistem dikelola oleh Dinas Komunikasi dan Informatika
                bersama Dinas Pendidikan dan Dinas Kesehatan.
              </p>

            </div>

            <div className="info-card">

              <div className="icon-box">
                <HeartPulse size={32} />
              </div>

              <h4>Monitoring UKS</h4>

              <p>
                Pemantauan strata UKS dilakukan secara digital mulai
                dari tingkat Minimal hingga Paripurna.
              </p>

            </div>

            <div className="info-card">

              <div className="icon-box">
                <ShieldCheck size={32} />
              </div>

              <h4>Layanan Terintegrasi</h4>

              <p>
                Mendukung pengelolaan data kesehatan siswa,
                dashboard statistik, dan pelaporan sekolah.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =========================
          BERITA
      ========================== */}
      <section id="berita" className="news-section">

        <div className="container-custom">

          <div className="section-header">

            <div className="badge-custom">
              <Newspaper size={18} />
              Informasi Terbaru
            </div>

            <h2 className="section-title">
              Berita & Artikel UKS
            </h2>

            <p className="section-subtitle">
              Publikasi terbaru mengenai kegiatan kesehatan sekolah,
              edukasi kesehatan, dan prestasi UKS daerah.
            </p>

          </div>

          <div className="card-grid">

            <div className="news-card">

              <img
                src="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=1200&auto=format&fit=crop"
                alt=""
                className="news-img"
              />

              <div className="news-content">

                <span className="news-tag tag-success">
                  Kegiatan UKS
                </span>

                <h5>
                  Sosialisasi PHBS di 25 Sekolah Dasar
                </h5>

                <p>
                  Program edukasi hidup bersih dan sehat
                  dilaksanakan bersama tenaga kesehatan daerah.
                </p>

              </div>

            </div>

            <div className="news-card">

              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop"
                alt=""
                className="news-img"
              />

              <div className="news-content">

                <span className="news-tag tag-primary">
                  Prestasi
                </span>

                <h5>
                  SMPN 3 Sukamaju Raih UKS Paripurna
                </h5>

                <p>
                  Sekolah berhasil meraih penghargaan
                  strata tertinggi tingkat kabupaten.
                </p>

              </div>

            </div>

            <div className="news-card">

              <img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200&auto=format&fit=crop"
                alt=""
                className="news-img"
              />

              <div className="news-content">

                <span className="news-tag tag-warning">
                  Edukasi
                </span>

                <h5>
                  Pentingnya Gizi Seimbang Bagi Pelajar
                </h5>

                <p>
                  Artikel edukasi kesehatan untuk meningkatkan
                  kualitas hidup siswa.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================
          DOWNLOAD
      ========================== */}
      <section id="download">

        <div className="container-custom">

          <div className="section-header">

            <div className="badge-custom">
              <Download size={18} />
              Pusat Dokumen
            </div>

            <h2 className="section-title">
              Pusat Unduhan
            </h2>

            <p className="section-subtitle">
              Download dokumen pedoman teknis,
              buku panduan UKS, dan regulasi resmi.
            </p>

          </div>

          <div className="download-wrapper">

            <div className="download-item">

              <div>
                <h5>Buku Panduan UKS 2026</h5>
                <small>PDF • 5.2 MB</small>
              </div>

              <button className="btn-gradient">
                Download
              </button>

            </div>

            <div className="download-item">

              <div>
                <h5>Pedoman Teknis Monitoring UKS</h5>
                <small>PDF • 3.8 MB</small>
              </div>

              <button className="btn-gradient">
                Download
              </button>

            </div>

            <div className="download-item">

              <div>
                <h5>Regulasi Pelaksanaan UKS</h5>
                <small>PDF • 2.4 MB</small>
              </div>

              <button className="btn-gradient">
                Download
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* =========================
          LOGIN
      ========================== */}
      <section>

        <div className="container-custom">

          <div className="login-box">

            <div className="badge-custom" style={{ background: "white", color: "#042C53" }}>
              Portal Terintegrasi
            </div>

            <h2 style={{ color: "white" }}>
              Login Portal SI-UKS DIGITAL
            </h2>

            <p>
              Akses masuk untuk Kepala Sekolah,
              PJ UKS, Admin OPD, dan Superadmin
              Pemerintah Daerah dalam satu sistem terintegrasi.
            </p>

            <div className="login-buttons">

              <Link to="/login" className="btn-light-custom">
                Login Sekolah
              </Link>

              <Link to="/login" className="btn-outline-light-custom">
                Login Admin
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* =========================
          FOOTER
      ========================== */}
      <footer className="footer">

        <div className="container-custom">

          <div className="footer-grid">

            <div>

              <h3>SI-UKS DIGITAL</h3>

              <p>
                Sistem Informasi UKS berbasis digital
                untuk mendukung sekolah sehat, modern,
                dan terintegrasi di seluruh Indonesia.
              </p>

            </div>

            <div>

              <h4>Menu</h4>

              <ul>
                <li><a href="#profil">Profil</a></li>
                <li><a href="#berita">Berita</a></li>
                <li><a href="#download">Unduhan</a></li>
              </ul>

            </div>

            <div>

              <h4>Kontak</h4>

              <ul>
                <li>Diskominfo Kabupaten Sukamaju</li>
                <li>info@siuks.go.id</li>
                <li>(0271) 123456</li>
              </ul>

            </div>

          </div>

          <div className="footer-bottom">
            © 2026 SI-UKS DIGITAL — All Rights Reserved
          </div>

        </div>

      </footer>

    </div>
  );
}