const mongoose = require('mongoose');

const showroomNodeSchema = new mongoose.Schema({
    nodeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    panoramaImage: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    links: [{
        targetNodeId: { type: String, required: true },
        yaw: { type: Number, default: 0 },
        pitch: { type: Number, default: 0 }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('ShowroomNode', showroomNodeSchema);
