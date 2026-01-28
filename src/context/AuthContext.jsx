import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('freegarden_token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is authenticated on mount
    const checkAuth = useCallback(async () => {
        const storedToken = localStorage.getItem('freegarden_token');

        if (!storedToken) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${storedToken}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setToken(storedToken);
            } else {
                // Token invalid, clear it
                localStorage.removeItem('freegarden_token');
                setToken(null);
                setUser(null);
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            localStorage.removeItem('freegarden_token');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Login function
    const login = async (email, password) => {
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Giriş başarısız');
            }

            localStorage.setItem('fabrikaa_token', data.token);
            setToken(data.token);
            setUser(data.user);

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = useCallback(() => {
        localStorage.removeItem('fabrikaa_token');
        setToken(null);
        setUser(null);
    }, []);

    // Get auth header for API calls
    const getAuthHeader = useCallback(() => {
        if (!token) return {};
        return { 'Authorization': `Bearer ${token}` };
    }, [token]);

    const value = {
        user,
        token,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        getAuthHeader,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
