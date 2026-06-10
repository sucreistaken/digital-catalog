import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { useBrand, getDomainForBrand } from '../context/BrandContext';
import { useLanguage } from '../context/LanguageContext';
import { trackBrandSelect } from '../utils/analytics';
import './BrandSelection.css';

const BrandSelection = () => {
    const navigate = useNavigate();
    const { setBrand, getAllBrands, domainBrand } = useBrand();
    const { language } = useLanguage();
    const tr = language === 'tr';

    const brands = getAllBrands();

    const handleSelect = (brandId) => {
        trackBrandSelect(brandId);
        // If on a mapped domain and selecting a different brand, redirect to that brand's domain
        const targetDomain = getDomainForBrand(brandId);
        if (domainBrand && brandId !== domainBrand && targetDomain) {
            window.location.href = targetDomain + '/home';
            return;
        }
        setBrand(brandId);
        navigate('/home');
    };

    return (
        <div className="brand-selection">
            {/* Background video */}
            <div className="brand-slideshow">
                <video
                    className="brand-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="/fatih-plastik-hero-poster.jpg"
                >
                    <source src="/fatih-plastik-hero.mp4" type="video/mp4" />
                </video>
                <div className="brand-slideshow-overlay" />
            </div>

            {/* Content */}
            <div className="brand-selection-content">
                <div className="brand-selection-header">
                    <h1 className="brand-selection-title">Fatih Plastik</h1>
                    <p className="brand-selection-subtitle">
                        {tr ? 'Hangi ürün grubunu incelemek istersiniz?' : 'Which product group would you like to explore?'}
                    </p>
                </div>
                <div className="brand-cards">
                    {brands.map((brand) => (
                        <button
                            key={brand.id}
                            className="brand-card"
                            onClick={() => handleSelect(brand.id)}
                            style={{ '--brand-accent': brand.theme['--color-primary'] }}
                        >
                            <div className="brand-card-logo">
                                {brand.logo ? (
                                    <img src={brand.logo} alt={brand.name} />
                                ) : (
                                    <span className="brand-card-text-logo" style={{ color: brand.theme['--color-primary'] }}>
                                        {brand.name}
                                    </span>
                                )}
                            </div>
                            <h2 className="brand-card-name">{brand.name}</h2>
                            <p className="brand-card-tagline">
                                {tr ? brand.taglineTr : brand.tagline}
                            </p>
                            <div className="brand-card-accent" />
                        </button>
                    ))}
                </div>
                <Link to="/showroom" className="showroom-hint">
                    <Eye size={16} />
                    {tr ? "Showroom'a göz at" : 'Browse Showroom'}
                </Link>
            </div>
        </div>
    );
};

export default BrandSelection;
