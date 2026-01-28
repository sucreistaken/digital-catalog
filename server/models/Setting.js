const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed, // Can store string, number, object, array
        required: true
    },
    group: {
        type: String,
        enum: ['company', 'contact', 'social', 'seo', 'appearance', 'other'],
        default: 'other'
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

// Static method to get all settings as object
settingSchema.statics.getAllAsObject = async function () {
    const settings = await this.find();
    return settings.reduce((obj, setting) => {
        obj[setting.key] = setting.value;
        return obj;
    }, {});
};

// Static method to set a setting
settingSchema.statics.set = async function (key, value, group = 'other') {
    return this.findOneAndUpdate(
        { key },
        { key, value, group },
        { upsert: true, new: true }
    );
};

// Static method to get a setting
settingSchema.statics.get = async function (key, defaultValue = null) {
    const setting = await this.findOne({ key });
    return setting ? setting.value : defaultValue;
};

module.exports = mongoose.model('Setting', settingSchema);
