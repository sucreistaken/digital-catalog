const express = require('express');
const router = express.Router();
const Page = require('../models/Page');

// GET /api/pages - Get all pages
router.get('/', async (req, res) => {
    try {
        const { active } = req.query;
        let query = {};

        if (active === 'true') {
            query.isActive = true;
        }

        const pages = await Page.find(query).sort({ order: 1 });
        res.json(pages);
    } catch (error) {
        console.error('Get pages error:', error);
        res.status(500).json({ error: 'Sayfalar yüklenemedi' });
    }
});

// GET /api/pages/:slug - Get page by slug (public)
router.get('/:slug', async (req, res) => {
    try {
        const page = await Page.findOne({ slug: req.params.slug });

        if (!page) {
            return res.status(404).json({ error: 'Sayfa bulunamadı' });
        }

        res.json(page);
    } catch (error) {
        console.error('Get page error:', error);
        res.status(500).json({ error: 'Sayfa alınamadı' });
    }
});

// POST /api/pages - Create new page
router.post('/', async (req, res) => {
    try {
        const { slug, title, content, metaDescription, isActive, order, showInMenu } = req.body;

        if (!slug) {
            return res.status(400).json({ error: 'Slug gerekli' });
        }

        // Check if slug exists
        const existing = await Page.findOne({ slug: slug.toLowerCase() });
        if (existing) {
            return res.status(400).json({ error: 'Bu slug zaten kullanılıyor' });
        }

        const page = new Page({
            slug: slug.toLowerCase(),
            title: title || {},
            content: content || {},
            metaDescription: metaDescription || {},
            isActive: isActive !== false,
            order: order || 0,
            showInMenu: showInMenu || false
        });

        await page.save();
        res.status(201).json(page);
    } catch (error) {
        console.error('Create page error:', error);
        res.status(500).json({ error: 'Sayfa oluşturulamadı' });
    }
});

// PUT /api/pages/:id - Update page
router.put('/:id', async (req, res) => {
    try {
        const { title, content, metaDescription, isActive, order, showInMenu } = req.body;

        const page = await Page.findByIdAndUpdate(
            req.params.id,
            { title, content, metaDescription, isActive, order, showInMenu },
            { new: true, runValidators: true }
        );

        if (!page) {
            return res.status(404).json({ error: 'Sayfa bulunamadı' });
        }

        res.json(page);
    } catch (error) {
        console.error('Update page error:', error);
        res.status(500).json({ error: 'Sayfa güncellenemedi' });
    }
});

// DELETE /api/pages/:id - Delete page
router.delete('/:id', async (req, res) => {
    try {
        const page = await Page.findByIdAndDelete(req.params.id);

        if (!page) {
            return res.status(404).json({ error: 'Sayfa bulunamadı' });
        }

        res.json({ message: 'Sayfa silindi', page });
    } catch (error) {
        console.error('Delete page error:', error);
        res.status(500).json({ error: 'Sayfa silinemedi' });
    }
});

// POST /api/pages/seed - Seed default pages
router.post('/seed', async (req, res) => {
    try {
        const defaults = [
            {
                slug: 'about',
                title: { en: 'About Us', tr: 'Hakkımızda' },
                content: {
                    en: '<h2>About FreeGarden</h2><p>We are a leading manufacturer of premium plastic products.</p>',
                    tr: '<h2>FreeGarden Hakkında</h2><p>Üstün kaliteli plastik ürünlerin önde gelen üreticisiyiz.</p>'
                },
                isActive: true,
                order: 1,
                showInMenu: true
            },
            {
                slug: 'privacy',
                title: { en: 'Privacy Policy', tr: 'Gizlilik Politikası' },
                content: {
                    en: '<h2>Privacy Policy</h2><p>Your privacy is important to us.</p>',
                    tr: '<h2>Gizlilik Politikası</h2><p>Gizliliğiniz bizim için önemlidir.</p>'
                },
                isActive: true,
                order: 2
            },
            {
                slug: 'terms',
                title: { en: 'Terms of Service', tr: 'Kullanım Koşulları' },
                content: {
                    en: '<h2>Terms of Service</h2><p>Please read these terms carefully.</p>',
                    tr: '<h2>Kullanım Koşulları</h2><p>Lütfen bu koşulları dikkatle okuyun.</p>'
                },
                isActive: true,
                order: 3
            }
        ];

        for (const pageData of defaults) {
            await Page.findOneAndUpdate(
                { slug: pageData.slug },
                pageData,
                { upsert: true }
            );
        }

        res.json({ message: 'Varsayılan sayfalar oluşturuldu', count: defaults.length });
    } catch (error) {
        console.error('Seed pages error:', error);
        res.status(500).json({ error: 'Sayfalar oluşturulamadı' });
    }
});

module.exports = router;
