import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Palette, Maximize2, Settings, Upload, Loader2, Star } from 'lucide-react';
import { productsApi, categoriesApi } from '../utils/api';
import { colors, materials } from '../data/products';
import { useLanguage } from '../context/LanguageContext';
import './ProductEditModal.css';

// Basic colors as metadata
import { fabricaColors as presetFabricaColors } from '../data/products';

// If loaded from API later, we can dynamic them. For now use mock.
const fabricaColors = presetFabricaColors;

const defaultSizeVariants = [
    { id: 'S', label: 'Small', labelTr: 'Küçük', dimensions: { width: 100, height: 80 } },
    { id: 'M', label: 'Medium', labelTr: 'Orta', dimensions: { width: 150, height: 120 } },
    { id: 'L', label: 'Large', labelTr: 'Büyük', dimensions: { width: 200, height: 160 } },
];

const ProductEditModal = ({ product, isOpen, onClose, onSave }) => {
    const { t, language } = useLanguage();
    const isEditing = !!product;

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        nameTr: '',
        sku: '',
        category: 'furniture',
        description: '',
        descriptionTr: '',
        material: 'pp',
        image: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=600',
        inStock: true,
        featured: false,
        weight: 1.0,
        // New fields
        productCode: '',
        barcode: '',
        piecesInPackage: '',
        packageType: 'BOX',
        volume: '',
        packageDimensions: { width: 0, height: 0, depth: 0 },
        dimensions: { width: 0, height: 0, depth: 0 },
    });

    // Color states
    const [colorVariants, setColorVariants] = useState([]);
    const [selectedColorVariant, setSelectedColorVariant] = useState(null);
    const [currentHue, setCurrentHue] = useState(0);
    const [currentSaturation, setCurrentSaturation] = useState(100);
    const [currentBrightness, setCurrentBrightness] = useState(100);
    const [isEditingExistingVariant, setIsEditingExistingVariant] = useState(false);
    const [defaultColorId, setDefaultColorId] = useState(null);

    // Size states
    const [sizeVariants, setSizeVariants] = useState(defaultSizeVariants);
    const [selectedSize, setSelectedSize] = useState('M');
    const [imageScale, setImageScale] = useState(product?.imageScale || 100); // 50-200%
    const [baseDimensions, setBaseDimensions] = useState(product?.dimensions || { width: 150, height: 120 });


    // Active tab
    const [activeTab, setActiveTab] = useState('color');

    // Creating this state at the top level to avoid Hook Rule violation
    const [uploading, setUploading] = useState(false);

    // Option to create separate products for each color variant
    const [createSeparateVariants, setCreateSeparateVariants] = useState(true);

    // Categories from API
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // Fetch categories from API
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setCategoriesLoading(true);
                const data = await categoriesApi.getAll();
                setCategories(data);
            } catch (err) {
                console.error('Kategoriler yüklenemedi:', err);
                setCategories([]);
            } finally {
                setCategoriesLoading(false);
            }
        };
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen]);

    // Initialize form with product data if editing
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                nameTr: product.nameTr || '',
                sku: product.sku || '',
                category: product.category || 'furniture',
                description: product.description || '',
                descriptionTr: product.descriptionTr || '',
                material: product.material || 'pp',
                image: product.image || '',
                inStock: product.inStock ?? true,
                featured: product.featured ?? false,
                featured: product.featured ?? false,
                weight: product.weight || 1.0,
                // New fields mapping
                productCode: product.productCode || '',
                barcode: product.barcode || '',
                piecesInPackage: product.piecesInPackage || '',
                packageType: product.packageType || 'BOX',
                volume: product.volume || '',
                packageDimensions: product.packageDimensions || { width: 0, height: 0, depth: 0 },
                dimensions: product.dimensions || { width: 0, height: 0, depth: 0 },
            });
            if (product.sizeVariants) {
                setSizeVariants(product.sizeVariants);
            }
            if (product.colorVariants) {
                setColorVariants(product.colorVariants);
            }
            if (product.defaultColor) {
                setDefaultColorId(product.defaultColor);
            } else if (product.colors && product.colors.length > 0) {
                setDefaultColorId(product.colors[0]);
            }
            if (product.imageScale) {
                setImageScale(product.imageScale);
            }
            if (product.dimensions) {
                setBaseDimensions(product.dimensions);
            }
        }
    }, [product]);

    if (!isOpen) return null;

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle file upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const res = await productsApi.uploadImage(file);
            setFormData(prev => ({ ...prev, image: res.url }));
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Resim yüklenemedi: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    // Select a base color from the palette
    const handleBaseColorSelect = (colorId) => {
        // If clicking the same color that's already selected, deselect it
        if (selectedColorVariant?.colorId === colorId) {
            setSelectedColorVariant(null);
            setCurrentHue(0);
            setCurrentSaturation(100);
            setCurrentBrightness(100);
            setIsEditingExistingVariant(false);
            return;
        }

        // Check if this color already has a variant
        const existingVariant = colorVariants.find(v => v.colorId === colorId);
        if (existingVariant) {
            // Editing existing variant
            setSelectedColorVariant(existingVariant);
            setCurrentHue(existingVariant.hue);
            setCurrentSaturation(existingVariant.saturation);
            setCurrentBrightness(existingVariant.brightness || 100);
            setIsEditingExistingVariant(true);
        } else {
            // Create a new variant with default values
            const colorInfo = colors.find(c => c.id === colorId);
            // Try to find matching factory preset to initialize Hue
            const fabricaPreset = fabricaColors.find(f =>
                f.hex.toLowerCase() === colorInfo.hex.toLowerCase()
            );

            const newVariant = {
                id: `color-${Date.now()}`,
                colorId,
                colorName: colorInfo?.name || colorId,
                hue: fabricaPreset?.hue || 0,
                saturation: fabricaPreset?.saturation !== undefined ? fabricaPreset.saturation : 100,
                brightness: fabricaPreset?.brightness !== undefined ? fabricaPreset.brightness : 100,
            };
            setSelectedColorVariant(newVariant);
            setCurrentHue(newVariant.hue);
            setCurrentSaturation(newVariant.saturation);
            setCurrentBrightness(newVariant.brightness);
            setIsEditingExistingVariant(false);
        }
    };

    // Real-time Slider Updates (only updates local state, applied on Add/Update)
    const handleHueChange = (val) => {
        setCurrentHue(parseInt(val));
    };

    const handleSaturationChange = (val) => {
        setCurrentSaturation(parseInt(val));
    };

    // Apply fabrica preset to current selection
    const handleFabricaColorSelect = (fabricaColor) => {
        setCurrentHue(fabricaColor.hue);
        if (fabricaColor.saturation !== undefined) setCurrentSaturation(fabricaColor.saturation);
        if (fabricaColor.brightness !== undefined) setCurrentBrightness(fabricaColor.brightness);
    };

    // Add current color variant to the list
    const handleAddColorVariant = () => {
        if (!selectedColorVariant) return;

        const updatedVariant = {
            ...selectedColorVariant,
            hue: currentHue,
            saturation: currentSaturation,
            brightness: currentBrightness,
        };

        // Check if variant already exists, update it
        const existingIndex = colorVariants.findIndex(v => v.colorId === selectedColorVariant.colorId);
        if (existingIndex >= 0) {
            setColorVariants(prev => prev.map((v, i) => i === existingIndex ? updatedVariant : v));
        } else {
            setColorVariants(prev => [...prev, updatedVariant]);
        }

        // Reset selection
        setSelectedColorVariant(null);
        setCurrentHue(0);
        setCurrentSaturation(100);
        setIsEditingExistingVariant(false);
    };

    // Remove a color variant
    const handleRemoveColorVariant = (variantId) => {
        const variant = colorVariants.find(v => v.id === variantId);
        setColorVariants(prev => prev.filter(v => v.id !== variantId));
        // If we're removing the currently selected variant, reset selection
        if (selectedColorVariant?.id === variantId) {
            setSelectedColorVariant(null);
            setCurrentHue(0);
            setCurrentSaturation(100);
            setCurrentBrightness(100);
            setIsEditingExistingVariant(false);
        }
    };

    // Preview a saved color variant
    const handlePreviewColorVariant = (variant) => {
        setCurrentHue(variant.hue);
        setCurrentSaturation(variant.saturation);
        setCurrentBrightness(variant.brightness || 100);
    };

    const handleAddSizeVariant = () => {
        const newId = `SIZE-${Date.now()}`;
        setSizeVariants(prev => [...prev, {
            id: newId,
            label: 'New Size',
            labelTr: 'Yeni Boyut',
            dimensions: { width: 100, height: 100 }
        }]);
    };

    const handleRemoveSizeVariant = (id) => {
        setSizeVariants(prev => prev.filter(v => v.id !== id));
    };

    const handleSizeVariantChange = (id, field, value) => {
        setSizeVariants(prev => prev.map(v =>
            v.id === id ? { ...v, [field]: value } : v
        ));
    };

    const handleDimensionChange = (id, dimension, value) => {
        setSizeVariants(prev => prev.map(v =>
            v.id === id ? {
                ...v,
                dimensions: { ...v.dimensions, [dimension]: parseInt(value) || 0 }
            } : v
        ));
    };

    // Handle visual scale change - updates selected variant dimensions
    // Handle visual scale change - updates ONLY visual scale, not dimensions
    const handleScaleChange = (newScale) => {
        setImageScale(newScale);
        // User requested that this scale customization does NOT affect the actual product content/dimensions.
        // It's purely for visual scaling in the preview.
    };

    // When selecting a size variant, update base dimensions and scale
    const handleSizeSelect = (variantId) => {
        setSelectedSize(variantId);
        const variant = sizeVariants.find(v => v.id === variantId);
        if (variant) {
            setBaseDimensions(variant.dimensions);
            setImageScale(100); // Reset scale to 100% when switching variants
        }
    };

    const handleSave = () => {
        const selectedVariant = sizeVariants.find(v => v.id === selectedSize) || sizeVariants[0];

        // Add hex color to each variant for catalog display
        const enrichedColorVariants = colorVariants.map(v => ({
            ...v,
            hex: colors.find(c => c.id === v.colorId)?.hex || '#808080'
        }));

        const productData = {
            ...formData,
            id: product?.id || Date.now(),
            dimensions: formData.dimensions || { width: 100, height: 100, depth: 0 },
            packageDimensions: formData.packageDimensions || { width: 0, height: 0, depth: 0 },
            sizeVariants,
            defaultSize: selectedSize,
            imageScale: imageScale,
            colorVariants: enrichedColorVariants,
            colors: enrichedColorVariants.length > 0 ? enrichedColorVariants.map(v => v.colorId) : ['white'],
            defaultColor: defaultColorId || (enrichedColorVariants.length > 0 ? enrichedColorVariants[0].colorId : 'white'),
            createSeparateVariants, // Flag to indicate if variants should be created as separate products
        };
        onSave(productData);
        onClose();
    };

    const getCategoryName = (catId) => {
        const cat = categories.find(c => c.id === catId);
        return language === 'tr' ? cat?.nameTr : cat?.name;
    };

    const imageStyle = {
        filter: `hue-rotate(${currentHue}deg) saturate(${currentSaturation / 100}) brightness(${currentBrightness / 100})`,
        transform: activeTab === 'size' ? `scale(${imageScale / 100})` : 'scale(1)',
        transition: 'transform 0.2s ease',
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="product-edit-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="modal-layout">
                    {/* Left: Image Preview */}
                    <div className="preview-section">
                        <div className="image-preview">
                            <img
                                src={formData.image}
                                alt="Product preview"
                                style={imageStyle}
                            />
                            <button className="reset-btn" onClick={() => { setCurrentHue(0); setCurrentSaturation(100); setCurrentBrightness(100); }}>
                                ↺
                            </button>
                        </div>
                        <div className="preview-info">
                            <h4>{formData.nameTr || formData.name || 'Ürün Adı'}</h4>
                            <p className="sku">{formData.sku || 'Barkod'}</p>

                        </div>
                    </div>

                    {/* Right: Editor Tabs */}
                    <div className="editor-section">
                        {/* Tab Navigation */}
                        <div className="tab-nav">
                            <button
                                className={`tab-btn ${activeTab === 'color' ? 'active' : ''}`}
                                onClick={() => setActiveTab('color')}
                            >
                                <Palette size={16} />
                                Renk
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'size' ? 'active' : ''}`}
                                onClick={() => setActiveTab('size')}
                            >
                                <Maximize2 size={16} />
                                Boyut
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                                onClick={() => setActiveTab('general')}
                            >
                                <Settings size={16} />
                                Genel
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {/* Color Tab */}
                            {activeTab === 'color' && (
                                <div className="color-tab">
                                    <div className="section">
                                        <h5>
                                            <span className="section-indicator"></span>
                                            FABRİKA RENKLERİ
                                        </h5>
                                        <div className="fabrica-colors">
                                            {fabricaColors.map(color => (
                                                <button
                                                    key={color.name}
                                                    className={`color-preset ${Math.abs(currentHue - color.hue) < 10 ? 'active' : ''}`}
                                                    style={{ backgroundColor: color.hex }}
                                                    onClick={() => handleFabricaColorSelect(color)}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="section">
                                        <h5>
                                            <span className="section-indicator"></span>
                                            ÖZEL TONLAMA
                                        </h5>
                                        <div className="slider-group">
                                            <div className="slider-row">
                                                <label>Renk Tonu (Hue)</label>
                                                <span className="slider-value">{currentHue}°</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="360"
                                                value={currentHue}
                                                onChange={e => handleHueChange(e.target.value)}
                                                className="hue-slider"
                                                style={{
                                                    background: `linear-gradient(to right, 
                                                        hsl(0, 100%, 50%), 
                                                        hsl(60, 100%, 50%), 
                                                        hsl(120, 100%, 50%), 
                                                        hsl(180, 100%, 50%), 
                                                        hsl(240, 100%, 50%), 
                                                        hsl(300, 100%, 50%), 
                                                        hsl(360, 100%, 50%))`
                                                }}
                                            />
                                        </div>

                                        <div className="slider-group">
                                            <div className="slider-row">
                                                <label>Doygunluk (Saturation)</label>
                                                <span className="slider-value">{currentSaturation}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="200"
                                                value={currentSaturation}
                                                onChange={e => handleSaturationChange(e.target.value)}
                                                className="saturation-slider"
                                            />
                                        </div>
                                    </div>

                                    <div className="section">
                                        <h5>
                                            <span className="section-indicator"></span>
                                            RENK SEÇ VE EKLE
                                        </h5>
                                        <p className="section-hint">Bir renk seç, ayarla ve "Ekle" butonuna tıkla</p>
                                        <div className="color-options">
                                            {colors.map(color => (
                                                <button
                                                    key={color.id}
                                                    className={`color-option ${selectedColorVariant?.colorId === color.id ? 'selected' : ''} ${colorVariants.some(v => v.colorId === color.id) ? 'has-variant' : ''}`}
                                                    style={{ backgroundColor: color.hex }}
                                                    onClick={() => handleBaseColorSelect(color.id)}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>

                                        {selectedColorVariant && (
                                            <div className="variant-actions">
                                                <button className="add-color-btn" onClick={handleAddColorVariant}>
                                                    <Plus size={16} />
                                                    {isEditingExistingVariant
                                                        ? `"${selectedColorVariant.colorName}" Rengini Güncelle`
                                                        : `"${selectedColorVariant.colorName}" Rengini Ekle`
                                                    }
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {colorVariants.length > 0 && (
                                        <div className="section">
                                            <h5>
                                                <span className="section-indicator"></span>
                                                EKLENMİŞ RENK VARYANTLARI ({colorVariants.length})
                                            </h5>
                                            <div className="saved-variants">
                                                {colorVariants.map(variant => (
                                                    <div key={variant.id} className={`saved-variant-item ${defaultColorId === variant.colorId ? 'is-default' : ''}`}>
                                                        <span
                                                            className="variant-color"
                                                            style={{
                                                                backgroundColor: colors.find(c => c.id === variant.colorId)?.hex,
                                                                filter: `hue-rotate(${variant.hue}deg) saturate(${variant.saturation / 100})`
                                                            }}
                                                        />
                                                        <div className="variant-details">
                                                            <span className="variant-name">{variant.colorName}</span>
                                                            <span className="variant-info">Hue: {variant.hue}°</span>
                                                            {defaultColorId === variant.colorId && <span className="default-badge">Varsayılan</span>}
                                                        </div>
                                                        <div className="variant-buttons">
                                                            <button
                                                                className="preview-btn"
                                                                onClick={() => handlePreviewColorVariant(variant)}
                                                                title="Önizle"
                                                            >
                                                                👁
                                                            </button>
                                                            <button
                                                                className={`default-color-btn ${defaultColorId === variant.colorId ? 'active' : ''}`}
                                                                onClick={() => setDefaultColorId(variant.colorId)}
                                                                title={defaultColorId === variant.colorId ? "Varsayılan Renk" : "Varsayılan Yap"}
                                                            >
                                                                <Star size={16} fill={defaultColorId === variant.colorId ? "#FFD700" : "none"} color={defaultColorId === variant.colorId ? "#FFD700" : "currentColor"} />
                                                            </button>
                                                            <button
                                                                className="remove-btn"
                                                                onClick={() => handleRemoveColorVariant(variant.id)}
                                                                title="Sil"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Size Tab */}
                            {activeTab === 'size' && (
                                <div className="size-tab">
                                    {/* Visual Scale Section */}
                                    <div className="section">
                                        <h5>
                                            <span className="section-indicator"></span>
                                            GÖRSEL ÖLÇEKLEME
                                        </h5>
                                        <p className="section-hint">Slider'ı hareket ettirerek ürün boyutunu ayarlayın</p>

                                        <div className="slider-group">
                                            <div className="slider-row">
                                                <label>Ölçek / Scale</label>
                                                <span className="slider-value">{imageScale}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="50"
                                                max="200"
                                                value={imageScale}
                                                onChange={e => handleScaleChange(parseInt(e.target.value))}
                                                className="scale-slider"
                                            />
                                            <div className="scale-labels">
                                                <span>50%</span>
                                                <span>100%</span>
                                                <span>200%</span>
                                            </div>
                                        </div>


                                    </div>

                                    {/* Preset Sizes Section */}


                                    {/* Custom Size Section */}

                                </div>
                            )}

                            {/* General Tab */}
                            {activeTab === 'general' && (
                                <div className="general-tab">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Ürün Adı (TR)</label>
                                            <input
                                                type="text"
                                                value={formData.nameTr}
                                                onChange={e => handleInputChange('nameTr', e.target.value)}
                                                placeholder="Ürün adı..."
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Product Name (EN)</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={e => handleInputChange('name', e.target.value)}
                                                placeholder="Product name..."
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Barkod</label>
                                            <input
                                                type="text"
                                                value={formData.sku}
                                                onChange={e => handleInputChange('sku', e.target.value)}
                                                placeholder="Ürün barkodu..."
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Kategori</label>
                                            <select
                                                value={formData.category}
                                                onChange={e => handleInputChange('category', e.target.value)}
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {getCategoryName(cat.id)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Malzeme</label>
                                            <select
                                                value={formData.material}
                                                onChange={e => handleInputChange('material', e.target.value)}
                                            >
                                                {materials.map(mat => (
                                                    <option key={mat.id} value={mat.id}>{mat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Ağırlık (kg)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={formData.weight}
                                                onChange={e => handleInputChange('weight', parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Hacim (LT)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.volume}
                                                onChange={e => handleInputChange('volume', parseFloat(e.target.value))}
                                                placeholder="0.60"
                                            />
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Ürün Boyutları (mm) - Genişlik x Yükseklik x Derinlik</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input
                                                    type="number"
                                                    placeholder="Genişlik"
                                                    value={formData.dimensions?.width || ''}
                                                    onChange={e => setFormData(prev => ({
                                                        ...prev,
                                                        dimensions: { ...prev.dimensions, width: parseFloat(e.target.value) }
                                                    }))}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Yükseklik"
                                                    value={formData.dimensions?.height || ''}
                                                    onChange={e => setFormData(prev => ({
                                                        ...prev,
                                                        dimensions: { ...prev.dimensions, height: parseFloat(e.target.value) }
                                                    }))}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Derinlik"
                                                    value={formData.dimensions?.depth || ''}
                                                    onChange={e => setFormData(prev => ({
                                                        ...prev,
                                                        dimensions: { ...prev.dimensions, depth: parseFloat(e.target.value) }
                                                    }))}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Ürün Kodu (Seçenek)</label>
                                            <input
                                                type="text"
                                                value={formData.productCode}
                                                onChange={e => handleInputChange('productCode', e.target.value)}
                                                placeholder="Örn: EXTRA-123"
                                            />
                                        </div>


                                        {/* Packaging Information Group */}
                                        <div className="form-group full-width" style={{ marginTop: '10px', marginBottom: '5px' }}>
                                            <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#444', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                                Paketleme Bilgileri
                                            </h5>
                                        </div>

                                        <div className="form-group">
                                            <label>Paket İçi Adet (PCS)</label>
                                            <input
                                                type="number"
                                                value={formData.piecesInPackage}
                                                onChange={e => handleInputChange('piecesInPackage', parseInt(e.target.value))}
                                                placeholder="240"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Paket Tipi</label>
                                            <select
                                                value={formData.packageType}
                                                onChange={e => handleInputChange('packageType', e.target.value)}
                                            >
                                                <option value="BOX">Koli (BOX)</option>
                                                <option value="PP_BAG">Poşet (PP BAG)</option>
                                                <option value="PALLET">Palet</option>
                                            </select>
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Paket Boyutları (cm) - Genişlik x Yükseklik x Derinlik</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input
                                                    type="number"
                                                    placeholder="Genişlik"
                                                    value={formData.packageDimensions?.width || ''}
                                                    onChange={e => setFormData(prev => ({
                                                        ...prev,
                                                        packageDimensions: { ...prev.packageDimensions, width: parseFloat(e.target.value) }
                                                    }))}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Yükseklik"
                                                    value={formData.packageDimensions?.height || ''}
                                                    onChange={e => setFormData(prev => ({
                                                        ...prev,
                                                        packageDimensions: { ...prev.packageDimensions, height: parseFloat(e.target.value) }
                                                    }))}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Derinlik"
                                                    value={formData.packageDimensions?.depth || ''}
                                                    onChange={e => setFormData(prev => ({
                                                        ...prev,
                                                        packageDimensions: { ...prev.packageDimensions, depth: parseFloat(e.target.value) }
                                                    }))}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Görsel URL veya Yükle</label>
                                            <div className="image-input-group">
                                                <input
                                                    type="text"
                                                    value={formData.image}
                                                    onChange={e => handleInputChange('image', e.target.value)}
                                                    placeholder="https://... veya resim yükleyin"
                                                />
                                                <label className="upload-btn">
                                                    <input
                                                        type="file"
                                                        hidden
                                                        accept="image/*"
                                                        onChange={handleFileUpload}
                                                    />
                                                    {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                                                    <span>Yükle</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Görseldeki Ürün Rengi (Otomatik Varyant Ekler)</label>
                                            <div className="color-options small-gap">
                                                {colors.map(color => (
                                                    <button
                                                        key={color.id}
                                                        className={`color-option ${defaultColorId === color.id ? 'selected' : ''}`}
                                                        style={{ backgroundColor: color.hex, width: '24px', height: '24px' }}
                                                        onClick={() => {
                                                            // Set as default color
                                                            setDefaultColorId(color.id);

                                                            // Auto-add or update variant to be "Original" (No filter)
                                                            const existingIndex = colorVariants.findIndex(v => v.colorId === color.id);
                                                            const originalVariant = {
                                                                id: `color-${Date.now()}`,
                                                                colorId: color.id,
                                                                colorName: color.name,
                                                                hue: 0,
                                                                saturation: 100, // No filter effect
                                                            };

                                                            if (existingIndex >= 0) {
                                                                // Update existing to be original (no filter)
                                                                setColorVariants(prev => prev.map((v, i) => i === existingIndex ? { ...v, hue: 0, saturation: 100 } : v));
                                                            } else {
                                                                // Add new
                                                                setColorVariants(prev => [...prev, originalVariant]);
                                                            }
                                                        }}
                                                        title={`${color.name} (Görsel Rengi)`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="field-hint">Yüklediğiniz fotoğrafın rengini seçin. Bu renk otomatik olarak varyantlara eklenecektir.</p>
                                        </div>
                                        <div className="form-group checkbox-group">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.inStock}
                                                    onChange={e => handleInputChange('inStock', e.target.checked)}
                                                />
                                                Stokta
                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.featured}
                                                    onChange={e => handleInputChange('featured', e.target.checked)}
                                                />
                                                Öne Çıkan
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            {/* Variant Toggle - Only show when adding new product with color variants */}
                            {!isEditing && colorVariants.length > 0 && (
                                <label className="variant-toggle">
                                    <input
                                        type="checkbox"
                                        checked={createSeparateVariants}
                                        onChange={e => setCreateSeparateVariants(e.target.checked)}
                                    />
                                    <span>Her renk için ayrı ürün oluştur ({colorVariants.length} ürün)</span>
                                </label>
                            )}
                            <div className="footer-buttons">
                                <button className="btn btn-secondary" onClick={onClose}>
                                    İptal
                                </button>
                                <button className="btn btn-primary" onClick={handleSave}>
                                    {isEditing ? 'Güncelle' : (createSeparateVariants && colorVariants.length > 0 ? `${colorVariants.length} Ürün Kaydet` : 'Kaydet')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductEditModal;
