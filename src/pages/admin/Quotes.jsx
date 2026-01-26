import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Mail, Clock, Search, Loader2, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { quotesApi } from '../../utils/api';
import '../Dashboard.css';

const Quotes = () => {
    const { t } = useLanguage();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [filter, setFilter] = useState('all');

    // Load quotes from API
    useEffect(() => {
        loadQuotes();
    }, [filter]);

    const loadQuotes = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await quotesApi.getAll(filter);
            setQuotes(data);
        } catch (err) {
            console.error('Quotes load error:', err);
            setError('Teklifler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const updated = await quotesApi.update(id, { status });
            setQuotes(quotes.map(q => q._id === id ? updated : q));
        } catch (err) {
            console.error('Status update error:', err);
            alert('Durum güncellenemedi!');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Bu teklifi silmek istediğinizden emin misiniz?')) {
            try {
                await quotesApi.delete(id);
                setQuotes(quotes.filter(q => q._id !== id));
            } catch (err) {
                console.error('Delete error:', err);
                alert('Teklif silinemedi!');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const statusColors = {
        new: '#007AFF',
        replied: '#34C759',
        pending: '#FF9500',
        closed: '#8E8E93',
    };

    const statusLabels = {
        new: 'Yeni',
        replied: 'Cevaplandı',
        pending: 'Bekliyor',
        closed: 'Kapatıldı',
    };

    if (loading) {
        return (
            <div className="admin-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <Loader2 size={32} className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="text-h2">{t('quoteRequests')}</h1>
                    <p className="text-body">Gelen teklif taleplerini yönetin</p>
                </div>
                <div className="status-filters">
                    {['all', 'new', 'replied', 'pending', 'closed'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${filter === status ? 'active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {status === 'all' ? 'Tümü' : statusLabels[status]}
                        </button>
                    ))}
                </div>
            </header>

            {error && (
                <div className="error-message" style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {quotes.length === 0 ? (
                <div className="empty-state card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: '#888' }}>Henüz teklif talebi yok.</p>
                </div>
            ) : (
                <div className="quotes-list">
                    {quotes.map(quote => (
                        <div key={quote._id} className="quote-card card">
                            <div className="quote-header">
                                <div className="quote-meta">
                                    <span className="quote-status" style={{ background: statusColors[quote.status] }}>
                                        {statusLabels[quote.status]}
                                    </span>
                                    <span className="quote-date"><Clock size={14} /> {formatDate(quote.createdAt)}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedQuote(quote)}>
                                        <Eye size={16} /> Görüntüle
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(quote._id)} style={{ color: '#ef4444' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="quote-body">
                                <h4>{quote.name}</h4>
                                <p className="company">{quote.company} • {quote.country}</p>
                                <p className="message">"{quote.message || 'Mesaj yok'}"</p>
                                <div className="quote-products">
                                    {quote.products?.map(sku => (
                                        <span key={sku} className="product-tag">{sku}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="quote-actions">
                                <a href={`mailto:${quote.email}`} className="btn btn-secondary btn-sm">
                                    <Mail size={14} /> E-posta Gönder
                                </a>
                                {quote.status === 'new' && (
                                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(quote._id, 'replied')}>
                                        <Check size={14} /> Cevaplandı
                                    </button>
                                )}
                                {quote.status === 'replied' && (
                                    <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(quote._id, 'closed')}>
                                        Kapat
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quote Detail Modal */}
            {selectedQuote && (
                <div className="modal-overlay" onClick={() => setSelectedQuote(null)}>
                    <div className="modal-content quote-detail" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedQuote(null)}><X size={24} /></button>
                        <h2>Teklif Detayı</h2>
                        <div className="detail-grid">
                            <div><strong>İsim:</strong> {selectedQuote.name}</div>
                            <div><strong>Firma:</strong> {selectedQuote.company}</div>
                            <div><strong>E-posta:</strong> <a href={`mailto:${selectedQuote.email}`}>{selectedQuote.email}</a></div>
                            <div><strong>Telefon:</strong> <a href={`tel:${selectedQuote.phone}`}>{selectedQuote.phone}</a></div>
                            <div><strong>Ülke:</strong> {selectedQuote.country}</div>
                            <div><strong>Tarih:</strong> {formatDate(selectedQuote.createdAt)}</div>
                        </div>
                        <div className="detail-section">
                            <strong>Ürünler:</strong>
                            <div className="quote-products">
                                {selectedQuote.products?.map(sku => <span key={sku} className="product-tag">{sku}</span>)}
                            </div>
                        </div>
                        <div className="detail-section">
                            <strong>Mesaj:</strong>
                            <p>{selectedQuote.message || 'Mesaj yok'}</p>
                        </div>
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '12px' }}>
                            <a href={`mailto:${selectedQuote.email}`} className="btn btn-primary">
                                <Mail size={16} /> E-posta Gönder
                            </a>
                            <a href={`https://wa.me/${selectedQuote.phone?.replace(/\D/g, '')}`} target="_blank" className="btn btn-secondary">
                                WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Quotes;
