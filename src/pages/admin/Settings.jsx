import React, { useState, useEffect } from 'react';
import { Save, Upload, Globe, Phone, Mail, MapPin, Loader2, RefreshCw, Lock, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { settingsApi } from '../../utils/api';
import '../Dashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const Settings = () => {
    const { t } = useLanguage();
    const { user, token } = useAuth();
    const [credentials, setCredentials] = useState({
        currentPassword: '',
        newUsername: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [credSaving, setCredSaving] = useState(false);
    const [settings, setSettings] = useState({
        companyName: '',
        email: '',
        phone: '',
        whatsapp: '',
        address: '',
        website: '',
        defaultLanguage: 'en',
        instagram: '',
        facebook: '',
        linkedin: ''
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await settingsApi.getAll();
            setSettings(prev => ({ ...prev, ...data }));
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await settingsApi.update(settings);
            showToast('Ayarlar kaydedildi');
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCredentialsSave = async () => {
        if (!credentials.currentPassword) {
            showToast('Mevcut şifre gerekli', 'error');
            return;
        }
        if (credentials.newPassword && credentials.newPassword !== credentials.confirmPassword) {
            showToast('Yeni şifreler eşleşmiyor', 'error');
            return;
        }
        try {
            setCredSaving(true);
            const res = await fetch(`${API_BASE_URL}/auth/credentials`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: credentials.currentPassword,
                    newUsername: credentials.newUsername || undefined,
                    newPassword: credentials.newPassword || undefined
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showToast('Giriş bilgileri güncellendi');
            setCredentials({ currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setCredSaving(false);
        }
    };

    const handleSeedDefaults = async () => {
        if (!window.confirm('Varsayılan ayarları yüklemek istediğinize emin misiniz?')) return;

        try {
            await settingsApi.seed();
            showToast('Varsayılan ayarlar yüklendi');
            loadSettings();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="loading-state">
                    <Loader2 size={32} className="spin" />
                    <p>Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            {/* Toast */}
            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.message}
                </div>
            )}

            <header className="admin-header">
                <div>
                    <h1 className="text-h2">{t('settings')}</h1>
                    <p className="text-body">Katalog ayarlarını yapılandırın</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={handleSeedDefaults}>
                        <RefreshCw size={18} />
                        Varsayılanlar
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 size={18} className="spin" />
                                Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Kaydet
                            </>
                        )}
                    </button>
                </div>
            </header>

            <div className="settings-grid">
                {/* Company Info */}
                <div className="settings-section card">
                    <h3>Şirket Bilgileri</h3>
                    <div className="form-group">
                        <label>Şirket Adı</label>
                        <input
                            type="text"
                            value={settings.companyName}
                            onChange={e => setSettings({ ...settings, companyName: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Logo</label>
                        <div className="logo-upload">
                            <div className="logo-preview">
                                <span className="brand-free">free</span>
                                <span className="brand-garden">garden</span>
                            </div>
                            <button className="btn btn-secondary btn-sm">
                                <Upload size={14} /> Yeni Yükle
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="settings-section card">
                    <h3>İletişim Bilgileri</h3>
                    <div className="form-group">
                        <label><Mail size={16} /> Email</label>
                        <input
                            type="email"
                            value={settings.email}
                            onChange={e => setSettings({ ...settings, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label><Phone size={16} /> Telefon</label>
                        <input
                            type="tel"
                            value={settings.phone}
                            onChange={e => setSettings({ ...settings, phone: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>💬 WhatsApp</label>
                        <input
                            type="tel"
                            value={settings.whatsapp}
                            onChange={e => setSettings({ ...settings, whatsapp: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label><MapPin size={16} /> Adres</label>
                        <input
                            type="text"
                            value={settings.address}
                            onChange={e => setSettings({ ...settings, address: e.target.value })}
                        />
                    </div>
                </div>

                {/* Website Settings */}
                <div className="settings-section card">
                    <h3>Web Sitesi Ayarları</h3>
                    <div className="form-group">
                        <label><Globe size={16} /> Website URL</label>
                        <input
                            type="text"
                            value={settings.website}
                            onChange={e => setSettings({ ...settings, website: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Varsayılan Dil</label>
                        <select
                            value={settings.defaultLanguage}
                            onChange={e => setSettings({ ...settings, defaultLanguage: e.target.value })}
                        >
                            <option value="en">English</option>
                            <option value="tr">Türkçe</option>
                            <option value="ar">العربية</option>
                            <option value="de">Deutsch</option>
                            <option value="zh">中文</option>
                        </select>
                    </div>
                </div>

                {/* Account Credentials */}
                <div className="settings-section card">
                    <h3><Lock size={18} /> Giriş Bilgileri</h3>
                    <div className="form-group">
                        <label><User size={16} /> Yeni Kullanıcı Adı</label>
                        <input
                            type="text"
                            value={credentials.newUsername}
                            onChange={e => setCredentials({ ...credentials, newUsername: e.target.value })}
                            placeholder={user?.username || 'Yeni kullanıcı adı'}
                        />
                    </div>
                    <div className="form-group">
                        <label><Lock size={16} /> Yeni Şifre</label>
                        <input
                            type="password"
                            value={credentials.newPassword}
                            onChange={e => setCredentials({ ...credentials, newPassword: e.target.value })}
                            placeholder="Yeni şifre"
                        />
                    </div>
                    <div className="form-group">
                        <label><Lock size={16} /> Yeni Şifre (Tekrar)</label>
                        <input
                            type="password"
                            value={credentials.confirmPassword}
                            onChange={e => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                            placeholder="Yeni şifre tekrar"
                        />
                    </div>
                    <div className="form-group">
                        <label><Lock size={16} /> Mevcut Şifre (onay için)</label>
                        <input
                            type="password"
                            value={credentials.currentPassword}
                            onChange={e => setCredentials({ ...credentials, currentPassword: e.target.value })}
                            placeholder="Mevcut şifreniz"
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleCredentialsSave} disabled={credSaving} style={{ marginTop: '8px' }}>
                        {credSaving ? <><Loader2 size={18} className="spin" /> Kaydediliyor...</> : <><Save size={18} /> Bilgileri Güncelle</>}
                    </button>
                </div>

                {/* Social Media */}
                <div className="settings-section card">
                    <h3>Sosyal Medya</h3>
                    <div className="form-group">
                        <label>📸 Instagram</label>
                        <input
                            type="text"
                            value={settings.instagram}
                            onChange={e => setSettings({ ...settings, instagram: e.target.value })}
                            placeholder="https://instagram.com/..."
                        />
                    </div>
                    <div className="form-group">
                        <label>📘 Facebook</label>
                        <input
                            type="text"
                            value={settings.facebook}
                            onChange={e => setSettings({ ...settings, facebook: e.target.value })}
                            placeholder="https://facebook.com/..."
                        />
                    </div>
                    <div className="form-group">
                        <label>💼 LinkedIn</label>
                        <input
                            type="text"
                            value={settings.linkedin}
                            onChange={e => setSettings({ ...settings, linkedin: e.target.value })}
                            placeholder="https://linkedin.com/company/..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
