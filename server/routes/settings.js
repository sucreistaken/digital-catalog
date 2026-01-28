const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

// GET /api/settings - Get all settings
router.get('/', async (req, res) => {
    try {
        const { group } = req.query;
        let query = {};

        if (group && group !== 'all') {
            query.group = group;
        }

        const settings = await Setting.find(query);

        // Return as object for easier use
        const settingsObj = settings.reduce((obj, setting) => {
            obj[setting.key] = setting.value;
            return obj;
        }, {});

        res.json(settingsObj);
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Ayarlar yüklenemedi' });
    }
});

// GET /api/settings/:key - Get single setting
router.get('/:key', async (req, res) => {
    try {
        const setting = await Setting.findOne({ key: req.params.key });

        if (!setting) {
            return res.status(404).json({ error: 'Ayar bulunamadı' });
        }

        res.json({ key: setting.key, value: setting.value });
    } catch (error) {
        console.error('Get setting error:', error);
        res.status(500).json({ error: 'Ayar alınamadı' });
    }
});

// PUT /api/settings - Bulk update settings
router.put('/', async (req, res) => {
    try {
        const updates = req.body; // { key1: value1, key2: value2, ... }

        const operations = Object.entries(updates).map(([key, value]) => ({
            updateOne: {
                filter: { key },
                update: { key, value },
                upsert: true
            }
        }));

        await Setting.bulkWrite(operations);

        res.json({ message: 'Ayarlar güncellendi', updated: Object.keys(updates).length });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Ayarlar güncellenemedi' });
    }
});

// POST /api/settings/seed - Seed default settings
router.post('/seed', async (req, res) => {
    try {
        const defaults = [
            { key: 'companyName', value: 'FreeGarden', group: 'company' },
            { key: 'email', value: 'info@freegarden.com', group: 'contact' },
            { key: 'phone', value: '+90 500 123 45 67', group: 'contact' },
            { key: 'whatsapp', value: '+90 500 123 45 67', group: 'contact' },
            { key: 'address', value: 'Adana, Turkey', group: 'contact' },
            { key: 'website', value: 'www.freegarden.com', group: 'company' },
            { key: 'defaultLanguage', value: 'en', group: 'appearance' },
            { key: 'instagram', value: '', group: 'social' },
            { key: 'facebook', value: '', group: 'social' },
            { key: 'linkedin', value: '', group: 'social' }
        ];

        for (const setting of defaults) {
            await Setting.findOneAndUpdate(
                { key: setting.key },
                setting,
                { upsert: true }
            );
        }

        res.json({ message: 'Varsayılan ayarlar oluşturuldu', count: defaults.length });
    } catch (error) {
        console.error('Seed settings error:', error);
        res.status(500).json({ error: 'Ayarlar oluşturulamadı' });
    }
});

module.exports = router;
