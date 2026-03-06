import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBrand as getStaticBrand, brandList as staticBrandList } from '../config/brands';
import { brandsApi } from '../utils/api';

const BrandContext = createContext(null);

// Convert API brand to the format used in the app
const normalizeBrand = (apiBrand) => ({
    id: apiBrand.id,
    name: apiBrand.name,
    tagline: apiBrand.tagline || '',
    taglineTr: apiBrand.taglineTr || '',
    email: apiBrand.email || '',
    phone: apiBrand.phone || '',
    whatsapp: apiBrand.whatsapp || '',
    website: apiBrand.website || '',
    logo: apiBrand.logo || '',
    theme: {
        '--color-primary': apiBrand.theme?.primaryColor || '#34C759',
        '--color-primary-hover': apiBrand.theme?.primaryHover || '#28A745',
        '--color-primary-light': apiBrand.theme?.primaryLight || 'rgba(52, 199, 89, 0.1)',
    },
    pdfTheme: {
        primary: hexToRgbArray(apiBrand.theme?.primaryColor || '#34C759'),
        primaryHex: apiBrand.theme?.primaryColor || '#34C759',
    },
});

// Helper: hex color to [r, g, b] array for PDF
function hexToRgbArray(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [52, 199, 89];
}

export const BrandProvider = ({ children }) => {
    const [brandId, setBrandId] = useState(() => {
        return localStorage.getItem('fabrikaa_brand') || null;
    });
    const [adminBrandId, setAdminBrandId] = useState(() => {
        return localStorage.getItem('fabrikaa_admin_brand') || 'freegarden';
    });
    const [dynamicBrands, setDynamicBrands] = useState(null);

    // Fetch brands from API on mount
    useEffect(() => {
        brandsApi.getAll()
            .then(data => {
                if (data && data.length > 0) {
                    setDynamicBrands(data.filter(b => b.isActive).map(normalizeBrand));
                }
            })
            .catch(() => {
                // API unavailable, use static fallback
            });
    }, []);

    // Persist public brand
    useEffect(() => {
        if (brandId) {
            localStorage.setItem('fabrikaa_brand', brandId);
        } else {
            localStorage.removeItem('fabrikaa_brand');
        }
    }, [brandId]);

    // Persist admin brand
    useEffect(() => {
        if (adminBrandId) {
            localStorage.setItem('fabrikaa_admin_brand', adminBrandId);
        }
    }, [adminBrandId]);

    // Get brand by id (dynamic first, then static fallback)
    const getBrand = (id) => {
        if (!id) return null;
        if (dynamicBrands) {
            return dynamicBrands.find(b => b.id === id) || null;
        }
        return getStaticBrand(id);
    };

    // Get all brands list
    const getAllBrands = () => {
        if (dynamicBrands) return dynamicBrands;
        return staticBrandList;
    };

    // Apply theme CSS variables
    useEffect(() => {
        const brand = getBrand(brandId);
        if (brand) {
            Object.entries(brand.theme).forEach(([key, value]) => {
                document.documentElement.style.setProperty(key, value);
            });
            document.title = brand.name;
        } else {
            document.title = 'Fabrikaa';
        }
    }, [brandId, dynamicBrands]);

    const setBrand = (id) => {
        setBrandId(id);
    };

    const setAdminBrand = (id) => {
        setAdminBrandId(id);
    };

    const clearBrand = () => {
        setBrandId(null);
        localStorage.removeItem('fabrikaa_brand');
        const defaultBrand = getBrand('freegarden');
        if (defaultBrand) {
            Object.entries(defaultBrand.theme).forEach(([key, value]) => {
                document.documentElement.style.setProperty(key, value);
            });
        }
        document.title = 'Fabrikaa';
    };

    const refreshBrands = async () => {
        try {
            const data = await brandsApi.getAll();
            if (data && data.length > 0) {
                setDynamicBrands(data.filter(b => b.isActive).map(normalizeBrand));
            }
        } catch {
            // ignore
        }
    };

    const brand = getBrand(brandId);
    const adminBrand = getBrand(adminBrandId);

    return (
        <BrandContext.Provider value={{
            brandId,
            brand,
            setBrand,
            clearBrand,
            adminBrandId,
            adminBrand,
            setAdminBrand,
            getAllBrands,
            refreshBrands,
        }}>
            {children}
        </BrandContext.Provider>
    );
};

export const useBrand = () => {
    const context = useContext(BrandContext);
    if (!context) {
        throw new Error('useBrand must be used within a BrandProvider');
    }
    return context;
};

export default BrandContext;
