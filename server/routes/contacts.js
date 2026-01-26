const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// GET all contacts
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status && status !== 'all' ? { status } : {};
        const contacts = await Contact.find(filter).sort({ createdAt: -1 });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single contact
router.get('/:id', async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ error: 'Mesaj bulunamadı' });
        }
        res.json(contact);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create contact (from frontend form)
router.post('/', async (req, res) => {
    try {
        const contact = new Contact(req.body);
        await contact.save();
        res.status(201).json(contact);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update contact status
router.put('/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (req.body.status === 'replied' && !req.body.repliedAt) {
            updateData.repliedAt = new Date();
        }

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!contact) {
            return res.status(404).json({ error: 'Mesaj bulunamadı' });
        }
        res.json(contact);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE contact
router.delete('/:id', async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            return res.status(404).json({ error: 'Mesaj bulunamadı' });
        }
        res.json({ message: 'Mesaj silindi', contact });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET contact stats
router.get('/stats/summary', async (req, res) => {
    try {
        const total = await Contact.countDocuments();
        const newCount = await Contact.countDocuments({ status: 'new' });
        const readCount = await Contact.countDocuments({ status: 'read' });

        res.json({
            total,
            new: newCount,
            read: readCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
