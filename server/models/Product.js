const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, default: 'Unnamed Product' },
    nameTr: { type: String, default: '' },
    sku: { type: String, default: () => `SKU-${Date.now()}` },
    category: { type: String, default: 'furniture' },
    description: { type: String },
    descriptionTr: { type: String },
    material: { type: String },
    image: { type: String },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 }, // Sıralama için
    colors: [{ type: String }],
    weight: { type: Number },
    dimensions: {
        width: { type: Number },
        height: { type: Number },
        depth: { type: Number }
    },
    sizeVariants: [{
        id: String,
        label: String,
        labelTr: String,
        dimensions: {
            width: Number,
            height: Number
        }
    }],
    defaultSize: { type: String },
    imageScale: { type: Number, default: 100 }, // Görsel ölçek değeri (50-200)
    // Eski colorFilters yerine yeni colorVariants
    colorVariants: [{
        id: String,
        colorId: String,
        colorName: String,
        hue: Number,
        saturation: Number
    }],
    // Deprecated but kept for backward compatibility
    colorFilters: {
        hue: { type: Number },
        saturation: { type: Number }
    },
    // New fields for Product Grouping (Variant linking)
    groupId: { type: String, index: true }, // Shared ID among variants
    primaryColor: {
        id: String,
        name: String,
        hex: String
    },
    defaultColor: { type: String } // User selected default color for display
}, {
    timestamps: true // createdAt, updatedAt otomatik ekler
});

module.exports = mongoose.model('Product', productSchema);
