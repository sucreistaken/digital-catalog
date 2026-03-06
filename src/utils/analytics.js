const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Generate or retrieve a persistent session ID
const getSessionId = () => {
    let sid = sessionStorage.getItem('fabrikaa_session');
    if (!sid) {
        sid = Date.now().toString(36) + Math.random().toString(36).slice(2);
        sessionStorage.setItem('fabrikaa_session', sid);
    }
    return sid;
};

// Fire-and-forget event tracking
export const trackEvent = (type, data = {}) => {
    try {
        const payload = {
            type,
            sessionId: getSessionId(),
            referrer: document.referrer || '',
            ...data
        };

        // Use sendBeacon if available for reliability, else fetch
        const body = JSON.stringify(payload);
        if (navigator.sendBeacon) {
            navigator.sendBeacon(`${API_BASE_URL}/analytics/track`, new Blob([body], { type: 'application/json' }));
        } else {
            fetch(`${API_BASE_URL}/analytics/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
                keepalive: true
            }).catch(() => {});
        }
    } catch {
        // Silent fail - analytics should never break the app
    }
};

// Convenience helpers
export const trackPageView = (page, brand) => trackEvent('page_view', { page, brand });
export const trackProductView = (product, brand) => trackEvent('product_view', {
    brand,
    productId: product._id || product.id,
    productName: product.name,
    productSku: product.sku || ''
});
export const trackWhatsAppClick = (brand, context = '') => trackEvent('whatsapp_click', { brand, page: context });
export const trackBrandSelect = (brand) => trackEvent('brand_select', { brand });
export const trackPdfExport = (brand) => trackEvent('catalog_pdf', { brand });

// Analytics data API (for admin panel)
export const analyticsApi = {
    getSummary: async (brand, days = 30) => {
        const params = new URLSearchParams({ days });
        if (brand) params.append('brand', brand);
        const res = await fetch(`${API_BASE_URL}/analytics/summary?${params}`);
        if (!res.ok) throw new Error('Analytics yuklenemedi');
        return res.json();
    },

    getDaily: async (brand, days = 14) => {
        const params = new URLSearchParams({ days });
        if (brand) params.append('brand', brand);
        const res = await fetch(`${API_BASE_URL}/analytics/daily?${params}`);
        if (!res.ok) throw new Error('Gunluk veriler yuklenemedi');
        return res.json();
    },

    getTopProducts: async (brand, days = 30) => {
        const params = new URLSearchParams({ days });
        if (brand) params.append('brand', brand);
        const res = await fetch(`${API_BASE_URL}/analytics/products?${params}`);
        if (!res.ok) throw new Error('Urun analizleri yuklenemedi');
        return res.json();
    },

    getEventBreakdown: async (brand, days = 30) => {
        const params = new URLSearchParams({ days });
        if (brand) params.append('brand', brand);
        const res = await fetch(`${API_BASE_URL}/analytics/events?${params}`);
        if (!res.ok) throw new Error('Event verileri yuklenemedi');
        return res.json();
    },

    getTopPages: async (brand, days = 30) => {
        const params = new URLSearchParams({ days });
        if (brand) params.append('brand', brand);
        const res = await fetch(`${API_BASE_URL}/analytics/pages?${params}`);
        if (!res.ok) throw new Error('Sayfa analizleri yuklenemedi');
        return res.json();
    }
};
