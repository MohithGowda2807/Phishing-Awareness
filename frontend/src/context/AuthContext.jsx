import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, logout as apiLogout } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const userData = await getCurrentUser();
            if (userData && userData._id) {
                // Successfully got full user data from /users/me
                setUser(userData);
            } else if (userData && userData.message) {
                // Error response
                localStorage.removeItem("token");
                setUser(null);
            } else {
                localStorage.removeItem("token");
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            localStorage.removeItem("token");
            setUser(null);
        }
        setLoading(false);
    };

    const login = async (token) => {
        localStorage.setItem("token", token);
        // Fetch full user data after login
        try {
            const userData = await getCurrentUser();
            if (userData && userData._id) {
                setUser(userData);
                return true;
            }
        } catch (error) {
            console.error("Failed to fetch user after login:", error);
        }
        return false;
    };

    const logout = () => {
        apiLogout();
        setUser(null);
        window.location.href = "/login";
    };

    const refreshUser = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const userData = await getCurrentUser();
            if (userData && userData._id) {
                setUser(userData);
            }
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
