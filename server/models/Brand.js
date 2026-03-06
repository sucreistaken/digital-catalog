const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    tagline: {
        type: String,
        default: ''
    },
    taglineTr: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    whatsapp: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    logo: {
        type: String,
        default: ''
    },
    theme: {
        primaryColor: { type: String, default: '#34C759' },
        primaryHover: { type: String, default: '#28A745' },
        primaryLight: { type: String, default: 'rgba(52, 199, 89, 0.1)' }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Brand', brandSchema);
