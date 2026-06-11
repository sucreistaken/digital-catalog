import freegardenLogo from '../assets/freegarden-logo.png';
import fatihplastikLogo from '../assets/plastime-logo.png';

const brands = {
    freegarden: {
        id: 'freegarden',
        name: 'FreeGarden',
        tagline: 'Pots, garden & outdoor living products',
        taglineTr: 'Saksı, bahçe ve yaşam alanı ürünleri',
        email: 'export@plastime.com.tr',
        website: 'www.freegardensaksi.com',
        phone: '+90 549 207 44 44',
        whatsapp: '905492074444',
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
        name: 'Plastime',
        tagline: 'Houseware & plastic kitchen products',
        taglineTr: 'Ev gereçleri ve plastik mutfak ürünleri',
        email: 'export@plastime.com.tr',
        website: 'www.plastime.com.tr',
        phone: '+90 549 207 44 44',
        whatsapp: '905492074444',
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
