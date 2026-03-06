const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['page_view', 'product_view', 'whatsapp_click', 'brand_select', 'catalog_pdf'],
        index: true
    },
    brand: {
        type: String,
        default: '',
        index: true
    },
    page: {
        type: String,
        default: ''
    },
    productId: String,
    productName: String,
    productSku: String,
    sessionId: {
        type: String,
        default: '',
        index: true
    },
    referrer: String,
    userAgent: String,
    ip: String
}, {
    timestamps: true
});

// Compound index for common queries
analyticsEventSchema.index({ type: 1, brand: 1, createdAt: -1 });
analyticsEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
