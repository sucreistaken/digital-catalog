const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Default categories to seed if none exist
const defaultCategories = [
    { id: 'furniture', name: 'Furniture', nameAr: 'أثاث', nameDe: 'Möbel', nameZh: '家具', nameTr: 'Mobilya', order: 1 },
    { id: 'garden', name: 'Garden', nameAr: 'حديقة', nameDe: 'Garten', nameZh: '花园', nameTr: 'Bahçe', order: 2 },
    { id: 'storage', name: 'Storage', nameAr: 'تخزين', nameDe: 'Lagerung', nameZh: '存储', nameTr: 'Depolama', order: 3 },
    { id: 'industrial', name: 'Industrial', nameAr: 'صناعي', nameDe: 'Industrie', nameZh: '工业', nameTr: 'Endüstriyel', order: 4 },
    { id: 'kids', name: 'Kids', nameAr: 'أطفال', nameDe: 'Kinder', nameZh: '儿童', nameTr: 'Çocuk', order: 5 },
];

// GET all categories
router.get('/', async (req, res) => {
    try {
        let categories = await Category.find().sort({ order: 1 });

        // If no categories exist, seed with defaults
        if (categories.length === 0) {
            await Category.insertMany(defaultCategories);
            categories = await Category.find().sort({ order: 1 });
        }

        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single category
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findOne({ id: req.params.id });
        if (!category) {
            return res.status(404).json({ error: 'Kategori bulunamadı' });
        }
        res.json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create category
router.post('/', async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update category
router.put('/:id', async (req, res) => {
    try {
        const category = await Category.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        if (!category) {
            return res.status(404).json({ error: 'Kategori bulunamadı' });
        }
        res.json(category);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE category
router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({ id: req.params.id });
        if (!category) {
            return res.status(404).json({ error: 'Kategori bulunamadı' });
        }
        res.json({ message: 'Kategori silindi', category });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST reset to defaults
router.post('/reset', async (req, res) => {
    try {
        await Category.deleteMany({});
        await Category.insertMany(defaultCategories);
        const categories = await Category.find().sort({ order: 1 });
        res.json({ message: 'Kategoriler sıfırlandı', categories });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
