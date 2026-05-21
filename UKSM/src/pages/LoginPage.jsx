import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";

const ROLE_REDIRECT = {
    superadmin: "/superadmin/dashboard",
    admin:      "/admin/dashboard",
    sekolah:    "/sekolah/dashboard",
    konten:     "/konten/dashboard",
    user:       "/konten/dashboard",
};

export default function LoginPage() {
    const { login, user, loading } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail]           = useState("");
    const [password, setPassword]     = useState("");
    const [showPass, setShowPass]     = useState(false);
    const [error, setError]           = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Jika sudah login, redirect otomatis
    useEffect(() => {
        if (!loading && user) {
            navigate(ROLE_REDIRECT[user.role] || "/", { replace: true });
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
            @keyframes floatGlow {
                0%   { transform: translate3d(0px,0px,0px) scale(1); }
                25%  { transform: translate3d(80px,-60px,0px) scale(1.15); }
                50%  { transform: translate3d(-60px,50px,0px) scale(0.9); }
                75%  { transform: translate3d(60px,80px,0px) scale(1.08); }
                100% { transform: translate3d(0px,0px,0px) scale(1); }
            }
            @keyframes pulseGlow {
                0%,100% { opacity: 0.22; }
                50%     { opacity: 0.38; }
            }
            @keyframes cardFloat {
                0%,100% { transform: translateY(0px); }
                50%     { transform: translateY(-6px); }
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            .login-input:focus {
                border-color: #0F6E56 !important;
                box-shadow: 0 0 0 3px rgba(15,110,86,0.12) !important;
                outline: none !important;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const result = await login(email, password);
            if (!result.ok) {
                setError(result.message || "Email atau password salah.");
            } else {
                navigate(ROLE_REDIRECT[result.role] || "/", { replace: true });
            }
        } catch (err) {
            setError("Terjadi kesalahan koneksi. Pastikan server berjalan.");
        } finally {
            setSubmitting(false);
        }
    }

    const floatingLights = [
        { width: 420, height: 420, color: "#60A5FA", top: "-120px",  left: "-150px",  duration: "18s" },
        { width: 520, height: 520, color: "#34D399", bottom: "-220px", right: "-180px", duration: "24s" },
        { width: 340, height: 340, color: "#A78BFA", top: "40%",     left: "60%",     duration: "16s" },
    ];

    if (loading) return null;

    return (
        <div style={{
            minHeight: "100vh",
            background: "radial-gradient(circle at top left, #f8fafb, #eef2f3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1.5rem", position: "relative", overflow: "hidden",
            fontFamily: "Inter, sans-serif",
        }}>
            {/* Animated Background */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
                {floatingLights.map((light, i) => (
                    <div key={i} style={{
                        position: "absolute",
                        width: light.width, height: light.height,
                        background: light.color,
                        borderRadius: "50%", filter: "blur(90px)",
                        opacity: 0.3, mixBlendMode: "screen",
                        animation: `floatGlow ${light.duration} ease-in-out infinite, pulseGlow 7s ease-in-out infinite`,
                        top: light.top, left: light.left,
                        right: light.right, bottom: light.bottom,
                    }} />
                ))}
                <div style={{
                    position: "absolute", inset: 0,
                    background: "radial-gradient(circle at center, rgba(255,255,255,0.06), transparent 70%)",
                    mixBlendMode: "soft-light",
                }} />
            </div>

            {/* Login Card */}
            <div style={{
                width: "100%", maxWidth: "420px",
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.5)",
                borderRadius: "28px",
                boxShadow: "0 25px 60px rgba(0,0,0,0.13)",
                padding: "44px",
                position: "relative", zIndex: 1,
                animation: "cardFloat 6s ease-in-out infinite",
            }}>
                {/* Logo */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <ShieldCheck size={34} style={{ color: "#0F6E56" }} />
                    <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#042C53", letterSpacing: "-1px" }}>
                        SI-UKS <span style={{ color: "#0F6E56" }}>DIGITAL</span>
                    </h1>
                </div>

                <p style={{ textAlign: "center", color: "#6c757d", fontSize: "14px", marginBottom: "32px", lineHeight: 1.7 }}>
                    Masukkan email dan kata sandi untuk masuk ke dashboard.
                </p>

                {/* Form */}
                <form onSubmit={handleLogin}>
                    {/* Email */}
                    <div style={{ marginBottom: "18px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px", color: "#042C53" }}>
                            Email
                        </label>
                        <div style={{ position: "relative" }}>
                            <div style={{ position: "absolute", top: "50%", left: "14px", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                className="login-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                required
                                autoComplete="email"
                                style={{
                                    width: "100%", borderRadius: "14px",
                                    padding: "13px 16px 13px 46px",
                                    border: "1.5px solid #e5e7eb",
                                    background: "#fdfdfd",
                                    fontSize: "14px", transition: "border 0.3s, box-shadow 0.3s",
                                    boxSizing: "border-box", outline: "none",
                                    color: "#1f2937",
                                }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: "22px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px", color: "#042C53" }}>
                            Kata Sandi
                        </label>
                        <div style={{ position: "relative" }}>
                            <div style={{ position: "absolute", top: "50%", left: "14px", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPass ? "text" : "password"}
                                className="login-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                                style={{
                                    width: "100%", borderRadius: "14px",
                                    padding: "13px 46px 13px 46px",
                                    border: "1.5px solid #e5e7eb",
                                    background: "#fdfdfd",
                                    fontSize: "14px", transition: "border 0.3s, box-shadow 0.3s",
                                    boxSizing: "border-box", outline: "none",
                                    color: "#1f2937",
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                style={{
                                    position: "absolute", top: "50%", right: "14px",
                                    transform: "translateY(-50%)",
                                    background: "none", border: "none",
                                    cursor: "pointer", color: "#9ca3af", padding: 0,
                                }}
                            >
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: "#FEE2E2", color: "#991B1B",
                            padding: "12px 14px", borderRadius: "14px",
                            marginBottom: "18px",
                            display: "flex", alignItems: "center", gap: "10px",
                            fontSize: "13px",
                        }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            width: "100%", border: "none", borderRadius: "14px",
                            padding: "14px",
                            background: submitting
                                ? "#6b7280"
                                : "linear-gradient(135deg, #042C53, #0F6E56)",
                            color: "#fff", fontWeight: 700, fontSize: "15px",
                            cursor: submitting ? "not-allowed" : "pointer",
                            boxShadow: "0 10px 20px rgba(4,44,83,0.15)",
                            transition: "0.3s",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        }}
                    >
                        {submitting ? (
                            <>
                                <span style={{
                                    width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)",
                                    borderTop: "2px solid #fff", borderRadius: "50%",
                                    display: "inline-block",
                                    animation: "spin 0.8s linear infinite",
                                }} />
                                Memproses...
                            </>
                        ) : "Masuk ke Dashboard"}
                    </button>
                </form>

                <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "#7d879c", lineHeight: 1.8 }}>
                    Belum memiliki akses?<br />
                    <a href="#" style={{ color: "#042C53", textDecoration: "none", fontWeight: 700 }}>
                        Hubungi Tim Teknis Kominfo
                    </a>
                </div>
            </div>
        </div>
    );
}