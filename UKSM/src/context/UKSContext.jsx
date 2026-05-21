import { createContext, useContext, useState } from "react";

const UKSContext = createContext(null);

export const TIER_KEYS = ["dasar", "madya", "utama", "paripurna"];

export const TIER_STATUS = {
  LOCKED: "locked",
  OPEN: "open", 
  SUBMITTED: "submitted",
};

export const VERIFY = {
  PENDING: "pending",
  MEMENUHI: "memenuhi",
  BELUM: "belum",
};

const DEMO_DATA = {
  1: {
    tierStatus: {
      dasar: TIER_STATUS.SUBMITTED,
      madya: TIER_STATUS.OPEN,
      utama: TIER_STATUS.LOCKED,
      paripurna: TIER_STATUS.LOCKED,
    },
    answers: {
      dasar_0:  { memenuhi: true,  bukti: { files: [], links: ["https://drive.google.com/contoh"] } },
      dasar_1:  { memenuhi: true,  bukti: { files: [], links: [] } },
      dasar_2:  { memenuhi: false, bukti: { files: [], links: [] } },
      dasar_3:  { memenuhi: true,  bukti: { files: [], links: [] } },
      dasar_4:  { memenuhi: true,  bukti: { files: [], links: [] } },
      dasar_5:  { memenuhi: true,  bukti: { files: [], links: [] } },
      dasar_6:  { memenuhi: true,  bukti: { files: [], links: [] } },
      dasar_7:  { memenuhi: false, bukti: { files: [], links: [] } },
      dasar_8:  { memenuhi: true,  bukti: { files: [], links: [] } },
      dasar_9:  { memenuhi: true,  bukti: { files: [], links: [] } },
      dasar_10: { memenuhi: true,  bukti: { files: [], links: [] } },
      dasar_11: { memenuhi: true,  bukti: { files: [], links: [] } },
      dasar_12: { memenuhi: true,  bukti: { files: [], links: [] } },
      dasar_13: { memenuhi: false, bukti: { files: [], links: [] } },
      dasar_14: { memenuhi: true,  bukti: { files: [], links: [] } },
      dasar_15: { memenuhi: true,  bukti: { files: [], links: [] } },
      dasar_16: { memenuhi: true,  bukti: { files: [], links: [] } },
      dasar_17: { memenuhi: false, bukti: { files: [], links: [] } },
      dasar_18: { memenuhi: true,  bukti: { files: [], links: [] } },
      dasar_19: { memenuhi: true,  bukti: { files: [], links: [] } },
      dasar_20: { memenuhi: true,  bukti: { files: [], links: [] } },
      dasar_21: { memenuhi: true,  bukti: { files: [], links: [] } },
      dasar_22: { memenuhi: true,  bukti: { files: [], links: [] } },
    },
    verifikasi: {
      dasar_0:  { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:00" },
      dasar_1:  { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:01" },
      dasar_2:  { status: VERIFY.BELUM, catatan: "Kotak P3K tidak lengkap.", finalized: true, verifiedAt: "2025-05-02 10:02" },
      dasar_3:  { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:03" },
      dasar_4:  { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:04" },
      dasar_5:  { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:05" },
      dasar_6:  { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:06" },
      dasar_7:  { status: VERIFY.BELUM,    catatan: "Tinggi badan tidak terukur.", finalized: true, verifiedAt: "2025-05-02 10:07" },
      dasar_8:  { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:08" },
      dasar_9:  { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:09" },
      dasar_10: { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:10" },
      dasar_11: { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:11" },
      dasar_12: { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:12" },
      dasar_13: { status: VERIFY.BELUM,    catatan: "Tempat sampah belum tersedia di semua kelas.", finalized: true, verifiedAt: "2025-05-02 10:13" },
      dasar_14: { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:14" },
      dasar_15: { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:15" },
      dasar_16: { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:16" },
      dasar_17: { status: VERIFY.BELUM,    catatan: "Buku register belum tersedia.", finalized: true, verifiedAt: "2025-05-02 10:17" },
      dasar_18: { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:18" },
      dasar_19: { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:19" },
      dasar_20: { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:20" },
      dasar_21: { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:21" },
      dasar_22: { status: VERIFY.MEMENUHI, catatan: "", finalized: true, verifiedAt: "2025-05-02 10:22" },
    },
  },
  2: {
    tierStatus: {
      dasar: TIER_STATUS.OPEN,
      madya: TIER_STATUS.LOCKED,
      utama: TIER_STATUS.LOCKED,
      paripurna: TIER_STATUS.LOCKED,
    },
    answers: {},
    verifikasi: {},
  },
};

export function UKSProvider({ children }) {
  const [schoolData, setSchoolData] = useState(DEMO_DATA);

  function getSchoolData(schoolId) {
    return schoolData[schoolId] || {
      tierStatus: { dasar: TIER_STATUS.OPEN, madya: TIER_STATUS.LOCKED, utama: TIER_STATUS.LOCKED, paripurna: TIER_STATUS.LOCKED },
      answers: {},
      verifikasi: {},
      certificateName: "",
      completed: false,
    };
  }

  function updateAnswer(schoolId, key, memenuhi, bukti) {
    setSchoolData((prev) => {
      const sd = prev[schoolId] || {};
      return {
        ...prev,
        [schoolId]: {
          ...sd,
          answers: {
            ...(sd.answers || {}),
            [key]: { memenuhi, bukti: bukti || { files: [], links: [] } },
          },
        },
      };
    });
  }

  function submitTier(schoolId, tierKey) {
    setSchoolData((prev) => {
      const sd = prev[schoolId] || {};
      const tierIdx = TIER_KEYS.indexOf(tierKey);
      const nextTier = TIER_KEYS[tierIdx + 1];
      const isLast = tierIdx === TIER_KEYS.length - 1;

      const newTierStatus = {
        ...(sd.tierStatus || {}),
        [tierKey]: TIER_STATUS.SUBMITTED,
      };
      if (nextTier) newTierStatus[nextTier] = TIER_STATUS.OPEN;

      return {
        ...prev,
        [schoolId]: {
          ...sd,
          tierStatus: newTierStatus,
          completed: isLast ? true : sd.completed,
          [`${tierKey}SubmittedAt`]: new Date().toLocaleString("id-ID"),
        },
      };
    });
  }

  function updateVerifikasi(schoolId, key, status, catatan) {
    setSchoolData((prev) => {
      const sd = prev[schoolId] || {};
      return {
        ...prev,
        [schoolId]: {
          ...sd,
          verifikasi: {
            ...(sd.verifikasi || {}),
            [key]: { status, catatan: catatan || "" },
          },
        },
      };
    });
  }

  function submitVerifikasiQuestion(schoolId, key, status, catatan) {
    setSchoolData((prev) => {
      const sd = prev[schoolId] || {};
      return {
        ...prev,
        [schoolId]: {
          ...sd,
          verifikasi: {
            ...(sd.verifikasi || {}),
            [key]: { status, catatan: catatan || "", finalized: true, verifiedAt: new Date().toLocaleString("id-ID") },
          },
        },
      };
    });
  }

  function allTiersVerifiedForSchool(schoolId) {
    const sd = schoolData[schoolId] || {};
    const answers = sd.answers || {};
    const verifikasi = sd.verifikasi || {};
    const tierStatus = sd.tierStatus || {};

    const allSubmitted = TIER_KEYS.every(tk => tierStatus[tk] === TIER_STATUS.SUBMITTED);
    if (!allSubmitted) return false;

    const answeredKeys = Object.keys(answers);
    if (answeredKeys.length === 0) return false;
    return answeredKeys.every(key => verifikasi[key]?.finalized === true);
  }

  // Dipanggil admin saat tombol Verifikasi dikonfirmasi
  // Otomatis set certificateReady=true sehingga sekolah bisa download sertifikat
  function verifySchool(schoolId, predikat, catatan, adminName) {
    setSchoolData((prev) => {
      const sd = prev[schoolId] || {};
      const nomorSertif = `UKS-${new Date().getFullYear()}-${String(schoolId).padStart(4, "0")}-${Date.now().toString().slice(-4)}`;
      return {
        ...prev,
        [schoolId]: {
          ...sd,
          verified: true,
          predikat,
          catatanVerifikasi: catatan || "",
          verifiedBy: adminName || "Admin",
          verifiedAt: new Date().toLocaleString("id-ID"),
          certificateReady: true,
          nomorSertifikat: nomorSertif,
        },
      };
    });
  }

  function getAllSchoolData() {
    return schoolData;
  }

  function setCertificateName(schoolId, name) {
    setSchoolData((prev) => {
      const sd = prev[schoolId] || {};
      return { ...prev, [schoolId]: { ...sd, certificateName: name } };
    });
  }

  return (
    <UKSContext.Provider value={{
      getSchoolData, updateAnswer, submitTier,
      updateVerifikasi, submitVerifikasiQuestion,
      allTiersVerifiedForSchool, verifySchool, getAllSchoolData,
      setCertificateName,
    }}>
      {children}
    </UKSContext.Provider>
  );
}

export function useUKS() {
  return useContext(UKSContext);
}
