import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Filter, Download } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { products as allProducts, categories, materials, colors } from '../../data/products';
import '../Dashboard.css';

const Products = () => {
    const { t, language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [products, setProducts] = useState(allProducts);

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
            p.sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="text-h2">{t('products')}</h1>
                    <p className="text-body">Manage your product catalog</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <Download size={18} />
                        Export
                    </button>
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        Add Product
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{getCategoryName(cat.id)}</option>
                    ))}
                </select>
                <span className="results-count">{filteredProducts.length} products</span>
            </div>

            {/* Products Table */}
            <div className="data-table card">
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Category</th>
                            <th>Dimensions</th>
                            <th>Weight</th>
                            <th>Colors</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id}>
                                <td>
                                    <div className="product-cell">
                                        <img src={product.image} alt="" className="product-thumb" />
                                        <span className="product-name">{getProductName(product)}</span>
                                    </div>
                                </td>
                                <td className="sku-cell">{product.sku}</td>
                                <td>{getCategoryName(product.category)}</td>
                                <td>{product.dimensions.width}×{product.dimensions.height}×{product.dimensions.depth} cm</td>
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
                                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="action-btn" title="View"><Eye size={16} /></button>
                                        <button className="action-btn" title="Edit"><Edit size={16} /></button>
                                        <button className="action-btn danger" title="Delete" onClick={() => handleDelete(product.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Products;
