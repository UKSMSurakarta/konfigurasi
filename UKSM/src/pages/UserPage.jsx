import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useUKS, TIER_STATUS, VERIFY, TIER_KEYS } from "../context/UKSContext";
import { TIERS } from "../data/questions";
import { useToast } from "../components/Toast";
import Certificate from "../components/Certificate";

export default function UserPage() {
  const { user, logout } = useAuth();
  const { getSchoolData, updateAnswer, submitTier, allTiersVerifiedForSchool } = useUKS();
  const { showToast } = useToast();

  const schoolId = user.school.id;
  const sd = getSchoolData(schoolId);
  const { tierStatus, answers, verifikasi } = sd;

  const certUnlocked = allTiersVerifiedForSchool(schoolId);
  const kepalaName = user.school.kepalaName || user.school.name;

  const [localAnswers, setLocalAnswers] = useState({});
  const [linkInputs, setLinkInputs] = useState({});
  const [openTiers, setOpenTiers] = useState({ dasar: true, madya: false, utama: false, paripurna: false });
  const [confirmTier, setConfirmTier] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function getAns(key) {
    return localAnswers[key] !== undefined ? localAnswers[key] : (answers[key] || null);
  }

  function setMemenuhi(key, val) {
    const existing = getAns(key) || { memenuhi: null, bukti: { files: [], links: [] } };
    setLocalAnswers((p) => ({ ...p, [key]: { ...existing, memenuhi: val } }));
  }

  function handleFile(e, key) {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/jpg","application/pdf"].includes(file.type)) {
      showToast("Hanya JPG, PNG, atau PDF", "error"); return;
    }
    if (file.size > 5 * 1024 * 1024) { showToast("Maksimal 5MB", "error"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLocalAnswers((p) => {
        const ex = p[key] || answers[key] || { memenuhi: null, bukti: { files: [], links: [] } };
        return { ...p, [key]: { ...ex, bukti: { ...(ex.bukti||{}), files: [...(ex.bukti?.files||[]), { name: file.name, type: file.type, data: ev.target.result }] } } };
      });
    };
    reader.readAsDataURL(file);
  }

  function removeFile(key, idx) {
    setLocalAnswers((p) => {
      const ex = p[key] || answers[key] || { memenuhi: null, bukti: { files: [], links: [] } };
      return { ...p, [key]: { ...ex, bukti: { ...(ex.bukti||{}), files: (ex.bukti?.files||[]).filter((_,i)=>i!==idx) } } };
    });
  }

  function addLink(key) {
    const link = (linkInputs[key]||"").trim();
    if (!link) return;
    if (!link.startsWith("http")) { showToast("Link harus diawali https://","error"); return; }
    setLocalAnswers((p) => {
      const ex = p[key] || answers[key] || { memenuhi: null, bukti: { files: [], links: [] } };
      return { ...p, [key]: { ...ex, bukti: { ...(ex.bukti||{}), links: [...(ex.bukti?.links||[]), link] } } };
    });
    setLinkInputs((p) => ({ ...p, [key]: "" }));
  }

  function removeLink(key, idx) {
    setLocalAnswers((p) => {
      const ex = p[key] || answers[key] || { memenuhi: null, bukti: { files: [], links: [] } };
      return { ...p, [key]: { ...ex, bukti: { ...(ex.bukti||{}), links: (ex.bukti?.links||[]).filter((_,i)=>i!==idx) } } };
    });
  }

  function isTierComplete(tk) {
    return TIERS[tk].questions.every((_, i) => {
      const key = `${tk}_${i}`;
      const a = getAns(key);
      return a && a.memenuhi !== null && a.memenuhi !== undefined;
    });
  }

  async function handleSubmitTier(tk) {
    TIERS[tk].questions.forEach((_, i) => {
      const key = `${tk}_${i}`;
      const a = getAns(key);
      if (a) updateAnswer(schoolId, key, a.memenuhi, a.bukti);
    });
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    submitTier(schoolId, tk);
    setSubmitting(false);
    setConfirmTier(null);
    const isLast = tk === "paripurna";
    showToast(isLast ? "Semua kategori selesai! 🎉" : `Kategori ${TIERS[tk].label} berhasil dikunci. Lanjut ke kategori berikutnya!`);
    if (!isLast) {
      const nextIdx = TIER_KEYS.indexOf(tk) + 1;
      setOpenTiers(p => ({ ...p, [tk]: false, [TIER_KEYS[nextIdx]]: true }));
    }
  }

  const totalAnswered = TIER_KEYS.reduce((acc, tk) =>
    acc + TIERS[tk].questions.filter((_, i) => { const a = getAns(`${tk}_${i}`); return a && a.memenuhi !== null && a.memenuhi !== undefined; }).length, 0);

  const allTiersSubmitted = TIER_KEYS.every(tk => (tierStatus[tk] || TIER_STATUS.LOCKED) === TIER_STATUS.SUBMITTED);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f3" }}>
      {/* Header */}
      <div style={stickyHeader}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Penilaian UKS</div>
          <div style={{ fontSize: 12, color: "#888" }}>{user.school.name}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#E6F1FB", color: "#185FA5", fontWeight: 600 }}>
            {totalAnswered}/48 diisi
          </span>
          <button onClick={logout} style={outlineBtn}>Keluar</button>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 16px" }}>

        {/* Sertifikat — muncul HANYA setelah admin verifikasi semua */}
        {certUnlocked && (
          <div style={{ background: "white", borderRadius: 14, border: "2px solid #1D9E75", padding: "20px", marginBottom: 20 }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>🏆</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#1D9E75", marginBottom: 4 }}>Selamat! Penilaian UKS Selesai</div>
              <div style={{ fontSize: 13, color: "#888" }}>Semua instrumen telah diverifikasi. Sertifikat siap diunduh.</div>
            </div>
            <Certificate schoolName={user.school.name} kepalaName={kepalaName} />
          </div>
        )}

        {/* Banner: semua sudah submit tapi menunggu verifikasi admin */}
        {allTiersSubmitted && !certUnlocked && (
          <div style={{ background: "#FFF8E6", border: "0.5px solid #F5D98B", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>⏳</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#854F0B" }}>Semua kategori sudah dikirim!</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Menunggu verifikasi admin. Sertifikat akan muncul setelah semua soal diverifikasi.</div>
            </div>
          </div>
        )}

        {/* Tier steps indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, background: "white", borderRadius: 12, border: "0.5px solid #e0e0e0", padding: "12px 16px", gap: 0 }}>
          {TIER_KEYS.map((tk, idx) => {
            const ts = tierStatus[tk] || TIER_STATUS.LOCKED;
            const tier = TIERS[tk];
            const isSubmitted = ts === TIER_STATUS.SUBMITTED;
            const isOpen = ts === TIER_STATUS.OPEN;
            const isLocked = ts === TIER_STATUS.LOCKED;
            return (
              <div key={tk} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700,
                    background: isSubmitted ? "#1D9E75" : isOpen ? tier.bgColor : "#f0f0ee",
                    color: isSubmitted ? "white" : isOpen ? tier.color : "#ccc",
                    border: isOpen ? `2px solid ${tier.color}` : "2px solid transparent",
                  }}>
                    {isSubmitted ? "✓" : idx + 1}
                  </div>
                  <div style={{ fontSize: 10, marginTop: 4, fontWeight: 500, color: isLocked ? "#ccc" : isOpen ? tier.color : "#1D9E75" }}>{tier.label}</div>
                </div>
                {idx < TIER_KEYS.length - 1 && (
                  <div style={{ height: 2, flex: 0.5, background: isSubmitted ? "#1D9E75" : "#e0e0e0", borderRadius: 2 }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Tier sections */}
        {TIER_KEYS.map((tk, tierIdx) => {
          const tier = TIERS[tk];
          const ts = tierStatus[tk] || TIER_STATUS.LOCKED;
          const isLocked = ts === TIER_STATUS.LOCKED;
          const isSubmitted = ts === TIER_STATUS.SUBMITTED;
          const isOpen = ts === TIER_STATUS.OPEN;
          const isOpenUI = openTiers[tk];
          const complete = isTierComplete(tk);
          const verif = verifikasi || {};

          const answeredInTier = TIERS[tk].questions.filter((_, i) => {
            const a = getAns(`${tk}_${i}`);
            return a && a.memenuhi !== null && a.memenuhi !== undefined;
          }).length;

          const hasBelum = TIERS[tk].questions.some((_, i) => verif[`${tk}_${i}`]?.finalized && verif[`${tk}_${i}`]?.status === VERIFY.BELUM);

          return (
            <div key={tk} style={{
              background: "white", borderRadius: 12,
              border: isOpen ? `1.5px solid ${tier.color}` : "0.5px solid #e0e0e0",
              marginBottom: 12, overflow: "hidden",
              opacity: isLocked ? 0.5 : 1,
            }}>
              {/* Tier header */}
              <div onClick={() => !isLocked && setOpenTiers(p => ({ ...p, [tk]: !p[tk] }))}
                style={{ padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: isLocked ? "not-allowed" : "pointer", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: tier.bgColor, color: tier.color, fontWeight: 600 }}>{tier.label}</span>
                  {isLocked && <span style={{ fontSize: 12, color: "#aaa" }}>🔒 Selesaikan kategori sebelumnya dulu</span>}
                  {isOpen && <span style={{ fontSize: 12, color: tier.color, fontWeight: 500 }}>{answeredInTier}/{tier.questions.length} diisi</span>}
                  {isSubmitted && <span style={{ fontSize: 12, color: "#1D9E75", fontWeight: 500 }}>✓ Selesai & Terkunci</span>}
                  {hasBelum && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#FCEBEB", color: "#E24B4A", fontWeight: 600 }}>Ada catatan admin</span>}
                </div>
                {!isLocked && <span style={{ color: "#aaa", transform: isOpenUI ? "rotate(90deg)" : "none", transition: "transform 0.2s", fontSize: 12 }}>▶</span>}
              </div>

              {/* Questions */}
              {!isLocked && isOpenUI && (
                <div style={{ borderTop: "0.5px solid #f0f0ee" }}>
                  {tier.questions.map((q, i) => {
                    const key = `${tk}_${i}`;
                    const ans = getAns(key);
                    const bukti = ans?.bukti || { files: [], links: [] };
                    const qVerif = verif[key];
                    const isLastQ = i === tier.questions.length - 1;

                    return (
                      <div key={i} style={{ padding: "14px 16px", borderBottom: isLastQ ? "none" : "0.5px solid #f8f8f8", background: isSubmitted ? "#FAFFFE" : "white" }}>
                        <div style={{ fontSize: 13, color: "#333", marginBottom: 10, lineHeight: 1.6 }}>
                          <span style={{ color: "#bbb", marginRight: 6 }}>{i + 1}.</span>{q}
                        </div>

                        {/* Admin feedback */}
                        {qVerif?.finalized && (
                          <div style={{ marginBottom: 10, padding: "8px 12px", borderRadius: 8,
                            background: qVerif.status === VERIFY.BELUM ? "#FCEBEB" : "#E1F5EE",
                            border: `0.5px solid ${qVerif.status === VERIFY.BELUM ? "#F5C0C0" : "#A0DEC8"}` }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: qVerif.status === VERIFY.BELUM ? "#E24B4A" : "#1D9E75" }}>
                              {qVerif.status === VERIFY.BELUM ? "✕ Belum Memenuhi — Catatan Admin:" : "✓ Diverifikasi Admin"}
                            </div>
                            {qVerif.catatan && <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{qVerif.catatan}</div>}
                          </div>
                        )}

                        {/* Memenuhi toggle — editable hanya saat tier OPEN */}
                        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                          <button onClick={() => isOpen && setMemenuhi(key, true)} disabled={!isOpen}
                            style={toggleBtn(ans?.memenuhi === true, "#1D9E75", "#E1F5EE", !isOpen)}>✓ Memenuhi</button>
                          <button onClick={() => isOpen && setMemenuhi(key, false)} disabled={!isOpen}
                            style={toggleBtn(ans?.memenuhi === false, "#E24B4A", "#FCEBEB", !isOpen)}>✕ Belum Memenuhi</button>
                        </div>

                        {/* Bukti dukung */}
                        <div style={{ background: "#fafafa", borderRadius: 8, border: "0.5px solid #eee", padding: "10px 12px" }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 8 }}>BUKTI DUKUNG</div>
                          {bukti.files?.map((f, fi) => (
                            <div key={fi} style={filePill}>
                              <span>{f.type === "application/pdf" ? "📄" : "🖼️"}</span>
                              <span style={{ fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#444" }}>{f.name}</span>
                              {f.type !== "application/pdf" && <img src={f.data} alt="" style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 4 }} />}
                              {isOpen && <button onClick={() => removeFile(key, fi)} style={rmBtn}>×</button>}
                            </div>
                          ))}
                          {bukti.links?.map((link, li) => (
                            <div key={li} style={filePill}>
                              <span>🔗</span>
                              <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, flex: 1, color: "#185FA5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link}</a>
                              {isOpen && <button onClick={() => removeLink(key, li)} style={rmBtn}>×</button>}
                            </div>
                          ))}
                          {isOpen && (
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                              <label style={uploadLabel}>
                                + Foto/PDF
                                <input type="file" accept="image/jpeg,image/png,application/pdf" style={{ display: "none" }} onChange={e => handleFile(e, key)} />
                              </label>
                              <div style={{ display: "flex", gap: 4, flex: 1, minWidth: 180 }}>
                                <input type="text" placeholder="https://..."
                                  value={linkInputs[key] || ""}
                                  onChange={e => setLinkInputs(p => ({ ...p, [key]: e.target.value }))}
                                  onKeyDown={e => e.key === "Enter" && addLink(key)}
                                  style={linkInput} />
                                <button onClick={() => addLink(key)} style={addLinkBtn}>+ Link</button>
                              </div>
                            </div>
                          )}
                          {bukti.files?.length === 0 && bukti.links?.length === 0 && isSubmitted && (
                            <div style={{ fontSize: 12, color: "#bbb", fontStyle: "italic" }}>Tidak ada bukti dukung</div>
                          )}
                        </div>

                        {/* Submit button at last question */}
                        {isLastQ && !isSubmitted && (
                          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "0.5px solid #f0f0ee" }}>
                            {!complete && (
                              <div style={{ fontSize: 12, color: "#E24B4A", marginBottom: 10, padding: "8px 12px", background: "#FCEBEB", borderRadius: 8 }}>
                                ⚠️ Masih ada {tier.questions.length - answeredInTier} soal belum diisi. Isi semua soal dulu sebelum submit.
                              </div>
                            )}
                            <button
                              onClick={() => complete && setConfirmTier(tk)}
                              disabled={!complete}
                              style={{
                                width: "100%", padding: "12px", borderRadius: 10, border: "none",
                                background: complete ? tier.color : "#d0d0d0",
                                color: "white", fontSize: 14, fontWeight: 600,
                                cursor: complete ? "pointer" : "not-allowed",
                              }}>
                              {tk === "paripurna" ? "🎉 Submit & Selesaikan Semua Kategori" : `Submit Kategori ${tier.label} & Lanjut ke ${TIERS[TIER_KEYS[TIER_KEYS.indexOf(tk)+1]]?.label} →`}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm modal */}
      {confirmTier && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "white", borderRadius: 14, padding: 28, maxWidth: 380, width: "100%" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              Submit Kategori {TIERS[confirmTier]?.label}?
            </div>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 20, lineHeight: 1.6 }}>
              {confirmTier === "paripurna"
                ? "Ini adalah kategori terakhir. Setelah disubmit, semua data terkunci dan kamu akan mendapatkan sertifikat."
                : `Setelah disubmit, kategori ${TIERS[confirmTier]?.label} terkunci dan tidak bisa diubah. Kategori ${TIERS[TIER_KEYS[TIER_KEYS.indexOf(confirmTier)+1]]?.label} akan terbuka.`}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmTier(null)} style={{ ...outlineBtn, flex: 1, padding: "9px", fontSize: 13 }}>Batal</button>
              <button onClick={() => handleSubmitTier(confirmTier)} disabled={submitting} style={{
                flex: 2, padding: "9px", borderRadius: 8, border: "none",
                background: TIERS[confirmTier]?.color || "#1D9E75", color: "white",
                fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}>
                {submitting ? "Menyimpan..." : "Ya, Submit Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const stickyHeader = {
  background: "white", borderBottom: "0.5px solid #e0e0e0",
  padding: "12px 20px", display: "flex", justifyContent: "space-between",
  alignItems: "center", position: "sticky", top: 0, zIndex: 10
};
const outlineBtn = { padding: "5px 12px", borderRadius: 8, border: "0.5px solid #d0d0d0", background: "transparent", fontSize: 12, color: "#666", cursor: "pointer" };
const filePill = { display: "flex", alignItems: "center", gap: 8, marginBottom: 6, padding: "5px 8px", background: "white", borderRadius: 6, border: "0.5px solid #e0e0e0" };
const rmBtn = { width: 20, height: 20, borderRadius: "50%", border: "none", background: "#eee", color: "#888", fontSize: 14, cursor: "pointer", flexShrink: 0, lineHeight: 1 };
const uploadLabel = { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6, border: "0.5px dashed #c0c0c0", fontSize: 12, color: "#666", cursor: "pointer", background: "white" };
const linkInput = { flex: 1, padding: "5px 8px", borderRadius: 6, border: "0.5px solid #d0d0d0", fontSize: 12, background: "white" };
const addLinkBtn = { padding: "5px 10px", borderRadius: 6, border: "none", background: "#185FA5", color: "white", fontSize: 12, cursor: "pointer" };
const toggleBtn = (active, activeColor, activeBg, disabled) => ({
  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
  border: `0.5px solid ${active ? activeColor : "#d0d0d0"}`,
  background: active ? activeBg : "white", color: active ? activeColor : "#888",
  cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.7 : 1, transition: "all 0.1s",
});
