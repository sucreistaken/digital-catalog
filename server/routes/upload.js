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
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: fileFilter
});

// POST /api/upload - Single image upload
router.post('/', (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Dosya boyutu çok büyük! Maksimum 10MB yükleyebilirsiniz.' });
            }
            return res.status(400).json({ error: `Yükleme hatası: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Lütfen bir dosya seçin' });
            }

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

// POST /api/upload/bulk - Multiple image upload
router.post('/bulk', (req, res) => {
    upload.array('images', 50)(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Dosya boyutu çok büyük! Maksimum 10MB yükleyebilirsiniz.' });
            }
            return res.status(400).json({ error: `Yükleme hatası: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'Lütfen en az bir dosya seçin' });
            }

            const uploadedFiles = req.files.map(file => ({
                url: `/uploads/${file.filename}`,
                filename: file.filename,
                originalName: file.originalname,
                size: file.size
            }));

            console.log(`✅ ${uploadedFiles.length} resim yüklendi`);

            res.status(201).json({
                message: `${uploadedFiles.length} dosya başarıyla yüklendi`,
                files: uploadedFiles
            });
        } catch (error) {
            console.error('❌ Bulk upload error:', error);
            res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
        }
    });
});

// GET /api/upload/gallery - List all uploaded images
router.get('/gallery', (req, res) => {
    try {
        if (!fs.existsSync(uploadDir)) {
            return res.json({ files: [] });
        }

        const files = fs.readdirSync(uploadDir)
            .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
            .map(filename => {
                const filePath = path.join(uploadDir, filename);
                const stats = fs.statSync(filePath);
                return {
                    url: `/uploads/${filename}`,
                    filename: filename,
                    size: stats.size,
                    uploadedAt: stats.mtime
                };
            })
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

        res.json({ files });
    } catch (error) {
        console.error('❌ Gallery error:', error);
        res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
    }
});

// DELETE /api/upload/all - Delete ALL images (Must be before /:filename)
router.delete('/all', (req, res) => {
    try {
        if (!fs.existsSync(uploadDir)) {
            return res.json({ message: 'Galeri zaten boş', count: 0 });
        }

        const files = fs.readdirSync(uploadDir)
            .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));

        let deletedCount = 0;
        for (const file of files) {
            try {
                fs.unlinkSync(path.join(uploadDir, file));
                deletedCount++;
            } catch (e) {
                console.error(`Silinemedi: ${file}`, e);
            }
        }

        console.log(`🗑️ ${deletedCount} resim silindi`);
        res.json({ message: `${deletedCount} resim silindi`, count: deletedCount });
    } catch (error) {
        console.error('❌ Delete all error:', error);
        res.status(500).json({ error: 'Silme hatası: ' + error.message });
    }
});

// DELETE /api/upload/:filename - Delete a single image
router.delete('/:filename', (req, res) => {
    try {
        const { filename } = req.params;

        // Security: prevent directory traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({ error: 'Geçersiz dosya adı' });
        }

        const filePath = path.join(uploadDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Dosya bulunamadı' });
        }

        fs.unlinkSync(filePath);
        console.log(`🗑️ Resim silindi: ${filename}`);

        res.json({ message: 'Dosya başarıyla silindi', filename });
    } catch (error) {
        console.error('❌ Delete error:', error);
        res.status(500).json({ error: 'Silme hatası: ' + error.message });
    }
});

module.exports = router;
