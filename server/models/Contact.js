const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ['new', 'read', 'replied', 'archived'],
        default: 'new'
    },
    repliedAt: { type: Date },
    notes: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);
