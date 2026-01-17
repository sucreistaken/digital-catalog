import React from 'react';
import { ArrowRight, Leaf, Package, Globe, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Home.css';

const Home = () => {
    const { t } = useLanguage();

    const features = [
        { icon: Leaf, title: t('ecoFriendly'), description: t('ecoFriendlyDesc') },
        { icon: Package, title: t('premiumQuality'), description: t('premiumQualityDesc') },
        { icon: Globe, title: t('globalReach'), description: t('globalReachDesc') },
    ];

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content container">
                    <div className="hero-badge">
                        <Sparkles size={16} />
                        Premium Plastic Solutions
                    </div>
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
                        <Link to="/quote" className="btn btn-secondary btn-lg">
                            {t('requestQuote')}
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
                            <h2 className="text-h2">Ready to Partner with Us?</h2>
                            <p className="text-body">Get in touch for wholesale pricing, custom orders, and more.</p>
                        </div>
                        <Link to="/quote" className="btn btn-primary btn-lg">
                            {t('requestQuote')}
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
