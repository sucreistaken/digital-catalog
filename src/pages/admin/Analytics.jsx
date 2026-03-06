import React, { useState, useEffect } from 'react';
import { Eye, Users, Package, TrendingUp, TrendingDown, Clock, MousePointer, Loader2, MessageCircle, FileDown, Tag, BarChart3 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBrand } from '../../context/BrandContext';
import { analyticsApi } from '../../utils/analytics';
import '../Dashboard.css';
import './Analytics.css';

const EVENT_LABELS = {
    page_view: { label: 'Sayfa Goruntulemesi', icon: Eye, color: '#007AFF' },
    product_view: { label: 'Urun Goruntulemesi', icon: Package, color: '#34C759' },
    whatsapp_click: { label: 'WhatsApp Tiklama', icon: MessageCircle, color: '#25D366' },
    brand_select: { label: 'Marka Secimi', icon: Tag, color: '#FF9500' },
    catalog_pdf: { label: 'PDF Indirme', icon: FileDown, color: '#A855F7' }
};

const PAGE_LABELS = {
    '/home': 'Ana Sayfa',
    '/catalog': 'Katalog',
    '/contact': 'Iletisim',
    '/certificates': 'Sertifikalar',
    '/showroom': 'Showroom'
};

const Analytics = () => {
    const { t } = useLanguage();
    const { adminBrandId } = useBrand();
    const [summary, setSummary] = useState(null);
    const [daily, setDaily] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [eventBreakdown, setEventBreakdown] = useState([]);
    const [topPages, setTopPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        loadAll();
    }, [adminBrandId, days]);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [summaryData, dailyData, productsData, eventsData, pagesData] = await Promise.all([
                analyticsApi.getSummary(adminBrandId, days),
                analyticsApi.getDaily(adminBrandId, Math.min(days, 30)),
                analyticsApi.getTopProducts(adminBrandId, days),
                analyticsApi.getEventBreakdown(adminBrandId, days),
                analyticsApi.getTopPages(adminBrandId, days)
            ]);
            setSummary(summaryData);
            setDaily(dailyData);
            setTopProducts(productsData);
            setEventBreakdown(eventsData);
            setTopPages(pagesData);
        } catch (err) {
            console.error('Analytics load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const maxDailyViews = Math.max(...daily.map(d => d.views), 1);
    const totalEvents = eventBreakdown.reduce((sum, e) => sum + e.count, 0);

    if (loading) {
        return (
            <div className="admin-page analytics-page">
                <header className="admin-header">
                    <div>
                        <h1 className="text-h2">Analytics</h1>
                        <p className="text-body">Katalog performansini takip edin</p>
                    </div>
                </header>
                <div className="loading-state">
                    <Loader2 size={32} className="spin" />
                    <p>Yukleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page analytics-page">
            <header className="admin-header">
                <div>
                    <h1 className="text-h2">Analytics</h1>
                    <p className="text-body">Katalog performansini takip edin</p>
                </div>
                <div className="header-actions">
                    <select
                        className="date-range-select"
                        value={days}
                        onChange={e => setDays(parseInt(e.target.value))}
                        style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '0.875rem', background: '#fff', cursor: 'pointer' }}
                    >
                        <option value={7}>Son 7 Gun</option>
                        <option value={14}>Son 14 Gun</option>
                        <option value={30}>Son 30 Gun</option>
                        <option value={90}>Son 90 Gun</option>
                    </select>
                </div>
            </header>

            {/* Summary Stats */}
            <div className="stats-grid stats-4">
                <StatCard
                    icon={Eye}
                    value={summary?.totalViews || 0}
                    label="Sayfa Goruntulemesi"
                    trend={summary?.trends?.views}
                    color="var(--color-primary)"
                    bg="rgba(52, 199, 89, 0.1)"
                />
                <StatCard
                    icon={Users}
                    value={summary?.totalVisitors || 0}
                    label="Tekil Ziyaretci"
                    trend={summary?.trends?.visitors}
                    color="var(--color-info, #007AFF)"
                    bg="rgba(0, 122, 255, 0.1)"
                />
                <StatCard
                    icon={Package}
                    value={summary?.totalProductViews || 0}
                    label="Urun Goruntulemesi"
                    trend={summary?.trends?.productViews}
                    color="#FF9500"
                    bg="rgba(255, 149, 0, 0.1)"
                />
                <StatCard
                    icon={MessageCircle}
                    value={summary?.whatsappClicks || 0}
                    label="WhatsApp Tiklama"
                    trend={summary?.trends?.whatsapp}
                    color="#25D366"
                    bg="rgba(37, 211, 102, 0.1)"
                />
            </div>

            {/* Daily Views Chart */}
            {daily.length > 0 && (
                <div className="card chart-card">
                    <h3 className="text-h3">Gunluk Ziyaret</h3>
                    <div className="chart-container">
                        <div className="bar-chart">
                            {daily.map((day, idx) => (
                                <div key={idx} className="bar-wrapper">
                                    <div
                                        className="bar"
                                        style={{ height: `${(day.views / maxDailyViews) * 100}%` }}
                                        title={`${day.date}: ${day.views} goruntulenme, ${day.visitors} ziyaretci`}
                                    >
                                        <span className="bar-value">{day.views}</span>
                                    </div>
                                    <span className="bar-label">{day.date.slice(8)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="analytics-grid">
                {/* Top Viewed Products */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-h3">En Cok Goruntulenen Urunler</h3>
                    </div>
                    {topProducts.length === 0 ? (
                        <EmptyState text="Henuz urun goruntulemesi yok" />
                    ) : (
                        <div className="ranking-list">
                            {topProducts.map((product, idx) => (
                                <div key={product.productId || idx} className="ranking-item">
                                    <span className="rank">#{idx + 1}</span>
                                    <div className="ranking-info">
                                        <span className="ranking-name">{product.name}</span>
                                        <span className="ranking-sku">{product.sku}</span>
                                    </div>
                                    <div className="ranking-stats">
                                        <span className="views-count">{product.views.toLocaleString()}</span>
                                        <TrendBadge value={product.trend} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Event Breakdown */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-h3">Etkinlik Dagilimi</h3>
                    </div>
                    {eventBreakdown.length === 0 ? (
                        <EmptyState text="Henuz etkinlik verisi yok" />
                    ) : (
                        <div className="event-breakdown-list">
                            {eventBreakdown.map(event => {
                                const info = EVENT_LABELS[event.type] || { label: event.type, icon: BarChart3, color: '#888' };
                                const Icon = info.icon;
                                const percentage = totalEvents > 0 ? ((event.count / totalEvents) * 100).toFixed(1) : 0;
                                return (
                                    <div key={event.type} className="event-breakdown-item">
                                        <div className="event-icon" style={{ color: info.color, background: `${info.color}15` }}>
                                            <Icon size={18} />
                                        </div>
                                        <div className="event-info">
                                            <span className="event-label">{info.label}</span>
                                            <div className="event-bar-wrapper">
                                                <div className="country-bar">
                                                    <div
                                                        className="country-bar-fill"
                                                        style={{ width: `${percentage}%`, background: info.color }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="event-stats">
                                            <span className="views-count">{event.count.toLocaleString()}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#888' }}>{percentage}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Top Pages */}
            {topPages.length > 0 && (
                <div className="card" style={{ marginTop: '1.5rem' }}>
                    <div className="card-header">
                        <h3 className="text-h3">En Cok Ziyaret Edilen Sayfalar</h3>
                    </div>
                    <div className="ranking-list">
                        {topPages.map((page, idx) => (
                            <div key={page.page || idx} className="ranking-item">
                                <span className="rank">#{idx + 1}</span>
                                <div className="ranking-info">
                                    <span className="ranking-name">{PAGE_LABELS[page.page] || page.page || 'Bilinmeyen'}</span>
                                    <span className="ranking-sku">{page.page}</span>
                                </div>
                                <div className="ranking-stats">
                                    <span className="views-count">{page.views.toLocaleString()}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#888' }}>{page.visitors} ziyaretci</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon: Icon, value, label, trend, color, bg }) => (
    <div className="stat-card card">
        <div className="stat-icon" style={{ background: bg, color }}>
            <Icon size={24} />
        </div>
        <div className="stat-content">
            <span className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</span>
            <span className="stat-label">{label}</span>
        </div>
        {trend !== undefined && trend !== null && (
            <TrendBadge value={trend} />
        )}
    </div>
);

// Trend Badge
const TrendBadge = ({ value }) => {
    if (value === undefined || value === null) return null;
    const isUp = value >= 0;
    return (
        <span className={`trend ${isUp ? 'up' : 'down'}`}>
            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(value)}%
        </span>
    );
};

// Empty State
const EmptyState = ({ text }) => (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
        <BarChart3 size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
        <p>{text}</p>
    </div>
);

export default Analytics;
