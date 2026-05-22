import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  School, MapPin, Mail, Phone, User,
  ShieldCheck, CalendarDays, BadgeCheck, Edit2, Save, X,
} from "lucide-react";
import { getSekolahProfileApi, updateSekolahProfileApi } from "../../api/sekolah";
import { getSekolahLevelsApi } from "../../api/sekolah";

export default function SekolahDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [levels, setLevels]   = useState([]);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSekolahProfileApi(), getSekolahLevelsApi()])
      .then(([profRes, lvRes]) => {
        const profileData = profRes?.data ?? profRes;
        const sekolah = profileData?.sekolah ?? profileData ?? {};
        setProfile(sekolah);
        setEditData({
          ...sekolah,
          email_sekolah: sekolah.email_sekolah ?? sekolah.email ?? "",
          telepon: sekolah.telepon ?? sekolah.no_telp ?? "",
        });
        const lv = lvRes.data?.data ?? lvRes.data ?? [];
        setLevels(Array.isArray(lv) ? lv : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await updateSekolahProfileApi(editData);
      const updated = res.data?.sekolah ?? res.data ?? res;
      setProfile(updated);
      setEditing(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  const totalLevels = levels.length;
  const doneLevels  = levels.filter(l => l.status === "submitted" || l.status === "verified").length;
  const progressPct = totalLevels > 0 ? Math.round((doneLevels / totalLevels) * 100) : 0;

  const p = profile || {};

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ width: 44, height: 44, border: "3px solid #e5e7eb", borderTop: "3px solid var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div
      style={{
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        className="flex items-start justify-between gap-4 mb-6"
        style={{
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: "clamp(20px, 4vw, 28px)",
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: 6,
              wordBreak: "break-word",
            }}
          >
            Profile Sekolah
          </h1>

          <p
            className="text-muted"
            style={{
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            Informasi lengkap data sekolah peserta UKS
          </p>
        </div>

        <div
          className="badge badge-glow"
          style={{
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Periode Aktif
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-main)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
            <Edit2 size={15} /> Edit Profil
          </button>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "12px", border: "none", background: "var(--primary)", color: "white", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
              <Save size={15} /> {saving ? "Menyimpan..." : "Simpan"}
            </button>
            <button onClick={() => { setEditing(false); setEditData(profile); }} style={{ padding: "9px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--card-bg)", cursor: "pointer", color: "var(--text-muted)" }}>
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      {/* PROFILE CARD */}
      <div
        className="card glass-panel mb-6"
        style={{
          padding: "24px",
          borderRadius: "24px",
        }}
      >
        <div
          className="flex gap-5"
          style={{
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* LOGO */}
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "var(--accent-glow)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--secondary)",
              flexShrink: 0,
              margin: "0 auto",
            }}
          >
            <School size={40} />
          </div>

          {/* INFO */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <h2
              style={{
                fontSize: "clamp(20px, 4vw, 26px)",
                fontWeight: 700,
                lineHeight: 1.3,
                marginBottom: 8,
                wordBreak: "break-word",
              }}
            >
              {p.nama || p.name || user?.school?.name || "SDN 01 Percontohan"}
            </h2>

            <p
              className="text-muted"
              style={{
                fontSize: "14px",
                marginBottom: 14,
                lineHeight: 1.5,
              }}
            >
              {p.opd?.nama || p.wilayah || "Sekolah Peserta Penilaian UKS Digital"}
            </p>

            <div
              className="flex gap-2"
              style={{
                flexWrap: "wrap",
              }}
            >
              <div className="badge badge-glow">
                Sekolah Aktif
              </div>

              <div
                className="badge"
                style={{
                  background: "var(--bg-light)",
                  color: "var(--primary)",
                }}
              >
                Terverifikasi
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div
        className="grid gap-6 mb-6"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        }}
      >
        {/* IDENTITAS */}
        <div
          className="card glass-panel"
          style={{
            padding: "22px",
            borderRadius: "22px",
            minWidth: 0,
          }}
        >
          <div
            className="flex items-center gap-2 mb-5"
            style={{
              flexWrap: "wrap",
            }}
          >
            <ShieldCheck
              size={20}
              color="var(--primary)"
            />

            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              Identitas Sekolah
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <ProfileItem icon={<School size={18} />}      label="Nama Sekolah"   value={p.nama || p.name || user?.school?.name || "–"} editing={editing} field="nama" editData={editData} setEditData={setEditData} />
            <ProfileItem icon={<User size={18} />}         label="Kepala Sekolah" value={p.kepala_sekolah || p.nama_kepala || user?.name || "–"} editing={editing} field="kepala_sekolah" editData={editData} setEditData={setEditData} />
            <ProfileItem icon={<BadgeCheck size={18} />}   label="NPSN"           value={p.npsn || "–"} editing={editing} field="npsn" editData={editData} setEditData={setEditData} />
            <ProfileItem icon={<CalendarDays size={18} />} label="Jenjang"         value={p.jenjang || "–"} />
          </div>
        </div>

        {/* KONTAK */}
        <div
          className="card glass-panel"
          style={{
            padding: "22px",
            borderRadius: "22px",
            minWidth: 0,
          }}
        >
          <div
            className="flex items-center gap-2 mb-5"
            style={{
              flexWrap: "wrap",
            }}
          >
            <Mail
              size={20}
              color="var(--secondary)"
            />

            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              Kontak & Lokasi
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <ProfileItem icon={<MapPin size={18} />} label="Alamat"        value={p.alamat || "–"} editing={editing} field="alamat" editData={editData} setEditData={setEditData} />
            <ProfileItem icon={<Phone size={18} />}  label="Nomor Telepon" value={p.telepon || p.no_telp || "–"} editing={editing} field="telepon" editData={editData} setEditData={setEditData} />
            <ProfileItem icon={<Mail size={18} />}   label="Email Sekolah" value={p.email_sekolah || p.email || "–"} editing={editing} field="email_sekolah" editData={editData} setEditData={setEditData} />
            <ProfileItem icon={<School size={18} />} label="Akreditasi"    value={p.akreditasi || "–"} />
          </div>
        </div>
      </div>

      {/* STATUS */}
      <div
        className="card glass-panel"
        style={{
          padding: "24px",
          borderRadius: "24px",
        }}
      >
        <div
          className="flex items-start justify-between gap-4 mb-5"
          style={{
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              Status Penilaian UKS
            </h3>

            <p
              className="text-muted"
              style={{
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              Ringkasan progres penilaian sekolah
            </p>
          </div>

          <div
            className="badge"
            style={{
              background: "var(--accent-glow)",
              color: "var(--secondary)",
              whiteSpace: "nowrap",
            }}
          >
            Dalam Proses
          </div>
        </div>

        {/* STATUS GRID */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <StatusCard title="Level Selesai"  value={`${doneLevels} / ${totalLevels}`} />
          <StatusCard title="Progress"        value={`${progressPct}%`} />
        </div>
      </div>
    </div>
  );
}

/* PROFILE ITEM – supports inline edit */
function ProfileItem({ icon, label, value, editing, field, editData, setEditData }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: 14, borderBottom: "1px solid var(--border)", minWidth: 0 }}>
      <div style={{ width: 42, height: 42, borderRadius: 14, background: "var(--bg-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="text-muted" style={{ fontSize: 12, marginBottom: 4 }}>{label}</div>
        {editing && field ? (
          <input
            type="text"
            value={editData?.[field] || ""}
            onChange={e => setEditData(prev => ({ ...prev, [field]: e.target.value }))}
            style={{ width: "100%", borderRadius: 10, border: "1px solid var(--border)", padding: "7px 10px", fontSize: 14, outline: "none", background: "var(--card-bg)", color: "var(--text-main)", boxSizing: "border-box" }}
          />
        ) : (
          <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.5, wordBreak: "break-word" }}>{value}</div>
        )}
      </div>
    </div>
  );
}

/* STATUS CARD */
function StatusCard({ title, value }) {
  return (
    <div style={{ padding: "20px", borderRadius: "20px", border: "1px solid var(--border)", background: "var(--card-bg)", minWidth: 0 }}>
      <div className="text-muted" style={{ fontSize: 13, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: "clamp(24px, 5vw, 30px)", fontWeight: 700, color: "var(--primary)", wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}