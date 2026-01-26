const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameTr: { type: String },
    description: { type: String },
    descriptionTr: { type: String },
    order: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Material', materialSchema);
