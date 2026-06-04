import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { PERIODE_AKTIF } from "../../data/questions";
import CertificateTemplate from "../../components/CertificateTemplate";
import { getSekolahLevelsApi, getSekolahProfileApi, getSekolahSertifikatApi, generateSekolahSertifikatApi } from "../../api/sekolah";
import { toast } from "react-toastify";
import {
  Trophy, CheckCircle2, Clock3, ShieldCheck,
  Award, AlertCircle, FileBadge, Lock, Settings, Check,
} from "lucide-react";

export default function SekolahHasilPenilaian() {
  const { user } = useAuth();
  const [levels, setLevels] = useState([]);
  const [profil, setProfil] = useState({ sekolah: {}, stats: {} });
  const [loading, setLoading] = useState(true);
  
  // Sertifikat state
  const [certData, setCertData] = useState(null);
  const [inputNomor, setInputNomor] = useState("");
  const [useAutoNumber, setUseAutoNumber] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let active = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const [levelsRes, profilRes, certRes] = await Promise.all([
          getSekolahLevelsApi(),
          getSekolahProfileApi().catch(() => ({ data: {} })),
          getSekolahSertifikatApi().catch(() => null),
        ]);

        if (!active) return;

        const lvList = levelsRes.data?.data ?? levelsRes.data ?? [];
        setLevels(Array.isArray(lvList) ? lvList : []);

        const profileData = profilRes.data?.data ?? profilRes.data ?? profilRes ?? {};
        setProfil({ sekolah: profileData.sekolah ?? profileData ?? {}, stats: profileData.stats ?? {} });

        if (certRes?.success && certRes?.data) {
          setCertData(certRes.data);
          setInputNomor(certRes.data.auto_number_preview || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetch();
    return () => {
      active = false;
    };
  }, []);

  const handleGenerateSertifikat = async (e) => {
    e.preventDefault();
    if (!certData) return;

    try {
      setGenerating(true);
      const payload = {
        nomor_surat: useAutoNumber ? certData.auto_number_preview : inputNomor,
        predikat: certData.predikat_calc,
        is_auto: useAutoNumber,
      };

      const res = await generateSekolahSertifikatApi(payload);
      if (res.success) {
        toast.success(res.message || "Sertifikat berhasil diterbitkan!");
        setCertData({ ...certData, sertifikat: res.data });
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Terjadi kesalahan saat menerbitkan sertifikat.");
    } finally {
      setGenerating(false);
    }
  };

  /* ── hitung statistik dari levels ── */
  const totalLevels = levels.length;
  const tiersSelesai = levels.filter((l) => l.status === "submitted" || l.status === "verified").length;

  // Calculate aggregate percentages
  let totalPct = 0;
  let totalPertanyaan = 0;
  let totalFilled = 0;

  levels.forEach(l => {
    const pct = l.status === "submitted" || l.status === "verified" ? 100 : (l.progress_persen ?? l.answered_pct ?? 0);
    totalPct += pct;
    totalPertanyaan += l.total_pertanyaan || 10;
    totalFilled += l.answered_pertanyaan || Math.round((pct / 100) * (l.total_pertanyaan || 10));
  });

  const progressPct = totalLevels > 0 ? Math.round(totalPct / totalLevels) : 0;
  const userSchool = user?.school ?? user?.sekolah ?? null;
  const sekolah = profil?.sekolah ?? profil?.sekolah ?? userSchool ?? {};

  // Gunakan data dari backend certData
  const isVerified = certData?.is_verified ?? false;
  const certificateReady = isVerified;
  const isGenerated = !!certData?.sertifikat;
  
  const predikat = isGenerated ? certData.sertifikat.predikat : (certData?.predikat_calc || "standar");
  const nomorSertifikat = isGenerated ? certData.sertifikat.nomor_surat : "";
  const verifiedBy = certData?.verifier_name || "Admin Dinkes";
  const verifiedAt = certData?.verified_at ? new Date(certData.verified_at).toLocaleString("id-ID") : new Date().toLocaleString("id-ID");
  
  const catatanVerifikasi = profil?.stats?.catatan_verifikasi || profil?.sekolah?.catatan_verifikasi || "";
  
  const setting = certData?.setting || null;

  const predLabel = predikat.charAt(0).toUpperCase() + predikat.slice(1);
  const predColors = {
    minimal: { bg: "#F3F4F6", color: "#6B7280" },
    dasar: { bg: "#F3F4F6", color: "#6B7280" },
    standar: { bg: "#DBEAFE", color: "#3B82F6" },
    optimal: { bg: "#FEF3C7", color: "#F59E0B" },
    paripurna: { bg: "#DCFCE7", color: "#16A34A" }
  };
  const predStyle = predColors[predikat.toLowerCase()] || predColors.standar;

  const statusLabel = isVerified ? "Terverifikasi" : progressPct === 100 ? "Menunggu Verifikasi" : "Dalam Proses";
  const statusColor = isVerified ? "#0F9D58" : progressPct === 100 ? "#D97706" : "var(--primary)";
  const statusBg = isVerified ? "#E8FFF1" : progressPct === 100 ? "#FFF7E8" : "#EFF6FF";

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>Memuat data penilaian...</div>;
  }

  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 mb-6" style={{ flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 700, marginBottom: 6, lineHeight: 1.2 }}>
            Hasil Penilaian UKS
          </h1>
          <p className="text-muted" style={{ fontSize: "14px", lineHeight: 1.5 }}>
            Ringkasan hasil evaluasi dan progres penilaian sekolah
          </p>
        </div>
        <div className="badge badge-glow">{PERIODE_AKTIF.nama}</div>
      </div>

      {/* HERO */}
      <div className="card glass-panel mb-6" style={{ padding: "28px", borderRadius: "28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: "-30px", top: "-30px", width: "140px", height: "140px", borderRadius: "50%", background: "var(--accent-glow)", opacity: 0.4 }} />
        <div className="flex gap-5" style={{ flexWrap: "wrap", alignItems: "center", position: "relative", zIndex: 2 }}>
          <div style={{ width: "90px", height: "90px", borderRadius: "24px", background: "var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--secondary)", flexShrink: 0 }}>
            <Trophy size={42} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: 6 }}>Sekolah Peserta</div>
            <h2 style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 700, marginBottom: 8, lineHeight: 1.3, wordBreak: "break-word" }}>
              {sekolah.nama || user?.school?.name || "SDN 011 Laweyan"}
            </h2>
            <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
              {isVerified && (
                <div style={{ padding: "5px 14px", borderRadius: "999px", background: predStyle.bg, color: predStyle.color, fontWeight: 700, fontSize: "13px" }}>
                  Predikat {predLabel}
                </div>
              )}
              <div style={{ padding: "5px 14px", borderRadius: "999px", background: statusBg, color: statusColor, fontWeight: 700, fontSize: "13px" }}>
                {statusLabel}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid gap-5 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <StatCard icon={<CheckCircle2 size={24} />} title="Indikator Terpenuhi" value={`${totalFilled} / ${totalPertanyaan}`} color="var(--secondary)" bg="var(--accent-glow)" />
        <StatCard icon={<ShieldCheck size={24} />} title="Kategori Selesai" value={`${tiersSelesai} / ${totalLevels || 4}`} color="var(--primary)" bg="var(--bg-light)" />
        <StatCard icon={<Clock3 size={24} />} title="Progress Pengisian" value={`${progressPct}%`} color="#F59E0B" bg="#FFF7E8" />
      </div>

      {/* DETAIL PENILAIAN */}
      <div className="card glass-panel mb-6" style={{ padding: "24px", borderRadius: "24px" }}>
        <div className="flex items-center gap-2 mb-6" style={{ flexWrap: "wrap" }}>
          <Award size={22} color="var(--primary)" />
          <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Detail Penilaian per Tier</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {levels.length === 0 ? (
            <div className="text-muted" style={{ fontSize: "13px" }}>Tidak ada data tier/level.</div>
          ) : (
            levels.map((level) => {
              const done = level.status === "submitted" || level.status === "verified";
              const pct = done ? 100 : (level.progress_persen ?? level.answered_pct ?? 0);
              const color = done ? "#16A34A" : pct > 50 ? "#F59E0B" : "var(--primary)";
              return (
                <ProgressItem key={level.id} title={`Level ${level.nama || level.name}`} percent={`${pct}%`} width={`${pct}%`} color={color} />
              );
            })
          )}
        </div>
      </div>

      {/* SERTIFIKAT */}
      <div className="card glass-panel mb-6" style={{ padding: "24px", borderRadius: "24px" }}>
        <div className="flex items-center gap-2 mb-5" style={{ flexWrap: "wrap" }}>
          <FileBadge size={22} color="var(--secondary)" />
          <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Sertifikat Penilaian</h3>
        </div>

        {certificateReady ? (
          isGenerated ? (
            /* ── SERTIFIKAT SUDAH DIGENERATE ── */
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", borderRadius: "16px", background: "#E8FFF1", border: "1px solid #C7F0D8", marginBottom: "24px" }}>
                <CheckCircle2 size={20} color="#0F9D58" />
                <div>
                  <div style={{ fontWeight: 700, color: "#0F9D58" }}>Sertifikat Resmi Tersedia</div>
                  <div style={{ fontSize: "13px", color: "#256C45" }}>
                    Diterbitkan oleh {verifiedBy} · Nomor: {nomorSertifikat}
                  </div>
                </div>
              </div>
              <CertificateTemplate
                namaSekolah={sekolah.nama || user?.school?.name || "SDN"}
                predikat={predikat}
                nomorSertif={nomorSertifikat}
                verifiedAt={certData?.sertifikat?.published_at || verifiedAt}
                verifiedBy={verifiedBy}
                showActions={true}
                setting={setting}
              />
            </div>
          ) : (
            /* ── SERTIFIKAT SIAP DI-GENERATE (MEMILIH NOMOR) ── */
            <div style={{ padding: "24px", background: "var(--bg-light)", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--secondary)" }}>
                  <Settings size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0" }}>Terbitkan Sertifikat</h4>
                  <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>
                    Sekolah Anda telah diverifikasi dengan predikat <strong>{predLabel}</strong>. Silakan konfirmasi nomor surat untuk menerbitkan sertifikat.
                  </p>
                </div>
              </div>

              <form onSubmit={handleGenerateSertifikat}>
                <div style={{ display: "grid", gap: "16px", marginBottom: "24px" }}>
                  {setting?.is_auto_number && (
                    <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", padding: "16px", borderRadius: "12px", border: useAutoNumber ? "2px solid var(--primary)" : "1px solid var(--border)", background: useAutoNumber ? "var(--bg-light)" : "transparent" }}>
                      <input 
                        type="radio" 
                        checked={useAutoNumber} 
                        onChange={() => setUseAutoNumber(true)} 
                        style={{ marginTop: "4px" }} 
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "15px" }}>Gunakan Penomoran Otomatis</div>
                        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                          Sistem akan menggunakan format dari Admin OPD.
                        </div>
                        <div style={{ marginTop: "8px", padding: "8px 12px", background: "rgba(0,0,0,0.05)", borderRadius: "6px", fontFamily: "monospace", fontSize: "14px", fontWeight: 700 }}>
                          {certData?.auto_number_preview}
                        </div>
                      </div>
                    </label>
                  )}

                  <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", padding: "16px", borderRadius: "12px", border: !useAutoNumber ? "2px solid var(--primary)" : "1px solid var(--border)", background: !useAutoNumber ? "var(--bg-light)" : "transparent" }}>
                    <input 
                      type="radio" 
                      checked={!useAutoNumber} 
                      onChange={() => setUseAutoNumber(false)} 
                      style={{ marginTop: "4px" }} 
                    />
                    <div style={{ width: "100%" }}>
                      <div style={{ fontWeight: 600, fontSize: "15px" }}>Input Nomor Manual</div>
                      <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", marginBottom: "12px" }}>
                        Masukkan nomor surat sertifikat secara manual jika Anda memiliki format sendiri.
                      </div>
                      {!useAutoNumber && (
                        <input
                          type="text"
                          value={inputNomor}
                          onChange={(e) => setInputNomor(e.target.value)}
                          placeholder="Contoh: 440/123/UKS/2026"
                          className="input"
                          style={{ width: "100%" }}
                          required
                        />
                      )}
                    </div>
                  </label>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" className="btn btn-primary" disabled={generating} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px" }}>
                    <Check size={18} />
                    {generating ? "Menerbitkan..." : "Terbitkan Sertifikat"}
                  </button>
                </div>
              </form>
            </div>
          )
        ) : (
          /* ── BELUM TERSEDIA ── */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "52px 24px", gap: "18px", textAlign: "center" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "var(--bg-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
              <Lock size={36} />
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
                Sertifikat Belum Tersedia
              </div>
              <div style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: "420px" }}>
                {progressPct < 100
                  ? "Selesaikan seluruh pengisian kuesioner terlebih dahulu, kemudian tunggu verifikasi dari admin wilayah."
                  : "Kuesioner telah selesai diisi. Sertifikat akan otomatis tersedia setelah admin wilayah melakukan verifikasi."}
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderRadius: "14px", background: "#FFF7E8", border: "1px solid #FED7AA", fontSize: "13px", color: "#92400E" }}>
              Status: <strong>{statusLabel}</strong>
            </div>
          </div>
        )}
      </div>

      {/* CATATAN VERIFIKASI */}
      {catatanVerifikasi && (
        <div className="card glass-panel" style={{ padding: "24px", borderRadius: "24px" }}>
          <div className="flex items-center gap-2 mb-4" style={{ flexWrap: "wrap" }}>
            <AlertCircle size={20} color="#F59E0B" />
            <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Catatan dari Admin</h3>
          </div>
          <div style={{ padding: "18px", borderRadius: "18px", background: "var(--bg-light)", border: "1px solid var(--border)", lineHeight: 1.7, fontSize: "14px", color: "var(--text-main)" }}>
            {catatanVerifikasi}
          </div>
        </div>
      )}
    </div>
  );
}


function StatCard({ icon, title, value, color, bg }) {
  return (
    <div className="card" style={{ padding: "22px", borderRadius: "22px", border: "1px solid var(--border)", background: "var(--card-bg)", minWidth: 0 }}>
      <div style={{ width: "56px", height: "56px", borderRadius: "18px", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
        {icon}
      </div>
      <div className="text-muted" style={{ fontSize: "13px", marginBottom: "8px" }}>{title}</div>
      <div style={{ fontSize: "clamp(22px, 5vw, 28px)", fontWeight: 700, color: "var(--text-main)", lineHeight: 1.2, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}

function ProgressItem({ title, percent, width, color }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2" style={{ gap: "10px", flexWrap: "wrap" }}>
        <div style={{ fontSize: "14px", fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>{percent}</div>
      </div>
      <div style={{ width: "100%", height: "10px", borderRadius: "999px", background: "var(--border)", overflow: "hidden" }}>
        <div style={{ width, height: "100%", background: color, borderRadius: "999px", transition: "0.4s" }} />
      </div>
    </div>
  );
}
