const express = require('express');
const router = express.Router();
const Color = require('../models/Color');

// Default colors to seed if none exist
const defaultColors = [
    { id: 'white', name: 'White', nameTr: 'Beyaz', hex: '#FFFFFF', order: 1 },
    { id: 'black', name: 'Black', nameTr: 'Siyah', hex: '#1D1D1F', order: 2 },
    { id: 'green', name: 'Green', nameTr: 'Yeşil', hex: '#34C759', order: 3 },
    { id: 'blue', name: 'Blue', nameTr: 'Mavi', hex: '#007AFF', order: 4 },
    { id: 'red', name: 'Red', nameTr: 'Kırmızı', hex: '#FF3B30', order: 5 },
    { id: 'yellow', name: 'Yellow', nameTr: 'Sarı', hex: '#FFCC00', order: 6 },
    { id: 'gray', name: 'Gray', nameTr: 'Gri', hex: '#8E8E93', order: 7 },
    { id: 'brown', name: 'Brown', nameTr: 'Kahverengi', hex: '#A2845E', order: 8 },
    { id: 'beige', name: 'Beige', nameTr: 'Bej', hex: '#F5F5DC', order: 9 },
    { id: 'terracotta', name: 'Terracotta', nameTr: 'Terrakota', hex: '#E2725B', order: 10 },
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
