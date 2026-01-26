const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameTr: { type: String },
    hex: { type: String, required: true },
    order: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Color', colorSchema);
