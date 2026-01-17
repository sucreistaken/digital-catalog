import React from 'react';
import { Phone, MessageCircle, Mail, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Contact.css';

const Contact = () => {
    const { t } = useLanguage();

    return (
        <div className="contact-page">
            <div className="container">
                <header className="contact-header">
                    <h1 className="text-h1">{t('getInTouch')}</h1>
                    <p className="text-body">{t('contactDesc')}</p>
                </header>

                <div className="contact-grid">
                    {/* Contact Cards */}
                    <a href="tel:+905001234567" className="contact-card-lg">
                        <div className="card-icon">
                            <Phone size={32} />
                        </div>
                        <h3>{t('callUs')}</h3>
                        <p className="contact-value">+90 500 123 45 67</p>
                        <span className="card-hint">Mon - Sat, 9:00 - 18:00</span>
                    </a>

                    <a href="https://wa.me/905001234567" target="_blank" rel="noopener" className="contact-card-lg whatsapp">
                        <div className="card-icon">
                            <MessageCircle size={32} />
                        </div>
                        <h3>{t('whatsapp')}</h3>
                        <p className="contact-value">+90 500 123 45 67</p>
                        <span className="card-hint">Fast response</span>
                    </a>

                    <a href="mailto:info@freegarden.com" className="contact-card-lg">
                        <div className="card-icon">
                            <Mail size={32} />
                        </div>
                        <h3>{t('emailUs')}</h3>
                        <p className="contact-value">info@freegarden.com</p>
                        <span className="card-hint">We reply within 24 hours</span>
                    </a>

                    <div className="contact-card-lg">
                        <div className="card-icon">
                            <MapPin size={32} />
                        </div>
                        <h3>{t('visitUs')}</h3>
                        <p className="contact-value">Adana, Turkey</p>
                        <span className="card-hint">Factory & Showroom</span>
                    </div>
                </div>

                {/* Map Placeholder */}
                <div className="map-section">
                    <div className="map-placeholder">
                        <MapPin size={48} />
                        <p>Map will be displayed here</p>
                    </div>
                </div>

                {/* Working Hours */}
                <div className="hours-section">
                    <div className="hours-icon">
                        <Clock size={24} />
                    </div>
                    <div className="hours-info">
                        <h4>Working Hours</h4>
                        <p>Monday - Friday: 09:00 - 18:00</p>
                        <p>Saturday: 09:00 - 14:00</p>
                        <p>Sunday: Closed</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
