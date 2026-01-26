const express = require('express');
const router = express.Router();
const Material = require('../models/Material');

// Default materials to seed if none exist
const defaultMaterials = [
    { id: 'pp', name: 'Polypropylene (PP)', nameTr: 'Polipropilen (PP)', description: 'Durable, chemical resistant', descriptionTr: 'Dayanıklı, kimyasallara dirençli', order: 1 },
    { id: 'hdpe', name: 'High-Density Polyethylene (HDPE)', nameTr: 'Yüksek Yoğunluklu Polietilen (HDPE)', description: 'UV resistant, weatherproof', descriptionTr: 'UV dayanıklı, hava koşullarına dirençli', order: 2 },
    { id: 'pvc', name: 'PVC', nameTr: 'PVC', description: 'Rigid, cost-effective', descriptionTr: 'Sert, ekonomik', order: 3 },
    { id: 'recycled', name: 'Recycled Plastic', nameTr: 'Geri Dönüşüm Plastik', description: 'Eco-friendly, sustainable', descriptionTr: 'Çevre dostu, sürdürülebilir', order: 4 },
    { id: 'abs', name: 'ABS Plastic', nameTr: 'ABS Plastik', description: 'Impact resistant, glossy finish', descriptionTr: 'Darbelere dayanıklı, parlak yüzey', order: 5 },
];

// GET all materials
router.get('/', async (req, res) => {
    try {
        let materials = await Material.find().sort({ order: 1 });

        // If no materials exist, seed with defaults
        if (materials.length === 0) {
            await Material.insertMany(defaultMaterials);
            materials = await Material.find().sort({ order: 1 });
        }

        res.json(materials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single material
router.get('/:id', async (req, res) => {
    try {
        const material = await Material.findOne({ id: req.params.id });
        if (!material) {
            return res.status(404).json({ error: 'Malzeme bulunamadı' });
        }
        res.json(material);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create material
router.post('/', async (req, res) => {
    try {
        const material = new Material(req.body);
        await material.save();
        res.status(201).json(material);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update material
router.put('/:id', async (req, res) => {
    try {
        const material = await Material.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        if (!material) {
            return res.status(404).json({ error: 'Malzeme bulunamadı' });
        }
        res.json(material);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE material
router.delete('/:id', async (req, res) => {
    try {
        const material = await Material.findOneAndDelete({ id: req.params.id });
        if (!material) {
            return res.status(404).json({ error: 'Malzeme bulunamadı' });
        }
        res.json({ message: 'Malzeme silindi', material });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST reset to defaults
router.post('/reset', async (req, res) => {
    try {
        await Material.deleteMany({});
        await Material.insertMany(defaultMaterials);
        const materials = await Material.find().sort({ order: 1 });
        res.json({ message: 'Malzemeler sıfırlandı', materials });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
