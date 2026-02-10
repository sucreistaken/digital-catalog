const express = require('express');
const router = express.Router();
const HeroSlide = require('../models/HeroSlide');

// GET all slides (sorted by order)
router.get('/', async (req, res) => {
    try {
        const slides = await HeroSlide.find().sort({ order: 1 });
        res.json(slides);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new slide
router.post('/', async (req, res) => {
    try {
        const count = await HeroSlide.countDocuments();
        const slide = new HeroSlide({
            ...req.body,
            order: req.body.order ?? count + 1
        });
        await slide.save();
        res.status(201).json(slide);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update slide
router.put('/:id', async (req, res) => {
    try {
        const slide = await HeroSlide.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!slide) return res.status(404).json({ error: 'Slide bulunamadı' });
        res.json(slide);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE slide
router.delete('/:id', async (req, res) => {
    try {
        const slide = await HeroSlide.findByIdAndDelete(req.params.id);
        if (!slide) return res.status(404).json({ error: 'Slide bulunamadı' });
        res.json({ success: true, message: 'Slide silindi' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT reorder slides
router.put('/reorder/bulk', async (req, res) => {
    try {
        const { orderedIds } = req.body;
        if (!orderedIds || !Array.isArray(orderedIds)) {
            return res.status(400).json({ error: 'orderedIds array gerekli' });
        }

        const updatePromises = orderedIds.map((id, index) =>
            HeroSlide.findByIdAndUpdate(id, { order: index + 1 }, { new: true })
        );
        await Promise.all(updatePromises);

        const slides = await HeroSlide.find().sort({ order: 1 });
        res.json(slides);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
