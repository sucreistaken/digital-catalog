import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBrand } from '../config/brands';

const BrandContext = createContext(null);

export const BrandProvider = ({ children }) => {
    const [brandId, setBrandId] = useState(() => {
        return localStorage.getItem('fabrikaa_brand') || null;
    });
    const [adminBrandId, setAdminBrandId] = useState(() => {
        return localStorage.getItem('fabrikaa_admin_brand') || 'freegarden';
    });

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
    }, [brandId]);

    const setBrand = (id) => {
        setBrandId(id);
    };

    const setAdminBrand = (id) => {
        setAdminBrandId(id);
    };

    const clearBrand = () => {
        setBrandId(null);
        localStorage.removeItem('fabrikaa_brand');
        // Reset CSS variables to defaults
        const defaultBrand = getBrand('freegarden');
        if (defaultBrand) {
            Object.entries(defaultBrand.theme).forEach(([key, value]) => {
                document.documentElement.style.setProperty(key, value);
            });
        }
        document.title = 'Fabrikaa';
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
