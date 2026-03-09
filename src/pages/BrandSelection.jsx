import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { useBrand, getDomainForBrand } from '../context/BrandContext';
import { useLanguage } from '../context/LanguageContext';
import { trackBrandSelect } from '../utils/analytics';
import './BrandSelection.css';

const SLIDESHOW_IMAGES = [
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&q=80',
    'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=1920&q=80',
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebb6da8?w=1920&q=80',
    'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1920&q=80',
];

const BrandSelection = () => {
    const navigate = useNavigate();
    const { setBrand, getAllBrands, domainBrand } = useBrand();
    const { language } = useLanguage();
    const [currentSlide, setCurrentSlide] = useState(0);

    const brands = getAllBrands();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDESHOW_IMAGES.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

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
            {/* Background slideshow */}
            <div className="brand-slideshow">
                {SLIDESHOW_IMAGES.map((src, i) => (
                    <div
                        key={i}
                        className={`brand-slide ${i === currentSlide ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${src})` }}
                    />
                ))}
                <div className="brand-slideshow-overlay" />
            </div>

            {/* Content */}
            <div className="brand-selection-content">
                <div className="brand-selection-header">
                    <h1 className="brand-selection-title">Fatih Plastik</h1>
                    <p className="brand-selection-subtitle">
                        {language === 'tr' ? 'Markamizi secin' : 'Select our brand'}
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
                                {language === 'tr' ? brand.taglineTr : brand.tagline}
                            </p>
                            <div className="brand-card-accent" />
                        </button>
                    ))}
                </div>
                <Link to="/showroom" className="showroom-hint">
                    <Eye size={16} />
                    {language === 'tr' ? 'Showroom\'a goz at' : 'Browse Showroom'}
                </Link>
            </div>
        </div>
    );
};

export default BrandSelection;
