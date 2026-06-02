/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { loginApi, getMeApi, logoutApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(() => !!localStorage.getItem("uksm_token"));

    // inline normalization helper removed (do normalization where needed)

    // Restore session on mount
    useEffect(() => {
        const token = localStorage.getItem("uksm_token");
        if (!token) return;
        getMeApi()
            .then((res) => {
                if (res.success) {
                    const u = res.data;
                    const normalized = { ...(u || {}) };
                    if (normalized.sekolah && !normalized.school) normalized.school = normalized.sekolah;
                    if (normalized.school && !normalized.sekolah) normalized.sekolah = normalized.school;
                    console.log('[AuthContext] getMeApi success:', { role: normalized.role, user: normalized });
                    setUser(normalized);
                } else {
                    localStorage.removeItem("uksm_token");
                    localStorage.removeItem("uksm_user");
                }
            })
            .catch(() => {
                localStorage.removeItem("uksm_token");
                localStorage.removeItem("uksm_user");
            })
            .finally(() => setLoading(false));
    }, []);

    async function login(email, password, turnstileToken) {
        try {
            const res = await loginApi(email, password, turnstileToken);
            if (res.success) {
                const { access_token, user: userData } = res.data;
                localStorage.setItem("uksm_token", access_token);
                localStorage.setItem("uksm_user", JSON.stringify(userData));
                const normalized = { ...(userData || {}) };
                if (normalized.sekolah && !normalized.school) normalized.school = normalized.sekolah;
                if (normalized.school && !normalized.sekolah) normalized.sekolah = normalized.school;
                console.log('[AuthContext] login success:', { role: normalized.role, user: normalized });
                setUser(normalized);
                return { ok: true, role: userData.role };
            }
            return { ok: false, message: res.message || "Login gagal" };
        } catch (error) {
            if (error.response && error.response.data) {
                return { ok: false, message: error.response.data.message || "Login gagal" };
            }
            throw error;
        }
    }

    async function logout() {
        try {
            await logoutApi();
        } catch {
            // ignore
        } finally {
            localStorage.removeItem("uksm_token");
            localStorage.removeItem("uksm_user");
            setUser(null);
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
