// Extended Products Database - 250+ Products with Programmatic Generation
// Base products from original 50, plus generated variations

import { products as baseProducts, categories, colors, materials } from './products';

// Product templates for generation
const productTemplates = [
    // Furniture variations
    { type: 'chair', base: 'Chair', baseTr: 'Sandalye', category: 'furniture', img: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=600' },
    { type: 'table', base: 'Table', baseTr: 'Masa', category: 'furniture', img: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=600' },
    { type: 'bench', base: 'Bench', baseTr: 'Bank', category: 'furniture', img: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&q=80&w=600' },
    { type: 'stool', base: 'Stool', baseTr: 'Tabure', category: 'furniture', img: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=600' },
    { type: 'lounge', base: 'Lounge', baseTr: 'Şezlong', category: 'furniture', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600' },
    // Garden variations
    { type: 'pot', base: 'Plant Pot', baseTr: 'Saksı', category: 'garden', img: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=600' },
    { type: 'planter', base: 'Planter', baseTr: 'Ekici', category: 'garden', img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=600' },
    { type: 'watering', base: 'Watering Can', baseTr: 'Sulama Kabı', category: 'garden', img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=600' },
    // Storage variations
    { type: 'bin', base: 'Storage Bin', baseTr: 'Depo Kutusu', category: 'storage', img: 'https://images.unsplash.com/photo-1521577305356-3a46b746866d?auto=format&fit=crop&q=80&w=600' },
    { type: 'crate', base: 'Crate', baseTr: 'Kasa', category: 'storage', img: 'https://images.unsplash.com/photo-1521577305356-3a46b746866d?auto=format&fit=crop&q=80&w=600' },
    { type: 'container', base: 'Container', baseTr: 'Konteyner', category: 'storage', img: 'https://images.unsplash.com/photo-1521577305356-3a46b746866d?auto=format&fit=crop&q=80&w=600' },
    // Industrial variations
    { type: 'pallet', base: 'Pallet', baseTr: 'Palet', category: 'industrial', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600' },
    { type: 'drum', base: 'Drum', baseTr: 'Varil', category: 'industrial', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600' },
    // Kids variations
    { type: 'toy', base: 'Play Set', baseTr: 'Oyun Seti', category: 'kids', img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=600' },
    { type: 'slide', base: 'Slide', baseTr: 'Kaydırak', category: 'kids', img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=600' },
];

const sizes = ['Mini', 'Small', 'Medium', 'Large', 'XL', 'XXL', 'Jumbo'];
const sizesTr = ['Mini', 'Küçük', 'Orta', 'Büyük', 'XL', 'XXL', 'Jumbo'];
const styles = ['Classic', 'Modern', 'Premium', 'Pro', 'Elite', 'Basic', 'Standard', 'Deluxe', 'Ultra'];
const stylesTr = ['Klasik', 'Modern', 'Premium', 'Pro', 'Elit', 'Temel', 'Standart', 'Lüks', 'Ultra'];
const colorsList = ['white', 'black', 'green', 'blue', 'red', 'gray', 'brown', 'beige'];
const materialsList = ['pp', 'hdpe', 'pvc', 'recycled', 'abs'];

// Generate unique SKU
const generateSKU = (category, index) => {
    const prefixes = { furniture: 'FG-FN', garden: 'FG-GD', storage: 'FG-ST', industrial: 'FG-IN', kids: 'FG-KD' };
    return `${prefixes[category] || 'FG-XX'}-${String(index).padStart(3, '0')}`;
};

// Generate random dimensions based on type
const generateDimensions = (type) => {
    const base = {
        chair: { w: [40, 70], h: [70, 100], d: [40, 70] },
        table: { w: [60, 200], h: [50, 90], d: [60, 120] },
        bench: { w: [100, 200], h: [40, 90], d: [40, 70] },
        stool: { w: [30, 50], h: [40, 80], d: [30, 50] },
        lounge: { w: [60, 100], h: [80, 130], d: [100, 200] },
        pot: { w: [10, 60], h: [10, 70], d: [10, 60] },
        planter: { w: [30, 120], h: [20, 80], d: [20, 60] },
        watering: { w: [30, 60], h: [20, 40], d: [15, 30] },
        bin: { w: [30, 80], h: [20, 60], d: [20, 60] },
        crate: { w: [40, 80], h: [20, 50], d: [30, 60] },
        container: { w: [50, 150], h: [50, 120], d: [50, 120] },
        pallet: { w: [80, 140], h: [10, 20], d: [80, 120] },
        drum: { w: [40, 70], h: [60, 100], d: [40, 70] },
        toy: { w: [50, 200], h: [50, 200], d: [50, 150] },
        slide: { w: [80, 200], h: [80, 250], d: [150, 400] },
    };
    const dims = base[type] || { w: [30, 100], h: [30, 100], d: [30, 100] };
    return {
        width: Math.floor(Math.random() * (dims.w[1] - dims.w[0]) + dims.w[0]),
        height: Math.floor(Math.random() * (dims.h[1] - dims.h[0]) + dims.h[0]),
        depth: Math.floor(Math.random() * (dims.d[1] - dims.d[0]) + dims.d[0]),
    };
};

// Generate weight based on dimensions
const generateWeight = (dims) => {
    const volume = (dims.width * dims.height * dims.depth) / 1000;
    return Math.round((volume * 0.01 + Math.random() * 5) * 10) / 10;
};

// Pick random items from array
const pickRandom = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// Generate 250+ additional products
const generateAdditionalProducts = () => {
    const generated = [];
    let id = 100; // Start after base products

    for (let i = 0; i < 200; i++) {
        const template = productTemplates[i % productTemplates.length];
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        const sizeTr = sizesTr[sizes.indexOf(size)];
        const style = styles[Math.floor(Math.random() * styles.length)];
        const styleTr = stylesTr[styles.indexOf(style)];

        const dims = generateDimensions(template.type);
        const weight = generateWeight(dims);
        const productColors = pickRandom(colorsList, 2 + Math.floor(Math.random() * 4));

        generated.push({
            id: id++,
            sku: generateSKU(template.category, id),
            name: `${style} ${size} ${template.base}`,
            nameTr: `${styleTr} ${sizeTr} ${template.baseTr}`,
            nameAr: `${template.base} ${size}`,
            nameDe: `${style} ${size} ${template.base}`,
            nameZh: `${style} ${size} ${template.base}`,
            category: template.category,
            description: `High-quality ${style.toLowerCase()} ${template.base.toLowerCase()}. ${size} size with premium finish.`,
            descriptionTr: `Yüksek kaliteli ${styleTr.toLowerCase()} ${template.baseTr.toLowerCase()}. ${sizeTr} boy, premium kaplama.`,
            dimensions: dims,
            weight: weight,
            colors: productColors,
            material: materialsList[Math.floor(Math.random() * materialsList.length)],
            image: template.img,
            inStock: Math.random() > 0.1,
            featured: Math.random() > 0.85,
        });
    }

    return generated;
};

// Combine base products with generated ones
export const extendedProducts = [...baseProducts, ...generateAdditionalProducts()];

// Get all product IDs for warehouse room (all 250+)
export const allProductIds = extendedProducts.map(p => p.id);

// Categories with extended counts
export const extendedCategories = categories.map(cat => ({
    ...cat,
    productCount: extendedProducts.filter(p => p.category === cat.id).length
}));

export { categories, colors, materials };
