import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Package, Folder, MessageSquare, Users, Settings, LogOut, ChevronDown, BarChart2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/layout.css';
import WhatsAppButton from './WhatsAppButton';

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

            <footer className="footer-pro">
                <div className="footer-top container">
                    <div className="footer-brand-col">
                        <div className="footer-logo">
                            <span className="brand-free">free</span>
                            <span className="brand-garden">garden</span>
                        </div>
                        <p className="footer-desc">
                            {language === 'tr'
                                ? 'Modern yaşam alanları için üstün kaliteli, dayanıklı ve estetik plastik çözümler.'
                                : 'Premium quality, durable and aesthetic plastic solutions for modern living spaces.'
                            }
                        </p>
                        <div className="footer-social">
                            <a href="#" className="social-icon" aria-label="Instagram">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </a>
                            <a href="#" className="social-icon" aria-label="LinkedIn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                            </a>
                            <a href="#" className="social-icon" aria-label="Facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                            </a>
                        </div>
                    </div>

                    <div className="footer-group">
                        <h4>{language === 'tr' ? 'Keşfet' : 'Discover'}</h4>
                        <nav>
                            <Link to="/catalog">{t('catalog')}</Link>
                            <Link to="/showroom">Showroom</Link>
                            <Link to="/certificates">{language === 'tr' ? 'Sertifikalar' : 'Certificates'}</Link>
                            <Link to="/quote">{t('offer')}</Link>
                        </nav>
                    </div>

                    <div className="footer-group">
                        <h4>{language === 'tr' ? 'Kurumsal' : 'Corporate'}</h4>
                        <nav>
                            <Link to="/about">{language === 'tr' ? 'Hakkımızda' : 'About Us'}</Link>
                            <Link to="/contact">{t('contact')}</Link>
                            <Link to="/faq">{language === 'tr' ? 'S.S.S.' : 'FAQ'}</Link>
                        </nav>
                    </div>

                    <div className="footer-newsletter-col">
                        <h4>{language === 'tr' ? 'Bülten' : 'Newsletter'}</h4>
                        <p>{language === 'tr' ? 'Yeniliklerden ve özel tekliflerden haberdar olun.' : 'Stay updated with our latest news and special offers.'}</p>
                        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <input type="email" placeholder="Email Address" />
                            <button type="submit" aria-label="Subscribe">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </button>
                        </form>
                        <div className="footer-contact-mini">
                            <a href="mailto:info@freegarden.com">info@freegarden.com</a>
                            <a href="tel:+905001234567">+90 500 123 45 67</a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom-pro">
                    <div className="container footer-bottom-inner">
                        <div className="footer-copyright">
                            <span>© 2026 FreeGarden. {t('allRightsReserved')}</span>
                        </div>
                        <div className="footer-legal">
                            <a href="#">{language === 'tr' ? 'Gizlilik' : 'Privacy'}</a>
                            <a href="#">{language === 'tr' ? 'Şartlar' : 'Terms'}</a>
                            <a href="#">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>

            <WhatsAppButton />
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
