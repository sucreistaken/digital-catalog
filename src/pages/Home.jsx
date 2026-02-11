import React from 'react';
import { ArrowRight, Leaf, Package, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Home.css';

const Home = () => {
    const { t, language } = useLanguage();

    const features = [
        { icon: Leaf, title: t('ecoFriendly'), description: t('ecoFriendlyDesc') },
        { icon: Package, title: t('premiumQuality'), description: t('premiumQualityDesc') },
        { icon: Globe, title: t('globalReach'), description: t('globalReachDesc') },
    ];

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-video-bg">
                    <video autoPlay muted loop playsInline>
                        <source src="https://assets.mixkit.co/videos/14631/14631-720.mp4" type="video/mp4" />
                    </video>
                    <div className="hero-video-overlay" />
                </div>
                <div className="hero-content container">
                    <h1 className="hero-title">
                        {t('heroTitle')}
                        <span className="highlight"> {t('heroTitleHighlight')}</span>
                    </h1>
                    <p className="hero-subtitle">{t('heroSubtitle')}</p>
                    <div className="hero-cta">
                        <Link to="/catalog" className="btn btn-primary btn-lg">
                            {t('exploreCatalog')}
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <div className="features-header">
                        <h2 className="text-h2">{t('whyChooseUs')}</h2>
                        <p className="text-body">{t('builtWithQuality')}</p>
                    </div>
                    <div className="features-grid">
                        {features.map((feature, idx) => (
                            <div key={idx} className="feature-card">
                                <div className="feature-icon">
                                    <feature.icon size={28} />
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <div className="cta-content">
                            <h2 className="text-h2">{language === 'tr' ? 'Bizimle İletişime Geçin' : 'Get in Touch'}</h2>
                            <p className="text-body">{language === 'tr' ? 'Sorularınız ve işbirliği için bize ulaşın.' : 'Reach out to us for questions and collaboration.'}</p>
                        </div>
                        <Link to="/contact" className="btn btn-primary btn-lg">
                            {language === 'tr' ? 'İletişim' : 'Contact'}
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
