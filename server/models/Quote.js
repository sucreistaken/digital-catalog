const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    company: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    products: [{ type: String }], // Product IDs or SKUs
    message: { type: String },
    status: {
        type: String,
        enum: ['new', 'replied', 'pending', 'closed'],
        default: 'new'
    },
    notes: { type: String }, // Internal notes
    repliedAt: { type: Date },
    repliedBy: { type: String }
}, {
    timestamps: true // createdAt, updatedAt
});

module.exports = mongoose.model('Quote', quoteSchema);
