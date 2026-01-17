// Certificates Data
export const certificates = [
    {
        id: 'iso-9001',
        name: 'ISO 9001:2015',
        title: 'Quality Management System',
        titleTr: 'Kalite Yönetim Sistemi',
        titleAr: 'نظام إدارة الجودة',
        titleDe: 'Qualitätsmanagementsystem',
        titleZh: '质量管理体系',
        description: 'Internationally recognized standard for quality management systems.',
        issuer: 'TÜV Rheinland',
        validUntil: '2027-12-31',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400',
    },
    {
        id: 'iso-14001',
        name: 'ISO 14001:2015',
        title: 'Environmental Management',
        titleTr: 'Çevre Yönetim Sistemi',
        titleAr: 'نظام الإدارة البيئية',
        titleDe: 'Umweltmanagementsystem',
        titleZh: '环境管理体系',
        description: 'Environmental management system certification.',
        issuer: 'TÜV Rheinland',
        validUntil: '2027-12-31',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400',
    },
    {
        id: 'ce-mark',
        name: 'CE Marking',
        title: 'European Conformity',
        titleTr: 'Avrupa Uygunluğu',
        titleAr: 'المطابقة الأوروبية',
        titleDe: 'Europäische Konformität',
        titleZh: '欧洲合格认证',
        description: 'Products meet EU safety, health, and environmental requirements.',
        issuer: 'European Commission',
        validUntil: 'Permanent',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400',
    },
    {
        id: 'reach',
        name: 'REACH Compliance',
        title: 'Chemical Safety',
        titleTr: 'Kimyasal Güvenlik',
        titleAr: 'السلامة الكيميائية',
        titleDe: 'Chemische Sicherheit',
        titleZh: '化学品安全',
        description: 'Compliant with EU regulations on chemicals.',
        issuer: 'European Chemicals Agency',
        validUntil: 'Permanent',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400',
    },
    {
        id: 'food-safe',
        name: 'Food Contact Safe',
        title: 'Food Grade Materials',
        titleTr: 'Gıdaya Uygun Malzeme',
        titleAr: 'مواد صالحة للغذاء',
        titleDe: 'Lebensmitteltaugliche Materialien',
        titleZh: '食品级材料',
        description: 'Safe for contact with food products.',
        issuer: 'FDA / EU 1935/2004',
        validUntil: 'Permanent',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400',
    },
];

// Sample Analytics Data
export const analyticsData = {
    // Product Views (last 30 days)
    productViews: [
        { id: 1, sku: 'FG-CH-001', name: 'Ergonomic Garden Chair', views: 1245, trend: 12 },
        { id: 10, sku: 'FG-SET-001', name: 'Garden Furniture Set 5pc', views: 987, trend: 8 },
        { id: 38, sku: 'FG-PL-001', name: 'Recycled Plastic Pallet', views: 856, trend: 15 },
        { id: 28, sku: 'FG-SB-001', name: 'Industrial Storage Bin', views: 743, trend: -3 },
        { id: 16, sku: 'FG-PT-001', name: 'Modern Plant Pot Small', views: 698, trend: 5 },
        { id: 18, sku: 'FG-PT-003', name: 'Large Floor Planter', views: 654, trend: 22 },
        { id: 3, sku: 'FG-CH-003', name: 'Luxury Lounge Chair', views: 612, trend: 10 },
        { id: 46, sku: 'FG-KC-001', name: 'Kids Play Stool', views: 589, trend: -5 },
        { id: 34, sku: 'FG-SC-001', name: 'Storage Cabinet Outdoor', views: 534, trend: 7 },
        { id: 23, sku: 'FG-RB-001', name: 'Raised Garden Bed', views: 498, trend: 18 },
    ],

    // Traffic by Country (last 30 days)
    countryTraffic: [
        { country: 'Germany', code: 'DE', flag: '🇩🇪', visitors: 4532, percentage: 18.2, trend: 12 },
        { country: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', visitors: 3876, percentage: 15.6, trend: 25 },
        { country: 'United Kingdom', code: 'GB', flag: '🇬🇧', visitors: 3245, percentage: 13.1, trend: 8 },
        { country: 'Turkey', code: 'TR', flag: '🇹🇷', visitors: 2987, percentage: 12.0, trend: 5 },
        { country: 'France', code: 'FR', flag: '🇫🇷', visitors: 2456, percentage: 9.9, trend: -2 },
        { country: 'Netherlands', code: 'NL', flag: '🇳🇱', visitors: 1987, percentage: 8.0, trend: 15 },
        { country: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', visitors: 1654, percentage: 6.7, trend: 32 },
        { country: 'Spain', code: 'ES', flag: '🇪🇸', visitors: 1432, percentage: 5.8, trend: 3 },
        { country: 'Poland', code: 'PL', flag: '🇵🇱', visitors: 1287, percentage: 5.2, trend: 10 },
        { country: 'Italy', code: 'IT', flag: '🇮🇹', visitors: 1098, percentage: 4.4, trend: -8 },
    ],

    // Summary Stats
    summary: {
        totalViews: 24853,
        totalVisitors: 8745,
        avgSessionDuration: '2m 34s',
        bounceRate: '32%',
        quoteRequests: 127,
        conversionRate: '1.45%',
    },

    // Daily views for chart (last 14 days)
    dailyViews: [
        { date: '2026-01-03', views: 1245 },
        { date: '2026-01-04', views: 1567 },
        { date: '2026-01-05', views: 1823 },
        { date: '2026-01-06', views: 2134 },
        { date: '2026-01-07', views: 1987 },
        { date: '2026-01-08', views: 1654 },
        { date: '2026-01-09', views: 1432 },
        { date: '2026-01-10', views: 1789 },
        { date: '2026-01-11', views: 2045 },
        { date: '2026-01-12', views: 2356 },
        { date: '2026-01-13', views: 2187 },
        { date: '2026-01-14', views: 1923 },
        { date: '2026-01-15', views: 2098 },
        { date: '2026-01-16', views: 2413 },
    ],
};

export default { certificates, analyticsData };
