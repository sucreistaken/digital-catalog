const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    notes: {
        type: String // Internal notes
    },
    tags: [{
        type: String,
        trim: true
    }],
    source: {
        type: String,
        enum: ['quote', 'contact', 'manual'],
        default: 'manual'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastContactAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster searches
customerSchema.index({ email: 1 });
customerSchema.index({ company: 1 });
customerSchema.index({ name: 'text', company: 'text', email: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
