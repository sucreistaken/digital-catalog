import React from 'react';
import { Eye, Users, Globe, TrendingUp, TrendingDown, Clock, MousePointer, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { analyticsData } from '../../data/certificates';
import '../Dashboard.css';
import './Analytics.css';

const Analytics = () => {
    const { t } = useLanguage();
    const { productViews, countryTraffic, summary, dailyViews } = analyticsData;

    // Calculate max for chart scaling
    const maxViews = Math.max(...dailyViews.map(d => d.views));

    return (
        <div className="admin-page analytics-page">
            <header className="admin-header">
                <div>
                    <h1 className="text-h2">Analytics</h1>
                    <p className="text-body">Track your catalog performance</p>
                </div>
                <div className="date-range">
                    <span>Last 30 Days</span>
                </div>
            </header>

            {/* Summary Stats */}
            <div className="stats-grid stats-4">
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'rgba(52, 199, 89, 0.1)', color: 'var(--color-primary)' }}>
                        <Eye size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{summary.totalViews.toLocaleString()}</span>
                        <span className="stat-label">Total Page Views</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'rgba(0, 122, 255, 0.1)', color: 'var(--color-info)' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{summary.totalVisitors.toLocaleString()}</span>
                        <span className="stat-label">Unique Visitors</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'rgba(255, 149, 0, 0.1)', color: 'var(--color-warning)' }}>
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{summary.avgSessionDuration}</span>
                        <span className="stat-label">Avg. Session</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
                        <MousePointer size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{summary.conversionRate}</span>
                        <span className="stat-label">Conversion Rate</span>
                    </div>
                </div>
            </div>

            {/* Views Chart */}
            <div className="card chart-card">
                <h3 className="text-h3">Daily Views</h3>
                <div className="chart-container">
                    <div className="bar-chart">
                        {dailyViews.map((day, idx) => (
                            <div key={idx} className="bar-wrapper">
                                <div
                                    className="bar"
                                    style={{ height: `${(day.views / maxViews) * 100}%` }}
                                    title={`${day.date}: ${day.views} views`}
                                >
                                    <span className="bar-value">{day.views}</span>
                                </div>
                                <span className="bar-label">{day.date.slice(8)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="analytics-grid">
                {/* Most Viewed Products */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-h3">Most Viewed Products</h3>
                    </div>
                    <div className="ranking-list">
                        {productViews.map((product, idx) => (
                            <div key={product.id} className="ranking-item">
                                <span className="rank">#{idx + 1}</span>
                                <div className="ranking-info">
                                    <span className="ranking-name">{product.name}</span>
                                    <span className="ranking-sku">{product.sku}</span>
                                </div>
                                <div className="ranking-stats">
                                    <span className="views-count">{product.views.toLocaleString()}</span>
                                    <span className={`trend ${product.trend >= 0 ? 'up' : 'down'}`}>
                                        {product.trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        {Math.abs(product.trend)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Traffic by Country */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-h3">Traffic by Country</h3>
                    </div>
                    <div className="country-list">
                        {countryTraffic.map((country, idx) => (
                            <div key={country.code} className="country-item">
                                <span className="country-rank">#{idx + 1}</span>
                                <span className="country-flag">{country.flag}</span>
                                <div className="country-info">
                                    <span className="country-name">{country.country}</span>
                                    <div className="country-bar">
                                        <div
                                            className="country-bar-fill"
                                            style={{ width: `${country.percentage * 4}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="country-stats">
                                    <span className="visitor-count">{country.visitors.toLocaleString()}</span>
                                    <span className={`trend ${country.trend >= 0 ? 'up' : 'down'}`}>
                                        {country.trend >= 0 ? '+' : ''}{country.trend}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
