import React, { useState, useEffect } from 'react';
import { Package, Folder, MessageSquare, Users, TrendingUp, ArrowUpRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { categories } from '../data/products';
import { productsApi } from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await productsApi.getAll();
                setProducts(data);
            } catch (err) {
                console.error('Dashboard Data Error:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const stats = [
        { label: 'Total Products', value: products.length, icon: Package, link: '/admin/products', color: 'var(--color-primary)' },
        { label: 'Categories', value: categories.length, icon: Folder, link: '/admin/categories', color: 'var(--color-info)' },
        { label: 'Quote Requests', value: 12, icon: MessageSquare, link: '/admin/quotes', color: 'var(--color-warning)' },
        { label: 'Customers', value: 48, icon: Users, link: '/admin/customers', color: '#A855F7' },
    ];

    const recentProducts = products.filter(p => p.featured).slice(0, 5);

    if (loading) {
        return (
            <div className="admin-page flex-center" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
            </div>
        );
    }

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="text-h2">{t('dashboard')}</h1>
                    <p className="text-body">Welcome back! Here's your catalog overview.</p>
                </div>
            </header>

            {/* Stats */}
            <div className="stats-grid">
                {stats.map((stat, idx) => (
                    <Link key={idx} to={stat.link} className="stat-card card">
                        <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                        <ArrowUpRight size={20} className="stat-arrow" />
                    </Link>
                ))}
            </div>

            <div className="dashboard-grid">
                {/* Recent Products */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-h3">Featured Products</h3>
                        <Link to="/admin/products" className="btn btn-link">View All</Link>
                    </div>
                    <div className="recent-products">
                        {recentProducts.length === 0 ? (
                            <p className="text-body" style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No featured products yet.</p>
                        ) : (
                            recentProducts.map(product => (
                                <div key={product.id || product._id} className="recent-product">
                                    <img src={product.image} alt="" />
                                    <div className="product-info">
                                        <span className="product-name">{product.name}</span>
                                        <span className="product-sku">{product.sku}</span>
                                    </div>
                                    <span className={`status-dot ${product.inStock ? 'in-stock' : 'out'}`}></span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <h3 className="text-h3">Quick Actions</h3>
                    <div className="quick-actions">
                        <Link to="/admin/products" className="action-card">
                            <Package size={20} />
                            <span>Manage Products</span>
                        </Link>
                        <Link to="/admin/quotes" className="action-card">
                            <MessageSquare size={20} />
                            <span>View Quotes</span>
                        </Link>
                        <Link to="/admin/categories" className="action-card">
                            <Folder size={20} />
                            <span>Edit Categories</span>
                        </Link>
                        <Link to="/admin/settings" className="action-card">
                            <TrendingUp size={20} />
                            <span>Settings</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
