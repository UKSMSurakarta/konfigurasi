import { useAuth } from "../../context/AuthContext";
import { useUKS, TIER_KEYS } from "../../context/UKSContext";
import { TIERS, PREDIKAT_UKS, PERIODE_AKTIF } from "../../data/questions";
import CertificateTemplate from "../../components/CertificateTemplate";
import {
  Trophy, CheckCircle2, Clock3, ShieldCheck,
  Award, AlertCircle, FileBadge, Lock,
} from "lucide-react";

export default function SekolahHasilPenilaian() {
  const { user } = useAuth();
  const { getSchoolData } = useUKS();

  const schoolId = user?.school?.id;
  const sd = getSchoolData(schoolId);

  const {
    tierStatus = {},
    answers    = {},
    verifikasi = {},
    verified   = false,
    predikat   = null,
    certificateReady = false,
    nomorSertifikat  = "",
    verifiedBy       = "",
    verifiedAt       = "",
    catatanVerifikasi = "",
  } = sd;

  /* ── hitung statistik ── */
  const totalQuestions = TIER_KEYS.reduce((acc, tk) => acc + TIERS[tk].questions.length, 0);
  const totalAnswered  = TIER_KEYS.reduce(
    (acc, tk) => acc + TIERS[tk].questions.filter((_, i) => {
      const a = answers[`${tk}_${i}`];
      return a && a.memenuhi !== null && a.memenuhi !== undefined;
    }).length, 0
  );
  const totalMemenuhi = TIER_KEYS.reduce(
    (acc, tk) => acc + TIERS[tk].questions.filter((_, i) => answers[`${tk}_${i}`]?.memenuhi === true).length, 0
  );
  const tiersSelesai = TIER_KEYS.filter((tk) => tierStatus[tk] === "submitted").length;
  const progressPct  = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  const pred = PREDIKAT_UKS.find((p) => p.key === predikat);
  const statusLabel = verified ? "Terverifikasi" : totalAnswered === totalQuestions ? "Menunggu Verifikasi" : "Dalam Proses";
  const statusColor = verified ? "#0F9D58" : totalAnswered === totalQuestions ? "#D97706" : "var(--primary)";
  const statusBg    = verified ? "#E8FFF1" : totalAnswered === totalQuestions ? "#FFF7E8" : "#EFF6FF";

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
              {user?.school?.name || "SDN 011 Laweyan"}
            </h2>
            <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
              {pred && (
                <div style={{ padding: "5px 14px", borderRadius: "999px", background: pred.bg, color: pred.color, fontWeight: 700, fontSize: "13px" }}>
                  Predikat {pred.label}
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
        <StatCard icon={<CheckCircle2 size={24} />} title="Indikator Terpenuhi"  value={`${totalMemenuhi} / ${totalQuestions}`}  color="var(--secondary)" bg="var(--accent-glow)" />
        <StatCard icon={<ShieldCheck size={24} />}  title="Kategori Selesai"    value={`${tiersSelesai} / 4`}                  color="var(--primary)"   bg="var(--bg-light)" />
        <StatCard icon={<Clock3 size={24} />}        title="Progress Pengisian"  value={`${progressPct}%`}                      color="#F59E0B"           bg="#FFF7E8" />
      </div>

      {/* DETAIL PENILAIAN */}
      <div className="card glass-panel mb-6" style={{ padding: "24px", borderRadius: "24px" }}>
        <div className="flex items-center gap-2 mb-6" style={{ flexWrap: "wrap" }}>
          <Award size={22} color="var(--primary)" />
          <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Detail Penilaian per Tier</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {TIER_KEYS.map((tk) => {
            const tier   = TIERS[tk];
            const total  = tier.questions.length;
            const filled = tier.questions.filter((_, i) => answers[`${tk}_${i}`]?.memenuhi === true).length;
            const pct    = total > 0 ? Math.round((filled / total) * 100) : 0;
            return (
              <ProgressItem key={tk} title={`Tier ${tier.label}`} percent={`${filled}/${total} (${pct}%)`} width={`${pct}%`} color={tier.color} />
            );
          })}
        </div>
      </div>

      {/* SERTIFIKAT */}
      <div className="card glass-panel mb-6" style={{ padding: "24px", borderRadius: "24px" }}>
        <div className="flex items-center gap-2 mb-5" style={{ flexWrap: "wrap" }}>
          <FileBadge size={22} color="var(--secondary)" />
          <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Sertifikat Penilaian</h3>
        </div>

        {certificateReady ? (
          /* ── SERTIFIKAT TERSEDIA ── */
          <div>
            {/* status banner */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", borderRadius: "16px", background: "#E8FFF1", border: "1px solid #C7F0D8", marginBottom: "24px" }}>
              <CheckCircle2 size={20} color="#0F9D58" />
              <div>
                <div style={{ fontWeight: 700, color: "#0F9D58" }}>Sertifikat Resmi Tersedia</div>
                <div style={{ fontSize: "13px", color: "#256C45" }}>
                  Diterbitkan oleh {verifiedBy || "Admin"} · {verifiedAt}
                </div>
              </div>
            </div>
            {/* certificate component */}
            <CertificateTemplate
              namaSekolah={user?.school?.name || "SDN 011 Laweyan"}
              predikat={predikat}
              nomorSertif={nomorSertifikat}
              verifiedAt={verifiedAt}
              verifiedBy={verifiedBy}
              showActions={true}
            />
          </div>
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