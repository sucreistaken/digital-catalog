import freegardenLogo from '../assets/freegarden-logo.png';
import fatihplastikLogo from '../assets/fatihplastik-logo.jpg';

const brands = {
    freegarden: {
        id: 'freegarden',
        name: 'FreeGarden',
        tagline: 'Premium Plastic Solutions',
        taglineTr: 'Premium Plastik Çözümler',
        email: 'info@freegarden.com',
        website: 'www.freegarden.com',
        phone: '+90 500 123 45 67',
        logo: freegardenLogo,
        theme: {
            '--color-primary': '#34C759',
            '--color-primary-hover': '#28A745',
            '--color-primary-light': 'rgba(52, 199, 89, 0.1)',
        },
        pdfTheme: {
            primary: [52, 199, 89],
            primaryHex: '#34C759',
        },
    },
    fatihplastik: {
        id: 'fatihplastik',
        name: 'Fatih Plastik',
        tagline: 'Industrial Plastic Solutions',
        taglineTr: 'Endüstriyel Plastik Çözümler',
        email: 'info@fatihplastik.com',
        website: 'www.fatihplastik.com',
        phone: '+90 500 765 43 21',
        logo: fatihplastikLogo,
        theme: {
            '--color-primary': '#CF2030',
            '--color-primary-hover': '#B01C2A',
            '--color-primary-light': 'rgba(207, 32, 48, 0.1)',
        },
        pdfTheme: {
            primary: [207, 32, 48],
            primaryHex: '#CF2030',
        },
    },
};

export const brandList = Object.values(brands);
export const getBrand = (id) => brands[id] || null;
export default brands;
