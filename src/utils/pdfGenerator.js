import jsPDF from 'jspdf';
import { colors as staticColors } from '../data/products';

// --- Theme (matches site: Apple-inspired FreeGarden) ---
const THEME = {
    green:      [52, 199, 89],
    greenDark:  [40, 167, 69],
    greenLight: [240, 253, 244],
    dark:       [10, 10, 10],
    text:       [29, 29, 31],
    muted:      [134, 134, 139],
    light:      [245, 245, 247],
    white:      [255, 255, 255],
    border:     [225, 225, 230],
    danger:     [255, 59, 48],
    cardBg:     [255, 255, 255],
    pageBg:     [251, 251, 253],
};

// --- Helpers ---

// Fetch with timeout
const fetchWithTimeout = (url, timeoutMs = 10000) => {
    return Promise.race([
        fetch(url),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs))
    ]);
};

// Compress image via canvas — good quality for PDF print
const compressImage = (dataUrl, maxSize = 400, quality = 0.82) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(null);
        img.src = dataUrl;
    });
};

const getBase64FromUrl = async (url, timeoutMs = 12000) => {
    try {
        const response = await fetchWithTimeout(url, timeoutMs);
        if (!response.ok) return null;
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
};

// Fetch single image with up to 2 retries
const fetchImageWithRetry = async (url, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
        const raw = await getBase64FromUrl(url, 12000);
        if (raw) return raw;
        // Wait before retry (300ms, 600ms)
        if (attempt < retries) await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
    }
    return null;
};

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// Load all product images with progress reporting
const preloadImages = async (products, onProgress) => {
    const images = {};
    const total = products.filter(p => p.image).length;
    let loaded = 0;

    // Process 5 at a time to avoid rate-limiting from image hosts
    const batchSize = 5;
    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const results = await Promise.all(batch.map(async (product) => {
            if (!product.image) return null;
            try {
                const raw = await fetchImageWithRetry(product.image, 2);
                loaded++;
                if (onProgress) onProgress(loaded, total);
                if (!raw) return null;
                const compressed = await compressImage(raw, 400, 0.82);
                return { id: product.id || product._id, data: compressed };
            } catch {
                loaded++;
                if (onProgress) onProgress(loaded, total);
                return null;
            }
        }));
        results.forEach(r => { if (r) images[r.id] = r.data; });
        // Small pause between batches to avoid rate-limiting
        if (i + batchSize < products.length) await delay(200);
    }
    return images;
};

const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
};

// --- PDF Generation ---
// onProgress(percent: 0-100) callback for real progress tracking

export const generateProductCatalog = async (products, categories, dbColors = [], onProgress) => {
    try {
        const report = (pct) => { if (onProgress) onProgress(Math.min(Math.round(pct), 100)); };

        report(2);

        // Load fonts
        const [fontRaw, fontBoldRaw] = await Promise.all([
            getBase64FromUrl('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf', 8000),
            getBase64FromUrl('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf', 8000),
        ]);

        report(8);

        // Load images (this is the slow part — 8% to 80%)
        const productImages = await preloadImages(products, (loaded, total) => {
            const imgPct = total > 0 ? (loaded / total) : 1;
            report(8 + imgPct * 72); // 8% → 80%
        });

        report(80);

        const fontBase64 = fontRaw ? fontRaw.split(',')[1] : null;
        const fontBase64Bold = fontBoldRaw ? fontBoldRaw.split(',')[1] : null;

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        if (fontBase64) {
            doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
            doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        }
        if (fontBase64Bold) {
            doc.addFileToVFS('Roboto-Medium.ttf', fontBase64Bold);
            doc.addFont('Roboto-Medium.ttf', 'Roboto', 'bold');
        }

        const font = fontBase64 ? 'Roboto' : 'helvetica';
        doc.setFont(font);

        const PW = doc.internal.pageSize.width;
        const PH = doc.internal.pageSize.height;
        const ML = 15;
        const MR = 15;
        const CW = PW - ML - MR;

        const getColorName = (colorId) => {
            const dbColor = dbColors.find(c => c.id === colorId);
            if (dbColor) return dbColor.nameTr || dbColor.name;
            const sc = staticColors.find(c => c.id === colorId);
            return sc ? sc.name : colorId;
        };

        const getColorHex = (colorId) => {
            const dbColor = dbColors.find(c => c.id === colorId);
            if (dbColor) return dbColor.hex;
            const sc = staticColors.find(c => c.id === colorId);
            return sc ? sc.hex : '#CCCCCC';
        };

        // ===========================
        // PAGE 1: COVER
        // ===========================
        doc.setFillColor(...THEME.dark);
        doc.rect(0, 0, PW, PH, 'F');

        doc.setFillColor(...THEME.green);
        doc.rect(0, 0, PW, 5, 'F');

        doc.setFont(font, 'bold');
        doc.setFontSize(42);
        doc.setTextColor(...THEME.white);
        doc.text('FreeGarden', PW / 2, 80, { align: 'center' });

        doc.setFont(font, 'normal');
        doc.setFontSize(14);
        doc.setTextColor(...THEME.muted);
        doc.text('Premium Garden Products', PW / 2, 92, { align: 'center' });

        doc.setDrawColor(...THEME.green);
        doc.setLineWidth(0.8);
        doc.line(PW / 2 - 30, 102, PW / 2 + 30, 102);

        doc.setFont(font, 'bold');
        doc.setFontSize(20);
        doc.setTextColor(...THEME.white);
        doc.text('ÜRÜN KATALOĞU', PW / 2, 125, { align: 'center' });

        doc.setFont(font, 'normal');
        doc.setFontSize(16);
        doc.setTextColor(...THEME.green);
        doc.text(new Date().getFullYear().toString(), PW / 2, 136, { align: 'center' });

        // Stats boxes
        const statsY = 200;
        const boxW = 50;
        const gap = 15;
        const totalW = boxW * 3 + gap * 2;
        const startX = (PW - totalW) / 2;
        const stats = [
            { value: products.length.toString(), label: 'Ürün' },
            { value: categories.length.toString(), label: 'Kategori' },
            { value: products.filter(p => p.inStock).length.toString(), label: 'Stokta' }
        ];

        stats.forEach((stat, i) => {
            const bx = startX + i * (boxW + gap);
            doc.setFillColor(30, 30, 30);
            doc.rect(bx, statsY, boxW, 35, 'F');
            doc.setFillColor(...THEME.green);
            doc.rect(bx, statsY, boxW, 2, 'F');

            doc.setFont(font, 'bold');
            doc.setFontSize(22);
            doc.setTextColor(...THEME.white);
            doc.text(stat.value, bx + boxW / 2, statsY + 17, { align: 'center' });

            doc.setFont(font, 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...THEME.muted);
            doc.text(stat.label, bx + boxW / 2, statsY + 27, { align: 'center' });
        });

        const dateStr = new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.setFontSize(9);
        doc.setTextColor(...THEME.muted);
        doc.text(dateStr, PW / 2, PH - 25, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(...THEME.green);
        doc.text('www.freegarden.com', PW / 2, PH - 18, { align: 'center' });

        report(82);

        // ===========================
        // PAGE 2: TABLE OF CONTENTS
        // ===========================
        doc.addPage();
        drawPageBackground(doc, PW, PH);
        drawPageHeader(doc, font, PW, ML, 'İçindekiler');

        let tocY = 55;
        const activeCats = categories.filter(cat =>
            products.some(p => p.category === cat.id)
        );

        activeCats.forEach((cat, idx) => {
            const catProducts = products.filter(p => p.category === cat.id);
            const catName = cat.nameTr || cat.name;

            doc.setFillColor(...(idx % 2 === 0 ? THEME.white : THEME.light));
            doc.rect(ML, tocY, CW, 14, 'F');

            doc.setFillColor(...THEME.green);
            doc.circle(ML + 6, tocY + 7, 2.5, 'F');

            doc.setFont(font, 'bold');
            doc.setFontSize(8);
            doc.setTextColor(...THEME.white);
            doc.text((idx + 1).toString(), ML + 6, tocY + 8, { align: 'center' });

            doc.setFont(font, 'bold');
            doc.setFontSize(12);
            doc.setTextColor(...THEME.text);
            doc.text(catName, ML + 16, tocY + 9);

            doc.setFont(font, 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...THEME.muted);
            doc.text(`${catProducts.length} ürün`, PW - MR - 5, tocY + 9, { align: 'right' });

            doc.setDrawColor(...THEME.border);
            doc.setLineDashPattern([1, 1], 0);
            doc.setLineWidth(0.2);
            const nameWidth = doc.getTextWidth(catName);
            doc.line(ML + 18 + nameWidth, tocY + 8, PW - MR - doc.getTextWidth(`${catProducts.length} ürün`) - 10, tocY + 8);
            doc.setLineDashPattern([], 0);

            tocY += 16;
        });

        report(84);

        // ===========================
        // PRODUCT PAGES (by category)
        // ===========================
        const cardW = (CW - 8) / 2;
        const cardH = 62;
        const cardGap = 8;
        const rowH = cardH + cardGap;
        const imgSize = 38;
        const FOOTER_ZONE = 20;
        const FIRST_PAGE_START_Y = 75;
        const CONT_PAGE_START_Y = 40;

        const firstPageRows = Math.floor((PH - FIRST_PAGE_START_Y - FOOTER_ZONE) / rowH);
        const contPageRows = Math.floor((PH - CONT_PAGE_START_Y - FOOTER_ZONE) / rowH);
        const firstPageCards = firstPageRows * 2;
        const contPageCards = contPageRows * 2;

        let totalDrawn = 0;

        activeCats.forEach((cat) => {
            const catProducts = products.filter(p => p.category === cat.id);
            const catName = cat.nameTr || cat.name;

            doc.addPage();
            drawPageBackground(doc, PW, PH);

            doc.setFillColor(...THEME.dark);
            doc.rect(0, 25, PW, 40, 'F');
            doc.setFillColor(...THEME.green);
            doc.rect(0, 25, PW, 3, 'F');

            doc.setFont(font, 'bold');
            doc.setFontSize(24);
            doc.setTextColor(...THEME.white);
            doc.text(catName.toUpperCase(), PW / 2, 50, { align: 'center' });

            doc.setFont(font, 'normal');
            doc.setFontSize(11);
            doc.setTextColor(...THEME.green);
            doc.text(`${catProducts.length} Ürün`, PW / 2, 59, { align: 'center' });

            let posInPage = 0;
            let pageStartY = FIRST_PAGE_START_Y;
            let maxOnThisPage = firstPageCards;

            catProducts.forEach((product) => {
                if (posInPage >= maxOnThisPage) {
                    doc.addPage();
                    drawPageBackground(doc, PW, PH);
                    drawPageHeader(doc, font, PW, ML, catName);
                    posInPage = 0;
                    pageStartY = CONT_PAGE_START_Y;
                    maxOnThisPage = contPageCards;
                }

                const row = Math.floor(posInPage / 2);
                const col = posInPage % 2;
                const cx = ML + col * (cardW + cardGap);
                const cy = pageStartY + row * rowH;

                drawProductCard(doc, font, product, cx, cy, cardW, cardH, imgSize, productImages, getColorHex, THEME);

                posInPage++;
                totalDrawn++;
            });

            // Report card drawing progress: 84% → 92%
            report(84 + (totalDrawn / products.length) * 8);
        });

        report(92);

        // ===========================
        // LAST PAGE: SUMMARY TABLE
        // ===========================
        doc.addPage();
        drawPageBackground(doc, PW, PH);
        drawPageHeader(doc, font, PW, ML, 'Ürün Özet Tablosu');

        const { default: autoTable } = await import('jspdf-autotable');

        const summaryRows = products.map(product => {
            const category = categories.find(c => c.id === product.category);
            const categoryName = category?.nameTr || category?.name || '-';
            const name = product.nameTr || product.name || '-';
            const sku = product.sku || '-';
            const weight = product.weight ? `${product.weight} kg` : '-';

            let dims = '-';
            if (product.dimensions) {
                const { width, height, depth } = product.dimensions;
                const validDims = [width, height, depth].filter(d => d && d > 0);
                if (validDims.length > 0) dims = validDims.join('×') + ' cm';
            }

            const pColors = product.colors || [];
            const colorNames = pColors.length > 0
                ? pColors.slice(0, 3).map(id => getColorName(id)).join(', ') + (pColors.length > 3 ? ` +${pColors.length - 3}` : '')
                : '-';

            return [sku, name, categoryName, dims, weight, colorNames, product.inStock ? '●' : '○'];
        });

        autoTable(doc, {
            head: [['SKU', 'ÜRÜN ADI', 'KATEGORİ', 'EBAT', 'AĞIRLIK', 'RENKLER', '']],
            body: summaryRows,
            startY: 50,
            theme: 'plain',
            styles: {
                font,
                fontSize: 6.5,
                cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
                textColor: THEME.text,
                valign: 'middle',
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: THEME.dark,
                textColor: THEME.white,
                fontSize: 6,
                fontStyle: 'bold',
                cellPadding: { top: 4, bottom: 4, left: 3, right: 3 }
            },
            alternateRowStyles: {
                fillColor: THEME.light
            },
            columnStyles: {
                0: { cellWidth: 20, fontStyle: 'bold' },
                1: { cellWidth: 40 },
                2: { cellWidth: 22 },
                3: { cellWidth: 28 },
                4: { cellWidth: 18 },
                5: { cellWidth: 38 },
                6: { cellWidth: 8, halign: 'center', fontSize: 8 }
            },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 6) {
                    const product = products[data.row.index];
                    if (product) {
                        doc.setTextColor(...(product.inStock ? THEME.green : THEME.danger));
                    }
                }
            },
            margin: { top: 50, bottom: 25, left: ML, right: MR },
        });

        report(95);

        // ===========================
        // FOOTER ON ALL PAGES (except cover)
        // ===========================
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 2; i <= totalPages; i++) {
            doc.setPage(i);

            doc.setDrawColor(...THEME.border);
            doc.setLineWidth(0.3);
            doc.line(ML, PH - 15, PW - MR, PH - 15);

            doc.setFont(font, 'bold');
            doc.setFontSize(7);
            doc.setTextColor(...THEME.green);
            doc.text('FreeGarden', ML, PH - 10);

            doc.setFont(font, 'normal');
            doc.setFontSize(7);
            doc.setTextColor(...THEME.muted);
            doc.text('www.freegarden.com', PW / 2, PH - 10, { align: 'center' });

            doc.setFont(font, 'normal');
            doc.setFontSize(7);
            doc.setTextColor(...THEME.muted);
            doc.text(`${i - 1} / ${totalPages - 1}`, PW - MR, PH - 10, { align: 'right' });
        }

        report(98);

        // --- Save with blob fallback for VM/cloud environments ---
        try {
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'FreeGarden_Urun_Katalogu.pdf';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 1000);
        } catch {
            doc.output('dataurlnewwindow');
        }

        report(100);
    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw error;
    }
};

// --- Draw a single product card ---

function drawProductCard(doc, font, product, cx, cy, cardW, cardH, imgSize, productImages, getColorHex, T) {
    doc.setFillColor(...T.cardBg);
    doc.rect(cx, cy, cardW, cardH, 'F');

    doc.setDrawColor(...T.border);
    doc.setLineWidth(0.3);
    doc.rect(cx, cy, cardW, cardH, 'S');

    const imageData = productImages[product.id || product._id];
    const imgX = cx + 4;
    const imgY = cy + 4;

    if (imageData) {
        try {
            doc.addImage(imageData, 'JPEG', imgX, imgY, imgSize, imgSize);
        } catch {
            doc.setFillColor(...T.light);
            doc.rect(imgX, imgY, imgSize, imgSize, 'F');
        }
    } else {
        doc.setFillColor(...T.light);
        doc.rect(imgX, imgY, imgSize, imgSize, 'F');
        doc.setFontSize(7);
        doc.setTextColor(...T.muted);
        doc.text('Görsel Yok', imgX + imgSize / 2, imgY + imgSize / 2, { align: 'center' });
    }

    doc.setDrawColor(...T.border);
    doc.setLineWidth(0.2);
    doc.rect(imgX, imgY, imgSize, imgSize, 'S');

    const infoX = imgX + imgSize + 4;
    const infoW = cardW - imgSize - 12;
    let infoY = cy + 8;

    const name = product.nameTr || product.name || 'İsimsiz Ürün';
    doc.setFont(font, 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...T.text);
    const nameLines = doc.splitTextToSize(name, infoW);
    doc.text(nameLines.slice(0, 2), infoX, infoY);
    infoY += nameLines.slice(0, 2).length * 3.5 + 1;

    doc.setFont(font, 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...T.muted);
    doc.text(product.sku || '-', infoX, infoY);
    infoY += 4;

    if (product.dimensions) {
        const { width, height, depth } = product.dimensions;
        const validDims = [width, height, depth].filter(d => d && d > 0);
        if (validDims.length > 0) {
            doc.setFontSize(6);
            doc.setTextColor(...T.muted);
            doc.text(`${validDims.join(' × ')} cm`, infoX, infoY);
            infoY += 3.5;
        }
    }

    if (product.weight) {
        doc.setFontSize(6);
        doc.setTextColor(...T.muted);
        doc.text(`${product.weight} kg`, infoX, infoY);
        infoY += 3.5;
    }

    doc.setFont(font, 'bold');
    doc.setFontSize(5.5);
    if (product.inStock) {
        doc.setFillColor(...T.greenLight);
        doc.rect(infoX, infoY - 2.5, 14, 4, 'F');
        doc.setTextColor(...T.greenDark);
        doc.text('STOKTA', infoX + 1, infoY);
    } else {
        doc.setFillColor(255, 240, 240);
        doc.rect(infoX, infoY - 2.5, 16, 4, 'F');
        doc.setTextColor(...T.danger);
        doc.text('TÜKENDİ', infoX + 1, infoY);
    }

    const pColors = product.colors || [];
    if (pColors.length > 0) {
        const swatchSize = 4;
        const swatchGap = 1.5;
        const swatchY = cy + cardH - 8;
        const maxSwatches = Math.min(pColors.length, Math.floor((cardW - 8) / (swatchSize + swatchGap)));

        pColors.slice(0, maxSwatches).forEach((colorId, cIdx) => {
            const hex = getColorHex(colorId);
            const rgb = hexToRgb(hex);
            const sx = cx + 4 + cIdx * (swatchSize + swatchGap);

            doc.setFillColor(...rgb);
            doc.circle(sx + swatchSize / 2, swatchY + swatchSize / 2, swatchSize / 2, 'F');

            if (rgb[0] > 230 && rgb[1] > 230 && rgb[2] > 230) {
                doc.setDrawColor(...T.border);
                doc.setLineWidth(0.2);
                doc.circle(sx + swatchSize / 2, swatchY + swatchSize / 2, swatchSize / 2, 'S');
            }
        });

        if (pColors.length > maxSwatches) {
            doc.setFont(font, 'normal');
            doc.setFontSize(5.5);
            doc.setTextColor(...T.muted);
            doc.text(`+${pColors.length - maxSwatches}`, cx + 4 + maxSwatches * (swatchSize + swatchGap) + 1, swatchY + 3.5);
        }
    }
}

// --- Page Helpers ---

function drawPageBackground(doc, PW, PH) {
    doc.setFillColor(...THEME.pageBg);
    doc.rect(0, 0, PW, PH, 'F');
}

function drawPageHeader(doc, font, PW, ML, title) {
    doc.setFillColor(...THEME.green);
    doc.rect(0, 0, PW, 3, 'F');

    doc.setFont(font, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...THEME.text);
    doc.text(title, ML, 25);

    doc.setDrawColor(...THEME.green);
    doc.setLineWidth(0.8);
    const titleWidth = doc.getTextWidth(title);
    doc.line(ML, 28, ML + titleWidth, 28);

    doc.setFont(font, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...THEME.muted);
    doc.text('FreeGarden', PW - ML, 25, { align: 'right' });
}
