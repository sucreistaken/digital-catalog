const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    title: {
        // Multilingual support
        en: { type: String, default: '' },
        tr: { type: String, default: '' },
        ar: { type: String, default: '' },
        de: { type: String, default: '' },
        zh: { type: String, default: '' }
    },
    content: {
        // Multilingual support - stores HTML or markdown
        en: { type: String, default: '' },
        tr: { type: String, default: '' },
        ar: { type: String, default: '' },
        de: { type: String, default: '' },
        zh: { type: String, default: '' }
    },
    metaDescription: {
        en: { type: String, default: '' },
        tr: { type: String, default: '' }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    showInMenu: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
pageSchema.index({ slug: 1 });
pageSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Page', pageSchema);
