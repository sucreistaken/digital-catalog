import React, { useState } from 'react';
import { Search, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import '../Dashboard.css';

const sampleCustomers = [
    { id: 1, name: 'Ahmed Al-Rashid', company: 'Al-Faisal Trading', email: 'ahmed@alfaisal.com', phone: '+966 50 123 4567', country: 'Saudi Arabia', lastContact: '2026-01-16', totalQuotes: 5 },
    { id: 2, name: 'Hans Müller', company: 'Garten GmbH', email: 'hans@garten.de', phone: '+49 170 123 4567', country: 'Germany', lastContact: '2026-01-15', totalQuotes: 3 },
    { id: 3, name: '李明', company: '上海贸易公司', email: 'liming@shanghai.cn', phone: '+86 138 1234 5678', country: 'China', lastContact: '2026-01-14', totalQuotes: 2 },
    { id: 4, name: 'Maria Santos', company: 'Iberia Imports', email: 'maria@iberia.es', phone: '+34 612 345 678', country: 'Spain', lastContact: '2026-01-13', totalQuotes: 1 },
    { id: 5, name: 'John Smith', company: 'UK Garden Supplies', email: 'john@ukgarden.co.uk', phone: '+44 7700 123456', country: 'United Kingdom', lastContact: '2026-01-12', totalQuotes: 4 },
    { id: 6, name: 'Mehmet Yılmaz', company: 'Antalya Hotels', email: 'mehmet@antalya.com.tr', phone: '+90 532 123 4567', country: 'Turkey', lastContact: '2026-01-10', totalQuotes: 8 },
];

const Customers = () => {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const customers = sampleCustomers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="text-h2">{t('customers')}</h1>
                    <p className="text-body">View and manage customer contacts</p>
                </div>
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            <div className="customers-grid">
                {customers.map(customer => (
                    <div key={customer.id} className="customer-card card">
                        <div className="customer-avatar">
                            {customer.name.charAt(0)}
                        </div>
                        <div className="customer-info">
                            <h4>{customer.name}</h4>
                            <p className="company">{customer.company}</p>
                            <div className="customer-details">
                                <span><Mail size={14} /> {customer.email}</span>
                                <span><Phone size={14} /> {customer.phone}</span>
                                <span><MapPin size={14} /> {customer.country}</span>
                                <span><Calendar size={14} /> Last: {customer.lastContact}</span>
                            </div>
                        </div>
                        <div className="customer-stats">
                            <div className="stat">
                                <span className="stat-value">{customer.totalQuotes}</span>
                                <span className="stat-label">Quotes</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Customers;
