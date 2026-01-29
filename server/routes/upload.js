const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Double-check directory exists before each upload
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return cb(new Error('Sadece resim dosyaları yüklenebilir! (jpg, jpeg, png, gif, webp)'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max (increased from 5MB)
    },
    fileFilter: fileFilter
});

// POST /api/upload
router.post('/', (req, res) => {
    upload.single('image')(req, res, function (err) {
        // Handle Multer errors
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Dosya boyutu çok büyük! Maksimum 10MB yükleyebilirsiniz.' });
            }
            return res.status(400).json({ error: `Yükleme hatası: ${err.message}` });
        } else if (err) {
            // Other errors (like file type)
            return res.status(400).json({ error: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Lütfen bir dosya seçin' });
            }

            // Return the file URL
            const fileUrl = `/uploads/${req.file.filename}`;

            console.log(`✅ Resim yüklendi: ${req.file.filename}`);

            res.status(201).json({
                message: 'Dosya başarıyla yüklendi',
                url: fileUrl,
                filename: req.file.filename
            });
        } catch (error) {
            console.error('❌ Upload error:', error);
            res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
        }
    });
});

module.exports = router;

