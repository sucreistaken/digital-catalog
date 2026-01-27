const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ order: 1, createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new product
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update product
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
        res.json({ success: true, message: 'Ürün silindi' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT reorder products (drag & drop)
router.put('/reorder/bulk', async (req, res) => {
    try {
        const { orderedIds } = req.body; // Array of product IDs in new order

        if (!orderedIds || !Array.isArray(orderedIds)) {
            return res.status(400).json({ error: 'orderedIds array gerekli' });
        }

        // Update each product's order
        const updatePromises = orderedIds.map((id, index) =>
            Product.findByIdAndUpdate(
                id,
                { order: index + 1 },
                { new: true }
            )
        );

        await Promise.all(updatePromises);

        // Return updated products
        const products = await Product.find().sort({ order: 1, createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create product with color variants (each variant becomes a separate product)
router.post('/with-variants', async (req, res) => {
    try {
        const { colorVariants, ...baseProductData } = req.body;
        const groupId = `group-${Date.now()}`;
        const createdProducts = [];

        // If no color variants, create single product
        if (!colorVariants || colorVariants.length === 0) {
            const product = new Product({ ...baseProductData, groupId });
            await product.save();
            return res.status(201).json([product]);
        }

        // Create a separate product for each color variant
        for (const variant of colorVariants) {
            const variantProduct = new Product({
                ...baseProductData,
                groupId,
                name: `${baseProductData.name} - ${variant.colorName}`,
                nameTr: `${baseProductData.nameTr || baseProductData.name} - ${variant.colorName}`,
                sku: `${baseProductData.sku}-${variant.colorId.toUpperCase()}`,
                primaryColor: {
                    id: variant.colorId,
                    name: variant.colorName,
                    hex: variant.hex || '#808080'
                },
                colorVariants: [variant], // Store the variant info for filtering
                colors: [variant.colorId]
            });
            await variantProduct.save();
            createdProducts.push(variantProduct);
        }

        res.status(201).json(createdProducts);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET products by groupId (get all color variants of a product)
router.get('/group/:groupId', async (req, res) => {
    try {
        const products = await Product.find({ groupId: req.params.groupId });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT sync all products in a group (update shared properties)
router.put('/sync-group/:groupId', async (req, res) => {
    try {
        const { syncFields } = req.body; // Fields to sync: dimensions, weight, material, etc.

        // Get all products in the group
        const products = await Product.find({ groupId: req.params.groupId });
        if (products.length === 0) {
            return res.status(404).json({ error: 'Grup bulunamadı' });
        }

        // Update all products with synced fields
        const updateData = {};
        const allowedSyncFields = ['dimensions', 'weight', 'material', 'category', 'description', 'descriptionTr', 'image', 'imageScale', 'sizeVariants', 'defaultSize', 'inStock'];

        for (const field of allowedSyncFields) {
            if (syncFields[field] !== undefined) {
                updateData[field] = syncFields[field];
            }
        }

        await Product.updateMany(
            { groupId: req.params.groupId },
            { $set: updateData }
        );

        const updatedProducts = await Product.find({ groupId: req.params.groupId });
        res.json(updatedProducts);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
