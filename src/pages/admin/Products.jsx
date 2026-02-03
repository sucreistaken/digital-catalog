import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Filter, Download, Loader2, GripVertical, X, FileText, CheckCircle, FileSpreadsheet, Copy, Check, Image, Layers, List, Package, ToggleLeft, ToggleRight, ChevronUp, ChevronDown, Database, ChevronLeft, ChevronRight, Palette, RotateCcw, Save, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { products as defaultProducts, materials, colors } from '../../data/products';
import { generateProductCatalog } from '../../utils/pdfGenerator';
import { productsApi, categoriesApi, colorsApi } from '../../utils/api';
import ProductEditModal from '../../components/ProductEditModal';
import ImageGalleryAssigner from '../../components/ImageGalleryAssigner';
import '../Dashboard.css';

const Products = () => {
    const { t, language } = useLanguage();

    // Original State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSearchCategory] = useState('all');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportComplete, setExportComplete] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    // View mode: 'flat' (default) or 'category'
    const [viewMode, setViewMode] = useState('flat');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showGalleryAssigner, setShowGalleryAssigner] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Drag & Drop state (products)
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);
    const [isSavingOrder, setIsSavingOrder] = useState(false);

    // Drag & Drop state (categories)
    const [draggedCategory, setDraggedCategory] = useState(null);
    const [dragOverCategory, setDragOverCategory] = useState(null);

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkCategoryDropdown, setBulkCategoryDropdown] = useState(false);
    const [showBulkScale, setShowBulkScale] = useState(false);
    const [bulkScaleValue, setBulkScaleValue] = useState(100);

    // Sorting state
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Seed state
    const [isSeeding, setIsSeeding] = useState(false);

    // Optimize state
    const [isOptimizing, setIsOptimizing] = useState(false);

    // Color editor state
    const [showColorEditor, setShowColorEditor] = useState(false);
    const [dbColors, setDbColors] = useState([]);
    const [editingColors, setEditingColors] = useState({});
    const [savingColors, setSavingColors] = useState(false);

    // Toast notification state
    const [toast, setToast] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const copyToClipboard = async (text, productId) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(productId);
            showToast('Kopyalandı: ' + text);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
            showToast('Kopyalama başarısız', 'error');
        }
    };

    // Load products, categories and colors from API
    useEffect(() => {
        loadProducts();
        loadCategories();
        loadColors();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await productsApi.getAll();
            setProducts(data.length > 0 ? data : defaultProducts);
        } catch (err) {
            console.error('API Error:', err);
            setError('API bağlantısı başarısız. Varsayılan ürünler yükleniyor...');
            setProducts(defaultProducts);
        } finally {
            setLoading(false);
        }
    };

    const loadColors = async () => {
        try {
            const data = await colorsApi.getAll();
            setDbColors(data);
        } catch (err) {
            console.error('Renkler yüklenemedi:', err);
        }
    };

    const openColorEditor = () => {
        setEditingColors({});
        setShowColorEditor(true);
    };

    const handleColorNameChange = (colorId, field, value) => {
        setEditingColors(prev => ({
            ...prev,
            [colorId]: { ...prev[colorId], [field]: value }
        }));
    };

    const saveColorChanges = async () => {
        const entries = Object.entries(editingColors);
        if (entries.length === 0) return;
        try {
            setSavingColors(true);
            for (const [colorId, data] of entries) {
                await colorsApi.update(colorId, data);
            }
            await loadColors();
            setEditingColors({});
            showToast(`${entries.length} renk güncellendi`);
        } catch (err) {
            console.error('Color save error:', err);
            showToast('Renkler kaydedilemedi!', 'error');
        } finally {
            setSavingColors(false);
        }
    };

    const resetColors = async () => {
        if (!confirm('Tüm renk adları varsayılana sıfırlanacak. Devam etmek istiyor musunuz?')) return;
        try {
            setSavingColors(true);
            await colorsApi.reset();
            await loadColors();
            setEditingColors({});
            showToast('Renkler sıfırlandı');
        } catch (err) {
            showToast('Renkler sıfırlanamadı!', 'error');
        } finally {
            setSavingColors(false);
        }
    };

    // Merge DB colors with static colors (DB takes priority)
    const getColor = (colorId) => {
        const dbColor = dbColors.find(c => c.id === colorId);
        if (dbColor) return dbColor;
        return colors.find(c => c.id === colorId);
    };

    const loadCategories = async () => {
        try {
            const data = await categoriesApi.getAll();
            setCategories(data);
        } catch (err) {
            console.error('Kategoriler yüklenemedi:', err);
        }
    };

    const getProductName = (product) => {
        const langKey = `name${language.charAt(0).toUpperCase() + language.slice(1)}`;
        return product[langKey] || product.name;
    };

    const getCategoryName = (catId) => {
        const cat = categories.find(c => c.id === catId);
        const langKey = `name${language.charAt(0).toUpperCase() + language.slice(1)}`;
        return cat?.[langKey] || cat?.name || catId;
    };

    const filteredProducts = products
        .filter(p => {
            const matchesSearch = getProductName(p).toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (sortColumn) {
                const dir = sortDirection === 'asc' ? 1 : -1;
                let valA, valB;
                switch (sortColumn) {
                    case 'name':
                        valA = getProductName(a).toLowerCase();
                        valB = getProductName(b).toLowerCase();
                        return valA < valB ? -dir : valA > valB ? dir : 0;
                    case 'sku':
                        valA = (a.sku || '').toLowerCase();
                        valB = (b.sku || '').toLowerCase();
                        return valA < valB ? -dir : valA > valB ? dir : 0;
                    case 'category':
                        valA = getCategoryName(a.category).toLowerCase();
                        valB = getCategoryName(b.category).toLowerCase();
                        return valA < valB ? -dir : valA > valB ? dir : 0;
                    case 'weight':
                        return ((a.weight || 0) - (b.weight || 0)) * dir;
                    case 'imageSize':
                        return ((a.imageSize || 0) - (b.imageSize || 0)) * dir;
                    case 'inStock':
                        valA = a.inStock ? 1 : 0;
                        valB = b.inStock ? 1 : 0;
                        return (valA - valB) * dir;
                    default:
                        return 0;
                }
            }
            const catA = categories.find(c => c.id === a.category);
            const catB = categories.find(c => c.id === b.category);
            const catOrderA = catA?.order ?? 999;
            const catOrderB = catB?.order ?? 999;
            if (catOrderA !== catOrderB) return catOrderA - catOrderB;
            return (a.order || 0) - (b.order || 0);
        });

    // Pagination
    const totalPages = itemsPerPage === 0 ? 1 : Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = itemsPerPage === 0
        ? filteredProducts
        : filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSort = (column) => {
        if (sortColumn === column) {
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else {
                setSortColumn(null);
                setSortDirection('asc');
            }
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const SortIcon = ({ column }) => {
        if (sortColumn !== column) return null;
        return sortDirection === 'asc'
            ? <ChevronUp size={14} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
            : <ChevronDown size={14} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />;
    };

    // Check if drag & drop should be enabled
    // Flat mode: only when no filters are active
    // Category mode: always enabled (drag within each category)
    const isDragEnabled = sortColumn
        ? false
        : viewMode === 'category'
            ? searchQuery === ''
            : searchQuery === '' && selectedCategory === 'all';

    // Group products by category for category view
    const getCategoryGroups = () => {
        const sortedCategories = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
        const groups = [];
        const productsToShow = searchQuery
            ? products.filter(p =>
                getProductName(p).toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            : products;

        for (const cat of sortedCategories) {
            const catProducts = productsToShow
                .filter(p => p.category === cat.id)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            if (catProducts.length > 0) {
                groups.push({ category: cat, products: catProducts });
            }
        }

        // Uncategorized products
        const uncategorized = productsToShow.filter(p =>
            !p.category || !categories.some(c => c.id === p.category)
        );
        if (uncategorized.length > 0) {
            groups.push({
                category: { id: '_uncategorized', name: 'Kategorisiz', nameTr: 'Kategorisiz' },
                products: uncategorized
            });
        }

        return groups;
    };

    const openExportModal = () => {
        setShowExportModal(true);
        setExportProgress(0);
        setExportComplete(false);
        setIsExporting(false);
    };

    const closeExportModal = () => {
        setShowExportModal(false);
        setExportProgress(0);
        setExportComplete(false);
        setIsExporting(false);
    };

    const handleExportPdf = async () => {
        setIsExporting(true);
        setExportProgress(0);
        setExportComplete(false);

        try {
            const exportProducts = filteredProducts.filter(p => !p.hiddenFromCatalog);
            await generateProductCatalog(exportProducts, categories, dbColors, (pct) => {
                setExportProgress(pct);
            });

            setExportProgress(100);
            setExportComplete(true);

            setTimeout(() => {
                showToast('PDF başarıyla indirildi');
            }, 500);
        } catch (error) {
            console.error('PDF Export Error:', error);
            showToast('PDF oluşturulamadı', 'error');
            closeExportModal();
        } finally {
            setIsExporting(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
            try {
                await productsApi.delete(id);
                setProducts(products.filter(p => (p._id || p.id) !== id));
                showToast('Ürün silindi');
            } catch (err) {
                console.error('Delete error:', err);
                showToast('Silme işlemi başarısız!', 'error');
            }
        }
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (productData) => {
        try {
            if (editingProduct) {
                // Update existing product
                const updated = await productsApi.update(editingProduct._id || editingProduct.id, productData);
                setProducts(products.map(p =>
                    (p._id || p.id) === (updated._id || updated.id) ? updated : p
                ));
                showToast('Ürün güncellendi');
            } else {
                // Add new product(s)
                if (productData.createSeparateVariants && productData.colorVariants?.length > 0) {
                    // Create separate product for each color variant
                    const createdProducts = await productsApi.createWithVariants(productData);
                    setProducts([...createdProducts, ...products]);
                    showToast(`${createdProducts.length} ürün başarıyla oluşturuldu!`);
                } else {
                    // Create single product
                    const created = await productsApi.create(productData);
                    setProducts([created, ...products]);
                    showToast('Ürün eklendi');
                }
            }
        } catch (err) {
            console.error('Save error:', err);
            showToast('Kaydetme işlemi başarısız!', 'error');
        }
    };

    // Seed handler
    const handleSeed = async () => {
        if (!confirm('50 adet test ürünü eklenecek. Mevcut ürünler silinmeyecek. Devam etmek istiyor musunuz?')) return;
        try {
            setIsSeeding(true);
            const result = await productsApi.seed();
            showToast(`${result.count} test ürünü eklendi`);
            await loadProducts();
        } catch (err) {
            console.error('Seed error:', err);
            showToast('Test verileri eklenemedi!', 'error');
        } finally {
            setIsSeeding(false);
        }
    };

    // Optimize selected products' images
    const handleOptimizeImages = async () => {
        const count = selectedIds.size;
        if (!confirm(`${count} ürünün görselleri optimize edilecek. Devam etmek istiyor musunuz?`)) return;
        try {
            setIsOptimizing(true);
            const result = await productsApi.optimizeImages([...selectedIds]);
            const parts = [];
            if (result.optimized > 0) parts.push(`${result.optimized} görsel optimize edildi`);
            if (result.skipped > 0) parts.push(`${result.skipped} atlandı`);
            if (result.updatedProducts > 0) parts.push(`${result.updatedProducts} ürün güncellendi`);
            showToast(parts.join(', ') || 'Optimize edilecek görsel bulunamadı');
            await loadProducts();
            clearSelection();
        } catch (err) {
            console.error('Optimize error:', err);
            showToast('Görsel optimizasyonu başarısız!', 'error');
        } finally {
            setIsOptimizing(false);
        }
    };

    // Drag & Drop handlers (products)
    const handleDragStart = (e, product) => {
        if (!isDragEnabled || draggedCategory) return;
        setDraggedItem(product);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging');
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const handleDragOver = (e, product) => {
        e.preventDefault();
        if (!isDragEnabled || draggedCategory) return;
        if (!draggedItem || (draggedItem._id || draggedItem.id) === (product._id || product.id)) return;
        // In category mode, only allow drag over items in the same category
        if (viewMode === 'category' && draggedItem.category !== product.category) return;
        setDragOverItem(product);
    };

    const handleDragLeave = () => {
        setDragOverItem(null);
    };

    const handleDrop = async (e, targetProduct) => {
        e.preventDefault();
        if (!isDragEnabled) return;
        if (!draggedItem || (draggedItem._id || draggedItem.id) === (targetProduct._id || targetProduct.id)) return;

        if (viewMode === 'category') {
            // Category mode: only allow reorder within same category
            if (draggedItem.category !== targetProduct.category) {
                setDraggedItem(null);
                setDragOverItem(null);
                return;
            }

            const categoryId = targetProduct.category;
            const categoryProducts = products
                .filter(p => p.category === categoryId)
                .sort((a, b) => (a.order || 0) - (b.order || 0));

            const draggedIndex = categoryProducts.findIndex(p => (p._id || p.id) === (draggedItem._id || draggedItem.id));
            const targetIndex = categoryProducts.findIndex(p => (p._id || p.id) === (targetProduct._id || targetProduct.id));

            const newCategoryProducts = [...categoryProducts];
            const [removed] = newCategoryProducts.splice(draggedIndex, 1);
            newCategoryProducts.splice(targetIndex, 0, removed);

            // Update local state: replace products in this category with new order
            const otherProducts = products.filter(p => p.category !== categoryId);
            const reorderedCategoryProducts = newCategoryProducts.map((p, i) => ({ ...p, order: i + 1 }));
            setProducts([...otherProducts, ...reorderedCategoryProducts]);
            setDraggedItem(null);
            setDragOverItem(null);

            // Save to backend
            try {
                setIsSavingOrder(true);
                const orderedIds = newCategoryProducts.map(p => p._id || p.id);
                await productsApi.reorderByCategory(categoryId, orderedIds);
                showToast('Kategori sıralaması güncellendi');
            } catch (err) {
                console.error('Category reorder error:', err);
                showToast('Sıralama kaydedilemedi!', 'error');
                loadProducts();
            } finally {
                setIsSavingOrder(false);
            }
        } else {
            // Flat mode: existing behavior
            const newProducts = [...products];
            const draggedIndex = newProducts.findIndex(p => (p._id || p.id) === (draggedItem._id || draggedItem.id));
            const targetIndex = newProducts.findIndex(p => (p._id || p.id) === (targetProduct._id || targetProduct.id));

            const [removed] = newProducts.splice(draggedIndex, 1);
            newProducts.splice(targetIndex, 0, removed);

            setProducts(newProducts);
            setDraggedItem(null);
            setDragOverItem(null);

            try {
                setIsSavingOrder(true);
                const orderedIds = newProducts.map(p => p._id || p.id);
                await productsApi.reorder(orderedIds);
                showToast('Sıralama güncellendi');
            } catch (err) {
                console.error('Reorder error:', err);
                showToast('Sıralama kaydedilemedi!', 'error');
                loadProducts();
            } finally {
                setIsSavingOrder(false);
            }
        }
    };

    // Category Drag & Drop handlers
    const handleCategoryDragStart = (e, category) => {
        if (!isDragEnabled || category.id === '_uncategorized') return;
        setDraggedCategory(category);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
    };

    const handleCategoryDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging');
        setDraggedCategory(null);
        setDragOverCategory(null);
    };

    const handleCategoryDragOver = (e, category) => {
        e.preventDefault();
        if (!isDragEnabled || !draggedCategory) return;
        if (category.id === '_uncategorized') return;
        if (draggedCategory.id !== category.id) {
            setDragOverCategory(category);
        }
    };

    const handleCategoryDragLeave = () => {
        setDragOverCategory(null);
    };

    const handleCategoryDrop = async (e, targetCategory) => {
        e.preventDefault();
        if (!isDragEnabled || !draggedCategory) return;
        if (targetCategory.id === '_uncategorized' || draggedCategory.id === targetCategory.id) return;

        const sortedCats = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
        const draggedIndex = sortedCats.findIndex(c => c.id === draggedCategory.id);
        const targetIndex = sortedCats.findIndex(c => c.id === targetCategory.id);

        const newCats = [...sortedCats];
        const [removed] = newCats.splice(draggedIndex, 1);
        newCats.splice(targetIndex, 0, removed);

        // Update local state with new order values
        const reorderedCats = newCats.map((c, i) => ({ ...c, order: i + 1 }));
        setCategories(reorderedCats);
        setDraggedCategory(null);
        setDragOverCategory(null);

        // Save to backend
        try {
            setIsSavingOrder(true);
            const orderedIds = newCats.map(c => c.id);
            await categoriesApi.reorder(orderedIds);
            showToast('Kategori sıralaması güncellendi');
        } catch (err) {
            console.error('Category reorder error:', err);
            showToast('Kategori sıralaması kaydedilemedi!', 'error');
            loadCategories();
        } finally {
            setIsSavingOrder(false);
        }
    };

    // Bulk selection handlers
    const toggleSelectProduct = (productId) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(productId)) next.delete(productId);
            else next.add(productId);
            return next;
        });
    };

    const toggleSelectAll = () => {
        const currentIds = paginatedProducts.map(p => p._id || p.id);
        const allSelected = currentIds.length > 0 && currentIds.every(id => selectedIds.has(id));
        if (allSelected) {
            const next = new Set(selectedIds);
            currentIds.forEach(id => next.delete(id));
            setSelectedIds(next);
        } else {
            const next = new Set(selectedIds);
            currentIds.forEach(id => next.add(id));
            setSelectedIds(next);
        }
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
        setBulkCategoryDropdown(false);
        setShowBulkScale(false);
    };

    // Bulk action handlers
    const handleBulkDelete = async () => {
        const count = selectedIds.size;
        if (!confirm(`${count} ürünü silmek istediğinizden emin misiniz?`)) return;
        try {
            await productsApi.bulkDelete([...selectedIds]);
            setProducts(products.filter(p => !selectedIds.has(p._id || p.id)));
            showToast(`${count} ürün silindi`);
            clearSelection();
        } catch (err) {
            console.error('Bulk delete error:', err);
            showToast('Toplu silme başarısız!', 'error');
        }
    };

    const handleBulkCategoryChange = async (categoryId) => {
        try {
            const ids = [...selectedIds];
            const updated = await productsApi.bulkUpdate(ids, { category: categoryId });
            setProducts(updated);
            showToast(`${ids.length} ürünün kategorisi değiştirildi`);
            clearSelection();
        } catch (err) {
            console.error('Bulk category error:', err);
            showToast('Kategori değiştirme başarısız!', 'error');
        }
    };

    const handleBulkScaleApply = async () => {
        try {
            const ids = [...selectedIds];
            const updated = await productsApi.bulkUpdate(ids, { imageScale: bulkScaleValue });
            setProducts(updated);
            showToast(`${ids.length} ürünün ölçeği %${bulkScaleValue} olarak güncellendi`);
            setShowBulkScale(false);
            clearSelection();
        } catch (err) {
            console.error('Bulk scale error:', err);
            showToast('Ölçek güncelleme başarısız!', 'error');
        }
    };

    const handleBulkStockToggle = async (inStock) => {
        try {
            const ids = [...selectedIds];
            const updated = await productsApi.bulkUpdate(ids, { inStock });
            setProducts(updated);
            showToast(`${ids.length} ürün ${inStock ? 'stokta' : 'tükendi'} olarak güncellendi`);
            clearSelection();
        } catch (err) {
            console.error('Bulk stock error:', err);
            showToast('Stok güncelleme başarısız!', 'error');
        }
    };

    const handleToggleVisibility = async (product) => {
        const newVal = !product.hiddenFromCatalog;
        try {
            const updated = await productsApi.update(product._id || product.id, { hiddenFromCatalog: newVal });
            setProducts(products.map(p =>
                (p._id || p.id) === (updated._id || updated.id) ? updated : p
            ));
            showToast(newVal ? 'Ürün katalogdan gizlendi' : 'Ürün katalogda gösterildi');
        } catch (err) {
            console.error('Visibility toggle error:', err);
            showToast('Görünürlük güncellenemedi!', 'error');
        }
    };

    const handleBulkVisibilityToggle = async (hidden) => {
        try {
            const ids = [...selectedIds];
            const updated = await productsApi.bulkUpdate(ids, { hiddenFromCatalog: hidden });
            setProducts(updated);
            showToast(`${ids.length} ürün ${hidden ? 'gizlendi' : 'gösterildi'}`);
            clearSelection();
        } catch (err) {
            console.error('Bulk visibility error:', err);
            showToast('Görünürlük güncellenemedi!', 'error');
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '—';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const isAllSelected = paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.has(p._id || p.id));

    return (
        <div className="admin-page">
            {/* Toast Notification */}
            {toast && (
                <div className={`toast-notification ${toast.type}`} style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    background: toast.type === 'error' ? '#ef4444' : '#22c55e',
                    color: 'white',
                    fontWeight: '500',
                    zIndex: 10000,
                    animation: 'slideIn 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    {toast.message}
                </div>
            )}

            <header className="admin-header">
                <div>
                    <h1 className="text-h2">{t('products')}</h1>
                    <p className="text-body">Ürün kataloğunuzu yönetin</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={openExportModal}
                    >
                        <Download size={18} />
                        Dışa Aktar
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowGalleryAssigner(true)}>
                        <Image size={18} />
                        Toplu Resim
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={openColorEditor}
                    >
                        <Palette size={18} />
                        Renkler
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={handleSeed}
                        disabled={isSeeding}
                    >
                        {isSeeding ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
                        Test Verileri
                    </button>
                    <button className="btn btn-primary" onClick={handleAddProduct}>
                        <Plus size={18} />
                        Ürün Ekle
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Ad veya barkod ile ara..."
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                {viewMode === 'flat' && (
                    <select
                        value={selectedCategory}
                        onChange={e => { setSearchCategory(e.target.value); setCurrentPage(1); }}
                        className="filter-select"
                    >
                        <option value="all">Tüm Kategoriler</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{getCategoryName(cat.id)}</option>
                        ))}
                    </select>
                )}
                <button
                    className="btn btn-secondary"
                    onClick={() => {
                        setViewMode(viewMode === 'flat' ? 'category' : 'flat');
                        if (viewMode === 'flat') setSearchCategory('all');
                    }}
                    title={viewMode === 'flat' ? 'Kategori Görünümü' : 'Liste Görünümü'}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
                >
                    {viewMode === 'flat' ? <Layers size={18} /> : <List size={18} />}
                    {viewMode === 'flat' ? 'Kategori Görünümü' : 'Liste Görünümü'}
                </button>
                <span className="results-count">
                    {filteredProducts.length} ürün
                    {isSavingOrder && <Loader2 size={14} className="animate-spin" style={{ marginLeft: '8px' }} />}
                </span>
            </div>

            {/* Drag hint */}
            {isDragEnabled && (
                <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <GripVertical size={16} />
                    {viewMode === 'category'
                        ? 'Kategori başlıklarını veya ürünleri sürükleyip bırakarak sıralayın'
                        : 'Sıralamayı değiştirmek için satırları sürükleyip bırakın'
                    }
                </p>
            )}

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    marginBottom: '1rem',
                    background: 'rgba(52, 199, 89, 0.08)',
                    border: '1px solid rgba(52, 199, 89, 0.3)',
                    borderRadius: 'var(--radius-lg)',
                    flexWrap: 'wrap'
                }}>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                        {selectedIds.size} ürün seçildi
                    </span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', position: 'relative' }}>
                        {/* Category change */}
                        <div style={{ position: 'relative' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setBulkCategoryDropdown(!bulkCategoryDropdown)}
                                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                            >
                                <Layers size={15} />
                                Kategori Değiştir
                            </button>
                            {bulkCategoryDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    marginTop: '4px',
                                    background: 'var(--color-bg-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    zIndex: 100,
                                    minWidth: '180px',
                                    overflow: 'hidden'
                                }}>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                handleBulkCategoryChange(cat.id);
                                                setBulkCategoryDropdown(false);
                                            }}
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                padding: '8px 14px',
                                                border: 'none',
                                                background: 'none',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                borderBottom: '1px solid var(--color-border)'
                                            }}
                                            onMouseEnter={e => e.target.style.background = 'var(--color-bg-surface)'}
                                            onMouseLeave={e => e.target.style.background = 'none'}
                                        >
                                            {getCategoryName(cat.id)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Stock toggle */}
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleBulkStockToggle(true)}
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                            <ToggleRight size={15} />
                            Stokta
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleBulkStockToggle(false)}
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                            <ToggleLeft size={15} />
                            Tükendi
                        </button>
                        {/* Visibility toggle */}
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleBulkVisibilityToggle(true)}
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                            <EyeOff size={15} />
                            Gizle
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleBulkVisibilityToggle(false)}
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                            <Eye size={15} />
                            Göster
                        </button>
                        {/* Scale */}
                        <div style={{ position: 'relative' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowBulkScale(!showBulkScale)}
                                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                            >
                                <Image size={15} />
                                Ölçek Ayarı
                            </button>
                            {showBulkScale && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    marginTop: '4px',
                                    background: 'var(--color-bg-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    zIndex: 100,
                                    padding: '14px 16px',
                                    minWidth: '240px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                        <span style={{ fontWeight: '500' }}>Görsel Ölçek</span>
                                        <span style={{ fontWeight: '600' }}>%{bulkScaleValue}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="50"
                                        max="200"
                                        value={bulkScaleValue}
                                        onChange={e => setBulkScaleValue(parseInt(e.target.value))}
                                        style={{ width: '100%', cursor: 'pointer' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                                        <span>50%</span>
                                        <span>100%</span>
                                        <span>200%</span>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleBulkScaleApply}
                                        style={{ width: '100%', padding: '6px 12px', fontSize: '0.85rem' }}
                                    >
                                        Uygula
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* Optimize images */}
                        <button
                            className="btn btn-secondary"
                            onClick={handleOptimizeImages}
                            disabled={isOptimizing}
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                            {isOptimizing ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                            {isOptimizing ? 'Optimize Ediliyor...' : 'Optimize Et'}
                        </button>
                        {/* Bulk delete */}
                        <button
                            className="btn btn-secondary"
                            onClick={handleBulkDelete}
                            style={{ padding: '6px 12px', fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444' }}
                        >
                            <Trash2 size={15} />
                            Sil
                        </button>
                    </div>
                    <button
                        onClick={clearSelection}
                        style={{
                            marginLeft: 'auto',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-text-muted)',
                            padding: '4px'
                        }}
                        title="Seçimi Kaldır"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Products Table */}
            <div className="data-table card">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={toggleSelectAll}
                                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                />
                            </th>
                            {isDragEnabled && <th style={{ width: '40px' }}></th>}
                            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                Ürün<SortIcon column="name" />
                            </th>
                            <th onClick={() => handleSort('sku')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                Barkod<SortIcon column="sku" />
                            </th>
                            {viewMode === 'flat' && (
                                <th onClick={() => handleSort('category')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                    Kategori<SortIcon column="category" />
                                </th>
                            )}
                            <th>Boyutlar</th>
                            <th onClick={() => handleSort('weight')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                Ağırlık<SortIcon column="weight" />
                            </th>
                            <th>Renkler</th>
                            <th onClick={() => handleSort('imageSize')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                Görsel<SortIcon column="imageSize" />
                            </th>
                            <th onClick={() => handleSort('inStock')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                Durum<SortIcon column="inStock" />
                            </th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {viewMode === 'category' ? (
                            // Category grouped view
                            getCategoryGroups().map(group => {
                                const catLangKey = `name${language.charAt(0).toUpperCase() + language.slice(1)}`;
                                const catDisplayName = group.category[catLangKey] || group.category.name;
                                const colSpan = (isDragEnabled ? 10 : 9) + 1; // +1 for checkbox
                                return (
                                    <React.Fragment key={group.category.id}>
                                        <tr
                                            className={`category-header-row${dragOverCategory && dragOverCategory.id === group.category.id ? ' category-drag-over' : ''}`}
                                            draggable={isDragEnabled && group.category.id !== '_uncategorized'}
                                            onDragStart={(e) => handleCategoryDragStart(e, group.category)}
                                            onDragEnd={handleCategoryDragEnd}
                                            onDragOver={(e) => handleCategoryDragOver(e, group.category)}
                                            onDragLeave={handleCategoryDragLeave}
                                            onDrop={(e) => handleCategoryDrop(e, group.category)}
                                            style={{
                                                cursor: isDragEnabled && group.category.id !== '_uncategorized' ? 'grab' : 'default',
                                                borderLeft: dragOverCategory && dragOverCategory.id === group.category.id
                                                    ? '3px solid var(--color-primary)'
                                                    : '3px solid transparent'
                                            }}
                                        >
                                            <td colSpan={colSpan} style={{
                                                background: 'var(--color-bg-secondary)',
                                                padding: '10px 16px',
                                                fontWeight: '600',
                                                fontSize: '0.95rem',
                                                borderBottom: '2px solid var(--color-border)',
                                                userSelect: 'none'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {isDragEnabled && group.category.id !== '_uncategorized' && (
                                                        <GripVertical size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                                                    )}
                                                    {catDisplayName}
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        fontWeight: '500',
                                                        background: 'var(--color-primary)',
                                                        color: 'white',
                                                        padding: '2px 10px',
                                                        borderRadius: '12px',
                                                        display: 'inline-block'
                                                    }}>
                                                        {group.products.length}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        {group.products.map(product => (
                                            <tr
                                                key={product._id || product.id}
                                                draggable={isDragEnabled}
                                                onDragStart={(e) => handleDragStart(e, product)}
                                                onDragEnd={handleDragEnd}
                                                onDragOver={(e) => handleDragOver(e, product)}
                                                onDragLeave={handleDragLeave}
                                                onDrop={(e) => handleDrop(e, product)}
                                                style={{
                                                    cursor: isDragEnabled ? 'grab' : 'default',
                                                    transition: 'background-color 0.2s, border-color 0.2s',
                                                    borderLeft: dragOverItem && (dragOverItem._id || dragOverItem.id) === (product._id || product.id)
                                                        ? '3px solid var(--color-primary)'
                                                        : '3px solid transparent'
                                                }}
                                                className={`${dragOverItem && (dragOverItem._id || dragOverItem.id) === (product._id || product.id) ? 'drag-over' : ''} ${selectedIds.has(product._id || product.id) ? 'row-selected' : ''}`}
                                            >
                                                <td onClick={e => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(product._id || product.id)}
                                                        onChange={() => toggleSelectProduct(product._id || product.id)}
                                                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                    />
                                                </td>
                                                {isDragEnabled && (
                                                    <td style={{ color: 'var(--color-text-muted)', cursor: 'grab' }}>
                                                        <GripVertical size={16} />
                                                    </td>
                                                )}
                                                <td>
                                                    <div className="product-cell">
                                                        <img src={product.image} alt="" className="product-thumb" />
                                                        <span className="product-name">{getProductName(product)}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        className="sku-copy-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            copyToClipboard(product.sku || product._id || product.id, product._id || product.id);
                                                        }}
                                                        title="Tıkla ve kopyala"
                                                    >
                                                        <span className="sku-text">{product.sku}</span>
                                                        {copiedId === (product._id || product.id) ? (
                                                            <Check size={14} className="copy-icon copied" />
                                                        ) : (
                                                            <Copy size={14} className="copy-icon" />
                                                        )}
                                                    </button>
                                                </td>
                                                <td>{product.dimensions?.width}×{product.dimensions?.height}{product.dimensions?.depth ? `×${product.dimensions.depth}` : ''} cm</td>
                                                <td>{product.weight} kg</td>
                                                <td>
                                                    <div className="color-dots">
                                                        {product.colors?.slice(0, 4).map(colorId => {
                                                            const color = getColor(colorId);
                                                            return <span key={colorId} className="color-dot" style={{ backgroundColor: color?.hex }} />;
                                                        })}
                                                        {product.colors?.length > 4 && <span className="more">+{product.colors.length - 4}</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        fontFamily: 'monospace',
                                                        color: product.imageSize && product.imageSize > 1024 * 1024 ? '#ef4444' : 'var(--color-text-muted)'
                                                    }}>
                                                        {formatFileSize(product.imageSize)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${product.inStock ? 'in-stock' : 'out-stock'}`}>
                                                        {product.inStock ? 'Stokta' : 'Tükendi'}
                                                    </span>
                                                    {product.hiddenFromCatalog && (
                                                        <span className="status-badge" style={{ background: '#f59e0b', color: 'white', marginLeft: '4px' }}>
                                                            Gizli
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="action-btn"
                                                            title={product.hiddenFromCatalog ? 'Katalogda Göster' : 'Katalogdan Gizle'}
                                                            onClick={() => handleToggleVisibility(product)}
                                                            style={product.hiddenFromCatalog ? { color: '#f59e0b' } : {}}
                                                        >
                                                            {product.hiddenFromCatalog ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                        <button className="action-btn" title="Düzenle" onClick={() => handleEditProduct(product)}>
                                                            <Edit size={16} />
                                                        </button>
                                                        <button className="action-btn danger" title="Sil" onClick={() => handleDelete(product._id || product.id)}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            // Flat view (existing)
                            paginatedProducts.map(product => (
                                <tr
                                    key={product._id || product.id}
                                    draggable={isDragEnabled}
                                    onDragStart={(e) => handleDragStart(e, product)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => handleDragOver(e, product)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, product)}
                                    style={{
                                        cursor: isDragEnabled ? 'grab' : 'default',
                                        transition: 'background-color 0.2s, border-color 0.2s',
                                        borderLeft: dragOverItem && (dragOverItem._id || dragOverItem.id) === (product._id || product.id)
                                            ? '3px solid var(--color-primary)'
                                            : '3px solid transparent'
                                    }}
                                    className={`${dragOverItem && (dragOverItem._id || dragOverItem.id) === (product._id || product.id) ? 'drag-over' : ''} ${selectedIds.has(product._id || product.id) ? 'row-selected' : ''}`}
                                >
                                    <td onClick={e => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(product._id || product.id)}
                                            onChange={() => toggleSelectProduct(product._id || product.id)}
                                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                        />
                                    </td>
                                    {isDragEnabled && (
                                        <td style={{ color: 'var(--color-text-muted)', cursor: 'grab' }}>
                                            <GripVertical size={16} />
                                        </td>
                                    )}
                                    <td>
                                        <div className="product-cell">
                                            <img src={product.image} alt="" className="product-thumb" />
                                            <span className="product-name">{getProductName(product)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            className="sku-copy-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                copyToClipboard(product.sku || product._id || product.id, product._id || product.id);
                                            }}
                                            title="Tıkla ve kopyala"
                                        >
                                            <span className="sku-text">{product.sku}</span>
                                            {copiedId === (product._id || product.id) ? (
                                                <Check size={14} className="copy-icon copied" />
                                            ) : (
                                                <Copy size={14} className="copy-icon" />
                                            )}
                                        </button>
                                    </td>
                                    <td>
                                        {getCategoryName(product.category)}
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                                            {product.category}
                                        </div>
                                    </td>
                                    <td>{product.dimensions?.width}×{product.dimensions?.height}{product.dimensions?.depth ? `×${product.dimensions.depth}` : ''} cm</td>
                                    <td>{product.weight} kg</td>
                                    <td>
                                        <div className="color-dots">
                                            {product.colors?.slice(0, 4).map(colorId => {
                                                const color = getColor(colorId);
                                                return <span key={colorId} className="color-dot" style={{ backgroundColor: color?.hex }} />;
                                            })}
                                            {product.colors?.length > 4 && <span className="more">+{product.colors.length - 4}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            fontFamily: 'monospace',
                                            color: product.imageSize && product.imageSize > 1024 * 1024 ? '#ef4444' : 'var(--color-text-muted)'
                                        }}>
                                            {formatFileSize(product.imageSize)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${product.inStock ? 'in-stock' : 'out-stock'}`}>
                                            {product.inStock ? 'Stokta' : 'Tükendi'}
                                        </span>
                                        {product.hiddenFromCatalog && (
                                            <span className="status-badge" style={{ background: '#f59e0b', color: 'white', marginLeft: '4px' }}>
                                                Gizli
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn"
                                                title={product.hiddenFromCatalog ? 'Katalogda Göster' : 'Katalogdan Gizle'}
                                                onClick={() => handleToggleVisibility(product)}
                                                style={product.hiddenFromCatalog ? { color: '#f59e0b' } : {}}
                                            >
                                                {product.hiddenFromCatalog ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                            <button className="action-btn" title="Düzenle" onClick={() => handleEditProduct(product)}>
                                                <Edit size={16} />
                                            </button>
                                            <button className="action-btn danger" title="Sil" onClick={() => handleDelete(product._id || product.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {viewMode === 'flat' && filteredProducts.length > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderTop: '1px solid var(--color-border)',
                        fontSize: '0.875rem',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Sayfa başına:</span>
                            {[10, 20, 50].map(n => (
                                <button
                                    key={n}
                                    onClick={() => { setItemsPerPage(n); setCurrentPage(1); }}
                                    style={{
                                        padding: '4px 10px',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-sm)',
                                        background: itemsPerPage === n ? 'var(--color-primary)' : 'var(--color-bg-card)',
                                        color: itemsPerPage === n ? 'white' : 'inherit',
                                        cursor: 'pointer',
                                        fontWeight: itemsPerPage === n ? '600' : '400',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                onClick={() => { setItemsPerPage(0); setCurrentPage(1); }}
                                style={{
                                    padding: '4px 10px',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-sm)',
                                    background: itemsPerPage === 0 ? 'var(--color-primary)' : 'var(--color-bg-card)',
                                    color: itemsPerPage === 0 ? 'white' : 'inherit',
                                    cursor: 'pointer',
                                    fontWeight: itemsPerPage === 0 ? '600' : '400',
                                    fontSize: '0.8rem'
                                }}
                            >
                                Tümü
                            </button>
                        </div>

                        <div style={{ color: 'var(--color-text-muted)' }}>
                            {itemsPerPage === 0
                                ? `${filteredProducts.length} ürün`
                                : `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredProducts.length)} / ${filteredProducts.length} ürün`
                            }
                        </div>

                        {itemsPerPage > 0 && totalPages > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '4px 8px',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-sm)',
                                        background: 'var(--color-bg-card)',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        opacity: currentPage === 1 ? 0.5 : 1,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                        if (totalPages <= 7) return true;
                                        if (page === 1 || page === totalPages) return true;
                                        if (Math.abs(page - currentPage) <= 1) return true;
                                        return false;
                                    })
                                    .reduce((acc, page, idx, arr) => {
                                        if (idx > 0 && page - arr[idx - 1] > 1) {
                                            acc.push('...' + page);
                                        }
                                        acc.push(page);
                                        return acc;
                                    }, [])
                                    .map(page => (
                                        typeof page === 'string' ? (
                                            <span key={page} style={{ padding: '4px 6px', color: 'var(--color-text-muted)' }}>...</span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                style={{
                                                    padding: '4px 10px',
                                                    border: '1px solid var(--color-border)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    background: page === currentPage ? 'var(--color-primary)' : 'var(--color-bg-card)',
                                                    color: page === currentPage ? 'white' : 'inherit',
                                                    cursor: 'pointer',
                                                    fontWeight: page === currentPage ? '600' : '400',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                {page}
                                            </button>
                                        )
                                    ))
                                }
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '4px 8px',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-sm)',
                                        background: 'var(--color-bg-card)',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        opacity: currentPage === totalPages ? 0.5 : 1,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Product Edit Modal */}
            <ProductEditModal
                product={editingProduct}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProduct}
            />

            {/* Export Modal */}
            {showExportModal && (
                <div className="modal-overlay" onClick={closeExportModal}>
                    <div className="export-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeExportModal}>
                            <X size={20} />
                        </button>

                        <div className="export-modal-content">
                            {!isExporting && !exportComplete ? (
                                // Export Options
                                <>
                                    <div className="export-icon">
                                        <FileText size={48} />
                                    </div>
                                    <h2>Katalog Dışa Aktar</h2>
                                    <p className="export-subtitle">
                                        {filteredProducts.filter(p => !p.hiddenFromCatalog).length} ürün PDF olarak indirilecek (gizli ürünler hariç)
                                    </p>

                                    <div className="export-info">
                                        <div className="info-item">
                                            <span className="info-label">Format</span>
                                            <span className="info-value">PDF Katalog</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">İçerik</span>
                                            <span className="info-value">Görsel, Bilgi, Renkler</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Kağıt</span>
                                            <span className="info-value">A4 Dikey</span>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary export-btn"
                                        onClick={handleExportPdf}
                                    >
                                        <Download size={20} />
                                        PDF İndir
                                    </button>
                                </>
                            ) : isExporting && !exportComplete ? (
                                // Progress State
                                <>
                                    <div className="export-progress-ring">
                                        <svg viewBox="0 0 100 100">
                                            <circle className="progress-bg" cx="50" cy="50" r="45" />
                                            <circle
                                                className="progress-fill"
                                                cx="50" cy="50" r="45"
                                                style={{
                                                    strokeDasharray: `${2 * Math.PI * 45}`,
                                                    strokeDashoffset: `${2 * Math.PI * 45 * (1 - exportProgress / 100)}`
                                                }}
                                            />
                                        </svg>
                                        <span className="progress-text">{Math.round(exportProgress)}%</span>
                                    </div>
                                    <h2>PDF Oluşturuluyor</h2>
                                    <p className="export-subtitle">Lütfen bekleyin...</p>
                                </>
                            ) : (
                                // Complete State
                                <>
                                    <div className="export-success-icon">
                                        <CheckCircle size={64} />
                                    </div>
                                    <h2>İndirme Tamamlandı!</h2>
                                    <p className="export-subtitle">
                                        PDF dosyanız indirildi
                                    </p>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={closeExportModal}
                                    >
                                        Kapat
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Image Gallery Assigner Modal */}
            {showGalleryAssigner && (
                <ImageGalleryAssigner
                    products={products}
                    onClose={() => setShowGalleryAssigner(false)}
                    onUpdate={loadProducts}
                />
            )}

            {/* Color Editor Modal */}
            {showColorEditor && (
                <div className="modal-overlay" onClick={() => setShowColorEditor(false)}>
                    <div className="export-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '85vh' }}>
                        <button className="modal-close-btn" onClick={() => setShowColorEditor(false)}>
                            <X size={20} />
                        </button>
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Renk Adlarını Düzenle</h2>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={resetColors}
                                        disabled={savingColors}
                                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                    >
                                        <RotateCcw size={14} />
                                        Sıfırla
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={saveColorChanges}
                                        disabled={savingColors || Object.keys(editingColors).length === 0}
                                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                    >
                                        {savingColors ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        Kaydet {Object.keys(editingColors).length > 0 && `(${Object.keys(editingColors).length})`}
                                    </button>
                                </div>
                            </div>
                            <div style={{ overflowY: 'auto', maxHeight: 'calc(85vh - 120px)' }}>
                                <table className="products-table" style={{ fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40px' }}>Renk</th>
                                            <th>ID</th>
                                            <th>İngilizce Ad</th>
                                            <th>Türkçe Ad</th>
                                            <th>HEX</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dbColors.map(color => (
                                            <tr key={color.id}>
                                                <td>
                                                    <div style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        backgroundColor: color.hex,
                                                        border: '2px solid rgba(0,0,0,0.1)',
                                                        margin: '0 auto'
                                                    }} />
                                                </td>
                                                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#86868b' }}>
                                                    {color.id}
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        defaultValue={color.name}
                                                        onChange={e => handleColorNameChange(color.id, 'name', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '4px 8px',
                                                            border: '1px solid var(--color-border)',
                                                            borderRadius: '4px',
                                                            fontSize: '0.85rem',
                                                            background: editingColors[color.id]?.name !== undefined ? '#fffde7' : 'transparent'
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        defaultValue={color.nameTr || ''}
                                                        onChange={e => handleColorNameChange(color.id, 'nameTr', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '4px 8px',
                                                            border: '1px solid var(--color-border)',
                                                            borderRadius: '4px',
                                                            fontSize: '0.85rem',
                                                            background: editingColors[color.id]?.nameTr !== undefined ? '#fffde7' : 'transparent'
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        defaultValue={color.hex}
                                                        onChange={e => handleColorNameChange(color.id, 'hex', e.target.value)}
                                                        style={{
                                                            width: '80px',
                                                            padding: '4px 8px',
                                                            border: '1px solid var(--color-border)',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            fontFamily: 'monospace',
                                                            background: editingColors[color.id]?.hex !== undefined ? '#fffde7' : 'transparent'
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
