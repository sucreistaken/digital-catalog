const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// GET /api/customers - Get all customers with optional search
router.get('/', async (req, res) => {
    try {
        const { search, tag, source, limit = 50 } = req.query;
        let query = {};

        // Search by name, company, or email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { country: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by tag
        if (tag) {
            query.tags = tag;
        }

        // Filter by source
        if (source && source !== 'all') {
            query.source = source;
        }

        const customers = await Customer.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json(customers);
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Müşteriler yüklenemedi' });
    }
});

// GET /api/customers/:id - Get single customer
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ error: 'Müşteri bulunamadı' });
        }

        res.json(customer);
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({ error: 'Müşteri bilgisi alınamadı' });
    }
});

// POST /api/customers - Create new customer
router.post('/', async (req, res) => {
    try {
        const { name, company, email, phone, country, address, notes, tags, source } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'İsim ve email gerekli' });
        }

        // Check if customer with email already exists
        const existing = await Customer.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ error: 'Bu email ile kayıtlı müşteri mevcut' });
        }

        const customer = new Customer({
            name,
            company,
            email,
            phone,
            country,
            address,
            notes,
            tags: tags || [],
            source: source || 'manual'
        });

        await customer.save();
        res.status(201).json(customer);
    } catch (error) {
        console.error('Create customer error:', error);
        res.status(500).json({ error: 'Müşteri oluşturulamadı' });
    }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', async (req, res) => {
    try {
        const { name, company, email, phone, country, address, notes, tags, isActive, lastContactAt } = req.body;

        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            {
                name,
                company,
                email,
                phone,
                country,
                address,
                notes,
                tags,
                isActive,
                lastContactAt
            },
            { new: true, runValidators: true }
        );

        if (!customer) {
            return res.status(404).json({ error: 'Müşteri bulunamadı' });
        }

        res.json(customer);
    } catch (error) {
        console.error('Update customer error:', error);
        res.status(500).json({ error: 'Müşteri güncellenemedi' });
    }
});

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);

        if (!customer) {
            return res.status(404).json({ error: 'Müşteri bulunamadı' });
        }

        res.json({ message: 'Müşteri silindi', customer });
    } catch (error) {
        console.error('Delete customer error:', error);
        res.status(500).json({ error: 'Müşteri silinemedi' });
    }
});

// GET /api/customers/stats/summary - Get customer statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const total = await Customer.countDocuments();
        const bySource = await Customer.aggregate([
            { $group: { _id: '$source', count: { $sum: 1 } } }
        ]);
        const recent = await Customer.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        res.json({
            total,
            recent,
            bySource: bySource.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'İstatistikler yüklenemedi' });
    }
});

module.exports = router;
