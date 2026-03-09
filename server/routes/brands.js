const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');

// GET /api/brands - Get all brands
router.get('/', async (req, res) => {
    try {
        const brands = await Brand.find().sort({ order: 1 });
        res.json(brands);
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({ error: 'Markalar yuklenemedi' });
    }
});

// GET /api/brands/:id - Get single brand
router.get('/:id', async (req, res) => {
    try {
        const brand = await Brand.findOne({ id: req.params.id });
        if (!brand) {
            return res.status(404).json({ error: 'Marka bulunamadi' });
        }
        res.json(brand);
    } catch (error) {
        console.error('Get brand error:', error);
        res.status(500).json({ error: 'Marka alinamadi' });
    }
});

// POST /api/brands - Create brand
router.post('/', async (req, res) => {
    try {
        const { id, name, tagline, taglineTr, email, phone, whatsapp, website, logo, theme, isActive, order } = req.body;

        const existing = await Brand.findOne({ id });
        if (existing) {
            return res.status(400).json({ error: 'Bu ID ile marka zaten var' });
        }

        const brand = new Brand({ id, name, tagline, taglineTr, email, phone, whatsapp, website, logo, theme, isActive, order });
        await brand.save();
        res.status(201).json(brand);
    } catch (error) {
        console.error('Create brand error:', error);
        res.status(500).json({ error: 'Marka olusturulamadi' });
    }
});

// PUT /api/brands/:id - Update brand
router.put('/:id', async (req, res) => {
    try {
        const brand = await Brand.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        if (!brand) {
            return res.status(404).json({ error: 'Marka bulunamadi' });
        }
        res.json(brand);
    } catch (error) {
        console.error('Update brand error:', error);
        res.status(500).json({ error: 'Marka guncellenemedi' });
    }
});

// DELETE /api/brands/:id - Delete brand
router.delete('/:id', async (req, res) => {
    try {
        const brand = await Brand.findOneAndDelete({ id: req.params.id });
        if (!brand) {
            return res.status(404).json({ error: 'Marka bulunamadi' });
        }
        res.json({ message: 'Marka silindi' });
    } catch (error) {
        console.error('Delete brand error:', error);
        res.status(500).json({ error: 'Marka silinemedi' });
    }
});

// POST /api/brands/seed - Seed default brands
router.post('/seed', async (req, res) => {
    try {
        const defaults = [
            {
                id: 'freegarden',
                name: 'FreeGarden',
                tagline: 'Premium Plastic Solutions',
                taglineTr: 'Premium Plastik Cozumler',
                email: 'info@freegarden.com',
                phone: '+90 500 123 45 67',
                whatsapp: '905492074444',
                website: 'www.freegardensaksi.com',
                logo: '',
                theme: {
                    primaryColor: '#34C759',
                    primaryHover: '#28A745',
                    primaryLight: 'rgba(52, 199, 89, 0.1)'
                },
                isActive: true,
                order: 0
            },
            {
                id: 'fatihplastik',
                name: 'Fatih Plastik',
                tagline: 'Industrial Plastic Solutions',
                taglineTr: 'Endustriyel Plastik Cozumler',
                email: 'info@fatihplastik.com',
                phone: '+90 500 765 43 21',
                whatsapp: '905492074444',
                website: 'www.plastime.com.tr',
                logo: '',
                theme: {
                    primaryColor: '#CF2030',
                    primaryHover: '#B01C2A',
                    primaryLight: 'rgba(207, 32, 48, 0.1)'
                },
                isActive: true,
                order: 1
            }
        ];

        for (const brand of defaults) {
            await Brand.findOneAndUpdate(
                { id: brand.id },
                brand,
                { upsert: true, new: true }
            );
        }

        res.json({ message: 'Varsayilan markalar olusturuldu', count: defaults.length });
    } catch (error) {
        console.error('Seed brands error:', error);
        res.status(500).json({ error: 'Markalar olusturulamadi' });
    }
});

module.exports = router;
