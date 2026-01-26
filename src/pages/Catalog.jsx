import React, { useState, useEffect } from 'react';
import { Search, X, Ruler, Weight, Box, ChevronRight, FileText, Eye, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { categories, colors, materials } from '../data/products';
import { productsApi } from '../utils/api';
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
const ProductModal = ({ product, onClose, onRequestQuote, language, t, allProducts, onSwitchProduct }) => {
    if (!product) return null;

    const [selectedColor, setSelectedColor] = useState(null);
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
                            <span className="modal-sku">{product.sku || 'SKU-000'}</span>
                            <h2>{getProductName(product, language) || 'Yeni Ürün'}</h2>
                            {categoryObj && (
                                <span className="modal-category">
                                    {getCategoryName(categoryObj, language)}
                                </span>
                            )}
                        </div>

                        <p className="modal-description">
                            {product[`description${language.charAt(0).toUpperCase() + language.slice(1)}`] || product.description}
                        </p>

                        <div className="modal-specs">
                            <div className="spec-item">
                                <label>{t('dimensions')}</label>
                                <span>
                                    {product.dimensions?.width || 0} × {product.dimensions?.height || 0} × {product.dimensions?.depth || 0} cm
                                </span>
                            </div>
                            <div className="spec-item">
                                <label>{t('weight')}</label>
                                <span>{product.weight || 0} kg</span>
                            </div>
                            {material && (
                                <div className="spec-item">
                                    <label>{t('material')}</label>
                                    <span>{material.name}</span>
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

                        <div className="modal-actions">
                            <button className="btn-primary" onClick={() => onRequestQuote(product)}>
                                <FileText size={20} />
                                <span>{language === 'tr' ? 'Teklif Al' : 'Get Quote'}</span>
                            </button>
                            <a href="/showroom" className="btn-secondary">
                                <Eye size={20} />
                                <span>{language === 'tr' ? 'Showroom' : 'Showroom'}</span>
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
        const scale = product.imageScale || 100;
        // Normalize scale: 100% = 1, range 50-200 maps to 0.7-1.3 for subtle visual effect
        const normalizedScale = 0.7 + ((scale - 50) / 150) * 0.6;
        return {
            transform: `scale(${normalizedScale})`,
            transition: 'transform 0.3s ease'
        };
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
                    <span>{product.dimensions?.width || 0}×{product.dimensions?.height || 0}×{product.dimensions?.depth || 0} cm</span>
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
    const [loading, setLoading] = useState(true);

    // Load products from API
    useEffect(() => {
        loadProducts();
    }, []);

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
                />
            )}

            {/* Hero */}
            <section className="catalog-hero">
                <div className="container">
                    <h1 className="text-h1">{t('ourProducts')}</h1>
                    <p className="text-body">{t('premiumPlasticSolutions')}</p>
                </div>
            </section>

            {/* Toolbar */}
            <section className="catalog-toolbar container">
                <div className="category-pills">
                    <button
                        className={`category-pill ${activeCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('all')}
                    >
                        {t('all')}
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            {getCategoryName(cat, language)}
                        </button>
                    ))}
                </div>
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder={t('searchProducts')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </section>

            {/* Products Count */}
            <section className="container">
                <p className="results-count">{filteredProducts.length} {t('products').toLowerCase()}</p>
            </section>

            {/* Products Grid */}
            <section className="products-section container">
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
                    <div className="no-results">
                        <h3>No products found</h3>
                        <p>Try adjusting your search or filter</p>
                        <button className="btn btn-secondary" onClick={() => {
                            setActiveCategory('all');
                            setSearchQuery('');
                        }}>
                            Clear Filters
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Catalog;
