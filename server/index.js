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
const productRoutes = require('./routes/products'); // Renamed productsRouter to productRoutes
const uploadRoutes = require('./routes/upload'); // Added upload routes

app.use('/api/products', productRoutes); // Using productRoutes
app.use('/api/upload', uploadRoutes); // Added upload routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Fabrikaa API çalışıyor!' });
});

// Ana sayfa
app.get('/', (req, res) => {
    res.json({
        name: 'Fabrikaa API',
        version: '1.0.0',
        endpoints: {
            products: '/api/products',
            health: '/api/health'
        }
    });
});

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
    });
});
