import React from 'react';
import { Shield, Award, CheckCircle, Download, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { certificates } from '../data/certificates';
import './Certificates.css';

const Certificates = () => {
    const { t, language } = useLanguage();

    const getTitle = (cert) => {
        const langKey = `title${language.charAt(0).toUpperCase() + language.slice(1)}`;
        return cert[langKey] || cert.title;
    };

    return (
        <div className="certificates-page">
            <div className="container">
                {/* Header */}
                <header className="certificates-header">
                    <div className="header-icon">
                        <Shield size={48} />
                    </div>
                    <h1 className="text-h1">Quality Certifications</h1>
                    <p className="text-body">
                        Our commitment to quality, safety, and environmental responsibility is backed by
                        internationally recognized certifications.
                    </p>
                </header>

                {/* Certificates Grid */}
                <div className="certificates-grid">
                    {certificates.map(cert => (
                        <div key={cert.id} className="certificate-card">
                            <div className="cert-badge">
                                <Award size={32} />
                            </div>
                            <div className="cert-content">
                                <h3 className="cert-name">{cert.name}</h3>
                                <p className="cert-title">{getTitle(cert)}</p>
                                <p className="cert-desc">{cert.description}</p>
                                <div className="cert-meta">
                                    <div className="meta-item">
                                        <CheckCircle size={14} />
                                        <span>Issuer: {cert.issuer}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span>Valid until: {cert.validUntil}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="cert-actions">
                                <button className="btn btn-secondary btn-sm">
                                    <Download size={14} />
                                    Download PDF
                                </button>
                                <button className="btn btn-ghost btn-sm">
                                    <ExternalLink size={14} />
                                    Verify
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust Section */}
                <section className="trust-section">
                    <h2 className="text-h2">Why Trust FreeGarden?</h2>
                    <div className="trust-grid">
                        <div className="trust-item">
                            <div className="trust-number">25+</div>
                            <div className="trust-label">Years Experience</div>
                        </div>
                        <div className="trust-item">
                            <div className="trust-number">50+</div>
                            <div className="trust-label">Countries Served</div>
                        </div>
                        <div className="trust-item">
                            <div className="trust-number">500+</div>
                            <div className="trust-label">Products</div>
                        </div>
                        <div className="trust-item">
                            <div className="trust-number">100%</div>
                            <div className="trust-label">Quality Tested</div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Certificates;
