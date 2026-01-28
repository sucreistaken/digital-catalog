import React, { useState, useEffect } from 'react';
import { Save, Upload, Globe, Phone, Mail, MapPin, Loader2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { settingsApi } from '../../utils/api';
import '../Dashboard.css';

const Settings = () => {
    const { t } = useLanguage();
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
