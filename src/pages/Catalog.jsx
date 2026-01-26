import React, { useState, useEffect } from 'react';
import { Search, X, Ruler, Weight, Box, ChevronRight, FileText, Eye, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { products as defaultProducts, categories, colors, materials } from '../data/products';
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

// Product Modal V2 - matching Showroom design
const ProductModal = ({ product, onClose, onRequestQuote, language, t }) => {
    if (!product) return null;

    const [selectedColor, setSelectedColor] = useState(null);
    const material = getMaterial(product.material);
    const categoryObj = categories.find(c => c.id === product.category);

    // Get filter style for selected color
    const getImageStyle = () => {
        if (!selectedColor) return {};
        const variant = product.colorVariants?.find(v => v.colorId === selectedColor);
        if (variant) {
            return {
                filter: `hue-rotate(${variant.hue}deg) saturate(${variant.saturation / 100})`,
                transition: 'filter 0.3s ease'
            };
        }
        // Fallback or default
        return {};
    };

    return (
        <div className="product-modal-overlay" onClick={onClose}>
            <div className="product-modal-v2" onClick={e => e.stopPropagation()}>
                <button className="modal-close-v2" onClick={onClose}>
                    <X size={20} />
                </button>
                <div className="modal-content-v2">
                    <div className="modal-image-v2">
                        <img
                            src={product.image}
                            alt={getProductName(product, language)}
                            style={getImageStyle()}
                        />
                        {!product.inStock && (
                            <div className="out-stock-badge-v2">{t('outOfStock')}</div>
                        )}
                    </div>
                    <div className="modal-details-v2">
                        <div className="modal-details-scroll">
                            <div className="modal-header-v2">
                                <span className="modal-sku-v2">{product.sku}</span>
                                <h2>{getProductName(product, language)}</h2>
                                {categoryObj && (
                                    <span className="modal-category-v2">
                                        {getCategoryName(categoryObj, language)}
                                    </span>
                                )}
                            </div>

                            <p className="modal-description-v2">
                                {product[`description${language.charAt(0).toUpperCase() + language.slice(1)}`] || product.description}
                            </p>

                            <div className="modal-specs-v2">
                                <div className="spec-card-v2">
                                    <Ruler size={24} />
                                    <div>
                                        <label>{t('dimensions')}</label>
                                        <span>
                                            {product.dimensions.width} × {product.dimensions.height} × {product.dimensions.depth} cm
                                        </span>
                                    </div>
                                </div>
                                <div className="spec-card-v2">
                                    <Weight size={24} />
                                    <div>
                                        <label>{t('weight')}</label>
                                        <span>{product.weight} kg</span>
                                    </div>
                                </div>
                                {material && (
                                    <div className="spec-card-v2">
                                        <Box size={24} />
                                        <div>
                                            <label>{t('material')}</label>
                                            <span>{material.name}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-colors-v2">
                                <label>{t('colorOptions')}</label>
                                <div className="color-chips-v2">
                                    {product.colors.map(colorId => {
                                        const color = getColor(colorId);
                                        if (!color) return null;
                                        return (
                                            <button
                                                key={color.id}
                                                className={`color-chip-v2 ${selectedColor === color.id ? 'active' : ''}`}
                                                style={{ backgroundColor: color.hex }}
                                                onClick={() => setSelectedColor(color.id)}
                                                title={color.name}
                                            />
                                        );
                                    })}
                                </div>
                                {selectedColor && (
                                    <p className="selected-color-name">
                                        {getColor(selectedColor)?.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="modal-actions-v2">
                            <button className="btn-primary-v2" onClick={() => onRequestQuote(product)}>
                                <FileText size={20} />
                                <span>{language === 'tr' ? 'Teklif Al' : 'Get Quote'}</span>
                            </button>
                            <a href="/showroom" className="btn-secondary-v2">
                                <Eye size={20} />
                                <span>{language === 'tr' ? 'Showroom' : 'Showroom'}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Product Card
const ProductCard = ({ product, onClick, language, t }) => (
    <div className="product-card" onClick={() => onClick(product)}>
        <div className="product-image">
            <img src={product.image} alt={getProductName(product, language)} loading="lazy" />
            {product.featured && <span className="featured-badge">Featured</span>}
            {!product.inStock && <div className="out-stock-overlay">{t('outOfStock')}</div>}
        </div>
        <div className="product-info">
            <span className="product-sku">{product.sku}</span>
            <h3>{getProductName(product, language)}</h3>
            <div className="product-specs-mini">
                <span>{product.dimensions.width}×{product.dimensions.height}×{product.dimensions.depth} cm</span>
                <span>•</span>
                <span>{product.weight} kg</span>
            </div>
            <div className="product-colors-mini">
                {product.colors.slice(0, 4).map(colorId => {
                    const color = getColor(colorId);
                    return <div key={colorId} className="mini-swatch" style={{ backgroundColor: color?.hex }} />;
                })}
                {product.colors.length > 4 && <span className="more-colors">+{product.colors.length - 4}</span>}
            </div>
        </div>
    </div>
);

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
            setProducts(data.length > 0 ? data : defaultProducts);
        } catch (err) {
            console.error('API Error:', err);
            setProducts(defaultProducts);
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
