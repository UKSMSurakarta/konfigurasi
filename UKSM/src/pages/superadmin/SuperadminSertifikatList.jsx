import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Search, Award, CheckCircle2, XCircle,
    Clock3, ChevronLeft, ChevronRight, Eye, Filter
} from "lucide-react";
import { getSuperadminCertificatesApi } from "../../api/admin";
import { getOpdsApi } from "../../api/superadmin";

export default function SuperadminSertifikatList() {
    const [sekolahs, setSekolahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [jenjang, setJenjang] = useState("");
    const [opdId, setOpdId] = useState("");
    const [opds, setOpds] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSekolah, setTotalSekolah] = useState(0);

    const JENJANG_LIST = ["TK", "SD", "SMP", "SMA", "SMK"];

    useEffect(() => {
        getOpdsApi({ limit: 100 }).then(res => {
            if (res.success) {
                setOpds(res.data?.data || res.data || []);
            }
        }).catch(err => console.error("Gagal load OPD", err));
    }, []);

    useEffect(() => {
        const fetchSekolahs = async () => {
            setLoading(true);
            try {
                const res = await getSuperadminCertificatesApi({
                    search, jenjang, opd_id: opdId, page, limit: 10
                });

                if (res.success) {
                    setSekolahs(res.data.data);
                    setTotalPages(res.data.last_page);
                    setTotalSekolah(res.data.total);
                } else {
                    setSekolahs([]);
                }
            } catch (err) {
                console.error("Gagal load sertifikat", err);
                setSekolahs([]);
            } finally {
                setLoading(false);
            }
        };

        const t = setTimeout(fetchSekolahs, 300);
        return () => clearTimeout(t);
    }, [search, jenjang, opdId, page]);

    const getStatusBadge = (status) => {
        const config = {
            'pending': { label: 'Menunggu', bg: '#FEF3C7', color: '#B45309', icon: Clock3 },
            'published': { label: 'Terbit', bg: '#DCFCE7', color: '#15803D', icon: CheckCircle2 },
            'rejected': { label: 'Ditolak', bg: '#FEE2E2', color: '#B91C1C', icon: XCircle }
        };
        const c = config[status] || config.pending;
        const Icon = c.icon;

        return (
            <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: c.bg, color: c.color,
                padding: '4px 10px', borderRadius: 999,
                fontSize: 12, fontWeight: 600
            }}>
                <Icon size={12} /> {c.label}
            </div>
        );
    };

    return (
        <div style={{ padding: "0 24px", maxWidth: 1200, margin: "0 auto", paddingBottom: 40, width: "100%" }}>

            {/* H E A D E R */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Award size={26} color="var(--primary)" /> Terbitkan Sertifikat
                    </h1>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>
                        Sekolah di bawah ini telah diverifikasi OPD. Superadmin berwenang menerbitkan sertifikat manual.
                    </p>
                </div>
            </div>

            {/* T O O L B A R */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input
                        type="text"
                        placeholder="Cari sekolah atau npsn..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        style={{
                            width: '100%', padding: '10px 14px 10px 42px',
                            border: '1px solid var(--border)', borderRadius: 10,
                            fontSize: 14, outline: 'none', background: 'white'
                        }}
                    />
                </div>
                <div style={{ width: 160, position: 'relative' }}>
                    <select
                        value={opdId}
                        onChange={(e) => { setOpdId(e.target.value); setPage(1); }}
                        style={{
                            width: '100%', padding: '10px 14px',
                            border: '1px solid var(--border)', borderRadius: 10,
                            fontSize: 14, outline: 'none', background: 'white'
                        }}
                    >
                        <option value="">Semua OPD</option>
                        {opds.map(o => (
                            <option key={o.id} value={o.id}>{o.nama}</option>
                        ))}
                    </select>
                </div>
                <div style={{ width: 140, position: 'relative' }}>
                    <select
                        value={jenjang}
                        onChange={(e) => { setJenjang(e.target.value); setPage(1); }}
                        style={{
                            width: '100%', padding: '10px 14px',
                            border: '1px solid var(--border)', borderRadius: 10,
                            fontSize: 14, outline: 'none', background: 'white'
                        }}
                    >
                        <option value="">Semua Jenjang</option>
                        {JENJANG_LIST.map(j => (
                            <option key={j} value={j}>{j}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* T A B L E */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                <th style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Sekolah</th>
                                <th style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>OPD / Jenjang</th>
                                <th style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Status Sertifikat</th>
                                <th style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '30px 0', textAlign: 'center', color: '#6B7280' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                                            <div className="spinner border-t-primary" style={{ width: 16, height: 16, border: '2px solid #E5E7EB', borderRadius: '50%', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                                            Memuat data...
                                        </div>
                                    </td>
                                </tr>
                            ) : sekolahs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '30px 0', textAlign: 'center', color: '#6B7280' }}>
                                        Belum ada sekolah yang diverifikasi oleh Admin OPD.
                                    </td>
                                </tr>
                            ) : (
                                sekolahs.map((row, idx) => (
                                    <tr key={row.id} style={{ borderBottom: idx !== sekolahs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 14 }}>{row.nama}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>NPSN: {row.npsn}</div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ fontSize: 14 }}>{row.opd_nama}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{row.jenjang}</div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            {getStatusBadge(row.sertifikat_status)}
                                            {row.predikat && (
                                                <div style={{ fontSize: 12, marginTop: 4, color: 'var(--text-muted)' }}>Mendali: <b>{row.predikat}</b></div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                            <Link
                                                to={`/superadmin/sertifikat/${row.id}`}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                                    background: 'var(--primary)', color: 'white',
                                                    padding: '6px 12px', borderRadius: 8,
                                                    fontSize: 13, fontWeight: 600, textDecoration: 'none'
                                                }}
                                            >
                                                <Eye size={14} /> Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* P A G I N A T I O N */}
                {!loading && totalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--border)', background: '#F9FAFB' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            Menampilkan <b>{sekolahs.length}</b> dari total <b>{totalSekolah}</b> sekolah
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: 32, height: 32, borderRadius: 8,
                                    border: '1px solid var(--border)',
                                    background: page === 1 ? '#F3F4F6' : 'white',
                                    color: page === 1 ? '#9CA3AF' : 'var(--text-main)',
                                    cursor: page === 1 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: 32, height: 32, borderRadius: 8,
                                    border: '1px solid var(--border)',
                                    background: page === totalPages ? '#F3F4F6' : 'white',
                                    color: page === totalPages ? '#9CA3AF' : 'var(--text-main)',
                                    cursor: page === totalPages ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
