import React, { useState } from 'react';
import { Eye, Check, X, Mail, Clock, Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import '../Dashboard.css';

// Sample quote requests
const sampleQuotes = [
    { id: 1, name: 'Ahmed Al-Rashid', company: 'Al-Faisal Trading', email: 'ahmed@alfaisal.com', phone: '+966 50 123 4567', country: 'Saudi Arabia', products: ['FG-CH-001', 'FG-TB-001'], message: 'We are interested in bulk order for hotel project.', date: '2026-01-16', status: 'new' },
    { id: 2, name: 'Hans Müller', company: 'Garten GmbH', email: 'hans@garten.de', phone: '+49 170 123 4567', country: 'Germany', products: ['FG-PT-001', 'FG-PT-002', 'FG-PT-003'], message: 'Looking for garden products distribution in Germany.', date: '2026-01-15', status: 'replied' },
    { id: 3, name: '李明', company: '上海贸易公司', email: 'liming@shanghai.cn', phone: '+86 138 1234 5678', country: 'China', products: ['FG-PL-001', 'FG-SB-001'], message: 'Want to import industrial products.', date: '2026-01-14', status: 'new' },
    { id: 4, name: 'Maria Santos', company: 'Iberia Imports', email: 'maria@iberia.es', phone: '+34 612 345 678', country: 'Spain', products: ['FG-SET-001'], message: 'Furniture sets for restaurants.', date: '2026-01-13', status: 'pending' },
];

const Quotes = () => {
    const { t } = useLanguage();
    const [quotes, setQuotes] = useState(sampleQuotes);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [filter, setFilter] = useState('all');

    const filteredQuotes = quotes.filter(q => filter === 'all' || q.status === filter);

    const updateStatus = (id, status) => {
        setQuotes(quotes.map(q => q.id === id ? { ...q, status } : q));
    };

    const statusColors = {
        new: 'var(--color-primary)',
        replied: 'var(--color-info)',
        pending: 'var(--color-warning)',
        closed: 'var(--color-text-muted)',
    };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="text-h2">{t('quoteRequests')}</h1>
                    <p className="text-body">Manage incoming quote requests</p>
                </div>
                <div className="status-filters">
                    {['all', 'new', 'replied', 'pending'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${filter === status ? 'active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </header>

            <div className="quotes-list">
                {filteredQuotes.map(quote => (
                    <div key={quote.id} className="quote-card card">
                        <div className="quote-header">
                            <div className="quote-meta">
                                <span className="quote-status" style={{ background: statusColors[quote.status] }}>
                                    {quote.status}
                                </span>
                                <span className="quote-date"><Clock size={14} /> {quote.date}</span>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedQuote(quote)}>
                                <Eye size={16} /> View
                            </button>
                        </div>
                        <div className="quote-body">
                            <h4>{quote.name}</h4>
                            <p className="company">{quote.company} • {quote.country}</p>
                            <p className="message">"{quote.message}"</p>
                            <div className="quote-products">
                                {quote.products.map(sku => (
                                    <span key={sku} className="product-tag">{sku}</span>
                                ))}
                            </div>
                        </div>
                        <div className="quote-actions">
                            <a href={`mailto:${quote.email}`} className="btn btn-secondary btn-sm">
                                <Mail size={14} /> Reply
                            </a>
                            {quote.status === 'new' && (
                                <button className="btn btn-primary btn-sm" onClick={() => updateStatus(quote.id, 'replied')}>
                                    <Check size={14} /> Mark Replied
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quote Detail Modal */}
            {selectedQuote && (
                <div className="modal-overlay" onClick={() => setSelectedQuote(null)}>
                    <div className="modal-content quote-detail" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedQuote(null)}><X size={24} /></button>
                        <h2>Quote Request</h2>
                        <div className="detail-grid">
                            <div><strong>Name:</strong> {selectedQuote.name}</div>
                            <div><strong>Company:</strong> {selectedQuote.company}</div>
                            <div><strong>Email:</strong> {selectedQuote.email}</div>
                            <div><strong>Phone:</strong> {selectedQuote.phone}</div>
                            <div><strong>Country:</strong> {selectedQuote.country}</div>
                            <div><strong>Date:</strong> {selectedQuote.date}</div>
                        </div>
                        <div className="detail-section">
                            <strong>Products:</strong>
                            <div className="quote-products">
                                {selectedQuote.products.map(sku => <span key={sku} className="product-tag">{sku}</span>)}
                            </div>
                        </div>
                        <div className="detail-section">
                            <strong>Message:</strong>
                            <p>{selectedQuote.message}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Quotes;
