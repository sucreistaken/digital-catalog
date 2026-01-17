import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Package, Folder, MessageSquare, Users, Settings, LogOut, ChevronDown, BarChart2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/layout.css';

// Language Switcher Component
const LanguageSwitcher = () => {
    const { language, setLanguage, languages, currentLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="language-switcher">
            <button className="language-btn" onClick={() => setIsOpen(!isOpen)}>
                <span className="lang-flag">{currentLanguage?.flag}</span>
                <span className="lang-code">{language.toUpperCase()}</span>
                <ChevronDown size={16} />
            </button>
            {isOpen && (
                <div className="language-dropdown">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            className={`lang-option ${language === lang.code ? 'active' : ''}`}
                            onClick={() => { setLanguage(lang.code); setIsOpen(false); }}
                        >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Public Layout
const PublicLayout = ({ children }) => {
    const { t, language } = useLanguage();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = [
        { path: '/', label: t('home') },
        { path: '/catalog', label: t('catalog') },
        { path: '/showroom', label: 'Showroom' },
        { path: '/certificates', label: 'Certificates' },
        { path: '/contact', label: t('contact') },
    ];

    return (
        <div className="public-layout">
            <nav className="navbar">
                <Link to="/" className="brand">
                    <span className="brand-free">free</span>
                    <span className="brand-garden">garden</span>
                </Link>

                <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="nav-actions">
                    <LanguageSwitcher />
                    <Link to="/admin/dashboard" className="btn btn-primary btn-sm">
                        {t('adminPanel')}
                    </Link>
                    <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            <main className="page-content">{children}</main>

            <footer className="footer">
                <div className="footer-main container">
                    <div className="footer-section footer-about">
                        <div className="footer-brand">
                            <span className="brand-free">free</span>
                            <span className="brand-garden">garden</span>
                        </div>
                        <p className="footer-tagline">{t('premiumPlasticProducts')}</p>
                        <p className="footer-description">
                            {language === 'tr'
                                ? 'Yüksek kaliteli plastik bahçe mobilyaları ve dış mekan ürünleri üreticisi. 20+ yıllık deneyim.'
                                : 'Manufacturer of high-quality plastic garden furniture and outdoor products. 20+ years of experience.'
                            }
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4>{language === 'tr' ? 'Hızlı Bağlantılar' : 'Quick Links'}</h4>
                        <nav className="footer-links">
                            <Link to="/catalog">{t('catalog')}</Link>
                            <Link to="/showroom">Showroom</Link>
                            <Link to="/certificates">{language === 'tr' ? 'Sertifikalar' : 'Certificates'}</Link>
                            <Link to="/contact">{t('contact')}</Link>
                        </nav>
                    </div>

                    <div className="footer-section">
                        <h4>{language === 'tr' ? 'İletişim' : 'Contact'}</h4>
                        <div className="footer-contact-list">
                            <a href="tel:+905001234567" className="contact-item">
                                <span className="contact-icon">📞</span>
                                <span>+90 500 123 45 67</span>
                            </a>
                            <a href="https://wa.me/905001234567" target="_blank" rel="noopener" className="contact-item whatsapp">
                                <span className="contact-icon">💬</span>
                                <span>WhatsApp</span>
                            </a>
                            <a href="mailto:info@freegarden.com" className="contact-item">
                                <span className="contact-icon">✉️</span>
                                <span>info@freegarden.com</span>
                            </a>
                            <div className="contact-item">
                                <span className="contact-icon">📍</span>
                                <span>{language === 'tr' ? 'İstanbul, Türkiye' : 'Istanbul, Turkey'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4>{language === 'tr' ? 'Bizi Takip Edin' : 'Follow Us'}</h4>
                        <div className="social-links">
                            <a href="#" className="social-link" aria-label="Facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                            </a>
                            <a href="#" className="social-link" aria-label="LinkedIn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                            </a>
                            <a href="#" className="social-link" aria-label="YouTube">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="container footer-bottom-content">
                        <p>© 2026 FreeGarden. {t('allRightsReserved')}</p>
                        <div className="footer-legal">
                            <a href="#">{language === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}</a>
                            <a href="#">{language === 'tr' ? 'Kullanım Şartları' : 'Terms of Service'}</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Admin Layout
const AdminLayout = ({ children }) => {
    const { t } = useLanguage();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: t('dashboard') },
        { path: '/admin/products', icon: Package, label: t('products') },
        { path: '/admin/categories', icon: Folder, label: t('categories') },
        { path: '/admin/quotes', icon: MessageSquare, label: t('quoteRequests') },
        { path: '/admin/customers', icon: Users, label: t('customers') },
        { path: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
        { path: '/admin/settings', icon: Settings, label: t('settings') },
    ];

    return (
        <div className="admin-layout">
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <Link to="/" className="brand">
                        <span className="brand-free">free</span>
                        <span className="brand-garden">garden</span>
                    </Link>
                    <span className="admin-badge">Admin</span>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <LanguageSwitcher />
                    <Link to="/" className="sidebar-item">
                        <LogOut size={20} />
                        <span>{t('exitAdmin')}</span>
                    </Link>
                </div>
            </aside>

            <main className="main-content">
                <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Menu size={24} />
                </button>
                {children}
            </main>
        </div>
    );
};

// Main Layout Component
const Layout = ({ children, type = 'public' }) => {
    if (type === 'admin') {
        return <AdminLayout>{children}</AdminLayout>;
    }
    return <PublicLayout>{children}</PublicLayout>;
};

export default Layout;
