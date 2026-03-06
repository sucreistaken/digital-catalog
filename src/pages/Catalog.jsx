import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Ruler, Weight, Box, ChevronRight, Eye, Loader2, Copy, Check, Package, Layers, Hash, Droplets, ChevronDown, Filter } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useBrand } from '../context/BrandContext';
import { colors as staticColors, materials } from '../data/products';
import { productsApi, categoriesApi, colorsApi } from '../utils/api';
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

// Get color info (uses provided colors list, falls back to static)
const getColor = (colorId, colorsList) => {
    return colorsList?.find(c => c.id === colorId) || staticColors.find(c => c.id === colorId);
};

// Product Modal (Standard Version)
const ProductModal = ({ product, onClose, language, t, allProducts, onSwitchProduct, categories, colorsList, brand }) => {
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
    const selectedColorName = getColor(selectedColor, colorsList)?.name || '';

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
                                <span>{product.sku || 'Barkod'}</span>
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
                            {(product.packageDimensions?.width > 0 || product.packageDimensions?.height > 0 || product.packageDimensions?.depth > 0) && (
                                <div className="spec-card">
                                    <Box size={18} />
                                    <span className="spec-label">{t('packageDimensions')}</span>
                                    <span className="spec-value">
                                        {product.packageDimensions?.width || 0} × {product.packageDimensions?.height || 0} {product.packageDimensions?.depth > 0 ? `× ${product.packageDimensions.depth}` : ''} cm
                                    </span>
                                </div>
                            )}
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
                                    const color = getColor(colorId, colorsList);
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
                                        const color = getColor(colorId, colorsList);
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
                                    const color = getColor(v.colorId, colorsList);
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
                            <a
                                href={`https://wa.me/${brand?.whatsapp || '905492074444'}?text=${encodeURIComponent(
                                    `${language === 'tr' ? 'Merhaba, bu urun hakkinda bilgi almak istiyorum' : 'Hello, I would like to get information about this product'}:\n${getProductName(product, language)} (${product.sku || ''})`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="modal-btn-primary"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                <span>{language === 'tr' ? 'Teklif Al' : 'Get Quote'}</span>
                            </a>
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
const ProductCard = ({ product, onClick, language, t, index = 0, colorsList }) => {
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
        <div
            className="product-card card-animate-in"
            onClick={() => onClick(product)}
            style={{ animationDelay: `${Math.min(index * 0.04, 0.6)}s` }}
        >
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
                <span className="product-sku">{product.sku || 'Barkod'}</span>
                <h3>{getProductName(product, language) || 'Yeni Ürün'}</h3>
                <div className="product-specs-mini">
                    <span>{product.dimensions?.width || 0}×{product.dimensions?.height || 0}{product.dimensions?.depth > 0 ? `×${product.dimensions.depth}` : ''} cm</span>
                    <span>•</span>
                    <span>{product.volume ? `${product.volume} Lt` : `${product.weight || 0} kg`}</span>
                </div>
                <div className="product-colors-mini">
                    {product.colors && product.colors.slice(0, 4).map(colorId => {
                        const color = getColor(colorId, colorsList);
                        return <div key={colorId} className="mini-swatch" style={{ backgroundColor: color?.hex || '#ccc' }} />;
                    })}
                    {product.colors && product.colors.length > 4 && <span className="more-colors">+{product.colors.length - 4}</span>}
                </div>
            </div>
        </div>
    );
};

// Skeleton Card for loading state
const SkeletonCard = () => (
    <div className="product-card skeleton-card">
        <div className="product-image skeleton-image">
            <div className="skeleton-pulse" />
        </div>
        <div className="product-info">
            <div className="skeleton-line skeleton-line-sm" />
            <div className="skeleton-line skeleton-line-lg" />
            <div className="skeleton-line skeleton-line-md" />
            <div className="skeleton-swatches">
                {[1, 2, 3].map(i => <div key={i} className="skeleton-swatch" />)}
            </div>
        </div>
    </div>
);

const Catalog = () => {
    const { t, language } = useLanguage();
    const { brand } = useBrand();
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [colorsList, setColorsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const MAX_VISIBLE_CATEGORIES = 5;

    // Load products, categories and colors from API
    useEffect(() => {
        loadProducts();
        loadCategories();
        loadColors();
    }, [brand?.id]);

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
            const data = await productsApi.getAll(brand?.id);
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
            const data = await categoriesApi.getAll(brand?.id);
            setCategories(data);
        } catch (err) {
            console.error('Kategoriler yüklenemedi:', err);
            setCategories([]);
        }
    };

    const loadColors = async () => {
        try {
            const data = await colorsApi.getAll();
            setColorsList(data);
        } catch (err) {
            console.error('Renkler yüklenemedi:', err);
        }
    };

    // Products visible in catalog (excluding hidden)
    const visibleProducts = products.filter(p => !p.hiddenFromCatalog);

    const filteredProducts = visibleProducts
        .filter(product => {
            const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
            const name = getProductName(product, language).toLowerCase();
            const matchesSearch = name.includes(searchQuery.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => {
            // Sort by category order first, then by product order within category
            const catA = categories.find(c => c.id === a.category);
            const catB = categories.find(c => c.id === b.category);
            const catOrderA = catA?.order ?? 999;
            const catOrderB = catB?.order ?? 999;
            if (catOrderA !== catOrderB) return catOrderA - catOrderB;
            return (a.order || 0) - (b.order || 0);
        });


    const catalogContentRef = React.useRef(null);
    const scrollContainerRef = React.useRef(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(false);

    // Auto-scroll to products on mobile/tablet
    useEffect(() => {
        if (!loading && catalogContentRef.current && window.innerWidth <= 900) {
            setTimeout(() => {
                catalogContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    }, [loading]);

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
                    language={language}
                    t={t}
                    allProducts={products}
                    onSwitchProduct={setSelectedProduct}
                    categories={categories}
                    colorsList={colorsList}
                    brand={brand}
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
                                <span className="cat-count">{visibleProducts.length}</span>
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`cat-row ${activeCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    <span className="cat-name">{getCategoryName(cat, language)}</span>
                                    <span className="cat-count">
                                        {visibleProducts.filter(p => p.category === cat.id).length}
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
                <div className="catalog-content" ref={catalogContentRef}>
                    {loading ? (
                        <>
                            <div className="content-header">
                                <div className="header-left">
                                    <h2 className="section-title">{language === 'tr' ? 'Tüm Ürünler' : 'All Products'}</h2>
                                </div>
                            </div>
                            <div className="products-grid">
                                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        </>
                    ) : activeCategory === 'all' && !searchQuery ? (
                        /* Grouped by category view */
                        <>
                            {categories
                                .filter(cat => filteredProducts.some(p => p.category === cat.id))
                                .map(cat => {
                                    const catProducts = filteredProducts.filter(p => p.category === cat.id);
                                    return (
                                        <div key={cat.id} className="catalog-category-section">
                                            <div className="category-section-header">
                                                <div>
                                                    <h2 className="section-title">{getCategoryName(cat, language)}</h2>
                                                    <p className="results-text">
                                                        <strong>{catProducts.length}</strong> {t('products').toLowerCase()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="products-grid">
                                                {catProducts.map((product, index) => (
                                                    <ProductCard
                                                        key={product._id || product.id}
                                                        product={product}
                                                        onClick={setSelectedProduct}
                                                        language={language}
                                                        t={t}
                                                        index={index}
                                                        colorsList={colorsList}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            {/* Products without a matching category */}
                            {(() => {
                                const categoryIds = categories.map(c => c.id);
                                const uncategorized = filteredProducts.filter(p => !categoryIds.includes(p.category));
                                if (uncategorized.length === 0) return null;
                                return (
                                    <div className="catalog-category-section">
                                        <div className="category-section-header">
                                            <div>
                                                <h2 className="section-title">{language === 'tr' ? 'Ürünler' : 'Products'}</h2>
                                                <p className="results-text">
                                                    <strong>{uncategorized.length}</strong> {t('products').toLowerCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="products-grid">
                                            {uncategorized.map((product, index) => (
                                                <ProductCard
                                                    key={product._id || product.id}
                                                    product={product}
                                                    onClick={setSelectedProduct}
                                                    language={language}
                                                    t={t}
                                                    index={index}
                                                    colorsList={colorsList}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </>
                    ) : (
                        /* Filtered / single category view */
                        <>
                            <div className="content-header">
                                <div className="header-left">
                                    <h2 className="section-title">
                                        {activeCategory === 'all'
                                            ? (language === 'tr' ? 'Arama Sonuçları' : 'Search Results')
                                            : getCategoryName(categories.find(c => c.id === activeCategory), language)
                                        }
                                    </h2>
                                    <p className="results-text">
                                        <strong>{filteredProducts.length}</strong> {t('products').toLowerCase()}
                                    </p>
                                </div>
                            </div>
                            <div className="products-grid">
                                {filteredProducts.map((product, index) => (
                                    <ProductCard
                                        key={product._id || product.id}
                                        product={product}
                                        onClick={setSelectedProduct}
                                        language={language}
                                        t={t}
                                        index={index}
                                        colorsList={colorsList}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {!loading && filteredProducts.length === 0 && (
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
