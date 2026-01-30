const express = require('express');
const router = express.Router();
const Color = require('../models/Color');

// Default colors to seed if none exist
const defaultColors = [
    // Temel
    { id: 'white', name: 'White', nameTr: 'Beyaz', hex: '#FFFFFF', order: 1 },
    { id: 'black', name: 'Black', nameTr: 'Siyah', hex: '#1D1D1F', order: 2 },
    { id: 'gray', name: 'Gray', nameTr: 'Gri', hex: '#8E8E93', order: 3 },
    { id: 'anthracite', name: 'Anthracite', nameTr: 'Antrasit', hex: '#36454F', order: 4 },
    { id: 'silver', name: 'Silver', nameTr: 'Gümüş', hex: '#C0C0C0', order: 5 },
    // Yeşil
    { id: 'green', name: 'Green', nameTr: 'Yeşil', hex: '#34C759', order: 6 },
    { id: 'dark-green', name: 'Dark Green', nameTr: 'Koyu Yeşil', hex: '#228B22', order: 7 },
    { id: 'lime', name: 'Lime', nameTr: 'Limon Yeşili', hex: '#32CD32', order: 8 },
    { id: 'mint', name: 'Mint', nameTr: 'Nane', hex: '#98FF98', order: 9 },
    { id: 'olive', name: 'Olive', nameTr: 'Zeytin', hex: '#808000', order: 10 },
    { id: 'teal', name: 'Teal', nameTr: 'Çamurcun', hex: '#008080', order: 11 },
    // Mavi
    { id: 'blue', name: 'Blue', nameTr: 'Mavi', hex: '#007AFF', order: 12 },
    { id: 'navy', name: 'Navy', nameTr: 'Lacivert', hex: '#000080', order: 13 },
    { id: 'light-blue', name: 'Light Blue', nameTr: 'Açık Mavi', hex: '#87CEEB', order: 14 },
    { id: 'turquoise', name: 'Turquoise', nameTr: 'Turkuaz', hex: '#5AC8FA', order: 15 },
    { id: 'cyan', name: 'Cyan', nameTr: 'Cam Göbeği', hex: '#00FFFF', order: 16 },
    { id: 'royal-blue', name: 'Royal Blue', nameTr: 'Saks Mavi', hex: '#4169E1', order: 17 },
    { id: 'cobalt', name: 'Cobalt', nameTr: 'Kobalt', hex: '#0047AB', order: 18 },
    // Kırmızı/Pembe
    { id: 'red', name: 'Red', nameTr: 'Kırmızı', hex: '#FF3B30', order: 19 },
    { id: 'burgundy', name: 'Burgundy', nameTr: 'Bordo', hex: '#800020', order: 20 },
    { id: 'pink', name: 'Pink', nameTr: 'Pembe', hex: '#FF2D55', order: 21 },
    { id: 'hot-pink', name: 'Hot Pink', nameTr: 'Fuşya Pembe', hex: '#FF69B4', order: 22 },
    { id: 'coral', name: 'Coral', nameTr: 'Mercan', hex: '#FF7F50', order: 23 },
    { id: 'salmon', name: 'Salmon', nameTr: 'Somon', hex: '#FA8072', order: 24 },
    { id: 'fuchsia', name: 'Fuchsia', nameTr: 'Fuşya', hex: '#FF00FF', order: 25 },
    // Sarı/Turuncu
    { id: 'yellow', name: 'Yellow', nameTr: 'Sarı', hex: '#FFCC00', order: 26 },
    { id: 'orange', name: 'Orange', nameTr: 'Turuncu', hex: '#FF9500', order: 27 },
    { id: 'gold', name: 'Gold', nameTr: 'Altın', hex: '#FFD700', order: 28 },
    { id: 'amber', name: 'Amber', nameTr: 'Kehribar', hex: '#FFBF00', order: 29 },
    { id: 'peach', name: 'Peach', nameTr: 'Şeftali', hex: '#FFCBA4', order: 30 },
    { id: 'tangerine', name: 'Tangerine', nameTr: 'Mandalina', hex: '#FF9966', order: 31 },
    // Mor/Eflatun
    { id: 'purple', name: 'Purple', nameTr: 'Mor', hex: '#AF52DE', order: 32 },
    { id: 'violet', name: 'Violet', nameTr: 'Menekşe', hex: '#8B00FF', order: 33 },
    { id: 'lavender', name: 'Lavender', nameTr: 'Lavanta', hex: '#E6E6FA', order: 34 },
    { id: 'lilac', name: 'Lilac', nameTr: 'Leylak', hex: '#C8A2C8', order: 35 },
    { id: 'plum', name: 'Plum', nameTr: 'Erik', hex: '#8E4585', order: 36 },
    { id: 'orchid', name: 'Orchid', nameTr: 'Orkide', hex: '#DA70D6', order: 37 },
    // Kahve/Toprak
    { id: 'brown', name: 'Brown', nameTr: 'Kahverengi', hex: '#A2845E', order: 38 },
    { id: 'beige', name: 'Beige', nameTr: 'Bej', hex: '#E5D0B1', order: 39 },
    { id: 'cream', name: 'Cream', nameTr: 'Krem', hex: '#FFFDD0', order: 40 },
    { id: 'tan', name: 'Tan', nameTr: 'Taba', hex: '#D2B48C', order: 41 },
    { id: 'chocolate', name: 'Chocolate', nameTr: 'Çikolata', hex: '#7B3F00', order: 42 },
    { id: 'terracotta', name: 'Terracotta', nameTr: 'Terrakota', hex: '#E2725B', order: 43 },
    { id: 'sand', name: 'Sand', nameTr: 'Kum', hex: '#C2B280', order: 44 },
    { id: 'champagne', name: 'Champagne', nameTr: 'Şampanya', hex: '#F7E7CE', order: 45 },
    { id: 'ivory', name: 'Ivory', nameTr: 'Fildişi', hex: '#FFFFF0', order: 46 },
    // Transparan
    { id: 'transparent', name: 'Transparent', nameTr: 'Şeffaf', hex: '#FFFFFF80', order: 47 },
    { id: 'smoke', name: 'Smoke', nameTr: 'Duman', hex: '#708090', order: 48 },
];

// GET all colors
router.get('/', async (req, res) => {
    try {
        let colors = await Color.find().sort({ order: 1 });

        // If no colors exist, seed with defaults
        if (colors.length === 0) {
            await Color.insertMany(defaultColors);
            colors = await Color.find().sort({ order: 1 });
        }

        res.json(colors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single color
router.get('/:id', async (req, res) => {
    try {
        const color = await Color.findOne({ id: req.params.id });
        if (!color) {
            return res.status(404).json({ error: 'Renk bulunamadı' });
        }
        res.json(color);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create color
router.post('/', async (req, res) => {
    try {
        const color = new Color(req.body);
        await color.save();
        res.status(201).json(color);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update color
router.put('/:id', async (req, res) => {
    try {
        const color = await Color.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        if (!color) {
            return res.status(404).json({ error: 'Renk bulunamadı' });
        }
        res.json(color);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE color
router.delete('/:id', async (req, res) => {
    try {
        const color = await Color.findOneAndDelete({ id: req.params.id });
        if (!color) {
            return res.status(404).json({ error: 'Renk bulunamadı' });
        }
        res.json({ message: 'Renk silindi', color });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST reset to defaults
router.post('/reset', async (req, res) => {
    try {
        await Color.deleteMany({});
        await Color.insertMany(defaultColors);
        const colors = await Color.find().sort({ order: 1 });
        res.json({ message: 'Renkler sıfırlandı', colors });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
