const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameTr: { type: String },
    nameAr: { type: String },
    nameDe: { type: String },
    nameZh: { type: String },
    icon: { type: String },
    order: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
