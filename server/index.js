require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB bağlantısı
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB bağlantısı başarılı!');
    } catch (err) {
        console.error('❌ MongoDB bağlantı hatası:', err.message);
        process.exit(1);
    }
};

// Routes
const productRoutes = require('./routes/products');
const uploadRoutes = require('./routes/upload');
const categoryRoutes = require('./routes/categories');
const quoteRoutes = require('./routes/quotes');
const contactRoutes = require('./routes/contacts');
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const settingsRoutes = require('./routes/settings');
const pagesRoutes = require('./routes/pages');
const colorRoutes = require('./routes/colors');
const showroomRoutes = require('./routes/showroom');

app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/showroom', showroomRoutes);


// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Fabrikaa API çalışıyor!' });
});

// Handle SPA routing: serve index.html for any unknown route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Migrate existing data: set brand to 'freegarden' where missing
const migrateExistingData = async () => {
    try {
        const Product = require('./models/Product');
        const Category = require('./models/Category');
        const pResult = await Product.updateMany({ brand: { $exists: false } }, { $set: { brand: 'freegarden' } });
        const cResult = await Category.updateMany({ brand: { $exists: false } }, { $set: { brand: 'freegarden' } });
        if (pResult.modifiedCount > 0 || cResult.modifiedCount > 0) {
            console.log(`✅ Brand migration: ${pResult.modifiedCount} products, ${cResult.modifiedCount} categories updated`);
        }
    } catch (err) {
        console.error('Brand migration error:', err.message);
    }
};

// Start server
connectDB().then(async () => {
    await migrateExistingData();
    app.listen(PORT, () => {
        console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
    });
});
