import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X, Upload, Image, Check, AlertCircle, Search, Loader2, Trash2 } from 'lucide-react';
import { productsApi } from '../utils/api';
import './ImageGalleryAssigner.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Intersection Observer based lazy image
const LazyImage = React.memo(({ src, alt, className, onClick, title }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '100px' }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={imgRef} className={className} onClick={onClick} title={title}>
            {!isVisible && <div className="image-skeleton" />}
            {isVisible && !loaded && <div className="image-skeleton" />}
            {isVisible && (
                <img
                    src={src}
                    alt={alt}
                    onLoad={() => setLoaded(true)}
                    style={{ opacity: loaded ? 1 : 0 }}
                />
            )}
        </div>
    );
});

// Product list item - memoized
const ProductItem = React.memo(({ product, isSelected, onClick }) => (
    <div
        className={`product-item ${isSelected ? 'selected' : ''} ${product.image ? 'has-image' : 'no-image'}`}
        onClick={onClick}
    >
        <div className="product-thumb">
            {product.image ? (
                <img src={product.image} alt="" loading="lazy" />
            ) : (
                <div className="no-thumb">?</div>
            )}
        </div>
        <div className="product-details">
            <span className="product-name">{product.nameTr || product.name || 'İsimsiz'}</span>
            <span className="product-sku">{product.sku || '-'}</span>
        </div>
        {product.image && <Check size={14} className="check-icon" />}
    </div>
));

const ImageGalleryAssigner = ({ products, onClose, onUpdate }) => {
    const [galleryImages, setGalleryImages] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [galleryLoading, setGalleryLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [filter, setFilter] = useState('noImage');
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState(null);
    const fileInputRef = useRef(null);

    // Load gallery images - delay to let modal render first
    useEffect(() => {
        const timer = setTimeout(() => {
            loadGallery();
        }, 50); // Small delay to prevent blocking
        return () => clearTimeout(timer);
    }, []);

    const loadGallery = async () => {
        try {
            const res = await fetch(`${API_BASE}/upload/gallery`);
            const data = await res.json();
            setGalleryImages(data.files || []);
        } catch (error) {
            console.error('Gallery load error:', error);
        } finally {
            setGalleryLoading(false);
        }
    };

    // Handle bulk upload
    const handleBulkUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('images', file);
        });

        try {
            const res = await fetch(`${API_BASE}/upload/bulk`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: `${data.files.length} resim yüklendi!` });
                loadGallery();
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Yükleme hatası: ' + error.message });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Memoized filtered products
    const filteredProducts = useMemo(() => {
        const searchLower = searchTerm.toLowerCase();
        return products.filter(product => {
            const matchesSearch = (product.nameTr || product.name || '').toLowerCase().includes(searchLower) ||
                (product.sku || '').toLowerCase().includes(searchLower);

            if (filter === 'noImage') return matchesSearch && !product.image;
            if (filter === 'hasImage') return matchesSearch && product.image;
            return matchesSearch;
        });
    }, [products, searchTerm, filter]);

    const productsWithoutImage = useMemo(() =>
        products.filter(p => !p.image).length,
        [products]
    );

    // Assign image to product - optimistic update
    const handleAssignImage = useCallback(async (imageUrl) => {
        if (!selectedProduct) {
            setMessage({ type: 'error', text: 'Önce bir ürün seçin!' });
            return;
        }

        const currentProduct = selectedProduct;

        // Find next product immediately
        const currentIndex = filteredProducts.findIndex(p => p._id === currentProduct._id);
        const nextProduct = filteredProducts.find((p, i) => i > currentIndex && !p.image);
        setSelectedProduct(nextProduct || null);

        setLoading(true);
        try {
            await productsApi.update(currentProduct._id, { image: imageUrl });
            setMessage({ type: 'success', text: `✓ ${currentProduct.nameTr || currentProduct.name}` });

            // Auto-hide success message
            setTimeout(() => setMessage(null), 1500);

            if (onUpdate) onUpdate();
        } catch (error) {
            setMessage({ type: 'error', text: 'Atama hatası: ' + error.message });
            setSelectedProduct(currentProduct); // Rollback selection
        } finally {
            setLoading(false);
        }
    }, [selectedProduct, filteredProducts, onUpdate]);

    // Clear all gallery images
    const handleClearGallery = useCallback(async () => {
        if (galleryImages.length === 0) return;

        if (!confirm(`Galerideki ${galleryImages.length} resmin tamamı silinecek. Emin misiniz?`)) return;

        try {
            const res = await fetch(`${API_BASE}/upload/all`, {
                method: 'DELETE'
            });

            if (res.ok) {
                const data = await res.json();
                setGalleryImages([]);
                setMessage({ type: 'success', text: data.message });
                setTimeout(() => setMessage(null), 2000);
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Silme hatası: ' + error.message });
        }
    }, [galleryImages.length]);

    const handleProductClick = useCallback((product) => {
        setSelectedProduct(product);
    }, []);

    return (
        <div className="gallery-assigner-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="gallery-assigner-modal">
                {/* Header */}
                <div className="gallery-header">
                    <div className="header-title">
                        <Image size={24} />
                        <h2>Toplu Resim Atama</h2>
                        <span className="pending-count">{productsWithoutImage} ürün bekliyor</span>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                {/* Message */}
                {message && (
                    <div className={`gallery-message ${message.type}`}>
                        {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                        {message.text}
                        <button onClick={() => setMessage(null)}>×</button>
                    </div>
                )}

                <div className="gallery-content">
                    {/* Left: Products List */}
                    <div className="products-panel">
                        <div className="panel-header">
                            <h3>📦 Ürünler</h3>
                            <div className="filter-buttons">
                                <button
                                    className={filter === 'noImage' ? 'active' : ''}
                                    onClick={() => setFilter('noImage')}
                                >
                                    Resmi Yok ({productsWithoutImage})
                                </button>
                                <button
                                    className={filter === 'all' ? 'active' : ''}
                                    onClick={() => setFilter('all')}
                                >
                                    Tümü
                                </button>
                            </div>
                        </div>

                        <div className="search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Ürün ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="products-list">
                            {filteredProducts.map(product => (
                                <ProductItem
                                    key={product._id}
                                    product={product}
                                    isSelected={selectedProduct?._id === product._id}
                                    onClick={() => handleProductClick(product)}
                                />
                            ))}
                            {filteredProducts.length === 0 && (
                                <div className="empty-state">Ürün bulunamadı</div>
                            )}
                        </div>
                    </div>

                    {/* Right: Image Gallery */}
                    <div className="gallery-panel">
                        <div className="panel-header">
                            <h3>🖼️ Galeri ({galleryImages.length})</h3>
                            <div className="gallery-actions">
                                {galleryImages.length > 0 && (
                                    <button
                                        className="clear-btn"
                                        onClick={handleClearGallery}
                                    >
                                        <Trash2 size={16} />
                                        Temizle
                                    </button>
                                )}
                                <button
                                    className="upload-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {uploading ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
                                    {uploading ? 'Yükleniyor...' : 'Resim Yükle'}
                                </button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleBulkUpload}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {selectedProduct && (
                            <div className="selection-info">
                                <strong>Seçili:</strong> {selectedProduct.nameTr || selectedProduct.name}
                                <span className="hint">→ Resme tıkla</span>
                            </div>
                        )}

                        <div className="image-gallery">
                            {galleryLoading ? (
                                <div className="gallery-loading">
                                    <Loader2 size={32} className="spin" />
                                    <p>Yükleniyor...</p>
                                </div>
                            ) : galleryImages.length === 0 ? (
                                <div className="empty-gallery">
                                    <Upload size={48} />
                                    <p>Henüz resim yok</p>
                                    <p>Yukarıdaki butona tıklayarak resim yükleyin</p>
                                </div>
                            ) : (
                                galleryImages.map((img, index) => (
                                    <LazyImage
                                        key={img.filename || index}
                                        src={img.url}
                                        alt=""
                                        className={`gallery-image ${!selectedProduct ? 'disabled' : ''} ${loading ? 'loading' : ''}`}
                                        onClick={() => !loading && handleAssignImage(img.url)}
                                        title={selectedProduct ? 'Tıkla ve ata' : 'Önce ürün seçin'}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="gallery-footer">
                    <span>💡 Ürün seç → Resme tıkla → Otomatik sonrakine geç</span>
                    <button className="done-btn" onClick={onClose}>Tamamla</button>
                </div>
            </div>
        </div>
    );
};

export default ImageGalleryAssigner;
