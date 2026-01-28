import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { colors } from '../data/products';

// --- Helper Functions ---

const getBase64FromUrl = async (url) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn('Asset load failed:', url);
        return null;
    }
};

const preloadImages = async (products) => {
    const images = {};
    const promises = products.map(async (product) => {
        if (product.image) {
            // Prepend data specifier to base64 for addImage
            const b64 = await getBase64FromUrl(product.image);
            if (b64) images[product.id || product._id] = `data:image/jpeg;base64,${b64}`;
        }
    });
    await Promise.all(promises);
    return images;
};

// --- PDF Generation ---

export const generateProductCatalog = async (products, categories) => {
    // 1. Load Assets (Images & Font)
    // We use a Turkish-compatible font (Roboto) hosted on a CDN to ensure characters like İ, ş, ğ work.
    const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
    const fontUrlBold = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf';

    // Fetch assets in parallel
    const [fontBase64, fontBase64Bold, productImages] = await Promise.all([
        getBase64FromUrl(fontUrl),
        getBase64FromUrl(fontUrlBold),
        preloadImages(products)
    ]);

    const doc = new jsPDF();

    // 2. Register Fonts
    if (fontBase64) {
        doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    }
    if (fontBase64Bold) {
        doc.addFileToVFS('Roboto-Medium.ttf', fontBase64Bold);
        doc.addFont('Roboto-Medium.ttf', 'Roboto', 'bold');
    }

    if (fontBase64) doc.setFont('Roboto'); // Set as default

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- Header Design ---
    // Dark Header Background
    doc.setFillColor(20, 20, 22); // Almost black
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Gold Accent Line
    doc.setLineWidth(0.5);
    doc.setDrawColor(218, 165, 32); // Goldenrod
    doc.line(14, 49, pageWidth - 14, 49);

    // Logo / Brand Name
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    if (fontBase64) doc.setFont('Roboto', 'normal'); // Use bold if we loaded a bold weight, mostly normal looks fine clean
    doc.text('FABRİKA', 14, 30);

    // Subtitle / Date
    doc.setFontSize(10);
    doc.setTextColor(180, 180, 180);
    doc.text('PREMIUM COLLECTION', 14, 38);

    const dateStr = new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(dateStr, pageWidth - 14, 30, { align: 'right' });
    doc.text('Ürün Kataloğu', pageWidth - 14, 38, { align: 'right' });

    // --- Table Data Preparation ---
    const tableRows = products.map(product => {
        const category = categories.find(c => c.id === product.category);
        const categoryName = category?.nameTr || category?.name || product.category || '-';

        // Clean Color Names
        const colorNames = (product.colors || [])
            .slice(0, 4)
            .map(id => {
                const c = colors.find(col => col.id === id);
                return c ? c.name : id;
            })
            .join(', ');

        // Clean Dimensions
        let dims = '-';
        if (product.dimensions) {
            const { width, height, depth } = product.dimensions;
            // Filter out undefined/null values
            const validDims = [width, height, depth].filter(d => d !== undefined && d !== null);
            if (validDims.length > 0) {
                dims = validDims.join(' x ') + ' cm';
            }
        }

        // Clean SKU & Name
        const sku = product.sku || '';
        const name = product.nameTr || product.name || 'İsimsiz Ürün';

        return [
            '', // Image Placeholder
            `${name}\n${sku ? 'kod: ' + sku : ''}`, // Combined Name & SKU
            { content: categoryName, styles: { valign: 'middle' } },
            { content: `Ebat: ${dims}\nRenkler: ${colorNames || '-'}` },
            product.inStock ? 'STOKTA' : 'TÜKENDİ'
        ];
    });

    // --- Table Render ---
    autoTable(doc, {
        head: [['GÖRSEL', 'ÜRÜN BİLGİSİ', 'KATEGORİ', 'ÖZELLİKLER', 'DURUM']],
        body: tableRows,
        startY: 60,
        theme: 'plain', // Clean base to build upon
        styles: {
            font: fontBase64 ? 'Roboto' : 'helvetica', // Use our custom font
            fontSize: 9,
            cellPadding: 6, // Slightly reduced padding to save space
            textColor: [40, 40, 40],
            valign: 'middle',
            lineColor: [230, 230, 230],
            lineWidth: { bottom: 0.1 },
            overflow: 'linebreak'
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [120, 120, 120],
            fontSize: 8,
            fontStyle: 'bold', // Made bold for better legibility
            lineWidth: { bottom: 0.5 },
            lineColor: [218, 165, 32], // Gold line under header
            halign: 'left',
            cellPadding: { top: 8, bottom: 8, left: 6, right: 6 } // More vertical breathing room
        },
        alternateRowStyles: {
            fillColor: [252, 252, 253] // Very subtle alternation
        },
        columnStyles: {
            0: { cellWidth: 28, minCellHeight: 28 }, // Increased for "GÖRSEL"
            1: { cellWidth: 'auto' }, // Name
            2: { cellWidth: 35 }, // Category
            3: { cellWidth: 50 }, // Specs
            4: { cellWidth: 28, halign: 'center' } // Increased for "DURUM" & "STOKTA"
        },
        didDrawCell: (data) => {
            // Draw Image
            if (data.section === 'body' && data.column.index === 0) {
                const product = products[data.row.index];
                const imageBase64 = productImages[product.id || product._id];

                if (imageBase64) {
                    const padding = 3;
                    const size = 22; // Slightly larger image
                    const posX = data.cell.x + padding;
                    const posY = data.cell.y + (data.cell.height - size) / 2; // Center vertically

                    doc.addImage(imageBase64, 'JPEG', posX, posY, size, size);

                    // Optional: Border around image
                    doc.setDrawColor(240, 240, 240);
                    doc.rect(posX, posY, size, size);
                }
            }

            // Bold Name styling
            if (data.section === 'body' && data.column.index === 1) {
                // autoTable handles newlines automatically
            }

            // Status Badge Look
            if (data.section === 'body' && data.column.index === 4) {
                const product = products[data.row.index];
                const color = product.inStock ? [34, 197, 94] : [239, 68, 68];

                // Draw a pill/badge background

                doc.setFont(fontBase64 ? 'Roboto' : 'helvetica', 'bold');
                doc.setTextColor(...color);
            }
        },
        margin: { top: 60, bottom: 20 },
    });

    // --- Modern Footer ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);

        // Page Number
        doc.text(
            `${i} / ${totalPages}`,
            pageWidth - 14,
            pageHeight - 10,
            { align: 'right' }
        );

        // Brand Footer
        doc.text('FABRİKA © 2026', 14, pageHeight - 10);
    }

    doc.save('Fabrika_Premium_Katalog.pdf');
};
