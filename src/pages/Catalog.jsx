import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Ruler, Weight, Box, ChevronRight, FileText, Eye, Loader2, Copy, Check, Package, Layers, Hash, Droplets, ChevronDown, Filter } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { colors, materials } from '../data/products';
import { productsApi, categoriesApi } from '../utils/api';
import './Catalog.css';

// Get localized product name
const getProductName = (product, language) => {
    const langKey = `name${language.charAt(0).toUpperCase() + language.slice(1)}`;
    return product[langKey] || product.name;
};

// Get localized category name
const getCategoryName = (category, language) => {
    const langKey = `name${language.charAt(0).toUpperCase() + language.slice(1)}`;
    return category[langKey] || category.name;
};

// Get material info
const getMaterial = (materialId) => materials.find(m => m.id === materialId);

// Get color info
const getColor = (colorId) => colors.find(c => c.id === colorId);

// Product Modal (Standard Version)
const ProductModal = ({ product, onClose, onRequestQuote, language, t, allProducts, onSwitchProduct, categories }) => {
    if (!product) return null;

    if (!product) return null;

    // Initialize with default color if available
    const [selectedColor, setSelectedColor] = useState(product.primaryColor?.id || product.defaultColor || null);

    // Update selected color if product changes (safety check, though component remounts usually handle this)
    useEffect(() => {
        setSelectedColor(product.primaryColor?.id || product.defaultColor || null);
    }, [product]);

    const material = getMaterial(product.material);
    const categoryObj = categories.find(c => c.id === product.category);

    // Get filter style for selected color AND imageScale
    const getImageStyle = () => {
        let style = { transition: 'filter 0.3s ease, transform 0.3s ease' };

        // Apply imageScale
        const scale = product.imageScale || 100;
        const normalizedScale = 0.7 + ((scale - 50) / 150) * 0.6;
        style.transform = `scale(${normalizedScale})`;

        // Apply color filter
        if (selectedColor) {
            const variant = product.colorVariants?.find(v => v.colorId === selectedColor);
            if (variant) {
                style.filter = `hue-rotate(${variant.hue}deg) saturate(${variant.saturation / 100})`;
            }
        }
        return style;
    };

    // Determine current display color name
    const selectedColorName = getColor(selectedColor)?.name || '';

    // Copy to clipboard
    const [copied, setCopied] = useState(false);
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    return (
        <div className="product-modal-overlay" onClick={onClose}>
            <div className="product-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>
                <div className="modal-content">
                    <div className="modal-image">
                        <img
                            src={product.image}
                            alt={getProductName(product, language)}
                            style={getImageStyle()}
                        />
                        {!product.inStock && (
                            <div className="out-stock-badge">{t('outOfStock')}</div>
                        )}
                    </div>
                    <div className="modal-details">
                        <div className="modal-header">
                            <button
                                className="modal-sku-btn"
                                onClick={() => copyToClipboard(product.sku || product._id)}
                                title="Tıkla ve kopyala"
                            >
                                <span>{product.sku || 'SKU-000'}</span>
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                            <h2>{getProductName(product, language) || 'Yeni Ürün'}</h2>
                            {categoryObj && (
                                <span className="modal-category-badge">
                                    {getCategoryName(categoryObj, language)}
                                </span>
                            )}
                        </div>

                        {(product.description || product.descriptionTr) && (
                            <p className="modal-description">
                                {product[`description${language.charAt(0).toUpperCase() + language.slice(1)}`] || product.description}
                            </p>
                        )}

                        <div className="modal-specs-grid">
                            <div className="spec-card">
                                <Ruler size={18} />
                                <span className="spec-label">{t('dimensions')}</span>
                                <span className="spec-value">
                                    {product.dimensions?.width || 0} × {product.dimensions?.height || 0} {product.dimensions?.depth > 0 ? `× ${product.dimensions.depth}` : ''} cm
                                </span>
                            </div>
                            <div className="spec-card">
                                <Weight size={18} />
                                <span className="spec-label">{t('weight')}</span>
                                <span className="spec-value">{product.weight || 0} kg</span>
                            </div>
                            {material && (
                                <div className="spec-card">
                                    <Layers size={18} />
                                    <span className="spec-label">{t('material')}</span>
                                    <span className="spec-value">{material.name}</span>
                                </div>
                            )}
                            {product.volume > 0 && (
                                <div className="spec-card">
                                    <Droplets size={18} />
                                    <span className="spec-label">{t('volume')}</span>
                                    <span className="spec-value">{product.volume} Lt</span>
                                </div>
                            )}
                            {product.piecesInPackage > 0 && (
                                <div className="spec-card">
                                    <Package size={18} />
                                    <span className="spec-label">{t('piecesInPackage')}</span>
                                    <span className="spec-value">{product.piecesInPackage} {product.packageType || ''}</span>
                                </div>
                            )}
                            {product.productCode && (
                                <div className="spec-card">
                                    <Hash size={18} />
                                    <span className="spec-label">{t('productCode')}</span>
                                    <span className="spec-value">{product.productCode}</span>
                                </div>
                            )}
                        </div>

                        <div className="modal-colors">
                            <label>{t('colorOptions')}</label>
                            <div className="color-chips">
                                {/* Current Product Colors */}
                                {product.colors && product.colors.map(colorId => {
                                    const color = getColor(colorId);
                                    return (
                                        <button
                                            key={colorId}
                                            className={`color-chip ${selectedColor === colorId ? 'active' : ''} active-product-chip`}
                                            style={{ backgroundColor: color?.hex }}
                                            onClick={() => setSelectedColor(selectedColor === colorId ? null : colorId)}
                                            title={color?.name}
                                        />
                                    );
                                })}

                                {/* Sibling Products (Same Group) */}
                                {product.groupId && allProducts && allProducts
                                    .filter(p => p.groupId === product.groupId && (p._id || p.id) !== (product._id || product.id))
                                    .map(sibling => {
                                        const colorId = sibling.primaryColor?.id || sibling.colors?.[0];
                                        if (!colorId) return null;
                                        const color = getColor(colorId);
                                        return (
                                            <button
                                                key={sibling._id || sibling.id}
                                                className="color-chip sibling-chip"
                                                style={{ backgroundColor: color?.hex }}
                                                onClick={() => onSwitchProduct(sibling)}
                                                title={`${getProductName(sibling, language)}`}
                                            />
                                        );
                                    })
                                }

                                {/* Legacy Variants */}
                                {product.colorVariants && product.colorVariants.map(v => {
                                    if (product.colors && product.colors.includes(v.colorId)) return null;
                                    const color = getColor(v.colorId);
                                    return (
                                        <button
                                            key={v.colorId}
                                            className={`color-chip ${selectedColor === v.colorId ? 'active' : ''}`}
                                            style={{ backgroundColor: color?.hex }}
                                            onClick={() => setSelectedColor(selectedColor === v.colorId ? null : v.colorId)}
                                            title={v.colorName}
                                        />
                                    );
                                })}
                            </div>
                            {selectedColorName && (
                                <p className="selected-color-name">
                                    {selectedColorName}
                                </p>
                            )}
                        </div>

                        <div className="modal-actions-grid">
                            <button className="modal-btn-primary" onClick={() => onRequestQuote(product)}>
                                <FileText size={18} />
                                <span>{language === 'tr' ? 'Teklif Al' : 'Get Quote'}</span>
                            </button>
                            <a href="/showroom" className="modal-btn-secondary">
                                <Eye size={18} />
                                <span>Showroom</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

// Product Card
const ProductCard = ({ product, onClick, language, t }) => {
    // Calculate scale style from saved imageScale
    const getImageStyle = () => {
        let style = { transition: 'transform 0.3s ease, filter 0.3s ease' };

        const scale = product.imageScale || 100;
        // Normalize scale: 100% = 1, range 50-200 maps to 0.7-1.3 for subtle visual effect
        const normalizedScale = 0.7 + ((scale - 50) / 150) * 0.6;
        style.transform = `scale(${normalizedScale})`;

        // Apply Color Filter
        // Priority: 
        // 1. activeColor (if passed as prop - currently removed)
        // 2. defaultColor (manually set in admin)
        // 3. primaryColor (for auto-generated variant products)
        // 1. activeColor (if passed as prop - currently removed)
        // 2. primaryColor (for auto-generated variant products)
        // 3. defaultColor (manually set in admin)
        const displayColor = product.primaryColor?.id || product.defaultColor;

        if (displayColor) {
            // Find variant for this color to get hue/saturation
            const variant = product.colorVariants?.find(v => v.colorId === displayColor);
            if (variant) {
                style.filter = `hue-rotate(${variant.hue}deg) saturate(${variant.saturation / 100})`;
            }
        }

        return style;
    };

    return (
        <div className="product-card" onClick={() => onClick(product)}>
            <div className="product-image">
                <img
                    src={product.image}
                    alt={getProductName(product, language)}
                    loading="lazy"
                    style={getImageStyle()}
                />
                {product.featured && <span className="featured-badge">Featured</span>}
                {!product.inStock && <div className="out-stock-overlay">{t('outOfStock')}</div>}
            </div>
            <div className="product-info">
                <span className="product-sku">{product.sku || 'SKU-000'}</span>
                <h3>{getProductName(product, language) || 'Yeni Ürün'}</h3>
                <div className="product-specs-mini">
                    <span>{product.dimensions?.width || 0}×{product.dimensions?.height || 0}{product.dimensions?.depth > 0 ? `×${product.dimensions.depth}` : ''} cm</span>
                    <span>•</span>
                    <span>{product.weight || 0} kg</span>
                </div>
                <div className="product-colors-mini">
                    {product.colors && product.colors.slice(0, 4).map(colorId => {
                        const color = getColor(colorId);
                        return <div key={colorId} className="mini-swatch" style={{ backgroundColor: color?.hex || '#ccc' }} />;
                    })}
                    {product.colors && product.colors.length > 4 && <span className="more-colors">+{product.colors.length - 4}</span>}
                </div>
            </div>
        </div>
    );
};

const Catalog = () => {
    const { t, language } = useLanguage();
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const MAX_VISIBLE_CATEGORIES = 5;

    // Load products and categories from API
    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (selectedProduct) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedProduct]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productsApi.getAll();
            setProducts(data);
        } catch (err) {
            console.error('API Error:', err);
            setProducts([]);
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
            setCategories([]);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
        const name = getProductName(product, language).toLowerCase();
        const matchesSearch = name.includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleRequestQuote = (product) => {
        setSelectedProduct(null);
        // Navigate to quote page with product pre-selected
        window.location.href = `/quote?product=${product._id || product.id}`;
    };

    const scrollContainerRef = React.useRef(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(false);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftScroll(scrollLeft > 0);
            setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [categories]);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="catalog">
            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onRequestQuote={handleRequestQuote}
                    language={language}
                    t={t}
                    allProducts={products}
                    onSwitchProduct={setSelectedProduct}
                    categories={categories}
                />
            )}

            {/* Hero */}


            {/* Main Content: Sidebar + Products */}
            <div className="catalog-main container">
                {/* Professional Sidebar Filter */}
                <aside className="catalog-sidebar">
                    <div className="sidebar-header">
                        <h3 className="text-overline">{t('filters')}</h3>
                    </div>

                    <div className="sidebar-section">
                        <div className="search-input-wrapper">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder={t('searchProducts')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h4 className="sidebar-subtitle">{language === 'tr' ? 'Kategoriler' : 'Categories'}</h4>
                        <div className="category-vertical-list">
                            <button
                                className={`cat-row ${activeCategory === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveCategory('all')}
                            >
                                <span className="cat-name">{t('all')}</span>
                                <span className="cat-count">{products.length}</span>
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`cat-row ${activeCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    <span className="cat-name">{getCategoryName(cat, language)}</span>
                                    <span className="cat-count">
                                        {products.filter(p => p.category === cat.id).length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeCategory !== 'all' && (
                        <button
                            className="reset-filters-btn"
                            onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                        >
                            {language === 'tr' ? 'Filtreleri Temizle' : 'Clear Filters'}
                        </button>
                    )}
                </aside>

                {/* Products Grid */}
                <div className="catalog-content">
                    <div className="content-header">
                        <div className="header-left">
                            <h2 className="section-title">
                                {activeCategory === 'all'
                                    ? (language === 'tr' ? 'Tüm Ürünler' : 'All Products')
                                    : getCategoryName(categories.find(c => c.id === activeCategory), language)
                                }
                            </h2>
                            <p className="results-text">
                                <strong>{filteredProducts.length}</strong> {t('products').toLowerCase()}
                            </p>
                        </div>
                    </div>

                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product._id || product.id}
                                product={product}
                                onClick={setSelectedProduct}
                                language={language}
                                t={t}
                            />
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="no-results-state">
                            <div className="no-results-icon">
                                <Search size={48} />
                            </div>
                            <h3>{language === 'tr' ? 'Sonuç bulunamadı' : 'No products found'}</h3>
                            <p>{language === 'tr' ? 'Arama kriterlerinizi değiştirmeyi deneyin.' : 'Try changing your search criteria.'}</p>
                            <button className="btn btn-secondary" onClick={() => {
                                setActiveCategory('all');
                                setSearchQuery('');
                            }}>
                                {language === 'tr' ? 'Tüm Ürünleri Gör' : 'View All Products'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Catalog;
