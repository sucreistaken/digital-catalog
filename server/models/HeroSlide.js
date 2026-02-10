const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema({
    image: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' }
}, {
    timestamps: true
});

module.exports = mongoose.model('HeroSlide', heroSlideSchema);
