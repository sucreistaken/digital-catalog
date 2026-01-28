import React, { useState, useEffect } from 'react';
import { Save, Loader2, Globe, Phone, Mail, MapPin, Building2, Palette, Type, Image, MousePointerClick } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { settingsApi } from '../../utils/api';
import '../Dashboard.css';

const SiteContent = () => {
    const { t } = useLanguage();
    const [activeSection, setActiveSection] = useState('hero');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    // All site content state
    const [content, setContent] = useState({
        // Hero Section
        heroBadge: 'Premium Plastic Solutions',
        heroTitle: 'Transform Your Outdoor Space with',
        heroTitleHighlight: 'Premium Plastics',
        heroSubtitle: 'Discover our collection of eco-friendly, durable plastic products designed for modern gardens and outdoor living.',

        // Features Section
        feature1Title: 'Eco-Friendly',
        feature1Desc: 'Made from sustainable materials',
        feature2Title: 'Premium Quality',
        feature2Desc: 'Built to last for years',
        feature3Title: 'Global Reach',
        feature3Desc: 'Shipping worldwide',

        // CTA Section
        ctaTitle: 'Ready to Partner with Us?',
        ctaSubtitle: 'Get in touch for wholesale pricing, custom orders, and more.',
        ctaButtonText: 'Request Quote',

        // Footer
        footerDescription: 'Leading manufacturer of premium plastic garden products. Quality and sustainability in every piece.',
        copyrightText: '© 2024 FreeGarden. All rights reserved.',

        // Contact Page
        contactTitle: 'Get in Touch',
        contactSubtitle: 'Have questions? We would love to hear from you.',
        contactFormTitle: 'Send us a message',
        contactInfoTitle: 'Contact Information'
    });

    const sections = [
        { id: 'hero', label: 'Hero Bölümü', icon: MousePointerClick, description: 'Ana sayfa üst kısım' },
        { id: 'features', label: 'Özellikler', icon: Palette, description: 'Neden biz kartları' },
        { id: 'cta', label: 'Aksiyon Çağrısı', icon: Type, description: 'Partnerlik bölümü' },
        { id: 'footer', label: 'Footer', icon: Building2, description: 'Site alt bilgi' },
        { id: 'contact', label: 'İletişim Sayfası', icon: Mail, description: 'İletişim sayfa metinleri' }
    ];

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        try {
            setLoading(true);
            const settings = await settingsApi.getAll();
            if (settings.siteContent) {
                setContent(prev => ({ ...prev, ...settings.siteContent }));
            }
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

    const handleChange = (field, value) => {
        setContent(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await settingsApi.update({ siteContent: content });
            showToast('Tüm değişiklikler kaydedildi');
            setHasChanges(false);
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setSaving(false);
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
        <div className="admin-page site-content-page">
            {/* Toast */}
            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <header className="admin-header">
                <div>
                    <h1 className="text-h2">Site İçerikleri</h1>
                    <p className="text-body">Web sitenizdeki tüm metinleri tek yerden yönetin</p>
                </div>
                <button
                    className={`btn btn-primary save-btn ${hasChanges ? 'has-changes' : ''}`}
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                >
                    {saving ? (
                        <>
                            <Loader2 size={18} className="spin" />
                            Kaydediliyor...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            {hasChanges ? 'Değişiklikleri Kaydet' : 'Kaydedildi'}
                        </>
                    )}
                </button>
            </header>

            {/* Main Content Layout */}
            <div className="content-editor-layout">
                {/* Section Navigator */}
                <nav className="section-navigator">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            className={`nav-section-btn ${activeSection === section.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(section.id)}
                        >
                            <div className="nav-icon">
                                <section.icon size={20} />
                            </div>
                            <div className="nav-text">
                                <span className="nav-label">{section.label}</span>
                                <span className="nav-desc">{section.description}</span>
                            </div>
                        </button>
                    ))}
                </nav>

                {/* Content Editor */}
                <div className="content-editor card">
                    {/* Hero Section */}
                    {activeSection === 'hero' && (
                        <div className="editor-section">
                            <div className="editor-header">
                                <MousePointerClick size={24} />
                                <div>
                                    <h3>Hero Bölümü</h3>
                                    <p>Ana sayfanın ilk görünen kısmı</p>
                                </div>
                            </div>

                            <div className="editor-fields">
                                <div className="field-group">
                                    <label>Rozet Metni</label>
                                    <input
                                        type="text"
                                        value={content.heroBadge}
                                        onChange={e => handleChange('heroBadge', e.target.value)}
                                        placeholder="Premium Plastic Solutions"
                                    />
                                    <span className="field-hint">Üst kısımdaki küçük etiket</span>
                                </div>

                                <div className="field-row">
                                    <div className="field-group">
                                        <label>Ana Başlık</label>
                                        <input
                                            type="text"
                                            value={content.heroTitle}
                                            onChange={e => handleChange('heroTitle', e.target.value)}
                                        />
                                    </div>
                                    <div className="field-group">
                                        <label>Vurgulanan Kısım</label>
                                        <input
                                            type="text"
                                            value={content.heroTitleHighlight}
                                            onChange={e => handleChange('heroTitleHighlight', e.target.value)}
                                        />
                                        <span className="field-hint">Yeşil renkte görünür</span>
                                    </div>
                                </div>

                                <div className="field-group">
                                    <label>Alt Başlık</label>
                                    <textarea
                                        value={content.heroSubtitle}
                                        onChange={e => handleChange('heroSubtitle', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Features Section */}
                    {activeSection === 'features' && (
                        <div className="editor-section">
                            <div className="editor-header">
                                <Palette size={24} />
                                <div>
                                    <h3>Özellikler</h3>
                                    <p>"Neden Bizi Seçmelisiniz" kartları</p>
                                </div>
                            </div>

                            <div className="editor-fields">
                                <div className="feature-card-editor">
                                    <div className="feature-number">1</div>
                                    <div className="feature-fields">
                                        <div className="field-group">
                                            <label>Başlık</label>
                                            <input
                                                type="text"
                                                value={content.feature1Title}
                                                onChange={e => handleChange('feature1Title', e.target.value)}
                                            />
                                        </div>
                                        <div className="field-group">
                                            <label>Açıklama</label>
                                            <input
                                                type="text"
                                                value={content.feature1Desc}
                                                onChange={e => handleChange('feature1Desc', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="feature-card-editor">
                                    <div className="feature-number">2</div>
                                    <div className="feature-fields">
                                        <div className="field-group">
                                            <label>Başlık</label>
                                            <input
                                                type="text"
                                                value={content.feature2Title}
                                                onChange={e => handleChange('feature2Title', e.target.value)}
                                            />
                                        </div>
                                        <div className="field-group">
                                            <label>Açıklama</label>
                                            <input
                                                type="text"
                                                value={content.feature2Desc}
                                                onChange={e => handleChange('feature2Desc', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="feature-card-editor">
                                    <div className="feature-number">3</div>
                                    <div className="feature-fields">
                                        <div className="field-group">
                                            <label>Başlık</label>
                                            <input
                                                type="text"
                                                value={content.feature3Title}
                                                onChange={e => handleChange('feature3Title', e.target.value)}
                                            />
                                        </div>
                                        <div className="field-group">
                                            <label>Açıklama</label>
                                            <input
                                                type="text"
                                                value={content.feature3Desc}
                                                onChange={e => handleChange('feature3Desc', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTA Section */}
                    {activeSection === 'cta' && (
                        <div className="editor-section">
                            <div className="editor-header">
                                <Type size={24} />
                                <div>
                                    <h3>Aksiyon Çağrısı (CTA)</h3>
                                    <p>Partnerlik teklif bölümü</p>
                                </div>
                            </div>

                            <div className="editor-fields">
                                <div className="field-group">
                                    <label>Başlık</label>
                                    <input
                                        type="text"
                                        value={content.ctaTitle}
                                        onChange={e => handleChange('ctaTitle', e.target.value)}
                                    />
                                </div>
                                <div className="field-group">
                                    <label>Alt Başlık</label>
                                    <input
                                        type="text"
                                        value={content.ctaSubtitle}
                                        onChange={e => handleChange('ctaSubtitle', e.target.value)}
                                    />
                                </div>
                                <div className="field-group">
                                    <label>Buton Metni</label>
                                    <input
                                        type="text"
                                        value={content.ctaButtonText}
                                        onChange={e => handleChange('ctaButtonText', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Section */}
                    {activeSection === 'footer' && (
                        <div className="editor-section">
                            <div className="editor-header">
                                <Building2 size={24} />
                                <div>
                                    <h3>Footer</h3>
                                    <p>Site alt bilgi alanı</p>
                                </div>
                            </div>

                            <div className="editor-fields">
                                <div className="field-group">
                                    <label>Şirket Açıklaması</label>
                                    <textarea
                                        value={content.footerDescription}
                                        onChange={e => handleChange('footerDescription', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className="field-group">
                                    <label>Copyright Metni</label>
                                    <input
                                        type="text"
                                        value={content.copyrightText}
                                        onChange={e => handleChange('copyrightText', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Section */}
                    {activeSection === 'contact' && (
                        <div className="editor-section">
                            <div className="editor-header">
                                <Mail size={24} />
                                <div>
                                    <h3>İletişim Sayfası</h3>
                                    <p>İletişim sayfası başlıkları</p>
                                </div>
                            </div>

                            <div className="editor-fields">
                                <div className="field-row">
                                    <div className="field-group">
                                        <label>Sayfa Başlığı</label>
                                        <input
                                            type="text"
                                            value={content.contactTitle}
                                            onChange={e => handleChange('contactTitle', e.target.value)}
                                        />
                                    </div>
                                    <div className="field-group">
                                        <label>Alt Başlık</label>
                                        <input
                                            type="text"
                                            value={content.contactSubtitle}
                                            onChange={e => handleChange('contactSubtitle', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="field-row">
                                    <div className="field-group">
                                        <label>Form Başlığı</label>
                                        <input
                                            type="text"
                                            value={content.contactFormTitle}
                                            onChange={e => handleChange('contactFormTitle', e.target.value)}
                                        />
                                    </div>
                                    <div className="field-group">
                                        <label>Bilgi Başlığı</label>
                                        <input
                                            type="text"
                                            value={content.contactInfoTitle}
                                            onChange={e => handleChange('contactInfoTitle', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SiteContent;
