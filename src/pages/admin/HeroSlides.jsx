import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, GripVertical, Loader2, Upload, X, Save, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { heroSlidesApi, productsApi } from '../../utils/api';

const HeroSlides = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);

    // Drag & Drop
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);
    const [isSavingOrder, setIsSavingOrder] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        loadSlides();
    }, []);

    const loadSlides = async () => {
        try {
            setLoading(true);
            const data = await heroSlidesApi.getAll();
            setSlides(data);
        } catch (err) {
            console.error('Hero slides yüklenemedi:', err);
            showToast('Veriler yüklenemedi', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bu slide silinecek. Devam?')) return;
        try {
            await heroSlidesApi.delete(id);
            setSlides(slides.filter(s => s._id !== id));
            showToast('Slide silindi');
        } catch (err) {
            console.error('Delete error:', err);
            showToast('Silme başarısız!', 'error');
        }
    };

    const handleToggleActive = async (slide) => {
        try {
            const updated = await heroSlidesApi.update(slide._id, { isActive: !slide.isActive });
            setSlides(slides.map(s => s._id === updated._id ? updated : s));
            showToast(updated.isActive ? 'Slide aktif' : 'Slide pasif');
        } catch (err) {
            showToast('Güncelleme başarısız!', 'error');
        }
    };

    // Drag handlers
    const handleDragStart = (e, slide) => {
        setDraggedItem(slide);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging');
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const handleDragOver = (e, slide) => {
        e.preventDefault();
        if (!draggedItem || draggedItem._id === slide._id) return;
        setDragOverItem(slide);
    };

    const handleDragLeave = () => {
        setDragOverItem(null);
    };

    const handleDrop = async (e, targetSlide) => {
        e.preventDefault();
        if (!draggedItem || draggedItem._id === targetSlide._id) return;

        const newSlides = [...slides];
        const draggedIndex = newSlides.findIndex(s => s._id === draggedItem._id);
        const targetIndex = newSlides.findIndex(s => s._id === targetSlide._id);

        const [removed] = newSlides.splice(draggedIndex, 1);
        newSlides.splice(targetIndex, 0, removed);

        setSlides(newSlides);
        setDraggedItem(null);
        setDragOverItem(null);

        try {
            setIsSavingOrder(true);
            await heroSlidesApi.reorder(newSlides.map(s => s._id));
            showToast('Sıralama güncellendi');
        } catch (err) {
            showToast('Sıralama kaydedilemedi!', 'error');
            loadSlides();
        } finally {
            setIsSavingOrder(false);
        }
    };

    const openAddModal = () => {
        setEditingSlide(null);
        setIsModalOpen(true);
    };

    const openEditModal = (slide) => {
        setEditingSlide(slide);
        setIsModalOpen(true);
    };

    const handleSaveSlide = async (slideData) => {
        try {
            if (editingSlide) {
                const updated = await heroSlidesApi.update(editingSlide._id, slideData);
                setSlides(slides.map(s => s._id === updated._id ? updated : s));
                showToast('Slide güncellendi');
            } else {
                const created = await heroSlidesApi.create(slideData);
                setSlides([...slides, created]);
                showToast('Slide eklendi');
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Save error:', err);
            showToast('Kaydetme başarısız!', 'error');
        }
    };

    if (loading) {
        return (
            <div className="admin-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 size={32} className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="admin-page">
            {toast && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', padding: '12px 24px', borderRadius: '8px',
                    background: toast.type === 'error' ? '#ef4444' : '#22c55e', color: 'white', fontWeight: '500',
                    zIndex: 10000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    {toast.message}
                </div>
            )}

            <header className="admin-header">
                <div>
                    <h1 className="text-h2">Ana Sayfa Slider</h1>
                    <p className="text-body">Arka planda gösterilecek görselleri yönetin</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={18} />
                        Slide Ekle
                    </button>
                </div>
            </header>

            {slides.length === 0 ? (
                <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <ImageIcon size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Henüz slide yok</p>
                    <p style={{ fontSize: '0.9rem' }}>Yeni slide ekleyerek başlayın.</p>
                </div>
            ) : (
                <>
                    <p style={{
                        fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                        <GripVertical size={16} />
                        Sıralamayı değiştirmek için kartları sürükleyip bırakın
                        {isSavingOrder && <Loader2 size={14} className="animate-spin" style={{ marginLeft: '8px' }} />}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {slides.map(slide => (
                            <div
                                key={slide._id}
                                className="card"
                                draggable
                                onDragStart={(e) => handleDragStart(e, slide)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, slide)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, slide)}
                                style={{
                                    cursor: 'grab',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                    borderLeft: dragOverItem && dragOverItem._id === slide._id
                                        ? '3px solid var(--color-primary)'
                                        : '3px solid transparent',
                                    opacity: !slide.isActive ? 0.6 : 1,
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                            >
                                {/* Drag handle + order */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '40px' }}>
                                    <GripVertical size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                                        #{slide.order}
                                    </span>
                                </div>

                                {/* Thumbnail */}
                                <div style={{
                                    width: '80px', height: '48px', borderRadius: 'var(--radius-sm)',
                                    backgroundImage: `url(${slide.image})`,
                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                    background: slide.image ? undefined : '#f0f0f0',
                                    flexShrink: 0
                                }} />

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {slide.title && (
                                        <h3 style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {slide.title}
                                        </h3>
                                    )}
                                    {slide.subtitle && (
                                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {slide.subtitle}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleToggleActive(slide); }}
                                        style={{
                                            background: 'none', border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-sm)', padding: '5px 7px', cursor: 'pointer',
                                            color: slide.isActive ? '#22c55e' : '#ef4444',
                                            display: 'flex', alignItems: 'center'
                                        }}
                                        title={slide.isActive ? 'Pasife al' : 'Aktif et'}
                                    >
                                        {slide.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => openEditModal(slide)}
                                        style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => handleDelete(slide._id)}
                                        style={{ padding: '5px 7px', color: '#ef4444', borderColor: '#ef4444' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {isModalOpen && (
                <SlideModal
                    slide={editingSlide}
                    onSave={handleSaveSlide}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

// ---- Slide Edit Modal ----
const SlideModal = ({ slide, onSave, onClose }) => {
    const [form, setForm] = useState({
        image: slide?.image || '',
        title: slide?.title || '',
        subtitle: slide?.subtitle || '',
        isActive: slide?.isActive ?? true
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploading(true);
            // Use showroom upload endpoint - no optimization, original quality
            const result = await productsApi.uploadShowroomImage(file);
            handleChange('image', result.url);
        } catch (err) {
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.image) return;
        onSave(form);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="export-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>
                <div style={{ padding: '24px' }}>
                    <h2 style={{ margin: '0 0 20px', fontSize: '1.25rem' }}>
                        {slide ? 'Slide Düzenle' : 'Yeni Slide'}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        {/* Image upload */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '8px' }}>
                                Görsel *
                            </label>
                            {form.image && (
                                <div style={{ marginBottom: '12px' }}>
                                    <img src={form.image} alt="Preview" style={{
                                        width: '100%', height: '200px', objectFit: 'cover',
                                        borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)'
                                    }} />
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                style={{ width: '100%' }}
                            >
                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                {uploading ? 'Yükleniyor...' : 'Görsel Yükle'}
                            </button>
                        </div>

                        {/* Title (optional) */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px' }}>
                                Başlık (opsiyonel)
                            </label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => handleChange('title', e.target.value)}
                                placeholder="Hoş geldiniz!"
                                style={{
                                    width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)', fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        {/* Subtitle (optional) */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px' }}>
                                Alt Başlık (opsiyonel)
                            </label>
                            <input
                                type="text"
                                value={form.subtitle}
                                onChange={e => handleChange('subtitle', e.target.value)}
                                placeholder="Ürünlerimizi keşfedin"
                                style={{
                                    width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)', fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        {/* Active toggle */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={e => handleChange('isActive', e.target.checked)}
                                    style={{ width: '16px', height: '16px' }}
                                />
                                Aktif
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                İptal
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={!form.image}>
                                <Save size={16} />
                                {slide ? 'Güncelle' : 'Ekle'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HeroSlides;
