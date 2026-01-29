import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Filter, Download, Loader2, GripVertical, X, FileText, CheckCircle, FileSpreadsheet, Copy, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { products as defaultProducts, materials, colors } from '../../data/products';
import { generateProductCatalog } from '../../utils/pdfGenerator';
import { productsApi, categoriesApi } from '../../utils/api';
import ProductEditModal from '../../components/ProductEditModal';
import '../Dashboard.css';

const Products = () => {
    const { t, language } = useLanguage();

    // Original State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSearchCategory] = useState('all');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportComplete, setExportComplete] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Drag & Drop state
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);
    const [isSavingOrder, setIsSavingOrder] = useState(false);

    // Toast notification state
    const [toast, setToast] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const copyToClipboard = async (text, productId) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(productId);
            showToast('Kopyalandı: ' + text);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
            showToast('Kopyalama başarısız', 'error');
        }
    };

    // Load products and categories from API
    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await productsApi.getAll();
            setProducts(data.length > 0 ? data : defaultProducts);
        } catch (err) {
            console.error('API Error:', err);
            setError('API bağlantısı başarısız. Varsayılan ürünler yükleniyor...');
            setProducts(defaultProducts);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await categoriesApi.getAll();
            setCategories(data);
        } catch (err) {
            console.error('Kategoriler yüklenemedi:', err);
        }
    };

    const getProductName = (product) => {
        const langKey = `name${language.charAt(0).toUpperCase() + language.slice(1)}`;
        return product[langKey] || product.name;
    };

    const getCategoryName = (catId) => {
        const cat = categories.find(c => c.id === catId);
        const langKey = `name${language.charAt(0).toUpperCase() + language.slice(1)}`;
        return cat?.[langKey] || cat?.name || catId;
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = getProductName(p).toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Check if drag & drop should be enabled (only when no filters are active)
    const isDragEnabled = searchQuery === '' && selectedCategory === 'all';

    const openExportModal = () => {
        setShowExportModal(true);
        setExportProgress(0);
        setExportComplete(false);
        setIsExporting(false);
    };

    const closeExportModal = () => {
        setShowExportModal(false);
        setExportProgress(0);
        setExportComplete(false);
        setIsExporting(false);
    };

    const handleExportPdf = async () => {
        setIsExporting(true);
        setExportProgress(0);
        setExportComplete(false);

        try {
            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setExportProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + Math.random() * 15;
                });
            }, 200);

            await generateProductCatalog(filteredProducts, categories);

            clearInterval(progressInterval);
            setExportProgress(100);
            setExportComplete(true);

            setTimeout(() => {
                showToast('PDF başarıyla indirildi');
            }, 500);
        } catch (error) {
            console.error('PDF Export Error:', error);
            showToast('PDF oluşturulamadı', 'error');
            closeExportModal();
        } finally {
            setIsExporting(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
            try {
                await productsApi.delete(id);
                setProducts(products.filter(p => (p._id || p.id) !== id));
                showToast('Ürün silindi');
            } catch (err) {
                console.error('Delete error:', err);
                showToast('Silme işlemi başarısız!', 'error');
            }
        }
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (productData) => {
        try {
            if (editingProduct) {
                // Update existing product
                const updated = await productsApi.update(editingProduct._id || editingProduct.id, productData);
                setProducts(products.map(p =>
                    (p._id || p.id) === (updated._id || updated.id) ? updated : p
                ));
                showToast('Ürün güncellendi');
            } else {
                // Add new product(s)
                if (productData.createSeparateVariants && productData.colorVariants?.length > 0) {
                    // Create separate product for each color variant
                    const createdProducts = await productsApi.createWithVariants(productData);
                    setProducts([...createdProducts, ...products]);
                    showToast(`${createdProducts.length} ürün başarıyla oluşturuldu!`);
                } else {
                    // Create single product
                    const created = await productsApi.create(productData);
                    setProducts([created, ...products]);
                    showToast('Ürün eklendi');
                }
            }
        } catch (err) {
            console.error('Save error:', err);
            showToast('Kaydetme işlemi başarısız!', 'error');
        }
    };

    // Drag & Drop handlers
    const handleDragStart = (e, product) => {
        if (!isDragEnabled) return;
        setDraggedItem(product);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging');
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const handleDragOver = (e, product) => {
        e.preventDefault();
        if (!isDragEnabled) return;
        if (draggedItem && (draggedItem._id || draggedItem.id) !== (product._id || product.id)) {
            setDragOverItem(product);
        }
    };

    const handleDragLeave = () => {
        setDragOverItem(null);
    };

    const handleDrop = async (e, targetProduct) => {
        e.preventDefault();
        if (!isDragEnabled) return;
        if (!draggedItem || (draggedItem._id || draggedItem.id) === (targetProduct._id || targetProduct.id)) return;

        // Calculate new order
        const newProducts = [...products];
        const draggedIndex = newProducts.findIndex(p => (p._id || p.id) === (draggedItem._id || draggedItem.id));
        const targetIndex = newProducts.findIndex(p => (p._id || p.id) === (targetProduct._id || targetProduct.id));

        // Remove dragged item and insert at new position
        const [removed] = newProducts.splice(draggedIndex, 1);
        newProducts.splice(targetIndex, 0, removed);

        // Update local state immediately for smooth UX
        setProducts(newProducts);
        setDraggedItem(null);
        setDragOverItem(null);

        // Save to backend
        try {
            setIsSavingOrder(true);
            const orderedIds = newProducts.map(p => p._id || p.id);
            await productsApi.reorder(orderedIds);
            showToast('Sıralama güncellendi');
        } catch (err) {
            console.error('Reorder error:', err);
            showToast('Sıralama kaydedilemedi!', 'error');
            // Revert on error
            loadProducts();
        } finally {
            setIsSavingOrder(false);
        }
    };

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
                    <h1 className="text-h2">{t('products')}</h1>
                    <p className="text-body">Ürün kataloğunuzu yönetin</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={openExportModal}
                    >
                        <Download size={18} />
                        Dışa Aktar
                    </button>
                    <button className="btn btn-primary" onClick={handleAddProduct}>
                        <Plus size={18} />
                        Ürün Ekle
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Ad veya barkod ile ara..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">Tüm Kategoriler</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{getCategoryName(cat.id)}</option>
                    ))}
                </select>
                <span className="results-count">
                    {filteredProducts.length} ürün
                    {isSavingOrder && <Loader2 size={14} className="animate-spin" style={{ marginLeft: '8px' }} />}
                </span>
            </div>

            {/* Drag hint */}
            {isDragEnabled && (
                <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <GripVertical size={16} />
                    Sıralamayı değiştirmek için satırları sürükleyip bırakın
                </p>
            )}

            {/* Products Table */}
            <div className="data-table card">
                <table>
                    <thead>
                        <tr>
                            {isDragEnabled && <th style={{ width: '40px' }}></th>}
                            <th>Ürün</th>
                            <th>Barkod</th>
                            <th>Kategori</th>
                            <th>Boyutlar</th>
                            <th>Ağırlık</th>
                            <th>Renkler</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr
                                key={product._id || product.id}
                                draggable={isDragEnabled}
                                onDragStart={(e) => handleDragStart(e, product)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, product)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, product)}
                                style={{
                                    cursor: isDragEnabled ? 'grab' : 'default',
                                    transition: 'background-color 0.2s, border-color 0.2s',
                                    borderLeft: dragOverItem && (dragOverItem._id || dragOverItem.id) === (product._id || product.id)
                                        ? '3px solid var(--color-primary)'
                                        : '3px solid transparent'
                                }}
                                className={dragOverItem && (dragOverItem._id || dragOverItem.id) === (product._id || product.id) ? 'drag-over' : ''}
                            >
                                {isDragEnabled && (
                                    <td style={{ color: 'var(--color-text-muted)', cursor: 'grab' }}>
                                        <GripVertical size={16} />
                                    </td>
                                )}
                                <td>
                                    <div className="product-cell">
                                        <img src={product.image} alt="" className="product-thumb" />
                                        <span className="product-name">{getProductName(product)}</span>
                                    </div>
                                </td>
                                <td>
                                    <button
                                        className="sku-copy-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(product.sku || product._id || product.id, product._id || product.id);
                                        }}
                                        title="Tıkla ve kopyala"
                                    >
                                        <span className="sku-text">{product.sku}</span>
                                        {copiedId === (product._id || product.id) ? (
                                            <Check size={14} className="copy-icon copied" />
                                        ) : (
                                            <Copy size={14} className="copy-icon" />
                                        )}
                                    </button>
                                </td>
                                <td>
                                    {getCategoryName(product.category)}
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                                        {product.category}
                                    </div>
                                </td>
                                <td>{product.dimensions?.width}×{product.dimensions?.height}{product.dimensions?.depth ? `×${product.dimensions.depth}` : ''} cm</td>
                                <td>{product.weight} kg</td>
                                <td>
                                    <div className="color-dots">
                                        {product.colors?.slice(0, 4).map(colorId => {
                                            const color = colors.find(c => c.id === colorId);
                                            return <span key={colorId} className="color-dot" style={{ backgroundColor: color?.hex }} />;
                                        })}
                                        {product.colors?.length > 4 && <span className="more">+{product.colors.length - 4}</span>}
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${product.inStock ? 'in-stock' : 'out-stock'}`}>
                                        {product.inStock ? 'Stokta' : 'Tükendi'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="action-btn" title="Görüntüle"><Eye size={16} /></button>
                                        <button className="action-btn" title="Düzenle" onClick={() => handleEditProduct(product)}>
                                            <Edit size={16} />
                                        </button>
                                        <button className="action-btn danger" title="Sil" onClick={() => handleDelete(product._id || product.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Product Edit Modal */}
            <ProductEditModal
                product={editingProduct}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProduct}
            />

            {/* Export Modal */}
            {showExportModal && (
                <div className="modal-overlay" onClick={closeExportModal}>
                    <div className="export-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeExportModal}>
                            <X size={20} />
                        </button>

                        <div className="export-modal-content">
                            {!isExporting && !exportComplete ? (
                                // Export Options
                                <>
                                    <div className="export-icon">
                                        <FileText size={48} />
                                    </div>
                                    <h2>Katalog Dışa Aktar</h2>
                                    <p className="export-subtitle">
                                        {filteredProducts.length} ürün PDF olarak indirilecek
                                    </p>

                                    <div className="export-info">
                                        <div className="info-item">
                                            <span className="info-label">Format</span>
                                            <span className="info-value">PDF Katalog</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">İçerik</span>
                                            <span className="info-value">Görsel, Bilgi, Renkler</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Kağıt</span>
                                            <span className="info-value">A4 Dikey</span>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary export-btn"
                                        onClick={handleExportPdf}
                                    >
                                        <Download size={20} />
                                        PDF İndir
                                    </button>
                                </>
                            ) : isExporting && !exportComplete ? (
                                // Progress State
                                <>
                                    <div className="export-progress-ring">
                                        <svg viewBox="0 0 100 100">
                                            <circle className="progress-bg" cx="50" cy="50" r="45" />
                                            <circle
                                                className="progress-fill"
                                                cx="50" cy="50" r="45"
                                                style={{
                                                    strokeDasharray: `${2 * Math.PI * 45}`,
                                                    strokeDashoffset: `${2 * Math.PI * 45 * (1 - exportProgress / 100)}`
                                                }}
                                            />
                                        </svg>
                                        <span className="progress-text">{Math.round(exportProgress)}%</span>
                                    </div>
                                    <h2>PDF Oluşturuluyor</h2>
                                    <p className="export-subtitle">Lütfen bekleyin...</p>
                                </>
                            ) : (
                                // Complete State
                                <>
                                    <div className="export-success-icon">
                                        <CheckCircle size={64} />
                                    </div>
                                    <h2>İndirme Tamamlandı!</h2>
                                    <p className="export-subtitle">
                                        PDF dosyanız indirildi
                                    </p>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={closeExportModal}
                                    >
                                        Kapat
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
