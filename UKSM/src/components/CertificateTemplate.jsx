import { useRef } from "react";
import { Download, Printer } from "lucide-react";
import { CERTIFICATE_CONFIG, PREDIKAT_UKS } from "../data/questions";

/* =============================================================
   CertificateTemplate
   Props:
     namaSekolah   : string
     predikat      : "dasar" | "madya" | "utama" | "paripurna"
     nomorSertif   : string
     verifiedAt    : string
     verifiedBy    : string
     showActions   : boolean (default true)
============================================================= */
export default function CertificateTemplate({
  namaSekolah,
  predikat,
  nomorSertif,
  verifiedAt,
  verifiedBy,
  showActions = true,
}) {
  const certRef = useRef(null);
  const cfg = CERTIFICATE_CONFIG;
  const pred = PREDIKAT_UKS.find((p) => p.key === predikat) || PREDIKAT_UKS[1];

  function handlePrint() {
    const printContents = certRef.current?.innerHTML || "";
    const w = window.open("", "_blank", "width=900,height=650");
    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <title>Sertifikat UKS - ${namaSekolah}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"/>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:'Inter',sans-serif; background:#fff; }
          @media print {
            body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
          }
        </style>
      </head>
      <body>${printContents}</body>
      </html>
    `);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); w.close(); }, 600);
  }

  const tanggal = verifiedAt
    ? new Date(verifiedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      {/* CERTIFICATE VISUAL */}
      <div
        ref={certRef}
        style={{
          width: "100%",
          maxWidth: "820px",
          margin: "0 auto",
          background: "white",
          border: `8px solid ${cfg.warnaPrima}`,
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* HEADER BAND */}
        <div
          style={{
            background: `linear-gradient(135deg, ${cfg.warnaPrima} 0%, ${cfg.warnaAksent} 100%)`,
            padding: "28px 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div style={{ color: "white" }}>
            <div style={{ fontSize: "11px", opacity: 0.85, letterSpacing: "2px", marginBottom: "4px" }}>
              KEMENTERIAN KESEHATAN REPUBLIK INDONESIA
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, lineHeight: 1.2 }}>
              SI-UKS DIGITAL
            </div>
            <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "2px" }}>
              {cfg.issuer}
            </div>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.2)",
              borderRadius: "12px",
              padding: "10px 18px",
              color: "white",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "11px", opacity: 0.85 }}>Nomor Sertifikat</div>
            <div style={{ fontWeight: 700, fontSize: "13px", letterSpacing: "1px" }}>
              {nomorSertif || "UKS-2026-0001"}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: "36px 40px" }}>
          {/* TITLE */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div
              style={{
                fontSize: "13px",
                letterSpacing: "3px",
                color: cfg.warnaPrima,
                fontWeight: 700,
                marginBottom: "10px",
                textTransform: "uppercase",
              }}
            >
              Sertifikat Penghargaan
            </div>
            <div
              style={{
                fontSize: "30px",
                fontWeight: 800,
                color: "#1a1a2e",
                lineHeight: 1.2,
              }}
            >
              Penilaian UKS
            </div>
            <div style={{ fontSize: "14px", color: "#666", marginTop: "6px" }}>
              Tahun Ajaran {cfg.tahunAjaran}
            </div>
          </div>

          {/* SCHOOL NAME */}
          <div
            style={{
              background: `linear-gradient(135deg, ${cfg.warnaPrima}10, ${cfg.warnaAksent}15)`,
              border: `2px solid ${cfg.warnaPrima}30`,
              borderRadius: "14px",
              padding: "22px 28px",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            <div style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>
              Diberikan kepada
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: cfg.warnaPrima,
                lineHeight: 1.3,
              }}
            >
              {namaSekolah || "Nama Sekolah"}
            </div>
          </div>

          {/* BODY TEXT */}
          <div
            style={{
              textAlign: "center",
              fontSize: "14px",
              color: "#555",
              lineHeight: 1.8,
              marginBottom: "24px",
            }}
          >
            Telah berhasil menyelesaikan seluruh tahapan penilaian dan verifikasi
            <br />
            dalam program <strong>{cfg.program}</strong> dengan hasil:
          </div>

          {/* PREDIKAT BADGE */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
            <div
              style={{
                background: pred.bg,
                color: pred.color,
                border: `2px solid ${pred.color}40`,
                borderRadius: "16px",
                padding: "16px 44px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "12px", letterSpacing: "2px", marginBottom: "4px", opacity: 0.75 }}>
                PREDIKAT
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1 }}>
                {pred.label}
              </div>
              <div style={{ fontSize: "12px", marginTop: "6px", opacity: 0.8 }}>
                {pred.deskripsi}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              borderTop: "1px dashed #e0e0e0",
              paddingTop: "24px",
            }}
          >
            <div style={{ fontSize: "13px", color: "#555" }}>
              <div style={{ marginBottom: "4px" }}>
                <strong>Tanggal Terbit:</strong> {tanggal}
              </div>
              <div>
                <strong>Diverifikasi oleh:</strong> {verifiedBy || cfg.ttdNama}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "32px" }}>
                {cfg.ttdJabatan}
              </div>
              <div
                style={{
                  borderTop: `2px solid ${cfg.warnaPrima}`,
                  paddingTop: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: cfg.warnaPrima,
                }}
              >
                {cfg.ttdNama}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM STRIPE */}
        <div
          style={{
            height: "8px",
            background: `linear-gradient(90deg, ${cfg.warnaPrima}, ${cfg.warnaAksent}, ${cfg.warnaPrima})`,
          }}
        />
      </div>

      {/* ACTION BUTTONS */}
      {showActions && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handlePrint}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              background: "linear-gradient(135deg, #0f4c75, #1b9e6e)",
              color: "white",
              border: "none",
              borderRadius: "14px",
              fontWeight: 700,
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            <Download size={18} />
            Unduh / Cetak Sertifikat
          </button>
          <button
            onClick={handlePrint}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              background: "white",
              color: "#0f4c75",
              border: "2px solid #0f4c75",
              borderRadius: "14px",
              fontWeight: 700,
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            <Printer size={18} />
            Preview Cetak
          </button>
        </div>
      )}
    </div>
  );
}
