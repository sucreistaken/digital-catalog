const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Product = require('../models/Product');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage - use memory for processing with sharp
const storage = multer.memoryStorage();

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
        fileSize: 100 * 1024 * 1024 // 100MB max
    },
    fileFilter: fileFilter
});

// Ensure thumbnails directory exists
const thumbDir = path.join(uploadDir, 'thumbs');
if (!fs.existsSync(thumbDir)) {
    fs.mkdirSync(thumbDir, { recursive: true });
}

// Save original and create thumbnail
async function saveWithThumbnail(buffer, originalName) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(originalName).toLowerCase() || '.jpg';
    const filename = uniqueSuffix + ext;
    const thumbFilename = uniqueSuffix + '_thumb.webp';

    const originalPath = path.join(uploadDir, filename);
    const thumbPath = path.join(thumbDir, thumbFilename);

    // Save original file as-is (full quality)
    fs.writeFileSync(originalPath, buffer);

    // Create small thumbnail for gallery (fast loading)
    await sharp(buffer)
        .resize(300, 300, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .webp({ quality: 70 })
        .toFile(thumbPath);

    return {
        filename,
        thumbFilename,
        url: `/uploads/${filename}`,
        thumbUrl: `/uploads/thumbs/${thumbFilename}`
    };
}

// POST /api/upload - Single image upload
router.post('/', (req, res) => {
    upload.single('image')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Dosya boyutu çok büyük! Maksimum 100MB yükleyebilirsiniz.' });
            }
            return res.status(400).json({ error: `Yükleme hatası: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Lütfen bir dosya seçin' });
            }

            // Save original + create thumbnail
            const result = await saveWithThumbnail(req.file.buffer, req.file.originalname);

            console.log(`✅ Resim yüklendi: ${result.filename}`);

            res.status(201).json({
                message: 'Dosya başarıyla yüklendi',
                url: result.url,
                thumbUrl: result.thumbUrl,
                filename: result.filename
            });
        } catch (error) {
            console.error('❌ Upload error:', error);
            res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
        }
    });
});

// POST /api/upload/bulk - Multiple image upload  
router.post('/bulk', (req, res) => {
    upload.array('images', 50)(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Dosya boyutu çok büyük! Maksimum 100MB yükleyebilirsiniz.' });
            }
            return res.status(400).json({ error: `Yükleme hatası: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'Lütfen en az bir dosya seçin' });
            }

            // Process all images in parallel - save original + thumbnail
            const uploadPromises = req.files.map(async (file) => {
                const result = await saveWithThumbnail(file.buffer, file.originalname);
                return {
                    url: result.url,
                    thumbUrl: result.thumbUrl,
                    filename: result.filename,
                    originalName: file.originalname
                };
            });

            const uploadedFiles = await Promise.all(uploadPromises);

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

        // Get original files (not thumbs)
        const files = fs.readdirSync(uploadDir)
            .filter(file => {
                // Skip directories and thumb files
                const filePath = path.join(uploadDir, file);
                return fs.statSync(filePath).isFile() &&
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(file) &&
                    !file.includes('_thumb');
            })
            .map(filename => {
                const filePath = path.join(uploadDir, filename);
                const stats = fs.statSync(filePath);

                // Find corresponding thumbnail
                const baseName = path.parse(filename).name;
                const thumbFilename = baseName + '_thumb.webp';
                const thumbPath = path.join(thumbDir, thumbFilename);
                const hasThumb = fs.existsSync(thumbPath);

                return {
                    url: `/uploads/${filename}`,
                    thumbUrl: hasThumb ? `/uploads/thumbs/${thumbFilename}` : `/uploads/${filename}`,
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

// DELETE /api/upload/all - Delete UNUSED images only (Must be before /:filename)
router.delete('/all', async (req, res) => {
    try {
        if (!fs.existsSync(uploadDir)) {
            return res.json({ message: 'Galeri zaten boş', count: 0 });
        }

        // Get all product images from database
        const products = await Product.find({}, 'image');
        const usedImages = new Set();

        products.forEach(product => {
            if (product.image) {
                // Extract filename from URL (e.g., /uploads/123456.jpg -> 123456.jpg)
                const filename = product.image.split('/').pop();
                usedImages.add(filename);
            }
        });

        console.log(`📦 Ürünlerde kullanılan ${usedImages.size} resim korunacak`);

        // Get all original files (not in thumbs folder)
        const allFiles = fs.readdirSync(uploadDir)
            .filter(file => {
                const filePath = path.join(uploadDir, file);
                return fs.statSync(filePath).isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
            });

        let deletedCount = 0;
        let skippedCount = 0;

        for (const file of allFiles) {
            if (usedImages.has(file)) {
                // This image is used by a product, skip it
                skippedCount++;
                continue;
            }

            try {
                // Delete original file
                fs.unlinkSync(path.join(uploadDir, file));

                // Also delete corresponding thumbnail if exists
                const baseName = path.parse(file).name;
                const thumbFilename = baseName + '_thumb.webp';
                const thumbPath = path.join(thumbDir, thumbFilename);
                if (fs.existsSync(thumbPath)) {
                    fs.unlinkSync(thumbPath);
                }

                deletedCount++;
            } catch (e) {
                console.error(`Silinemedi: ${file}`, e);
            }
        }

        console.log(`🗑️ ${deletedCount} kullanılmayan resim silindi, ${skippedCount} ürün resmi korundu`);
        res.json({
            message: `${deletedCount} kullanılmayan resim silindi`,
            count: deletedCount,
            kept: skippedCount
        });
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
