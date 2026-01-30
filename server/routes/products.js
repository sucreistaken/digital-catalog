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

// DELETE bulk delete products
router.delete('/bulk/delete', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'ids array gerekli' });
        }
        const result = await Product.deleteMany({ _id: { $in: ids } });
        res.json({ success: true, deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT bulk update products
router.put('/bulk/update', async (req, res) => {
    try {
        const { ids, updates } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'ids array gerekli' });
        }
        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'updates objesi gerekli' });
        }

        const allowedFields = ['category', 'inStock', 'material', 'featured', 'imageScale'];
        const safeUpdates = {};
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                safeUpdates[field] = updates[field];
            }
        }

        await Product.updateMany(
            { _id: { $in: ids } },
            { $set: safeUpdates }
        );

        const products = await Product.find().sort({ order: 1, createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT reorder products within a category (drag & drop)
router.put('/reorder/category', async (req, res) => {
    try {
        const { categoryId, orderedIds } = req.body;

        if (!categoryId || !orderedIds || !Array.isArray(orderedIds)) {
            return res.status(400).json({ error: 'categoryId ve orderedIds array gerekli' });
        }

        // Update order only for products in this category
        const updatePromises = orderedIds.map((id, index) =>
            Product.findByIdAndUpdate(
                id,
                { order: index + 1 },
                { new: true }
            )
        );

        await Promise.all(updatePromises);

        // Return all products (so frontend can update full list)
        const products = await Product.find().sort({ order: 1, createdAt: -1 });
        res.json(products);
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
                colors: [variant.colorId],
                defaultColor: variant.colorId
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

// POST seed test products
router.post('/seed', async (req, res) => {
    try {
        const seedProducts = [
            { sku: 'FG-CH-001', name: 'Ergonomic Garden Chair', nameTr: 'Ergonomik Bahçe Sandalyesi', category: 'furniture', description: 'Premium outdoor chair with ergonomic design for maximum comfort. UV resistant and weatherproof.', descriptionTr: 'Maksimum konfor için ergonomik tasarımlı premium dış mekan sandalyesi. UV dayanıklı ve su geçirmez.', dimensions: { width: 58, height: 82, depth: 55 }, weight: 3.2, colors: ['white', 'green', 'brown', 'beige'], material: 'hdpe', image: 'https://picsum.photos/seed/fg-chair1/600/600', inStock: true, featured: true },
            { sku: 'FG-CH-002', name: 'Stackable Bistro Chair', nameTr: 'İstiflenebilir Bistro Sandalye', category: 'furniture', description: 'Space-saving stackable design. Perfect for cafes, restaurants, and outdoor events.', descriptionTr: 'Yer tasarrufu sağlayan istiflenebilir tasarım. Kafeler, restoranlar ve açık hava etkinlikleri için ideal.', dimensions: { width: 45, height: 78, depth: 50 }, weight: 2.8, colors: ['white', 'black', 'red', 'blue', 'green'], material: 'pp', image: 'https://picsum.photos/seed/fg-chair2/600/600', inStock: true, featured: false },
            { sku: 'FG-CH-003', name: 'Luxury Lounge Chair', nameTr: 'Lüks Şezlong', category: 'furniture', description: 'Adjustable reclining positions. Perfect for poolside relaxation.', descriptionTr: 'Ayarlanabilir yatış pozisyonları. Havuz kenarı rahatlama için mükemmel.', dimensions: { width: 65, height: 95, depth: 180 }, weight: 8.5, colors: ['white', 'beige', 'gray'], material: 'hdpe', image: 'https://picsum.photos/seed/fg-lounge/600/600', inStock: true, featured: true },
            { sku: 'FG-TB-001', name: 'Round Garden Table', nameTr: 'Yuvarlak Bahçe Masası', category: 'furniture', description: 'Elegant round table with umbrella hole. Seats 4 comfortably.', descriptionTr: 'Şemsiye delikli zarif yuvarlak masa. 4 kişi rahatça oturur.', dimensions: { width: 90, height: 72, depth: 90 }, weight: 12.0, colors: ['white', 'green', 'brown'], material: 'pp', image: 'https://picsum.photos/seed/fg-table1/600/600', inStock: true, featured: false },
            { sku: 'FG-TB-002', name: 'Rectangular Dining Table', nameTr: 'Dikdörtgen Yemek Masası', category: 'furniture', description: 'Large family dining table. Seats 6-8 people. Foldable design.', descriptionTr: 'Büyük aile yemek masası. 6-8 kişilik. Katlanabilir tasarım.', dimensions: { width: 180, height: 74, depth: 90 }, weight: 18.5, colors: ['white', 'gray', 'brown'], material: 'hdpe', image: 'https://picsum.photos/seed/fg-table2/600/600', inStock: true, featured: true },
            { sku: 'FG-TB-003', name: 'Folding Event Table', nameTr: 'Katlanır Etkinlik Masası', category: 'furniture', description: 'Lightweight portable table for events and catering.', descriptionTr: 'Etkinlikler ve catering için hafif portatif masa.', dimensions: { width: 183, height: 74, depth: 76 }, weight: 14.0, colors: ['white', 'gray'], material: 'hdpe', image: 'https://picsum.photos/seed/fg-table3/600/600', inStock: false, featured: false },
            { sku: 'FG-BN-001', name: 'Park Bench 3-Seater', nameTr: '3 Kişilik Park Bankı', category: 'furniture', description: 'Classic park bench design with armrests. Weather resistant.', descriptionTr: 'Kolçaklı klasik park bankı tasarımı. Hava koşullarına dayanıklı.', dimensions: { width: 150, height: 80, depth: 60 }, weight: 22.0, colors: ['green', 'brown', 'gray'], material: 'recycled', image: 'https://picsum.photos/seed/fg-bench/600/600', inStock: true, featured: false },
            { sku: 'FG-AR-001', name: 'Armchair with Cushion', nameTr: 'Minderli Koltuk', category: 'furniture', description: 'Comfortable armchair with removable cushion. Indoor/outdoor use.', descriptionTr: 'Çıkarılabilir minderli rahat koltuk. İç ve dış mekan kullanımı.', dimensions: { width: 72, height: 85, depth: 70 }, weight: 6.5, colors: ['white', 'beige', 'gray'], material: 'pp', image: 'https://picsum.photos/seed/fg-lounge/600/600', inStock: true, featured: false },
            { sku: 'FG-ST-001', name: 'Bar Stool High', nameTr: 'Yüksek Bar Taburesi', category: 'furniture', description: 'Modern bar stool with footrest. Height: 75cm.', descriptionTr: 'Ayak dayanağı olan modern bar taburesi. Yükseklik: 75cm.', dimensions: { width: 42, height: 75, depth: 42 }, weight: 3.0, colors: ['white', 'black', 'red', 'green'], material: 'pp', image: 'https://picsum.photos/seed/fg-chair2/600/600', inStock: true, featured: false },
            { sku: 'FG-SET-001', name: 'Garden Furniture Set 5pc', nameTr: '5 Parça Bahçe Mobilya Seti', category: 'furniture', description: 'Complete set: 1 table + 4 chairs. Perfect for family gatherings.', descriptionTr: 'Komple set: 1 masa + 4 sandalye. Aile toplantıları için mükemmel.', dimensions: { width: 90, height: 72, depth: 90 }, weight: 25.0, colors: ['white', 'green', 'brown'], material: 'pp', image: 'https://picsum.photos/seed/fg-table2/600/600', inStock: true, featured: true },
            { sku: 'FG-SW-001', name: 'Garden Swing Chair', nameTr: 'Bahçe Salıncak Sandalye', category: 'furniture', description: 'Hanging egg chair design. Includes stand and cushion.', descriptionTr: 'Asılı yumurta sandalye tasarımı. Stand ve minder dahil.', dimensions: { width: 105, height: 195, depth: 95 }, weight: 35.0, colors: ['white', 'beige', 'gray'], material: 'hdpe', image: 'https://picsum.photos/seed/fg-swing/600/600', inStock: true, featured: true },
            { sku: 'FG-DC-001', name: 'Deck Chair Foldable', nameTr: 'Katlanır Güneş Yatağı', category: 'furniture', description: 'Classic deck chair with adjustable positions. Compact storage.', descriptionTr: 'Ayarlanabilir pozisyonlu klasik güneşlenme yatağı. Kompakt depolama.', dimensions: { width: 60, height: 100, depth: 135 }, weight: 5.5, colors: ['white', 'blue', 'green'], material: 'pp', image: 'https://picsum.photos/seed/fg-chair1/600/600', inStock: true, featured: false },
            { sku: 'FG-OT-001', name: 'Ottoman Footrest', nameTr: 'Puf Ayak Desteği', category: 'furniture', description: 'Matching ottoman for lounge chairs. Multi-purpose design.', descriptionTr: 'Şezlonglar için uyumlu puf. Çok amaçlı tasarım.', dimensions: { width: 45, height: 35, depth: 45 }, weight: 1.8, colors: ['white', 'beige', 'gray', 'brown'], material: 'pp', image: 'https://picsum.photos/seed/fg-lounge/600/600', inStock: true, featured: false },
            { sku: 'FG-CH-004', name: 'Director Chair Premium', nameTr: 'Premium Yönetmen Sandalyesi', category: 'furniture', description: 'Professional director chair with fabric seat. Foldable.', descriptionTr: 'Kumaş oturmalı profesyonel yönetmen sandalyesi. Katlanabilir.', dimensions: { width: 58, height: 88, depth: 47 }, weight: 4.2, colors: ['black', 'white', 'blue'], material: 'pp', image: 'https://picsum.photos/seed/fg-chair2/600/600', inStock: true, featured: false },
            { sku: 'FG-CH-005', name: 'Rocking Chair Classic', nameTr: 'Klasik Sallanan Sandalye', category: 'furniture', description: 'Traditional rocking chair design. Smooth rocking motion.', descriptionTr: 'Geleneksel sallanan sandalye tasarımı. Pürüzsüz sallanma hareketi.', dimensions: { width: 68, height: 95, depth: 85 }, weight: 7.0, colors: ['white', 'green', 'brown'], material: 'hdpe', image: 'https://picsum.photos/seed/fg-chair1/600/600', inStock: true, featured: false },
            { sku: 'FG-PT-001', name: 'Modern Plant Pot Small', nameTr: 'Küçük Modern Saksı', category: 'garden', description: 'Minimalist design with drainage holes. Perfect for succulents.', descriptionTr: 'Drenaj delikleri olan minimalist tasarım. Sukulent bitkiler için ideal.', dimensions: { width: 15, height: 14, depth: 15 }, weight: 0.3, colors: ['white', 'terracotta', 'gray', 'green'], material: 'pp', image: 'https://picsum.photos/seed/fg-pot1/600/600', inStock: true, featured: true },
            { sku: 'FG-PT-002', name: 'Plant Pot Medium', nameTr: 'Orta Boy Saksı', category: 'garden', description: 'Versatile medium-sized pot with saucer included.', descriptionTr: 'Tabak dahil çok yönlü orta boy saksı.', dimensions: { width: 25, height: 22, depth: 25 }, weight: 0.8, colors: ['white', 'terracotta', 'gray', 'green', 'black'], material: 'pp', image: 'https://picsum.photos/seed/fg-pot2/600/600', inStock: true, featured: false },
            { sku: 'FG-PT-003', name: 'Large Floor Planter', nameTr: 'Büyük Yer Saksısı', category: 'garden', description: 'Statement piece for trees and large plants. Built-in water reservoir.', descriptionTr: 'Ağaçlar ve büyük bitkiler için dekoratif parça. Dahili su haznesi.', dimensions: { width: 50, height: 60, depth: 50 }, weight: 5.5, colors: ['white', 'terracotta', 'gray', 'brown'], material: 'hdpe', image: 'https://picsum.photos/seed/fg-planter/600/600', inStock: true, featured: true },
            { sku: 'FG-PT-004', name: 'Hanging Basket Pot', nameTr: 'Asılı Sepet Saksı', category: 'garden', description: 'Decorative hanging pot with chain. Self-watering design.', descriptionTr: 'Zincirli dekoratif asılı saksı. Kendi kendine sulama tasarımı.', dimensions: { width: 28, height: 18, depth: 28 }, weight: 0.6, colors: ['white', 'green', 'terracotta'], material: 'pp', image: 'https://picsum.photos/seed/fg-pot2/600/600', inStock: true, featured: false },
            { sku: 'FG-PT-005', name: 'Window Box Planter', nameTr: 'Pencere Balkon Saksısı', category: 'garden', description: 'Long rectangular planter for windowsills and railings.', descriptionTr: 'Pencere kenarları ve korkuluklar için uzun dikdörtgen saksı.', dimensions: { width: 60, height: 18, depth: 18 }, weight: 1.2, colors: ['white', 'terracotta', 'green', 'brown'], material: 'pp', image: 'https://picsum.photos/seed/fg-garden/600/600', inStock: true, featured: false },
            { sku: 'FG-GC-001', name: 'Garden Composter 300L', nameTr: '300L Bahçe Kompostörü', category: 'garden', description: 'Efficient composting bin with ventilation. Easy access door.', descriptionTr: 'Havalandırmalı verimli kompost kutusu. Kolay erişim kapısı.', dimensions: { width: 60, height: 80, depth: 60 }, weight: 8.0, colors: ['green', 'black'], material: 'recycled', image: 'https://picsum.photos/seed/fg-garden/600/600', inStock: true, featured: false },
            { sku: 'FG-WC-001', name: 'Watering Can 10L', nameTr: '10L Sulama Kabı', category: 'garden', description: 'Ergonomic design with detachable rose. Large capacity.', descriptionTr: 'Çıkarılabilir başlıklı ergonomik tasarım. Büyük kapasite.', dimensions: { width: 55, height: 32, depth: 18 }, weight: 0.8, colors: ['green', 'gray', 'terracotta'], material: 'pp', image: 'https://picsum.photos/seed/fg-garden/600/600', inStock: true, featured: false },
            { sku: 'FG-RB-001', name: 'Raised Garden Bed', nameTr: 'Yükseltilmiş Bahçe Yatağı', category: 'garden', description: 'Modular raised bed for vegetables and herbs. No bending required.', descriptionTr: 'Sebzeler ve otlar için modüler yükseltilmiş yatak. Eğilme gerektirmez.', dimensions: { width: 120, height: 40, depth: 80 }, weight: 15.0, colors: ['brown', 'gray', 'terracotta'], material: 'recycled', image: 'https://picsum.photos/seed/fg-garden/600/600', inStock: true, featured: true },
            { sku: 'FG-GB-001', name: 'Garden Border Edging', nameTr: 'Bahçe Sınır Kenarı', category: 'garden', description: 'Flexible border edging. Sold per meter. Easy installation.', descriptionTr: 'Esnek sınır kenarı. Metre başına satılır. Kolay kurulum.', dimensions: { width: 100, height: 15, depth: 2 }, weight: 0.5, colors: ['green', 'brown', 'gray', 'black'], material: 'recycled', image: 'https://picsum.photos/seed/fg-garden/600/600', inStock: true, featured: false },
            { sku: 'FG-TP-001', name: 'Tomato Planter Tower', nameTr: 'Domates Ekici Kule', category: 'garden', description: 'Vertical growing system for tomatoes. Built-in support cage.', descriptionTr: 'Domatesler için dikey yetiştirme sistemi. Dahili destek kafesi.', dimensions: { width: 40, height: 120, depth: 40 }, weight: 4.0, colors: ['green', 'terracotta'], material: 'pp', image: 'https://picsum.photos/seed/fg-garden/600/600', inStock: true, featured: false },
            { sku: 'FG-ST-002', name: 'Garden Stepping Stone', nameTr: 'Bahçe Yürüyüş Taşı', category: 'garden', description: 'Natural stone look. Non-slip surface. Set of 4.', descriptionTr: 'Doğal taş görünümü. Kayma önleyici yüzey. 4\'lü set.', dimensions: { width: 30, height: 3, depth: 30 }, weight: 1.5, colors: ['gray', 'brown', 'terracotta'], material: 'recycled', image: 'https://picsum.photos/seed/fg-garden/600/600', inStock: true, featured: false },
            { sku: 'FG-TR-001', name: 'Plant Tray Heavy Duty', nameTr: 'Ağır Hizmet Bitki Tepsisi', category: 'garden', description: 'Multi-purpose tray for seed starting and plant transport.', descriptionTr: 'Tohum başlatma ve bitki taşıma için çok amaçlı tepsi.', dimensions: { width: 54, height: 6, depth: 28 }, weight: 0.4, colors: ['black', 'green', 'gray'], material: 'pp', image: 'https://picsum.photos/seed/fg-garden/600/600', inStock: true, featured: false },
            { sku: 'FG-SB-001', name: 'Industrial Storage Bin', nameTr: 'Endüstriyel Depolama Kutusu', category: 'storage', description: 'Heavy-duty stackable storage solution. Reinforced corners.', descriptionTr: 'Ağır hizmet istiflenebilir depolama çözümü. Güçlendirilmiş köşeler.', dimensions: { width: 60, height: 40, depth: 40 }, weight: 2.5, colors: ['blue', 'gray', 'black', 'yellow'], material: 'hdpe', image: 'https://picsum.photos/seed/fg-storage/600/600', inStock: true, featured: true },
            { sku: 'FG-SB-002', name: 'Nesting Crate Medium', nameTr: 'Orta Yuvalanır Kasa', category: 'storage', description: 'Space-saving nesting design when empty. Ventilated sides.', descriptionTr: 'Boşken yer tasarrufu sağlayan yuvalanma tasarımı. Havalandırmalı kenarlar.', dimensions: { width: 50, height: 30, depth: 35 }, weight: 1.8, colors: ['blue', 'green', 'red', 'black'], material: 'pp', image: 'https://picsum.photos/seed/fg-storage/600/600', inStock: true, featured: false },
            { sku: 'FG-SB-003', name: 'Folding Crate Large', nameTr: 'Büyük Katlanır Kasa', category: 'storage', description: 'Collapsible design for easy storage. Locking mechanism.', descriptionTr: 'Kolay depolama için katlanabilir tasarım. Kilitleme mekanizması.', dimensions: { width: 60, height: 45, depth: 40 }, weight: 2.2, colors: ['black', 'gray', 'blue'], material: 'pp', image: 'https://picsum.photos/seed/fg-storage/600/600', inStock: true, featured: true },
            { sku: 'FG-TB-004', name: 'Tool Storage Box', nameTr: 'Alet Saklama Kutusu', category: 'storage', description: 'Organized storage with removable tray. Secure latches.', descriptionTr: 'Çıkarılabilir tepsi ile düzenli depolama. Güvenli mandallar.', dimensions: { width: 50, height: 25, depth: 30 }, weight: 1.5, colors: ['black', 'blue', 'red'], material: 'pp', image: 'https://picsum.photos/seed/fg-storage/600/600', inStock: true, featured: false },
            { sku: 'FG-WB-001', name: 'Waste Bin 120L', nameTr: '120L Çöp Kovası', category: 'storage', description: 'Wheeled waste bin with lid. Compatible with truck lift.', descriptionTr: 'Kapaklı tekerlekli çöp kovası. Kamyon asansörü ile uyumlu.', dimensions: { width: 48, height: 93, depth: 55 }, weight: 9.5, colors: ['green', 'gray', 'blue', 'yellow'], material: 'hdpe', image: 'https://picsum.photos/seed/fg-storage/600/600', inStock: true, featured: false },
            { sku: 'FG-WB-002', name: 'Recycling Bin Set', nameTr: 'Geri Dönüşüm Kovası Seti', category: 'storage', description: 'Color-coded bins for waste separation. Set of 3.', descriptionTr: 'Atık ayrımı için renk kodlu kovalar. 3\'lü set.', dimensions: { width: 90, height: 45, depth: 35 }, weight: 4.5, colors: ['green', 'blue', 'yellow'], material: 'pp', image: 'https://picsum.photos/seed/fg-storage/600/600', inStock: true, featured: false },
            { sku: 'FG-SC-001', name: 'Storage Cabinet Outdoor', nameTr: 'Dış Mekan Depolama Dolabı', category: 'storage', description: 'Weather-resistant cabinet with adjustable shelves. Lockable.', descriptionTr: 'Ayarlanabilir raflı hava koşullarına dayanıklı dolap. Kilitlenebilir.', dimensions: { width: 68, height: 163, depth: 38 }, weight: 18.0, colors: ['beige', 'gray', 'green'], material: 'pp', image: 'https://picsum.photos/seed/fg-storage/600/600', inStock: true, featured: true },
            { sku: 'FG-SU-001', name: 'Shelving Unit 5-Tier', nameTr: '5 Katlı Raf Ünitesi', category: 'storage', description: 'Heavy-duty plastic shelving. Tool-free assembly.', descriptionTr: 'Ağır hizmet plastik raf. Aletsiz montaj.', dimensions: { width: 90, height: 180, depth: 40 }, weight: 12.0, colors: ['gray', 'black', 'beige'], material: 'pp', image: 'https://picsum.photos/seed/fg-storage/600/600', inStock: true, featured: false },
            { sku: 'FG-BX-001', name: 'Underbed Storage Box', nameTr: 'Yatak Altı Saklama Kutusu', category: 'storage', description: 'Low profile with wheels. Transparent lid for easy identification.', descriptionTr: 'Tekerlekli düşük profil. Kolay tanımlama için şeffaf kapak.', dimensions: { width: 80, height: 17, depth: 60 }, weight: 1.8, colors: ['white', 'gray'], material: 'pp', image: 'https://picsum.photos/seed/fg-storage/600/600', inStock: true, featured: false },
            { sku: 'FG-BP-001', name: 'Bulk Parts Bin', nameTr: 'Toplu Parça Kutusu', category: 'storage', description: 'Open front design for easy access. Wall mountable.', descriptionTr: 'Kolay erişim için açık ön tasarım. Duvara monte edilebilir.', dimensions: { width: 20, height: 12, depth: 35 }, weight: 0.3, colors: ['blue', 'red', 'yellow', 'green'], material: 'pp', image: 'https://picsum.photos/seed/fg-storage/600/600', inStock: true, featured: false },
            { sku: 'FG-PL-001', name: 'Recycled Plastic Pallet', nameTr: 'Geri Dönüşüm Plastik Palet', category: 'industrial', description: 'Eco-friendly pallet. Resistant to moisture and pests. Standard Euro size.', descriptionTr: 'Çevre dostu palet. Nem ve haşerelere dayanıklı. Standart Euro boyutu.', dimensions: { width: 120, height: 15, depth: 80 }, weight: 15.0, colors: ['black', 'gray', 'blue'], material: 'recycled', image: 'https://picsum.photos/seed/fg-industrial/600/600', inStock: true, featured: true },
            { sku: 'FG-PL-002', name: 'Heavy Duty Pallet', nameTr: 'Ağır Hizmet Paleti', category: 'industrial', description: 'Load capacity 2500kg. Rackable design. Chemical resistant.', descriptionTr: 'Yük kapasitesi 2500kg. Rafa uygun tasarım. Kimyasallara dayanıklı.', dimensions: { width: 120, height: 16, depth: 100 }, weight: 25.0, colors: ['black', 'blue'], material: 'hdpe', image: 'https://picsum.photos/seed/fg-industrial/600/600', inStock: true, featured: false },
            { sku: 'FG-IB-001', name: 'IBC Container 1000L', nameTr: '1000L IBC Konteyner', category: 'industrial', description: 'Intermediate bulk container for liquids. UN approved.', descriptionTr: 'Sıvılar için ara toplu konteyner. UN onaylı.', dimensions: { width: 120, height: 100, depth: 100 }, weight: 55.0, colors: ['white', 'black'], material: 'hdpe', image: 'https://picsum.photos/seed/fg-industrial/600/600', inStock: true, featured: false },
            { sku: 'FG-DR-001', name: 'Industrial Drum 200L', nameTr: '200L Endüstriyel Varil', category: 'industrial', description: 'Chemical storage drum with screw cap. FDA approved liner.', descriptionTr: 'Vidalı kapaklı kimyasal depolama varili. FDA onaylı astar.', dimensions: { width: 58, height: 98, depth: 58 }, weight: 9.0, colors: ['blue', 'black', 'white'], material: 'hdpe', image: 'https://picsum.photos/seed/fg-industrial/600/600', inStock: true, featured: false },
            { sku: 'FG-DT-001', name: 'Dolly Transport Base', nameTr: 'Taşıma Arabası Tabanı', category: 'industrial', description: 'Wheeled transport dolly for bins and crates. Load capacity 250kg.', descriptionTr: 'Kutular ve kasalar için tekerlekli taşıma arabası. Yük kapasitesi 250kg.', dimensions: { width: 60, height: 17, depth: 40 }, weight: 3.5, colors: ['black', 'blue'], material: 'pp', image: 'https://picsum.photos/seed/fg-industrial/600/600', inStock: true, featured: false },
            { sku: 'FG-SP-001', name: 'Spill Containment Pallet', nameTr: 'Sızıntı Toplama Paleti', category: 'industrial', description: 'Secondary containment for drums. Sump capacity 250L.', descriptionTr: 'Variller için ikincil kapsama. Hazne kapasitesi 250L.', dimensions: { width: 130, height: 30, depth: 130 }, weight: 28.0, colors: ['yellow', 'black'], material: 'hdpe', image: 'https://picsum.photos/seed/fg-industrial/600/600', inStock: true, featured: false },
            { sku: 'FG-CB-001', name: 'Cable Protector Ramp', nameTr: 'Kablo Koruyucu Rampa', category: 'industrial', description: '5-channel cable protector for events and construction sites.', descriptionTr: 'Etkinlikler ve şantiyeler için 5 kanallı kablo koruyucu.', dimensions: { width: 90, height: 7, depth: 50 }, weight: 12.0, colors: ['black', 'yellow'], material: 'recycled', image: 'https://picsum.photos/seed/fg-industrial/600/600', inStock: true, featured: false },
            { sku: 'FG-SB-004', name: 'Speed Bump Traffic', nameTr: 'Trafik Hız Kesici', category: 'industrial', description: 'Modular speed bump for parking lots. Reflective strips included.', descriptionTr: 'Otoparklar için modüler hız kesici. Yansıtıcı şeritler dahil.', dimensions: { width: 100, height: 5, depth: 35 }, weight: 5.0, colors: ['black', 'yellow'], material: 'recycled', image: 'https://picsum.photos/seed/fg-industrial/600/600', inStock: true, featured: false },
            { sku: 'FG-KC-001', name: 'Kids Play Stool', nameTr: 'Çocuk Oyun Taburesi', category: 'kids', description: 'Safe rounded edges. Lightweight for children to carry. Stackable.', descriptionTr: 'Güvenli yuvarlatılmış kenarlar. Çocukların taşıyacağı kadar hafif. İstiflenebilir.', dimensions: { width: 28, height: 27, depth: 28 }, weight: 0.8, colors: ['red', 'blue', 'yellow', 'green', 'white'], material: 'pp', image: 'https://picsum.photos/seed/fg-kids/600/600', inStock: true, featured: true },
            { sku: 'FG-KC-002', name: 'Kids Table Set', nameTr: 'Çocuk Masa Seti', category: 'kids', description: 'Table with 2 chairs. Perfect height for ages 3-8.', descriptionTr: '2 sandalyeli masa. 3-8 yaş için mükemmel yükseklik.', dimensions: { width: 60, height: 50, depth: 60 }, weight: 5.5, colors: ['white', 'blue', 'red'], material: 'pp', image: 'https://picsum.photos/seed/fg-kids/600/600', inStock: true, featured: false },
            { sku: 'FG-KS-001', name: 'Toy Storage Bin Kids', nameTr: 'Çocuk Oyuncak Kutusu', category: 'kids', description: 'Fun design with easy-grip handles. Smooth safe edges.', descriptionTr: 'Kolay tutuş kollarıyla eğlenceli tasarım. Pürüzsüz güvenli kenarlar.', dimensions: { width: 45, height: 30, depth: 35 }, weight: 1.2, colors: ['blue', 'red', 'yellow', 'green'], material: 'pp', image: 'https://picsum.photos/seed/fg-kids/600/600', inStock: true, featured: false },
            { sku: 'FG-KP-001', name: 'Kids Sandbox', nameTr: 'Çocuk Kum Havuzu', category: 'kids', description: 'Turtle shell design with lid. UV protected.', descriptionTr: 'Kapaklı kaplumbağa kabuğu tasarımı. UV korumalı.', dimensions: { width: 115, height: 25, depth: 83 }, weight: 8.0, colors: ['green', 'blue'], material: 'hdpe', image: 'https://picsum.photos/seed/fg-kids/600/600', inStock: true, featured: true },
            { sku: 'FG-KP-002', name: 'Splash Pool Kids', nameTr: 'Çocuk Su Havuzu', category: 'kids', description: 'Rigid wall splash pool. Easy drain plug. Ages 3+.', descriptionTr: 'Sert duvarlı su havuzu. Kolay boşaltma tapası. 3+ yaş.', dimensions: { width: 120, height: 35, depth: 120 }, weight: 6.0, colors: ['blue', 'green'], material: 'hdpe', image: 'https://picsum.photos/seed/fg-kids/600/600', inStock: true, featured: false },
        ];

        // Give each product a unique image using its SKU as seed
        const productsWithUniqueImages = seedProducts.map(p => ({
            ...p,
            image: `https://picsum.photos/seed/${p.sku.toLowerCase()}/600/600`
        }));

        const created = await Product.insertMany(productsWithUniqueImages);
        res.status(201).json({ success: true, count: created.length, message: `${created.length} test ürünü eklendi` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
