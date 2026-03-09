const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, generateToken } = require('../middleware/authMiddleware');

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
        }

        // Find user with password field
        const user = await User.findOne({ username: username.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
        }

        if (!user.isActive) {
            return res.status(401).json({ error: 'Hesabınız devre dışı bırakılmış' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
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
                username: user.username,
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
                username: req.user.username,
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

// PUT /api/auth/credentials - Update username/password
router.put('/credentials', authenticate, async (req, res) => {
    try {
        const { currentPassword, newUsername, newPassword } = req.body;

        if (!currentPassword) {
            return res.status(400).json({ error: 'Mevcut şifre gerekli' });
        }

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({ error: 'Mevcut şifre hatalı' });
        }

        if (newUsername) {
            const existing = await User.findOne({ username: newUsername.toLowerCase(), _id: { $ne: user._id } });
            if (existing) {
                return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor' });
            }
            user.username = newUsername;
        }

        if (newPassword) {
            if (newPassword.length < 4) {
                return res.status(400).json({ error: 'Şifre en az 4 karakter olmalı' });
            }
            user.password = newPassword;
        }

        await user.save();
        res.json({ message: 'Bilgiler güncellendi' });
    } catch (error) {
        console.error('Credentials update error:', error);
        res.status(500).json({ error: 'Bilgiler güncellenirken hata oluştu' });
    }
});

// POST /api/auth/seed - Create initial admin user (remove in production)
router.post('/seed', async (req, res) => {
    try {
        // Remove existing admin and recreate
        await User.deleteMany({ role: 'admin' });

        const admin = new User({
            username: 'hacihiradagi',
            password: 'hiradagi',
            name: 'Admin',
            role: 'admin',
            isActive: true
        });

        await admin.save();

        res.json({
            message: 'Admin kullanıcı oluşturuldu',
            credentials: {
                username: 'hacihiradagi'
            }
        });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ error: 'Admin kullanıcı oluşturulamadı' });
    }
});

module.exports = router;
