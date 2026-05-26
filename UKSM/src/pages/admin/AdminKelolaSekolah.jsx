import { useState, useEffect, useCallback, useRef } from "react";
import { School, Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, AlertCircle, GraduationCap, CheckCircle2 } from "lucide-react";
import {getAdminSekolahsApi, createAdminSekolahApi, updateAdminSekolahApi, deleteAdminSekolahApi} from "../../api/admin";

// Constants
const JENJANG_LIST = ["TK", "SD", "SMP", "SMA", "SMK"];
const JENJANG_COLOR = {TK:{bg:"#FEF3C7",color:"#D97706"}, SD:{bg:"#EEF2FF",color:"#4338CA"}, SMP:{bg:"#ECFDF5",color:"#059669"}, SMA:{bg:"#FFF1F2",color:"#E11D48"}, SMK:{bg:"#F0F9FF",color:"#0284C7"}};

// Main Component
export default function AdminKelolaSekolah() {
  // States untuk data
  const [sekolahs, setSekolahs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // States untuk filter/search
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterJenjang, setFilterJenjang] = useState("");

  // States untuk modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm());

  // States untuk delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const debounceRef = useRef(null);

  function emptyForm() {
    return {nama:"", npsn:"", jenjang:"SD", kepala_sekolah:"", alamat:""};
  }

  function showToast(type, msg) {
    if(toastTimer.current) clearTimeout(toastTimer.current);
    setToast({type, message:msg});
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  // Debounced search
  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if(debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {setSearch(val); setCurrentPage(1);}, 400);
  };

  // Fetch sekolahs
  const fetchSekolahs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminSekolahsApi({search, jenjang:filterJenjang, page:currentPage});
      const items = res.data?.data ?? res.data ?? [];
      const meta = res.data?.meta ?? res.meta ?? {};
      setSekolahs(Array.isArray(items) ? items : []);
      setLastPage(meta.last_page ?? 1);
      setTotal(meta.total ?? items.length);
    } catch(err) {
      console.error(err);
      showToast("error", "Gagal memuat data sekolah");
    } finally {
      setLoading(false);
    }
  }, [search, filterJenjang, currentPage]);

  useEffect(() => { fetchSekolahs(); }, [fetchSekolahs]);

  // Modal functions
  function openAdd() {
    setEditTarget(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(s) {
    setEditTarget(s.id);
    setForm({nama:s.nama, npsn:s.npsn, jenjang:s.jenjang, kepala_sekolah:s.kepala_sekolah||"", alamat:s.alamat||""});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditTarget(null);
    setForm(emptyForm());
  }

  // Submit (Create/Update)
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if(editTarget) {
        await updateAdminSekolahApi(editTarget, form);
        showToast("success", "Sekolah berhasil diperbarui");
      } else {
        await createAdminSekolahApi(form);
        showToast("success", "Sekolah berhasil ditambahkan");
        setCurrentPage(1);
      }
      closeModal();
      fetchSekolahs();
    } catch(err) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setSubmitting(false);
    }
  }

  // Delete
  async function handleDelete() {
    if(!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteAdminSekolahApi(deleteTarget.id);
      showToast("success", "Sekolah berhasil dihapus");
      setDeleteTarget(null);
      fetchSekolahs();
    } catch(err) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Gagal menghapus sekolah");
    } finally {
      setSubmitting(false);
    }
  }

  // Render JSX
  return (<div style={{width:"100%", overflowX:"hidden"}}>
    {/* Header */}
    <div style={{gap:"16px", flexWrap:"wrap", marginBottom:"24px"}}>
      <div style={{flex:1, minWidth:0}}>
        <h1 style={{fontSize:"clamp(24px,4vw,30px)", fontWeight:700, marginBottom:6}}>Kelola Sekolah Binaan</h1>
        <p style={{fontSize:"14px", color:"var(--text-muted)"}}>Kelola data sekolah binaan OPD Anda</p>
      </div>
    </div>

    {/* Stats */}
    <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"16px", marginBottom:"24px"}}>
      <StatCard icon={<School size={22}/>} title="Total Sekolah" value={String(total)} color="#0F6E56" bg="#E8F7F0"/>
      <StatCard icon={<GraduationCap size={22}/>} title="Halaman" value={`${currentPage} / ${lastPage}`} color="#4338CA" bg="#EEF2FF"/>
    </div>

    {/* Filters */}
    <div className="card" style={{padding:"20px", borderRadius:"18px", marginBottom:"24px"}}>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"14px"}}>
        <div style={{position:"relative"}}>
          <Search size={18} style={{position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)", pointerEvents:"none"}}/>
          <input type="text" placeholder="Cari nama/NPSN..." value={searchInput} onChange={handleSearchInput} style={{width:"100%", height:"46px", borderRadius:"12px", border:"1px solid var(--border)", background:"var(--card-bg)", paddingLeft:"44px", paddingRight:"14px", outline:"none", fontSize:"14px"}}/>
        </div>
        <select value={filterJenjang} onChange={(e)=>{setFilterJenjang(e.target.value); setCurrentPage(1);}} style={{height:"46px", borderRadius:"12px", border:"1px solid var(--border)", background:"var(--card-bg)", padding:"0 14px", outline:"none", fontSize:"14px", cursor:"pointer"}}>
          <option value="">Semua Jenjang</option>
          {JENJANG_LIST.map(j=>(<option key={j} value={j}>{j}</option>))}
        </select>
        <button onClick={openAdd} style={{height:"46px", borderRadius:"12px", border:"none", background:"linear-gradient(135deg,#0F6E56,#0D5C48)", color:"white", fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", cursor:"pointer"}}>
          <Plus size={18}/> Tambah Sekolah
        </button>
      </div>
    </div>

    {/* Table */}
    {loading ? <LoadingSpinner/> : (
      sekolahs.length === 0 ? <EmptyState/> : (
        <div style={{width:"100%", overflowX:"auto"}}>
          <table style={{width:"100%", borderCollapse:"collapse", minWidth:"800px"}}>
            <thead style={{background:"var(--bg-light)"}}>
              <tr>
                <TableHead>No</TableHead>
                <TableHead>Nama Sekolah</TableHead>
                <TableHead>NPSN</TableHead>
                <TableHead>Jenjang</TableHead>
                <TableHead>Kepala Sekolah</TableHead>
                <TableHead>Aksi</TableHead>
              </tr>
            </thead>
            <tbody>
              {sekolahs.map((s,i)=>(<SekolahRow key={s.id} sekolah={s} no={(currentPage-1)*10+i+1} onEdit={()=>openEdit(s)} onDelete={()=>setDeleteTarget(s)}/>))}
            </tbody>
          </table>
        </div>
      )
    )}

    {/* Pagination */}
    {lastPage > 1 && (
      <div style={{display:"flex", alignItems:"center", justifyContent:"center", marginTop:"24px", gap:"12px"}}>
        <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} style={{background:"var(--card-bg)", border:"1px solid var(--border)", padding:"8px 16px", borderRadius:"10px", cursor:currentPage===1?"not-allowed":"pointer", opacity:currentPage===1?0.5:1}}>
          <ChevronLeft size={18}/>
        </button>
        <span>{currentPage} / {lastPage}</span>
        <button onClick={()=>setCurrentPage(p=>Math.min(lastPage,p+1))} disabled={currentPage===lastPage} style={{background:"var(--card-bg)", border:"1px solid var(--border)", padding:"8px 16px", borderRadius:"10px", cursor:currentPage===lastPage?"not-allowed":"pointer", opacity:currentPage===lastPage?0.5:1}}>
          <ChevronRight size={18}/>
        </button>
      </div>
    )}

    {/* Modal Form */}
    {modalOpen && (<ModalForm editTarget={editTarget} form={form} setForm={setForm} onClose={closeModal} onSubmit={handleSubmit} submitting={submitting}/>)}

    {/* Delete Modal */}
    {deleteTarget && (<DeleteModal sekolah={deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={handleDelete} submitting={submitting}/>)}

    {/* Toast */}
    {toast && (<Toast type={toast.type} message={toast.message}/>)}
  </div>);
}

// Sub-components
function StatCard({icon, title, value, color, bg}) {
  return (<div className="card" style={{padding:"20px", borderRadius:"18px", border:"1px solid var(--border)", display:"flex", alignItems:"center", gap:"14px"}}>
    <div style={{width:"48px", height:"48px", borderRadius:"14px", background:bg, color, display:"flex", alignItems:"center", justifyContent:"center"}}>{icon}</div>
    <div><div style={{fontSize:"12px", marginBottom:"4px", color:"var(--text-muted)"}}>{title}</div><div style={{fontSize:"22px", fontWeight:700}}>{value}</div></div>
  </div>);
}

function TableHead({children}) {
  return (<th style={{textAlign:"left", padding:"14px 16px", fontSize:"13px", fontWeight:600, color:"var(--text-muted)", whiteSpace:"nowrap"}}>{children}</th>);
}

function SekolahRow({sekolah, no, onEdit, onDelete}) {
  const jc = JENJANG_COLOR[sekolah.jenjang] ?? {bg:"#F3F4F6", color:"#6B7280"};
  return (<tr style={{borderBottom:"1px solid var(--border)"}}>
    <td style={{padding:"14px 16px", fontSize:"14px"}}>{no}</td>
    <td style={{padding:"14px 16px", fontSize:"14px", fontWeight:600}}>{sekolah.nama}</td>
    <td style={{padding:"14px 16px", fontSize:"14px"}}>{sekolah.npsn}</td>
    <td style={{padding:"14px 16px"}}>
      <span style={{padding:"5px 12px", borderRadius:"999px", background:jc.bg, color:jc.color, fontWeight:600, fontSize:"12px"}}>{sekolah.jenjang}</span>
    </td>
    <td style={{padding:"14px 16px", fontSize:"14px"}}>{sekolah.kepala_sekolah || "-"}</td>
    <td style={{padding:"14px 16px"}}>
      <div style={{display:"flex", gap:"8px"}}>
        <button onClick={onEdit} style={{padding:"6px 12px", borderRadius:"8px", border:"1px solid var(--border)", background:"var(--card-bg)", cursor:"pointer"}}>
          <Pencil size={14}/>
        </button>
        <button onClick={onDelete} style={{padding:"6px 12px", borderRadius:"8px", border:"1px solid #FECACA", background:"#FEE2E2", color:"#DC2626", cursor:"pointer"}}>
          <Trash2 size={14}/>
        </button>
      </div>
    </td>
  </tr>);
}

function LoadingSpinner() {
  return (<div style={{display:"flex", flexDirection:"column", alignItems:"center", padding:"40px", gap:"16px"}}>
    <div style={{width:"40px", height:"40px", borderRadius:"50%", border:"3px solid var(--border)", borderTopColor:"var(--primary)", animation:"spin 0.8s linear infinite"}}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>);
}

function EmptyState() {
  return (<div style={{display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 20px", gap:"16px"}}>
    <div style={{width:"80px", height:"80px", borderRadius:"50%", background:"var(--bg-light)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-muted)"}}>
      <School size={40}/>
    </div>
    <p style={{fontWeight:600, fontSize:"16px"}}>Belum ada data sekolah</p>
  </div>);
}

function ModalForm({editTarget, form, setForm, onClose, onSubmit, submitting}) {
  return (<div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px"}}>
    <div style={{background:"var(--card-bg)", borderRadius:"24px", padding:"28px 32px", maxWidth:"520px", width:"100%", maxHeight:"90vh", overflowY:"auto"}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px"}}>
        <h2 style={{fontSize:"20px", fontWeight:700}}>{editTarget?"Edit Sekolah":"Tambah Sekolah"}</h2>
        <button onClick={onClose} style={{background:"rgba(0,0,0,0.05)", border:"none", width:36, height:36, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center"}}>
          <X size={18}/>
        </button>
      </div>
      <form onSubmit={onSubmit}>
        <FormField label="Nama Sekolah*" required>
          <input type="text" value={form.nama} onChange={(e)=>setForm({...form, nama:e.target.value})} placeholder="contoh: SDN 1 Sleman" required style={inputStyle}/>
        </FormField>
        <FormField label="NPSN*" required>
          <input type="text" value={form.npsn} onChange={(e)=>setForm({...form, npsn:e.target.value})} placeholder="8 digit" required style={inputStyle}/>
        </FormField>
        <FormField label="Jenjang*" required>
          <select value={form.jenjang} onChange={(e)=>setForm({...form, jenjang:e.target.value})} required style={{...inputStyle, cursor:"pointer"}}>
            {JENJANG_LIST.map(j=>(<option key={j} value={j}>{j}</option>))}
          </select>
        </FormField>
        <FormField label="Kepala Sekolah">
          <input type="text" value={form.kepala_sekolah} onChange={(e)=>setForm({...form, kepala_sekolah:e.target.value})} placeholder="Nama kepala sekolah" style={inputStyle}/>
        </FormField>
        <FormField label="Alamat">
          <textarea value={form.alamat} onChange={(e)=>setForm({...form, alamat:e.target.value})} placeholder="Alamat lengkap sekolah" rows={3} style={{...inputStyle, resize:"vertical", fontFamily:"inherit"}}/>
        </FormField>
        <div style={{display:"flex", gap:"12px", marginTop:"24px"}}>
          <button type="button" onClick={onClose} style={{flex:1, height:"46px", borderRadius:"12px", border:"1px solid var(--border)", background:"var(--card-bg)", fontWeight:600, cursor:"pointer"}}>Batal</button>
          <button type="submit" disabled={submitting} style={{flex:2, height:"46px", borderRadius:"12px", border:"none", background:"linear-gradient(135deg,#0F6E56,#0D5C48)", color:"white", fontWeight:700, cursor:submitting?"not-allowed":"pointer", opacity:submitting?0.7:1}}>
            {submitting?"Menyimpan...":(editTarget?"Simpan Perubahan":"Tambah Sekolah")}
          </button>
        </div>
      </form>
    </div>
  </div>);
}

function DeleteModal({sekolah, onClose, onConfirm, submitting}) {
  return (<div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px"}}>
    <div style={{background:"var(--card-bg)", borderRadius:"24px", padding:"28px 32px", maxWidth:"440px", width:"100%"}}>
      <div style={{width:56, height:56, borderRadius:"50%", background:"#FEE2E2", display:"flex", alignItems:"center", justifyContent:"center", color:"#DC2626", marginBottom:"20px"}}>
        <AlertCircle size={28}/>
      </div>
      <h2 style={{fontSize:"20px", fontWeight:700, marginBottom:"12px"}}>Hapus Sekolah?</h2>
      <p style={{fontSize:"14px", lineHeight:1.7, marginBottom:"24px", color:"var(--text-muted)"}}>
        Yakin ingin menghapus <strong>{sekolah.nama}</strong>? Data tidak dapat dikembalikan.
      </p>
      <div style={{display:"flex", gap:"12px"}}>
        <button onClick={onClose} style={{flex:1, height:"46px", borderRadius:"12px", border:"1px solid var(--border)", background:"var(--card-bg)", fontWeight:600, cursor:"pointer"}}>Batal</button>
        <button onClick={onConfirm} disabled={submitting} style={{flex:1, height:"46px", borderRadius:"12px", border:"none", background:"linear-gradient(135deg,#DC2626,#B91C1C)", color:"white", fontWeight:700, cursor:submitting?"not-allowed":"pointer", opacity:submitting?0.7:1}}>
          {submitting?"Menghapus...":"Hapus"}
        </button>
      </div>
    </div>
  </div>);
}

function FormField({label, required, children}) {
  return (<div style={{marginBottom:"18px"}}>
    <label style={{display:"block", fontSize:"13px", fontWeight:600, marginBottom:"8px", color:"var(--text-main)"}}>
      {label}{required && <span style={{color:"#DC2626"}}>*</span>}
    </label>
    {children}
  </div>);
}

function Toast({type, message}) {
  return (<div style={{position:"fixed", top:"24px", right:"24px", zIndex:9999, display:"flex", alignItems:"center", gap:"12px", padding:"14px 20px", borderRadius:"12px", background:type==="success"?"#DCFCE7":"#FEE2E2", border:`1px solid ${type==="success"?"#BBF7D0":"#FECACA"}`, color:type==="success"?"#15803D":"#DC2626", boxShadow:"0 10px 30px rgba(0,0,0,0.1)", fontWeight:600, fontSize:"14px", minWidth:"280px"}}>
    {type==="success"?<CheckCircle2 size={20}/>:<AlertCircle size={20}/>}
    <span>{message}</span>
  </div>);
}

const inputStyle = {width:"100%", height:"46px", borderRadius:"12px", border:"1px solid var(--border)", background:"var(--card-bg)", padding:"0 14px", outline:"none", fontSize:"14px", boxSizing:"border-box", color:"var(--text-main)"};
