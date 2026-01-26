import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Filter, Download, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { products as defaultProducts, categories, materials, colors } from '../../data/products';
import { productsApi } from '../../utils/api';
import ProductEditModal from '../../components/ProductEditModal';
import '../Dashboard.css';

const Products = () => {
    const { t, language } = useLanguage();

    // Original State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Load products from API
    useEffect(() => {
        loadProducts();
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

    const handleDelete = async (id) => {
        if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
            try {
                await productsApi.delete(id);
                setProducts(products.filter(p => (p._id || p.id) !== id));
            } catch (err) {
                console.error('Delete error:', err);
                alert('Silme işlemi başarısız!');
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
            } else {
                // Add new product(s)
                if (productData.createSeparateVariants && productData.colorVariants?.length > 0) {
                    // Create separate product for each color variant
                    const createdProducts = await productsApi.createWithVariants(productData);
                    setProducts([...createdProducts, ...products]);
                    alert(`${createdProducts.length} ürün başarıyla oluşturuldu!`);
                } else {
                    // Create single product
                    const created = await productsApi.create(productData);
                    setProducts([created, ...products]);
                }
            }
        } catch (err) {
            console.error('Save error:', err);
            alert('Kaydetme işlemi başarısız!');
        }
    };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="text-h2">{t('products')}</h1>
                    <p className="text-body">Ürün kataloğunuzu yönetin</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
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
                        placeholder="Ad veya SKU ile ara..."
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
                <span className="results-count">{filteredProducts.length} ürün</span>
            </div>

            {/* Products Table */}
            <div className="data-table card">
                <table>
                    <thead>
                        <tr>
                            <th>Ürün</th>
                            <th>SKU</th>
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
                            <tr key={product._id || product.id}>
                                <td>
                                    <div className="product-cell">
                                        <img src={product.image} alt="" className="product-thumb" />
                                        <span className="product-name">{getProductName(product)}</span>
                                    </div>
                                </td>
                                <td className="sku-cell">{product.sku}</td>
                                <td>{getCategoryName(product.category)}</td>
                                <td>{product.dimensions?.width}×{product.dimensions?.height}×{product.dimensions?.depth} cm</td>
                                <td>{product.weight} kg</td>
                                <td>
                                    <div className="color-dots">
                                        {product.colors.slice(0, 4).map(colorId => {
                                            const color = colors.find(c => c.id === colorId);
                                            return <span key={colorId} className="color-dot" style={{ backgroundColor: color?.hex }} />;
                                        })}
                                        {product.colors.length > 4 && <span className="more">+{product.colors.length - 4}</span>}
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
        </div>
    );
};

export default Products;
