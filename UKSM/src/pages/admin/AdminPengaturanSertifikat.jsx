import { useState, useEffect } from "react";
import { getPengaturanSertifikatApi, updatePengaturanSertifikatApi } from "../../api/admin";
import { toast } from "react-toastify";
import { Save, FileText, ToggleLeft, ToggleRight, Building, UserCheck } from "lucide-react";

export default function AdminPengaturanSertifikat() {
  const [formData, setFormData] = useState({
    nama_penerbit: "",
    jabatan_penandatangan: "",
    format_nomor_surat: "",
    is_auto_number: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSetting();
  }, []);

  const fetchSetting = async () => {
    try {
      setLoading(true);
      const res = await getPengaturanSertifikatApi();
      if (res.success && res.data) {
        setFormData({
          nama_penerbit: res.data.nama_penerbit || "",
          jabatan_penandatangan: res.data.jabatan_penandatangan || "",
          format_nomor_surat: res.data.format_nomor_surat || "",
          is_auto_number: res.data.is_auto_number === true || res.data.is_auto_number === 1,
        });
      }
    } catch (err) {
      console.error("Gagal memuat pengaturan sertifikat:", err);
      toast.error("Gagal memuat pengaturan sertifikat.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleAutoNumber = () => {
    setFormData((prev) => ({
      ...prev,
      is_auto_number: !prev.is_auto_number,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updatePengaturanSertifikatApi(formData);
      if (res.success) {
        toast.success(res.message || "Pengaturan berhasil disimpan!");
      }
    } catch (err) {
      console.error("Gagal menyimpan pengaturan sertifikat:", err);
      toast.error("Gagal menyimpan pengaturan sertifikat.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Memuat data...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
      <div className="flex items-center gap-3 mb-6">
        <FileText size={32} color="var(--primary)" />
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Pengaturan Sertifikat</h1>
          <p className="text-muted" style={{ fontSize: "14px", margin: 0 }}>
            Kelola data penerbit dan format penomoran surat untuk sertifikat sekolah.
          </p>
        </div>
      </div>

      <div className="card glass-panel" style={{ padding: "24px", borderRadius: "16px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, marginBottom: "8px" }}>
              <Building size={18} />
              Nama Penerbit
            </label>
            <input
              type="text"
              name="nama_penerbit"
              value={formData.nama_penerbit}
              onChange={handleChange}
              placeholder="Contoh: Dinas Kesehatan Kota Surakarta"
              className="input"
              required
            />
            <p className="text-muted" style={{ fontSize: "12px", marginTop: "4px" }}>
              Nama instansi yang menerbitkan sertifikat.
            </p>
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, marginBottom: "8px" }}>
              <UserCheck size={18} />
              Jabatan Penandatangan
            </label>
            <input
              type="text"
              name="jabatan_penandatangan"
              value={formData.jabatan_penandatangan}
              onChange={handleChange}
              placeholder="Contoh: Kepala Dinas Kesehatan"
              className="input"
              required
            />
          </div>

          <div style={{ padding: "16px", background: "var(--bg-light)", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <label style={{ fontWeight: 600, margin: 0 }}>Izinkan Penomoran Otomatis</label>
              <div onClick={toggleAutoNumber} style={{ cursor: "pointer", color: formData.is_auto_number ? "var(--primary)" : "var(--text-muted)" }}>
                {formData.is_auto_number ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </div>
            </div>
            <p className="text-muted" style={{ fontSize: "13px", marginBottom: formData.is_auto_number ? "16px" : 0 }}>
              Jika diaktifkan, sekolah dapat memilih opsi agar sistem meng-generate nomor surat secara otomatis saat menerbitkan sertifikat.
            </p>

            {formData.is_auto_number && (
              <div>
                <label style={{ fontWeight: 600, fontSize: "14px", marginBottom: "8px", display: "block" }}>
                  Format Nomor Surat Otomatis
                </label>
                <input
                  type="text"
                  name="format_nomor_surat"
                  value={formData.format_nomor_surat}
                  onChange={handleChange}
                  placeholder="UKS/[TAHUN]/[ID_SEKOLAH]"
                  className="input"
                  required={formData.is_auto_number}
                />
                <p className="text-muted" style={{ fontSize: "12px", marginTop: "6px" }}>
                  Gunakan placeholder <code>[TAHUN]</code> untuk tahun saat ini, dan <code>[ID_SEKOLAH]</code> untuk ID sekolah. Contoh hasil: <strong>UKS/{new Date().getFullYear()}/12</strong>
                </p>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px" }}
            >
              <Save size={18} />
              {saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
