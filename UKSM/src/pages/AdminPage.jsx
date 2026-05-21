import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useUKS, TIER_STATUS, VERIFY, TIER_KEYS } from "../context/UKSContext";
import { TIERS, SCHOOLS } from "../data/questions";
import { useToast } from "../components/Toast";

export default function AdminPage() {
  const { logout } = useAuth();
  const { getAllSchoolData, updateVerifikasi, submitVerifikasiQuestion } = useUKS();
  const { showToast } = useToast();

  const [selectedSchool, setSelectedSchool] = useState(null);
  const [openTiers, setOpenTiers] = useState({ dasar: true, madya: false, utama: false, paripurna: false });
  const [localVerif, setLocalVerif] = useState({});

  const allData = getAllSchoolData();

  const activeSchools = SCHOOLS.filter(s => {
    const sd = allData[s.id];
    return sd && Object.values(sd.tierStatus || {}).some(ts => ts === TIER_STATUS.SUBMITTED);
  });

  function getSchoolSummary(schoolId) {
    const sd = allData[schoolId] || {};
    const verif = sd.verifikasi || {};
    const finalized = Object.values(verif).filter(v => v?.finalized).length;
    const belum = Object.values(verif).filter(v => v?.finalized && v.status === VERIFY.BELUM).length;
    const submittedTiers = Object.values(sd.tierStatus || {}).filter(ts => ts === TIER_STATUS.SUBMITTED).length;
    return { submittedTiers, finalized, belum };
  }

  function getTierVerifStatus(schoolId, tk) {
    const sd = allData[schoolId] || {};
    const qs = TIERS[tk].questions;
    const finalizedKeys = qs.map((_, i) => `${tk}_${i}`).filter(k => sd.verifikasi?.[k]?.finalized);
    if (finalizedKeys.length === 0) return null;
    return finalizedKeys.some(k => sd.verifikasi[k].status === VERIFY.BELUM) ? VERIFY.BELUM : VERIFY.MEMENUHI;
  }

  function handleVerifChange(schoolId, key, field, val) {
    const lk = `${schoolId}_${key}`;
    setLocalVerif(p => ({ ...p, [lk]: { ...(p[lk] || {}), [field]: val } }));
    const existing = allData[schoolId]?.verifikasi?.[key] || {};
    updateVerifikasi(schoolId, key,
      field === "status" ? val : (localVerif[lk]?.status || existing.status || VERIFY.PENDING),
      field === "catatan" ? val : (localVerif[lk]?.catatan ?? existing.catatan ?? "")
    );
  }

  function handleSubmitVerif(schoolId, key) {
    const lk = `${schoolId}_${key}`;
    const local = localVerif[lk];
    const existing = allData[schoolId]?.verifikasi?.[key] || {};
    const status = local?.status || existing.status;
    const catatan = local?.catatan ?? existing.catatan ?? "";
    if (!status || status === VERIFY.PENDING) { showToast("Pilih Memenuhi atau Belum dulu", "error"); return; }
    submitVerifikasiQuestion(schoolId, key, status, catatan);
    showToast(status === VERIFY.MEMENUHI ? "✓ Diverifikasi: Memenuhi" : "Diverifikasi: Belum Memenuhi");
  }

  if (!selectedSchool) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f3" }}>
        <div style={stickyHeader}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Panel Admin — Verifikasi UKS</div>
            <div style={{ fontSize: 12, color: "#888" }}>{activeSchools.length} sekolah ada data masuk</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#FAEEDA", color: "#854F0B", fontWeight: 600 }}>Admin</span>
            <button onClick={logout} style={outlineBtn}>Keluar</button>
          </div>
        </div>

        <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 16px" }}>
          {activeSchools.length === 0 && (
            <div style={{ textAlign: "center", padding: 48, color: "#bbb", fontSize: 14 }}>Belum ada sekolah yang submit kategori</div>
          )}
          {activeSchools.map(school => {
            const sd = allData[school.id] || {};
            const summary = getSchoolSummary(school.id);
            return (
              <div key={school.id} style={{ background: "white", borderRadius: 12, border: "0.5px solid #e0e0e0", padding: "16px 18px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{school.name}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{summary.submittedTiers} dari 4 kategori sudah disubmit</div>
                  </div>
                  <button onClick={() => { setSelectedSchool(school); setOpenTiers({ dasar: true, madya: false, utama: false, paripurna: false }); }}
                    style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#1D9E75", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Verifikasi →
                  </button>
                </div>

                {/* Tier status chips */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  {TIER_KEYS.map(tk => {
                    const ts = sd.tierStatus?.[tk] || TIER_STATUS.LOCKED;
                    const vs = getTierVerifStatus(school.id, tk);
                    if (ts !== TIER_STATUS.SUBMITTED) return null;
                    return (
                      <span key={tk} style={{
                        fontSize: 11, padding: "2px 10px", borderRadius: 20, fontWeight: 600,
                        background: vs === VERIFY.BELUM ? "#FCEBEB" : vs === VERIFY.MEMENUHI ? "#E1F5EE" : TIERS[tk].bgColor,
                        color: vs === VERIFY.BELUM ? "#E24B4A" : vs === VERIFY.MEMENUHI ? "#1D9E75" : TIERS[tk].color,
                      }}>
                        {TIERS[tk].label} {vs === VERIFY.BELUM ? "· Ada catatan" : vs === VERIFY.MEMENUHI ? "· ✓" : "· Menunggu"}
                      </span>
                    );
                  })}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {[
                    { label: "Kategori tersubmit", val: summary.submittedTiers, color: "#185FA5", bg: "#E6F1FB" },
                    { label: "Soal diverifikasi", val: summary.finalized, color: "#1D9E75", bg: "#E1F5EE" },
                    { label: "Perlu perbaikan", val: summary.belum, color: "#E24B4A", bg: "#FCEBEB" },
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 600, color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: 10, color: s.color, opacity: 0.8 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const sd = allData[selectedSchool.id] || {};
  const answers = sd.answers || {};
  const verifikasi = sd.verifikasi || {};

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f3" }}>
      <div style={stickyHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setSelectedSchool(null)} style={{ ...outlineBtn, padding: "6px 12px" }}>← Kembali</button>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedSchool.name}</div>
            <div style={{ fontSize: 12, color: "#888" }}>Verifikasi per soal</div>
          </div>
        </div>
        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#FAEEDA", color: "#854F0B", fontWeight: 600 }}>Admin</span>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 16px" }}>
        {TIER_KEYS.map(tk => {
          const ts = sd.tierStatus?.[tk] || TIER_STATUS.LOCKED;
          const isSubmitted = ts === TIER_STATUS.SUBMITTED;
          const isLocked = ts === TIER_STATUS.LOCKED || ts === TIER_STATUS.OPEN;
          const isOpenUI = openTiers[tk];
          const tier = TIERS[tk];
          const vs = getTierVerifStatus(selectedSchool.id, tk);

          const answeredQs = tier.questions.map((q, i) => ({ q, i, key: `${tk}_${i}`, ans: answers[`${tk}_${i}`] })).filter(x => x.ans);

          return (
            <div key={tk} style={{
              background: "white", borderRadius: 12,
              border: isSubmitted ? `1.5px solid ${tier.color}` : "0.5px solid #e0e0e0",
              marginBottom: 12, overflow: "hidden", opacity: !isSubmitted ? 0.5 : 1
            }}>
              <div onClick={() => isSubmitted && setOpenTiers(p => ({ ...p, [tk]: !p[tk] }))}
                style={{ padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: isSubmitted ? "pointer" : "not-allowed", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: tier.bgColor, color: tier.color, fontWeight: 600 }}>{tier.label}</span>
                  {!isSubmitted && <span style={{ fontSize: 12, color: "#aaa" }}>🔒 Belum disubmit sekolah</span>}
                  {isSubmitted && <span style={{ fontSize: 12, color: "#555" }}>{answeredQs.length} soal terisi</span>}
                  {vs && (
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                      background: vs === VERIFY.BELUM ? "#FCEBEB" : "#E1F5EE",
                      color: vs === VERIFY.BELUM ? "#E24B4A" : "#1D9E75" }}>
                      {vs === VERIFY.BELUM ? "Ada catatan" : "✓ Memenuhi"}
                    </span>
                  )}
                </div>
                {isSubmitted && <span style={{ color: "#aaa", transform: isOpenUI ? "rotate(90deg)" : "none", transition: "transform 0.2s", fontSize: 12 }}>▶</span>}
              </div>

              {isSubmitted && isOpenUI && (
                <div style={{ borderTop: "0.5px solid #f0f0ee" }}>
                  {answeredQs.map(({ q, i, key, ans }) => {
                    const verifData = verifikasi[key];
                    const isFinalized = verifData?.finalized;
                    const lk = `${selectedSchool.id}_${key}`;
                    const currentStatus = localVerif[lk]?.status ?? verifData?.status ?? "";
                    const currentCatatan = localVerif[lk]?.catatan ?? verifData?.catatan ?? "";
                    const bukti = ans?.bukti || { files: [], links: [] };

                    return (
                      <div key={key} style={{ padding: "14px 16px", borderBottom: "0.5px solid #f8f8f8", background: isFinalized ? "#FAFFFE" : "white" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                          <div style={{ fontSize: 13, color: "#333", lineHeight: 1.5, flex: 1 }}>
                            <span style={{ color: "#bbb", marginRight: 6 }}>{i + 1}.</span>{q}
                          </div>
                          {isFinalized && (
                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600, flexShrink: 0,
                              background: verifData.status === VERIFY.BELUM ? "#FCEBEB" : "#E6F1FB",
                              color: verifData.status === VERIFY.BELUM ? "#E24B4A" : "#185FA5" }}>
                              {verifData.status === VERIFY.BELUM ? "✕ Belum" : "✓ Verified"}
                            </span>
                          )}
                        </div>

                        {/* School self-assessment */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <span style={{ fontSize: 11, color: "#888" }}>Penilaian sekolah:</span>
                          <span style={{ fontSize: 12, padding: "2px 10px", borderRadius: 20, fontWeight: 600,
                            background: ans?.memenuhi ? "#E1F5EE" : "#FCEBEB",
                            color: ans?.memenuhi ? "#1D9E75" : "#E24B4A" }}>
                            {ans?.memenuhi ? "✓ Memenuhi" : "✕ Belum Memenuhi"}
                          </span>
                        </div>

                        {/* Bukti dukung */}
                        {(bukti.files?.length > 0 || bukti.links?.length > 0) && (
                          <div style={{ background: "#fafafa", borderRadius: 8, border: "0.5px solid #eee", padding: "8px 12px", marginBottom: 10 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 6 }}>BUKTI DUKUNG</div>
                            {bukti.files?.map((f, fi) => (
                              <div key={fi} style={filePill}>
                                <span>{f.type === "application/pdf" ? "📄" : "🖼️"}</span>
                                <span style={{ fontSize: 12, flex: 1, color: "#444" }}>{f.name}</span>
                                {f.type !== "application/pdf" && <img src={f.data} alt="" onClick={() => window.open(f.data)} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4, cursor: "pointer" }} />}
                              </div>
                            ))}
                            {bukti.links?.map((link, li) => (
                              <div key={li} style={filePill}>
                                <span>🔗</span>
                                <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#185FA5" }}>{link}</a>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Verifikasi form */}
                        <div style={{ background: "#f5f5f3", borderRadius: 8, padding: "10px 12px" }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 8 }}>
                            VERIFIKASI ADMIN
                            {isFinalized && <span style={{ fontWeight: 400, color: "#aaa", marginLeft: 6 }}>· {verifData.verifiedAt}</span>}
                          </div>
                          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                            <button onClick={() => !isFinalized && handleVerifChange(selectedSchool.id, key, "status", VERIFY.MEMENUHI)}
                              disabled={isFinalized} style={verifyToggleBtn(currentStatus === VERIFY.MEMENUHI, "#1D9E75", "#E1F5EE", isFinalized)}>
                              ✓ Memenuhi
                            </button>
                            <button onClick={() => !isFinalized && handleVerifChange(selectedSchool.id, key, "status", VERIFY.BELUM)}
                              disabled={isFinalized} style={verifyToggleBtn(currentStatus === VERIFY.BELUM, "#E24B4A", "#FCEBEB", isFinalized)}>
                              ✕ Belum Memenuhi
                            </button>
                          </div>
                          <textarea value={currentCatatan}
                            onChange={e => !isFinalized && handleVerifChange(selectedSchool.id, key, "catatan", e.target.value)}
                            disabled={isFinalized} placeholder="Tulis catatan jika belum memenuhi..."
                            rows={2} style={{
                              width: "100%", padding: "7px 9px", borderRadius: 7, border: "0.5px solid #d0d0d0",
                              fontSize: 12, color: "#333", resize: "none",
                              background: isFinalized ? "#f0f0ee" : "white", boxSizing: "border-box", marginBottom: 8
                            }} />
                          {!isFinalized && (
                            <button onClick={() => handleSubmitVerif(selectedSchool.id, key)} style={submitVerifBtn}>
                              Submit Verifikasi Soal Ini →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
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
const submitVerifBtn = { padding: "7px 14px", borderRadius: 8, border: "none", background: "#185FA5", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" };
const verifyToggleBtn = (active, activeColor, activeBg, disabled) => ({
  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
  border: `0.5px solid ${active ? activeColor : "#d0d0d0"}`,
  background: active ? activeBg : "white", color: active ? activeColor : "#888",
  cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.7 : 1, transition: "all 0.1s",
});
