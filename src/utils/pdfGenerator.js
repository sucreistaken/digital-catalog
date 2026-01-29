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
            const b64 = await getBase64FromUrl(product.image);
            if (b64) images[product.id || product._id] = `data:image/jpeg;base64,${b64}`;
        }
    });
    await Promise.all(promises);
    return images;
};

// --- PDF Generation ---

export const generateProductCatalog = async (products, categories) => {
    try {
        // Site Colors
        const PRIMARY_GREEN = [52, 199, 89];       // #34C759
        const PRIMARY_GREEN_DARK = [40, 167, 69];  // #28A745
        const BG_SURFACE = [245, 245, 247];        // #F5F5F7
        const TEXT_MAIN = [29, 29, 31];            // #1D1D1F
        const TEXT_MUTED = [134, 134, 139];        // #86868B
        const BORDER = [210, 210, 215];            // #D2D2D7

        // Load Font & Images
        const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
        const fontUrlBold = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf';

        const [fontBase64, fontBase64Bold, productImages] = await Promise.all([
            getBase64FromUrl(fontUrl),
            getBase64FromUrl(fontUrlBold),
            preloadImages(products)
        ]);

        const doc = new jsPDF();

        // Register Fonts
        if (fontBase64) {
            doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
            doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        }
        if (fontBase64Bold) {
            doc.addFileToVFS('Roboto-Medium.ttf', fontBase64Bold);
            doc.addFont('Roboto-Medium.ttf', 'Roboto', 'bold');
        }
        if (fontBase64) doc.setFont('Roboto');

        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // --- Modern Header with Green Theme ---
        // White header with green accent
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, 45, 'F');

        // Green gradient line at top
        doc.setFillColor(...PRIMARY_GREEN);
        doc.rect(0, 0, pageWidth, 4, 'F');

        // Logo / Brand Name
        doc.setFontSize(24);
        doc.setTextColor(...PRIMARY_GREEN);
        if (fontBase64) doc.setFont('Roboto', 'bold');
        doc.text('FABRİKA', 14, 25);

        // Subtitle
        doc.setFontSize(9);
        doc.setTextColor(...TEXT_MUTED);
        if (fontBase64) doc.setFont('Roboto', 'normal');
        doc.text('PREMIUM GARDEN PRODUCTS', 14, 32);

        // Date & Info (right side)
        const dateStr = new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.setFontSize(10);
        doc.setTextColor(...TEXT_MAIN);
        doc.text(dateStr, pageWidth - 14, 22, { align: 'right' });
        doc.setTextColor(...TEXT_MUTED);
        doc.text(`${products.length} Ürün`, pageWidth - 14, 30, { align: 'right' });

        // Divider line
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.3);
        doc.line(14, 44, pageWidth - 14, 44);

        // --- Table Data Preparation ---
        const tableRows = products.map(product => {
            const category = categories.find(c => c.id === product.category);
            const categoryName = category?.nameTr || category?.name || '-';

            // Color Names (all colors)
            const colorNames = (product.colors || [])
                .map(id => {
                    const c = colors.find(col => col.id === id);
                    return c ? c.name : id;
                })
                .join(', ') || '-';

            // Dimensions
            let dims = '-';
            if (product.dimensions) {
                const { width, height, depth } = product.dimensions;
                const validDims = [width, height, depth].filter(d => d !== undefined && d !== null && d > 0);
                if (validDims.length > 0) {
                    dims = validDims.join(' × ') + ' cm';
                }
            }

            // Package Dimensions
            let packageDims = '';
            if (product.packageDimensions) {
                const { width, height, depth } = product.packageDimensions;
                const validDims = [width, height, depth].filter(d => d !== undefined && d !== null && d > 0);
                if (validDims.length > 0) {
                    packageDims = validDims.join(' × ') + ' cm';
                }
            }

            // All product features
            const sku = product.sku || '-';
            const name = product.nameTr || product.name || 'İsimsiz Ürün';
            const weight = product.weight ? `${product.weight} kg` : '-';
            const volume = product.volume ? `${product.volume} Lt` : '';
            const piecesInPackage = product.piecesInPackage || '';
            const packageType = product.packageType || '';

            // Feature Column with all details
            let features = `Ebat: ${dims}`;
            if (weight !== '-') features += `\nAğırlık: ${weight}`;
            if (volume) features += `\nHacim: ${volume}`;
            if (piecesInPackage) features += `\nPaket: ${piecesInPackage} adet`;
            if (packageType) features += ` (${packageType})`;
            if (packageDims) features += `\nKoli: ${packageDims}`;

            return [
                '', // Image Placeholder
                { content: `${name}\n${sku}`, styles: { fontStyle: 'bold' } },
                categoryName,
                features,
                colorNames,
                product.inStock ? 'STOKTA' : 'TÜKENDİ'
            ];
        });

        // --- Table Render ---
        autoTable(doc, {
            head: [['', 'ÜRÜN', 'KATEGORİ', 'ÖZELLİKLER', 'RENKLER', 'DURUM']],
            body: tableRows,
            startY: 52,
            theme: 'plain',
            styles: {
                font: fontBase64 ? 'Roboto' : 'helvetica',
                fontSize: 8,
                cellPadding: 5,
                textColor: TEXT_MAIN,
                valign: 'middle',
                lineColor: BORDER,
                lineWidth: { bottom: 0.1 },
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: BG_SURFACE,
                textColor: TEXT_MUTED,
                fontSize: 7,
                fontStyle: 'bold',
                halign: 'left',
                cellPadding: { top: 6, bottom: 6, left: 5, right: 5 }
            },
            alternateRowStyles: {
                fillColor: [252, 252, 253]
            },
            columnStyles: {
                0: { cellWidth: 20, minCellHeight: 20 },  // Image
                1: { cellWidth: 35 },                      // Name + SKU
                2: { cellWidth: 22 },                      // Category
                3: { cellWidth: 50 },                      // Features
                4: { cellWidth: 35 },                      // Colors
                5: { cellWidth: 22, halign: 'center' }     // Status - wider to fit STOKTA
            },
            didDrawCell: (data) => {
                // Draw Image
                if (data.section === 'body' && data.column.index === 0) {
                    const product = products[data.row.index];
                    const imageBase64 = productImages[product.id || product._id];

                    if (imageBase64) {
                        const padding = 2;
                        const size = 18;
                        const posX = data.cell.x + padding;
                        const posY = data.cell.y + (data.cell.height - size) / 2;

                        try {
                            doc.addImage(imageBase64, 'JPEG', posX, posY, size, size);
                            // Light border around image
                            doc.setDrawColor(...BORDER);
                            doc.setLineWidth(0.2);
                            doc.rect(posX, posY, size, size);
                        } catch (err) {
                            console.warn('Failed to add image:', err);
                        }
                    }
                }

                // Status Badge Color
                if (data.section === 'body' && data.column.index === 5) {
                    const product = products[data.row.index];
                    const color = product.inStock ? PRIMARY_GREEN : [239, 68, 68];
                    doc.setFont(fontBase64 ? 'Roboto' : 'helvetica', 'bold');
                    doc.setTextColor(...color);
                }
            },
            margin: { top: 52, bottom: 25 },
        });

        // --- Footer on all pages ---
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);

            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Sayfa ${i} / ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
            doc.text('www.freegarden.com', pageWidth / 2, pageHeight - 10, { align: 'center' }); // Updated domain
        }
        // Save PDF
        doc.save('FreeGarden_Urun_Katalogu.pdf'); // Updated filename
    } catch (error) {
        console.error('PDF Generation Error:', error);
        alert(`PDF Oluşturulamadı: ${error.message}\nLütfen konsolu kontrol edin.`);
    }
};
