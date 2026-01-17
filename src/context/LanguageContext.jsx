import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, languages } from '../data/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('freegarden-language');
        return saved || 'en';
    });

    useEffect(() => {
        localStorage.setItem('freegarden-language', language);
        // Set document direction for RTL languages
        const lang = languages.find(l => l.code === language);
        document.documentElement.dir = lang?.dir || 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    const t = (key) => {
        return translations[language]?.[key] || translations.en[key] || key;
    };

    const currentLanguage = languages.find(l => l.code === language);

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t,
            languages,
            currentLanguage,
            isRTL: currentLanguage?.dir === 'rtl'
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;
