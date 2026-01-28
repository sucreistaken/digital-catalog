import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, MapPin, Calendar, Plus, Edit, Trash2, X, Save, Loader2, Tag, FileText, Building } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { customersApi } from '../../utils/api';
import '../Dashboard.css';

const Customers = () => {
    const { t } = useLanguage();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [toast, setToast] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        country: '',
        address: '',
        notes: '',
        tags: []
    });
    const [saving, setSaving] = useState(false);
    const [tagInput, setTagInput] = useState('');

    // Load customers
    useEffect(() => {
        loadCustomers();
    }, [searchQuery, sourceFilter]);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const data = await customersApi.getAll(searchQuery, '', sourceFilter);
            setCustomers(data);
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Modal handlers
    const openAddModal = () => {
        setEditingCustomer(null);
        setFormData({
            name: '',
            company: '',
            email: '',
            phone: '',
            country: '',
            address: '',
            notes: '',
            tags: []
        });
        setTagInput('');
        setShowModal(true);
    };

    const openEditModal = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name || '',
            company: customer.company || '',
            email: customer.email || '',
            phone: customer.phone || '',
            country: customer.country || '',
            address: customer.address || '',
            notes: customer.notes || '',
            tags: customer.tags || []
        });
        setTagInput('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCustomer(null);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.email.trim()) {
            showToast('İsim ve email gerekli', 'error');
            return;
        }

        try {
            setSaving(true);
            if (editingCustomer) {
                await customersApi.update(editingCustomer._id, formData);
                showToast('Müşteri güncellendi');
            } else {
                await customersApi.create(formData);
                showToast('Müşteri eklendi');
            }
            closeModal();
            loadCustomers();
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) return;

        try {
            await customersApi.delete(id);
            showToast('Müşteri silindi');
            loadCustomers();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    const getSourceBadge = (source) => {
        const badges = {
            quote: { label: 'Teklif', color: 'var(--color-primary)' },
            contact: { label: 'İletişim', color: 'var(--color-info)' },
            manual: { label: 'Manuel', color: 'var(--color-warning)' }
        };
        return badges[source] || badges.manual;
    };

    return (
        <div className="admin-page">
            {/* Toast */}
            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.message}
                </div>
            )}

            <header className="admin-header">
                <div>
                    <h1 className="text-h2">{t('customers')}</h1>
                    <p className="text-body">Müşteri ilişkilerini yönetin</p>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Müşteri ara..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        value={sourceFilter}
                        onChange={e => setSourceFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Tüm Kaynaklar</option>
                        <option value="quote">Teklif</option>
                        <option value="contact">İletişim</option>
                        <option value="manual">Manuel</option>
                    </select>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={18} />
                        Yeni Müşteri
                    </button>
                </div>
            </header>

            {/* Customers Grid */}
            {loading ? (
                <div className="loading-state">
                    <Loader2 size={32} className="spin" />
                    <p>Yükleniyor...</p>
                </div>
            ) : customers.length === 0 ? (
                <div className="empty-state">
                    <p>Henüz müşteri bulunmuyor</p>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={18} />
                        İlk Müşteriyi Ekle
                    </button>
                </div>
            ) : (
                <div className="customers-grid">
                    {customers.map(customer => (
                        <div key={customer._id} className="customer-card card">
                            <div className="customer-header">
                                <div className="customer-avatar">
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="customer-actions">
                                    <button
                                        className="btn-icon"
                                        onClick={() => openEditModal(customer)}
                                        title="Düzenle"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className="btn-icon btn-danger"
                                        onClick={() => handleDelete(customer._id)}
                                        title="Sil"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="customer-info">
                                <h4>{customer.name}</h4>
                                {customer.company && (
                                    <p className="company">
                                        <Building size={14} />
                                        {customer.company}
                                    </p>
                                )}
                                <div className="customer-details">
                                    <span><Mail size={14} /> {customer.email}</span>
                                    {customer.phone && <span><Phone size={14} /> {customer.phone}</span>}
                                    {customer.country && <span><MapPin size={14} /> {customer.country}</span>}
                                    <span><Calendar size={14} /> {formatDate(customer.createdAt)}</span>
                                </div>
                                {customer.tags && customer.tags.length > 0 && (
                                    <div className="customer-tags">
                                        {customer.tags.map(tag => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="customer-meta">
                                <span
                                    className="source-badge"
                                    style={{ background: getSourceBadge(customer.source).color }}
                                >
                                    {getSourceBadge(customer.source).label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>İsim *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => handleInputChange('name', e.target.value)}
                                        placeholder="Müşteri adı"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Şirket</label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={e => handleInputChange('company', e.target.value)}
                                        placeholder="Şirket adı"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => handleInputChange('email', e.target.value)}
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Telefon</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => handleInputChange('phone', e.target.value)}
                                        placeholder="+90 xxx xxx xx xx"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ülke</label>
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={e => handleInputChange('country', e.target.value)}
                                        placeholder="Türkiye"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Adres</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={e => handleInputChange('address', e.target.value)}
                                        placeholder="Tam adres"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Notlar</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => handleInputChange('notes', e.target.value)}
                                    placeholder="Dahili notlar..."
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label>Etiketler</label>
                                <div className="tag-input-wrapper">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                        placeholder="Etiket ekle ve Enter'a bas"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={handleAddTag}
                                    >
                                        <Tag size={14} />
                                    </button>
                                </div>
                                {formData.tags.length > 0 && (
                                    <div className="tags-list">
                                        {formData.tags.map(tag => (
                                            <span key={tag} className="tag tag-removable">
                                                {tag}
                                                <button onClick={() => handleRemoveTag(tag)}>
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>
                                İptal
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={16} className="spin" />
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        {editingCustomer ? 'Güncelle' : 'Kaydet'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
