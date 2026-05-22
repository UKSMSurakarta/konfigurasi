import { createContext, useContext, useState, useEffect } from "react";
import { loginApi, getMeApi, logoutApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const token = localStorage.getItem("uksm_token");
        if (!token) {
            setLoading(false);
            return;
        }
        getMeApi()
            .then((res) => {
                if (res.success) {
                    setUser(res.data);
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

    async function login(email, password) {
        try {
            const res = await loginApi(email, password);
            if (res.success) {
                const { access_token, user: userData } = res.data;
                localStorage.setItem("uksm_token", access_token);
                localStorage.setItem("uksm_user", JSON.stringify(userData));
                setUser(userData);
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
        } catch (_) {
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
