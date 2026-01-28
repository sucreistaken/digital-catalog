const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, generateToken } = require('../middleware/authMiddleware');

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email ve şifre gerekli' });
        }

        // Find user with password field
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({ error: 'Geçersiz email veya şifre' });
        }

        if (!user.isActive) {
            return res.status(401).json({ error: 'Hesabınız devre dışı bırakılmış' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Geçersiz email veya şifre' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Giriş yapılırken bir hata oluştu' });
    }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticate, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                role: req.user.role
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Kullanıcı bilgisi alınamadı' });
    }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', authenticate, (req, res) => {
    // In a JWT setup, logout is handled client-side by removing the token
    // This endpoint is for logging purposes or future token blacklisting
    res.json({ message: 'Çıkış başarılı' });
});

// POST /api/auth/seed - Create initial admin user (remove in production)
router.post('/seed', async (req, res) => {
    try {
        const existingAdmin = await User.findOne({ role: 'admin' });

        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin kullanıcı zaten mevcut' });
        }

        const admin = new User({
            email: 'admin@fabrikaa.com',
            password: 'admin123',
            name: 'Admin',
            role: 'admin',
            isActive: true
        });

        await admin.save();

        res.json({
            message: 'Admin kullanıcı oluşturuldu',
            credentials: {
                email: 'admin@fabrikaa.com',
                password: 'admin123'
            }
        });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ error: 'Admin kullanıcı oluşturulamadı' });
    }
});

module.exports = router;
