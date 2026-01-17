import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Phone, MessageCircle, Mail, MapPin, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { products } from '../data/products';
import './Quote.css';

const Quote = () => {
    const { t, language } = useLanguage();
    const [searchParams] = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        country: '',
        products: [],
        message: '',
    });

    // Pre-select product if coming from catalog
    useEffect(() => {
        const productId = searchParams.get('product');
        if (productId) {
            setFormData(prev => ({
                ...prev,
                products: [parseInt(productId)]
            }));
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSuccess(true);
    };

    const handleProductToggle = (productId) => {
        setFormData(prev => ({
            ...prev,
            products: prev.products.includes(productId)
                ? prev.products.filter(id => id !== productId)
                : [...prev.products, productId]
        }));
    };

    const getProductName = (product) => {
        const langKey = `name${language.charAt(0).toUpperCase() + language.slice(1)}`;
        return product[langKey] || product.name;
    };

    if (isSuccess) {
        return (
            <div className="quote-page">
                <div className="success-message">
                    <div className="success-icon">
                        <CheckCircle size={64} />
                    </div>
                    <h2>{t('quoteSuccess')}</h2>
                    <p>We will contact you within 24 hours.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="quote-page">
            <div className="container">
                <div className="quote-layout">
                    {/* Form Section */}
                    <div className="quote-form-section">
                        <h1 className="text-h2">{t('requestAQuote')}</h1>
                        <p className="text-body">{t('quoteFormDesc')}</p>

                        <form onSubmit={handleSubmit} className="quote-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t('yourName')} *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('companyName')} *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.company}
                                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t('email')} *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('phone')} *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{t('country')} *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.country}
                                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('productsOfInterest')}</label>
                                <div className="product-checkboxes">
                                    {products.slice(0, 20).map(product => (
                                        <label key={product.id} className="product-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={formData.products.includes(product.id)}
                                                onChange={() => handleProductToggle(product.id)}
                                            />
                                            <span className="checkbox-custom"></span>
                                            <span className="checkbox-label">{getProductName(product)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{t('message')}</label>
                                <textarea
                                    rows="4"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Enter additional details about your requirements..."
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <span>{t('sending')}</span>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        {t('submitRequest')}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Contact Info Sidebar */}
                    <div className="contact-sidebar">
                        <h3 className="text-h3">{t('getInTouch')}</h3>
                        <p className="text-body">{t('contactDesc')}</p>

                        <div className="contact-cards">
                            <a href="tel:+905001234567" className="contact-card">
                                <div className="contact-icon">
                                    <Phone size={24} />
                                </div>
                                <div className="contact-info">
                                    <span className="contact-label">{t('callUs')}</span>
                                    <span className="contact-value">+90 500 123 45 67</span>
                                </div>
                            </a>

                            <a href="https://wa.me/905001234567" target="_blank" rel="noopener" className="contact-card whatsapp">
                                <div className="contact-icon">
                                    <MessageCircle size={24} />
                                </div>
                                <div className="contact-info">
                                    <span className="contact-label">{t('whatsapp')}</span>
                                    <span className="contact-value">+90 500 123 45 67</span>
                                </div>
                            </a>

                            <a href="mailto:info@freegarden.com" className="contact-card">
                                <div className="contact-icon">
                                    <Mail size={24} />
                                </div>
                                <div className="contact-info">
                                    <span className="contact-label">{t('emailUs')}</span>
                                    <span className="contact-value">info@freegarden.com</span>
                                </div>
                            </a>

                            <div className="contact-card">
                                <div className="contact-icon">
                                    <MapPin size={24} />
                                </div>
                                <div className="contact-info">
                                    <span className="contact-label">{t('visitUs')}</span>
                                    <span className="contact-value">{t('address')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Quote;
