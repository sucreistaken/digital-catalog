import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Upload, Loader2, RefreshCw, Eye, EyeOff, Palette, X } from 'lucide-react';
import { brandsApi, productsApi } from '../../utils/api';
import { useBrand } from '../../context/BrandContext';
import '../Dashboard.css';

const Brands = () => {
    const { refreshBrands } = useBrand();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBrand, setEditingBrand] = useState(null);
    const [isNew, setIsNew] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadBrands();
    }, []);

    const loadBrands = async () => {
        try {
            setLoading(true);
            const data = await brandsApi.getAll();
            setBrands(data);
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

    const handleNew = () => {
        setEditingBrand({
            id: '',
            name: '',
            tagline: '',
            taglineTr: '',
            email: '',
            phone: '',
            whatsapp: '',
            website: '',
            logo: '',
            theme: {
                primaryColor: '#34C759',
                primaryHover: '#28A745',
                primaryLight: 'rgba(52, 199, 89, 0.1)'
            },
            isActive: true,
            order: brands.length
        });
        setIsNew(true);
    };

    const handleEdit = (brand) => {
        setEditingBrand({ ...brand });
        setIsNew(false);
    };

    const handleSave = async () => {
        if (!editingBrand.id || !editingBrand.name) {
            showToast('ID ve isim zorunlu', 'error');
            return;
        }

        try {
            setIsSaving(true);
            if (isNew) {
                await brandsApi.create(editingBrand);
                showToast('Marka eklendi');
            } else {
                await brandsApi.update(editingBrand.id, editingBrand);
                showToast('Marka guncellendi');
            }
            setEditingBrand(null);
            loadBrands();
            refreshBrands();
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (brandId) => {
        if (!window.confirm('Bu markayi silmek istediginize emin misiniz?')) return;
        try {
            await brandsApi.delete(brandId);
            showToast('Marka silindi');
            loadBrands();
            refreshBrands();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const result = await productsApi.uploadImage(file);
            setEditingBrand(prev => ({ ...prev, logo: result.url }));
            showToast('Logo yuklendi');
        } catch (error) {
            showToast('Logo yuklenemedi', 'error');
        }
    };

    const handleSeed = async () => {
        if (!window.confirm('Varsayilan markalari yuklemek istediginize emin misiniz?')) return;
        try {
            await brandsApi.seed();
            showToast('Varsayilan markalar yuklendi');
            loadBrands();
            refreshBrands();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    // Auto-generate hover and light from primary color
    const handlePrimaryColorChange = (hex) => {
        // Darken for hover
        const darken = (hex, amount) => {
            const num = parseInt(hex.replace('#', ''), 16);
            const r = Math.max(0, (num >> 16) - amount);
            const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
            const b = Math.max(0, (num & 0x0000FF) - amount);
            return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
        };
        // Light version with alpha
        const hexToRgba = (hex, alpha) => {
            const num = parseInt(hex.replace('#', ''), 16);
            const r = (num >> 16) & 255;
            const g = (num >> 8) & 255;
            const b = num & 255;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        setEditingBrand(prev => ({
            ...prev,
            theme: {
                primaryColor: hex,
                primaryHover: darken(hex, 30),
                primaryLight: hexToRgba(hex, 0.1)
            }
        }));
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="loading-state">
                    <Loader2 size={32} className="spin" />
                    <p>Yukleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.message}
                </div>
            )}

            <header className="admin-header">
                <div>
                    <h1 className="text-h2">Marka Yonetimi</h1>
                    <p className="text-body">Marka logolari, renkleri ve bilgilerini duzenleyin</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={handleSeed}>
                        <RefreshCw size={18} />
                        Varsayilanlar
                    </button>
                    <button className="btn btn-primary" onClick={handleNew}>
                        <Plus size={18} />
                        Yeni Marka
                    </button>
                </div>
            </header>

            {/* Brand Cards */}
            <div className="brands-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                {brands.map(brand => (
                    <div key={brand.id} className="card" style={{ padding: '1.5rem', cursor: 'pointer', borderLeft: `4px solid ${brand.theme?.primaryColor || '#ccc'}`, opacity: brand.isActive ? 1 : 0.5 }} onClick={() => handleEdit(brand)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            {brand.logo ? (
                                <img src={brand.logo} alt={brand.name} style={{ height: '48px', objectFit: 'contain', maxWidth: '120px' }} />
                            ) : (
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: brand.theme?.primaryColor || '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
                                    {brand.name?.charAt(0)}
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{brand.name}</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>{brand.id}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                {brand.isActive ? <Eye size={16} style={{ color: '#34C759' }} /> : <EyeOff size={16} style={{ color: '#999' }} />}
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: brand.theme?.primaryColor || '#ccc', border: '2px solid #fff', boxShadow: '0 0 0 1px #ddd' }} />
                            </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{brand.taglineTr || brand.tagline}</p>
                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#888' }}>
                            {brand.email && <span>{brand.email}</span>}
                            {brand.phone && <span>| {brand.phone}</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingBrand && (
                <div className="modal-overlay" onClick={() => setEditingBrand(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
                        <button className="modal-close" onClick={() => setEditingBrand(null)}><X size={24} /></button>
                        <h2 style={{ marginBottom: '1.5rem' }}>{isNew ? 'Yeni Marka' : 'Marka Duzenle'}</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Logo */}
                            <div className="form-group">
                                <label>Logo</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {editingBrand.logo ? (
                                        <img src={editingBrand.logo} alt="Logo" style={{ height: '60px', objectFit: 'contain', maxWidth: '160px', background: '#f5f5f5', padding: '8px', borderRadius: '8px' }} />
                                    ) : (
                                        <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: editingBrand.theme?.primaryColor || '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.5rem' }}>
                                            {editingBrand.name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                                        <Upload size={14} /> Logo Yukle
                                        <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                                    </label>
                                    {editingBrand.logo && (
                                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingBrand(prev => ({ ...prev, logo: '' }))}>
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* ID & Name */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Marka ID *</label>
                                    <input
                                        type="text"
                                        value={editingBrand.id}
                                        onChange={e => setEditingBrand(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') }))}
                                        disabled={!isNew}
                                        placeholder="ornek: freegarden"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Marka Adi *</label>
                                    <input
                                        type="text"
                                        value={editingBrand.name}
                                        onChange={e => setEditingBrand(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="FreeGarden"
                                    />
                                </div>
                            </div>

                            {/* Taglines */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Slogan (EN)</label>
                                    <input
                                        type="text"
                                        value={editingBrand.tagline}
                                        onChange={e => setEditingBrand(prev => ({ ...prev, tagline: e.target.value }))}
                                        placeholder="Premium Plastic Solutions"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Slogan (TR)</label>
                                    <input
                                        type="text"
                                        value={editingBrand.taglineTr}
                                        onChange={e => setEditingBrand(prev => ({ ...prev, taglineTr: e.target.value }))}
                                        placeholder="Premium Plastik Cozumler"
                                    />
                                </div>
                            </div>

                            {/* Contact */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={editingBrand.email}
                                        onChange={e => setEditingBrand(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="info@freegarden.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Telefon</label>
                                    <input
                                        type="text"
                                        value={editingBrand.phone}
                                        onChange={e => setEditingBrand(prev => ({ ...prev, phone: e.target.value }))}
                                        placeholder="+90 500 123 45 67"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>WhatsApp Numarasi</label>
                                    <input
                                        type="text"
                                        value={editingBrand.whatsapp}
                                        onChange={e => setEditingBrand(prev => ({ ...prev, whatsapp: e.target.value }))}
                                        placeholder="905001234567"
                                    />
                                    <small style={{ color: '#888', fontSize: '0.75rem' }}>Ulke kodu ile, bosluksuz (ornek: 905001234567)</small>
                                </div>
                                <div className="form-group">
                                    <label>Website</label>
                                    <input
                                        type="text"
                                        value={editingBrand.website}
                                        onChange={e => setEditingBrand(prev => ({ ...prev, website: e.target.value }))}
                                        placeholder="www.freegarden.com"
                                    />
                                </div>
                            </div>

                            {/* Theme Color */}
                            <div className="form-group">
                                <label><Palette size={16} /> Marka Rengi</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <input
                                        type="color"
                                        value={editingBrand.theme?.primaryColor || '#34C759'}
                                        onChange={e => handlePrimaryColorChange(e.target.value)}
                                        style={{ width: '48px', height: '48px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                    />
                                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                                        <div style={{ flex: 1, padding: '12px', borderRadius: '8px', background: editingBrand.theme?.primaryColor, color: '#fff', textAlign: 'center', fontSize: '0.85rem' }}>
                                            Primary
                                        </div>
                                        <div style={{ flex: 1, padding: '12px', borderRadius: '8px', background: editingBrand.theme?.primaryHover, color: '#fff', textAlign: 'center', fontSize: '0.85rem' }}>
                                            Hover
                                        </div>
                                        <div style={{ flex: 1, padding: '12px', borderRadius: '8px', background: editingBrand.theme?.primaryLight, textAlign: 'center', fontSize: '0.85rem' }}>
                                            Light
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active & Order */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Sira</label>
                                    <input
                                        type="number"
                                        value={editingBrand.order || 0}
                                        onChange={e => setEditingBrand(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Durum</label>
                                    <button
                                        className={`btn ${editingBrand.isActive ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                        onClick={() => setEditingBrand(prev => ({ ...prev, isActive: !prev.isActive }))}
                                        style={{ marginTop: '4px' }}
                                    >
                                        {editingBrand.isActive ? <><Eye size={14} /> Aktif</> : <><EyeOff size={14} /> Pasif</>}
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                {!isNew && (
                                    <button className="btn btn-ghost" onClick={() => handleDelete(editingBrand.id)} style={{ color: '#ef4444', marginRight: 'auto' }}>
                                        <Trash2 size={16} /> Sil
                                    </button>
                                )}
                                <button className="btn btn-secondary" onClick={() => setEditingBrand(null)}>
                                    Iptal
                                </button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <><Loader2 size={16} className="spin" /> Kaydediliyor...</> : <><Save size={16} /> Kaydet</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Brands;
