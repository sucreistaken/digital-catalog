import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loading, error } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const from = location.state?.from?.pathname || '/admin/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (!email || !password) {
            setLocalError('Email ve şifre gerekli');
            return;
        }

        const result = await login(email, password);

        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setLocalError(result.error);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Background decoration */}
                <div className="login-bg-decoration">
                    <div className="decoration-circle circle-1"></div>
                    <div className="decoration-circle circle-2"></div>
                    <div className="decoration-circle circle-3"></div>
                </div>

                {/* Login card */}
                <div className="login-card">
                    {/* Logo & Header */}
                    <div className="login-header">
                        <div className="login-logo">
                            <span className="brand-free">free</span>
                            <span className="brand-garden">garden</span>
                        </div>
                        <h1>Admin Paneli</h1>
                        <p>Devam etmek için giriş yapın</p>
                    </div>

                    {/* Error message */}
                    {(localError || error) && (
                        <div className="login-error">
                            <span>⚠️ {localError || error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">
                                <Mail size={18} />
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@freegarden.com"
                                autoComplete="email"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                <Lock size={18} />
                                Şifre
                            </label>
                            <div className="password-input">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="spin" />
                                    Giriş yapılıyor...
                                </>
                            ) : (
                                'Giriş Yap'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="login-footer">
                        <p>© 2026 FreeGarden. Tüm hakları saklıdır.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
