import React, { useState } from 'react';
import { Save, Upload, Globe, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import '../Dashboard.css';

const Settings = () => {
    const { t } = useLanguage();
    const [settings, setSettings] = useState({
        companyName: 'FreeGarden',
        email: 'info@freegarden.com',
        phone: '+90 500 123 45 67',
        whatsapp: '+90 500 123 45 67',
        address: 'Adana, Turkey',
        website: 'www.freegarden.com',
        defaultLanguage: 'en',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 1000));
        setIsSaving(false);
        alert('Settings saved successfully!');
    };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="text-h2">{t('settings')}</h1>
                    <p className="text-body">Configure your catalog settings</p>
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </header>

            <div className="settings-grid">
                {/* Company Info */}
                <div className="settings-section card">
                    <h3>Company Information</h3>
                    <div className="form-group">
                        <label>Company Name</label>
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
                                <Upload size={14} /> Upload New
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="settings-section card">
                    <h3>Contact Information</h3>
                    <div className="form-group">
                        <label><Mail size={16} /> Email</label>
                        <input
                            type="email"
                            value={settings.email}
                            onChange={e => setSettings({ ...settings, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label><Phone size={16} /> Phone</label>
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
                        <label><MapPin size={16} /> Address</label>
                        <input
                            type="text"
                            value={settings.address}
                            onChange={e => setSettings({ ...settings, address: e.target.value })}
                        />
                    </div>
                </div>

                {/* Website Settings */}
                <div className="settings-section card">
                    <h3>Website Settings</h3>
                    <div className="form-group">
                        <label><Globe size={16} /> Website URL</label>
                        <input
                            type="text"
                            value={settings.website}
                            onChange={e => setSettings({ ...settings, website: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Default Language</label>
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
            </div>
        </div>
    );
};

export default Settings;
