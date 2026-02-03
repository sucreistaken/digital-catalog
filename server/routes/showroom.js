const express = require('express');
const router = express.Router();
const ShowroomNode = require('../models/ShowroomNode');

// GET all nodes (sorted by order)
router.get('/', async (req, res) => {
    try {
        const nodes = await ShowroomNode.find().sort({ order: 1 });
        res.json(nodes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new node
router.post('/', async (req, res) => {
    try {
        const count = await ShowroomNode.countDocuments();
        const node = new ShowroomNode({
            ...req.body,
            order: req.body.order ?? count + 1
        });
        await node.save();
        res.status(201).json(node);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update node
router.put('/reorder/bulk', async (req, res) => {
    try {
        const { orderedIds } = req.body;
        if (!orderedIds || !Array.isArray(orderedIds)) {
            return res.status(400).json({ error: 'orderedIds array gerekli' });
        }

        const updatePromises = orderedIds.map((id, index) =>
            ShowroomNode.findByIdAndUpdate(id, { order: index + 1 }, { new: true })
        );
        await Promise.all(updatePromises);

        const nodes = await ShowroomNode.find().sort({ order: 1 });
        res.json(nodes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update single node
router.put('/:id', async (req, res) => {
    try {
        const node = await ShowroomNode.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!node) return res.status(404).json({ error: 'Node bulunamadı' });
        res.json(node);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE node
router.delete('/:id', async (req, res) => {
    try {
        const node = await ShowroomNode.findByIdAndDelete(req.params.id);
        if (!node) return res.status(404).json({ error: 'Node bulunamadı' });
        res.json({ success: true, message: 'Node silindi' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST seed hardcoded tour data into DB
router.post('/seed', async (req, res) => {
    try {
        const NORTH = 0;
        const EAST = Math.PI / 2;
        const SOUTH = Math.PI;
        const WEST = -Math.PI / 2;

        const seedNodes = [
            {
                nodeId: 'fabrika-1', name: 'Fabrika 1', panoramaImage: '/showroom/fabrika-1.JPG', order: 1,
                links: [{ targetNodeId: 'fabrika-2', yaw: SOUTH, pitch: 0 }]
            },
            {
                nodeId: 'fabrika-2', name: 'Fabrika 2', panoramaImage: '/showroom/fabrika-2.JPG', order: 2,
                links: [{ targetNodeId: 'fabrika-1', yaw: NORTH, pitch: 0 }, { targetNodeId: 'fabrika-3', yaw: SOUTH, pitch: 0 }]
            },
            {
                nodeId: 'fabrika-3', name: 'Fabrika 3', panoramaImage: '/showroom/fabrika-3.JPG', order: 3,
                links: [{ targetNodeId: 'fabrika-2', yaw: NORTH, pitch: 0 }, { targetNodeId: 'fabrika-4', yaw: SOUTH, pitch: 0 }]
            },
            {
                nodeId: 'fabrika-4', name: 'Fabrika 4', panoramaImage: '/showroom/fabrika-4.JPG', order: 4,
                links: [{ targetNodeId: 'fabrika-3', yaw: NORTH, pitch: 0 }, { targetNodeId: 'fabrika-5', yaw: SOUTH, pitch: 0 }]
            },
            {
                nodeId: 'fabrika-5', name: 'Fabrika 5', panoramaImage: '/showroom/fabrika-5.JPG', order: 5,
                links: [{ targetNodeId: 'fabrika-4', yaw: NORTH, pitch: 0 }, { targetNodeId: 'fabrika-6', yaw: EAST, pitch: 0 }]
            },
            {
                nodeId: 'fabrika-6', name: 'Fabrika 6', panoramaImage: '/showroom/fabrika-6.JPG', order: 6,
                links: [{ targetNodeId: 'fabrika-5', yaw: WEST, pitch: 0 }, { targetNodeId: 'fabrika-7', yaw: NORTH, pitch: 0 }]
            },
            {
                nodeId: 'fabrika-7', name: 'Fabrika 7', panoramaImage: '/showroom/fabrika-7.JPG', order: 7,
                links: [{ targetNodeId: 'fabrika-6', yaw: SOUTH, pitch: 0 }, { targetNodeId: 'fabrika-8', yaw: NORTH, pitch: 0 }]
            },
            {
                nodeId: 'fabrika-8', name: 'Fabrika 8', panoramaImage: '/showroom/fabrika-8.JPG', order: 8,
                links: [{ targetNodeId: 'fabrika-7', yaw: SOUTH, pitch: 0 }, { targetNodeId: 'fabrika-9', yaw: NORTH, pitch: 0 }]
            },
            {
                nodeId: 'fabrika-9', name: 'Fabrika 9', panoramaImage: '/showroom/fabrika-9.JPG', order: 9,
                links: [{ targetNodeId: 'fabrika-8', yaw: SOUTH, pitch: 0 }, { targetNodeId: 'fabrika-10', yaw: NORTH, pitch: 0 }]
            },
            {
                nodeId: 'fabrika-10', name: 'Fabrika 10', panoramaImage: '/showroom/fabrika-10.JPG', order: 10,
                links: [{ targetNodeId: 'fabrika-9', yaw: SOUTH, pitch: 0 }, { targetNodeId: 'fabrika-11', yaw: NORTH, pitch: 0 }]
            },
            {
                nodeId: 'fabrika-11', name: 'Fabrika 11', panoramaImage: '/showroom/fabrika-11.JPG', order: 11,
                links: [{ targetNodeId: 'fabrika-10', yaw: SOUTH, pitch: 0 }, { targetNodeId: 'fabrika-12', yaw: NORTH, pitch: 0 }]
            },
            {
                nodeId: 'fabrika-12', name: 'Fabrika 12', panoramaImage: '/showroom/fabrika-12.JPG', order: 12,
                links: [{ targetNodeId: 'fabrika-11', yaw: SOUTH, pitch: 0 }]
            },
        ];

        // Clear existing and insert fresh
        await ShowroomNode.deleteMany({});
        const created = await ShowroomNode.insertMany(seedNodes);
        res.status(201).json({ success: true, count: created.length, message: `${created.length} showroom node eklendi` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
