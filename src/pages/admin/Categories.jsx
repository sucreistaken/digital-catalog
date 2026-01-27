import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Loader2, RefreshCw, X, Save, GripVertical } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { categoriesApi, productsApi } from '../../utils/api';
import '../Dashboard.css';

const Categories = () => {
    const { t, language } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        nameTr: '',
        nameAr: '',
        nameDe: '',
        nameZh: '',
        order: 0
    });
    const [saving, setSaving] = useState(false);

    // Drag & Drop state
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);
    const [isSavingOrder, setIsSavingOrder] = useState(false);

    // Toast notification state
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Load categories and products from API
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [categoriesData, productsData] = await Promise.all([
                categoriesApi.getAll(),
                productsApi.getAll()
            ]);
            setCategories(categoriesData);
            setProducts(productsData);
        } catch (err) {
            console.error('Load error:', err);
            setError('Veriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryName = (cat) => {
        const langKey = `name${language.charAt(0).toUpperCase() + language.slice(1)}`;
        return cat[langKey] || cat.name;
    };

    const getProductCount = (catId) => products.filter(p => p.category === catId).length;

    const handleDelete = async (id) => {
        if (confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
            try {
                await categoriesApi.delete(id);
                setCategories(categories.filter(c => c.id !== id));
                showToast('Kategori silindi');
            } catch (err) {
                console.error('Delete error:', err);
                showToast('Kategori silinemedi!', 'error');
            }
        }
    };

    // Drag & Drop handlers
    const handleDragStart = (e, category) => {
        setDraggedItem(category);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging');
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const handleDragOver = (e, category) => {
        e.preventDefault();
        if (draggedItem && draggedItem.id !== category.id) {
            setDragOverItem(category);
        }
    };

    const handleDragLeave = () => {
        setDragOverItem(null);
    };

    const handleDrop = async (e, targetCategory) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.id === targetCategory.id) return;

        // Calculate new order
        const newCategories = [...categories];
        const draggedIndex = newCategories.findIndex(c => c.id === draggedItem.id);
        const targetIndex = newCategories.findIndex(c => c.id === targetCategory.id);

        // Remove dragged item and insert at new position
        const [removed] = newCategories.splice(draggedIndex, 1);
        newCategories.splice(targetIndex, 0, removed);

        // Update local state immediately for smooth UX
        setCategories(newCategories);
        setDraggedItem(null);
        setDragOverItem(null);

        // Save to backend
        try {
            setIsSavingOrder(true);
            const orderedIds = newCategories.map(c => c.id);
            await categoriesApi.reorder(orderedIds);
            showToast('Sıralama güncellendi');
        } catch (err) {
            console.error('Reorder error:', err);
            showToast('Sıralama kaydedilemedi!', 'error');
            // Revert on error
            loadData();
        } finally {
            setIsSavingOrder(false);
        }
    };

    const handleReset = async () => {
        if (confirm('Tüm kategorileri varsayılana sıfırlamak istiyor musunuz?')) {
            try {
                const result = await categoriesApi.reset();
                setCategories(result.categories);
                showToast('Kategoriler sıfırlandı');
            } catch (err) {
                console.error('Reset error:', err);
                showToast('Kategoriler sıfırlanamadı!', 'error');
            }
        }
    };

    const openAddModal = () => {
        setEditingCategory(null);
        setFormData({
            id: '',
            name: '',
            nameTr: '',
            nameAr: '',
            nameDe: '',
            nameZh: '',
            order: categories.length + 1
        });
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({
            id: category.id,
            name: category.name || '',
            nameTr: category.nameTr || '',
            nameAr: category.nameAr || '',
            nameDe: category.nameDe || '',
            nameZh: category.nameZh || '',
            order: category.order || 0
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.id || !formData.name) {
            showToast('ID ve İsim alanları zorunludur!', 'error');
            return;
        }

        try {
            setSaving(true);
            if (editingCategory) {
                // Update existing
                const updated = await categoriesApi.update(editingCategory.id, formData);
                setCategories(categories.map(c => c.id === editingCategory.id ? updated : c));
                showToast('Kategori güncellendi');
            } else {
                // Create new
                const created = await categoriesApi.create(formData);
                setCategories([...categories, created]);
                showToast('Kategori eklendi');
            }
            closeModal();
        } catch (err) {
            console.error('Save error:', err);
            showToast(editingCategory ? 'Güncelleme başarısız!' : 'Ekleme başarısız!', 'error');
        } finally {
            setSaving(false);
        }
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
            {/* Toast Notification */}
            {toast && (
                <div className={`toast-notification ${toast.type}`} style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    background: toast.type === 'error' ? '#ef4444' : '#22c55e',
                    color: 'white',
                    fontWeight: '500',
                    zIndex: 10000,
                    animation: 'slideIn 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    {toast.message}
                </div>
            )}

            <header className="admin-header">
                <div>
                    <h1 className="text-h2">{t('categories')}</h1>
                    <p className="text-body">Ürün kategorilerinizi yönetin</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={handleReset}>
                        <RefreshCw size={18} />
                        Sıfırla
                    </button>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={18} />
                        Kategori Ekle
                    </button>
                </div>
            </header>

            {error && (
                <div className="error-message" style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {/* Drag hint */}
            <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <GripVertical size={16} />
                Sıralamayı değiştirmek için kartları sürükleyip bırakın
                {isSavingOrder && <Loader2 size={14} className="animate-spin" style={{ marginLeft: '0.5rem' }} />}
            </p>

            <div className="category-grid">
                {categories.map(cat => (
                    <div
                        key={cat.id}
                        className={`category-card card ${dragOverItem?.id === cat.id ? 'drag-over' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, cat)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, cat)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, cat)}
                        style={{
                            cursor: 'grab',
                            transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                            borderWidth: '2px',
                            borderStyle: 'solid',
                            borderColor: dragOverItem?.id === cat.id ? 'var(--color-primary)' : 'transparent'
                        }}
                    >
                        <div className="drag-handle" style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            color: 'var(--color-text-muted)',
                            cursor: 'grab'
                        }}>
                            <GripVertical size={18} />
                        </div>
                        <div className="category-icon">
                            <Package size={28} />
                        </div>
                        <h3>{getCategoryName(cat)}</h3>
                        <p className="product-count">{getProductCount(cat.id)} ürün</p>
                        <div className="category-actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(cat)}>
                                <Edit size={14} /> Düzenle
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(cat.id)}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="category-modal card" onClick={e => e.stopPropagation()} style={{
                        width: '90%',
                        maxWidth: '500px',
                        padding: '24px',
                        position: 'relative'
                    }}>
                        <button
                            className="modal-close"
                            onClick={closeModal}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <h2 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>
                            {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500' }}>
                                    Kategori ID *
                                </label>
                                <input
                                    type="text"
                                    value={formData.id}
                                    onChange={e => handleInputChange('id', e.target.value.toLowerCase().replace(/\s/g, '-'))}
                                    placeholder="ornek-kategori"
                                    disabled={!!editingCategory}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        background: editingCategory ? '#f5f5f5' : 'white'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500' }}>
                                        İsim (EN) *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => handleInputChange('name', e.target.value)}
                                        placeholder="Category Name"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500' }}>
                                        İsim (TR)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nameTr}
                                        onChange={e => handleInputChange('nameTr', e.target.value)}
                                        placeholder="Kategori Adı"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500' }}>
                                        İsim (AR)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nameAr}
                                        onChange={e => handleInputChange('nameAr', e.target.value)}
                                        placeholder="اسم الفئة"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500' }}>
                                        İsim (DE)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nameDe}
                                        onChange={e => handleInputChange('nameDe', e.target.value)}
                                        placeholder="Kategoriename"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500' }}>
                                        İsim (ZH)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nameZh}
                                        onChange={e => handleInputChange('nameZh', e.target.value)}
                                        placeholder="类别名称"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500' }}>
                                        Sıra
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={e => handleInputChange('order', parseInt(e.target.value) || 0)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button className="btn btn-secondary" onClick={closeModal}>
                                İptal
                            </button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {editingCategory ? 'Güncelle' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
