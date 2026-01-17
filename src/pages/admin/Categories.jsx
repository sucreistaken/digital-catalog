import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { categories as allCategories, products } from '../../data/products';
import '../Dashboard.css';

const Categories = () => {
    const { t, language } = useLanguage();
    const [categories, setCategories] = useState(allCategories);

    const getCategoryName = (cat) => {
        const langKey = `name${language.charAt(0).toUpperCase() + language.slice(1)}`;
        return cat[langKey] || cat.name;
    };

    const getProductCount = (catId) => products.filter(p => p.category === catId).length;

    const handleDelete = (id) => {
        if (confirm('Are you sure?')) {
            setCategories(categories.filter(c => c.id !== id));
        }
    };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="text-h2">{t('categories')}</h1>
                    <p className="text-body">Organize your product categories</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} />
                    Add Category
                </button>
            </header>

            <div className="category-grid">
                {categories.map(cat => (
                    <div key={cat.id} className="category-card card">
                        <div className="category-icon">
                            <Package size={28} />
                        </div>
                        <h3>{getCategoryName(cat)}</h3>
                        <p className="product-count">{getProductCount(cat.id)} products</p>
                        <div className="category-actions">
                            <button className="btn btn-secondary btn-sm"><Edit size={14} /> Edit</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(cat.id)}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Categories;
