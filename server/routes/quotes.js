const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');

// GET all quotes
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status && status !== 'all' ? { status } : {};
        const quotes = await Quote.find(filter).sort({ createdAt: -1 });
        res.json(quotes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single quote
router.get('/:id', async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id);
        if (!quote) {
            return res.status(404).json({ error: 'Teklif bulunamadı' });
        }
        res.json(quote);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create quote (from frontend form)
router.post('/', async (req, res) => {
    try {
        const quote = new Quote(req.body);
        await quote.save();
        res.status(201).json(quote);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update quote status
router.put('/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };

        // If marking as replied, set repliedAt
        if (req.body.status === 'replied' && !req.body.repliedAt) {
            updateData.repliedAt = new Date();
        }

        const quote = await Quote.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!quote) {
            return res.status(404).json({ error: 'Teklif bulunamadı' });
        }
        res.json(quote);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE quote
router.delete('/:id', async (req, res) => {
    try {
        const quote = await Quote.findByIdAndDelete(req.params.id);
        if (!quote) {
            return res.status(404).json({ error: 'Teklif bulunamadı' });
        }
        res.json({ message: 'Teklif silindi', quote });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET quote stats
router.get('/stats/summary', async (req, res) => {
    try {
        const total = await Quote.countDocuments();
        const newCount = await Quote.countDocuments({ status: 'new' });
        const repliedCount = await Quote.countDocuments({ status: 'replied' });
        const pendingCount = await Quote.countDocuments({ status: 'pending' });

        res.json({
            total,
            new: newCount,
            replied: repliedCount,
            pending: pendingCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
