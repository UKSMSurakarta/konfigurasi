import { useEffect, useRef, useState } from "react";
import templateSrc from "../assets/sertifikat-template.png";


const NAME_X_RATIO = 0.112;
const NAME_Y_RATIO = 0.475;
const FONT_SIZE_RATIO = 0.040;

export default function Certificate({ schoolName, kepalaName }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const displayName = schoolName || kepalaName || "Nama Sekolah";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.drawImage(img, 0, 0);

      const fontSize = Math.round(img.naturalWidth * FONT_SIZE_RATIO);
      const x = img.naturalWidth * NAME_X_RATIO;
      const y = img.naturalHeight * NAME_Y_RATIO;

      const coverW = img.naturalWidth * 0.45;
      const coverH = fontSize * 1.4;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x - 4, y - fontSize * 0.9, coverW, coverH);

      ctx.fillStyle = "#1a1a2e";
      ctx.font = `${fontSize}px Georgia, serif`;
      ctx.textBaseline = "alphabetic";
      ctx.fillText(displayName, x, y);

      const textWidth = Math.min(ctx.measureText(displayName).width, coverW - 8);
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y + fontSize * 0.25);
      ctx.lineTo(x + textWidth, y + fontSize * 0.25);
      ctx.stroke();

      setReady(true);
    };
    img.src = templateSrc;
  }, [displayName]);

  function handleDownload() {
    setDownloading(true);
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `Sertifikat-UKS-${displayName.replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setTimeout(() => setDownloading(false), 1000);
  }

  return (
    <div>
      {/* Canvas sertifikat */}
      <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "0.5px solid #e0e0e0", background: "#0a0a1a" }}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", display: "block", opacity: ready ? 1 : 0, transition: "opacity 0.3s" }}
        />
        {!ready && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a1a", minHeight: 200 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Memuat sertifikat...</div>
          </div>
        )}
      </div>

      {/* Info nama */}
      {ready && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0faf5", borderRadius: 8, border: "0.5px solid #A0DEC8", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Sertifikat atas nama</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1D9E75" }}>{displayName}</div>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              padding: "8px 18px", borderRadius: 8, border: "none",
              background: downloading ? "#9FE1CB" : "#1D9E75",
              color: "white", fontSize: 13, fontWeight: 600,
              cursor: downloading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6
            }}
          >
            {downloading ? "Mengunduh..." : "⬇ Unduh Sertifikat"}
          </button>
        </div>
      )}
    </div>
  );
}
