import React, { useState, useRef, useEffect } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';
import { X, Ruler, Weight, FileText, Eye, MapPin, Navigation, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { extendedProducts, colors } from '../data/extendedProducts';
import './Showroom.css';

// Virtual Tour Nodes - birbirine bağlı panorama noktaları
const tourNodes = [
    {
        id: 'entrance',
        name: 'Giriş',
        panorama: 'https://pannellum.org/images/cerro-toco-0.jpg',
        caption: 'Showroom Girişi',
        products: [1, 2, 3],
        links: ['hall-left', 'hall-right']
    },
    {
        id: 'hall-left',
        name: 'Sol Koridor - Mobilya',
        panorama: 'https://pannellum.org/images/bma-1.jpg',
        caption: 'Mobilya Bölümü',
        products: [4, 5, 6, 7, 8],
        links: ['entrance', 'furniture-area', 'hall-center']
    },
    {
        id: 'hall-right',
        name: 'Sağ Koridor - Bahçe',
        panorama: 'https://pannellum.org/images/alma.jpg',
        caption: 'Bahçe Ürünleri',
        products: [9, 10, 11, 12, 13],
        links: ['entrance', 'garden-area', 'hall-center']
    },
    {
        id: 'hall-center',
        name: 'Merkez Alan',
        panorama: 'https://pannellum.org/images/jfk.jpg',
        caption: 'Ana Sergi Alanı',
        products: [14, 15, 16, 17, 18, 19, 20],
        links: ['hall-left', 'hall-right', 'storage-area']
    },
    {
        id: 'furniture-area',
        name: 'Mobilya Alanı',
        panorama: 'https://pannellum.org/images/cerro-toco-0.jpg',
        caption: 'Mobilya Sergi Alanı',
        products: [21, 22, 23, 24, 25, 26, 27, 28],
        links: ['hall-left', 'kids-area']
    },
    {
        id: 'garden-area',
        name: 'Bahçe Alanı',
        panorama: 'https://pannellum.org/images/bma-1.jpg',
        caption: 'Bahçe Ürünleri Sergi Alanı',
        products: [29, 30, 31, 32, 33, 34, 35],
        links: ['hall-right', 'storage-area']
    },
    {
        id: 'storage-area',
        name: 'Depolama Alanı',
        panorama: 'https://pannellum.org/images/alma.jpg',
        caption: 'Depolama Çözümleri',
        products: [36, 37, 38, 39, 40, 41, 42],
        links: ['hall-center', 'garden-area']
    },
    {
        id: 'kids-area',
        name: 'Çocuk Bölümü',
        panorama: 'https://pannellum.org/images/jfk.jpg',
        caption: 'Çocuk Ürünleri',
        products: [43, 44, 45, 46, 47, 48, 49, 50],
        links: ['furniture-area']
    }
];

// Generate product markers for a node
const generateProductMarkers = (productIds, language) => {
    const markers = [];
    const count = productIds.length;

    productIds.forEach((productId, index) => {
        const product = extendedProducts.find(p => p.id === productId);
        if (!product) return;

        // Distribute products evenly across the view
        const angle = (index / count) * 2 * Math.PI - Math.PI;
        const pitch = -0.15 + (Math.random() * 0.2 - 0.1);

        const productName = language === 'tr' && product.nameTr ? product.nameTr : product.name;

        markers.push({
            id: `product-${productId}`,
            position: { yaw: angle, pitch: pitch },
            html: `<div class="product-hotspot">
                <div class="product-hotspot-image" style="background-image: url('${product.image}')"></div>
                <div class="product-hotspot-info">
                    <span class="product-hotspot-name">${productName}</span>
                    <span class="product-hotspot-price">${product.sku}</span>
                </div>
            </div>`,
            anchor: 'center center',
            data: { productId, type: 'product' },
            tooltip: productName
        });
    });

    return markers;
};

const Showroom = () => {
    const { language } = useLanguage();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentNode, setCurrentNode] = useState('entrance');
    const viewerRef = useRef(null);
    const containerRef = useRef(null);

    const getProductName = (p) => {
        if (!p) return '';
        return language === 'tr' && p.nameTr ? p.nameTr : p.name;
    };

    const getColor = (colorId) => colors.find(c => c.id === colorId);

    // Initialize Virtual Tour
    useEffect(() => {
        const initTimer = setTimeout(() => {
            if (!containerRef.current) return;

            setIsLoading(true);

            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }

            // Build nodes for virtual tour
            const nodes = tourNodes.map(node => {
                const markers = generateProductMarkers(node.products, language);

                return {
                    id: node.id,
                    panorama: node.panorama,
                    caption: node.caption,
                    name: node.name,
                    markers: markers,
                    links: node.links.map(linkId => {
                        const targetNode = tourNodes.find(n => n.id === linkId);
                        const linkIndex = node.links.indexOf(linkId);
                        const angle = (linkIndex / node.links.length) * Math.PI - Math.PI / 2;

                        return {
                            nodeId: linkId,
                            position: { yaw: angle, pitch: -0.1 },
                            markerStyle: {
                                size: { width: 80, height: 80 }
                            }
                        };
                    })
                };
            });

            viewerRef.current = new Viewer({
                container: containerRef.current,
                loadingTxt: 'Yükleniyor...',
                navbar: ['zoom', 'caption', 'fullscreen'],
                plugins: [
                    [MarkersPlugin, {}],
                    [VirtualTourPlugin, {
                        positionMode: 'manual',
                        renderMode: '3d',
                        nodes: nodes,
                        startNodeId: currentNode,
                        linksOnCompass: true,
                        markerPitchOffset: -0.1,
                    }],
                ],
            });

            const virtualTour = viewerRef.current.getPlugin(VirtualTourPlugin);
            const markersPlugin = viewerRef.current.getPlugin(MarkersPlugin);

            // Listen for node changes
            virtualTour.addEventListener('node-changed', (e) => {
                setCurrentNode(e.node.id);
            });

            // Click on product markers
            markersPlugin.addEventListener('select-marker', (e) => {
                if (e.marker.data?.type === 'product') {
                    const product = extendedProducts.find(p => p.id === e.marker.data.productId);
                    setSelectedProduct(product);
                }
            });

            viewerRef.current.addEventListener('ready', () => {
                setIsLoading(false);
            });

        }, 100);

        return () => {
            clearTimeout(initTimer);
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, [language]);

    // Navigate to specific node
    const goToNode = (nodeId) => {
        if (viewerRef.current) {
            const virtualTour = viewerRef.current.getPlugin(VirtualTourPlugin);
            virtualTour.setCurrentNode(nodeId);
        }
    };

    const currentNodeInfo = tourNodes.find(n => n.id === currentNode);

    return (
        <div className="showroom-page">
            {/* Product Modal */}
            {selectedProduct && (
                <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="product-modal-v2" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-v2" onClick={() => setSelectedProduct(null)}>
                            <X size={24} />
                        </button>
                        <div className="modal-content-v2">
                            <div className="modal-image-v2">
                                <img src={selectedProduct.image} alt={getProductName(selectedProduct)} />
                            </div>
                            <div className="modal-details-v2">
                                <div className="modal-header-v2">
                                    <span className="modal-sku-v2">{selectedProduct.sku}</span>
                                    <h2>{getProductName(selectedProduct)}</h2>
                                    <span className="modal-category-v2">{selectedProduct.category}</span>
                                </div>
                                <p className="modal-description-v2">
                                    {language === 'tr' ? selectedProduct.descriptionTr : selectedProduct.description}
                                </p>
                                <div className="modal-specs-v2">
                                    <div className="spec-card-v2">
                                        <Ruler size={24} color="#34C759" />
                                        <div>
                                            <label>{language === 'tr' ? 'Boyutlar' : 'Dimensions'}</label>
                                            <span>{selectedProduct.dimensions?.width} × {selectedProduct.dimensions?.height} × {selectedProduct.dimensions?.depth} cm</span>
                                        </div>
                                    </div>
                                    <div className="spec-card-v2">
                                        <Weight size={24} color="#34C759" />
                                        <div>
                                            <label>{language === 'tr' ? 'Ağırlık' : 'Weight'}</label>
                                            <span>{selectedProduct.weight} kg</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-colors-v2">
                                    <label>{language === 'tr' ? 'Renk Seçenekleri' : 'Color Options'}</label>
                                    <div className="color-chips-v2">
                                        {selectedProduct.colors?.map(colorId => {
                                            const color = getColor(colorId);
                                            return (
                                                <span
                                                    key={colorId}
                                                    className="color-chip-v2"
                                                    style={{ background: color?.hex }}
                                                    title={color?.name}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="modal-actions-v2">
                                    <button className="btn-primary-v2">
                                        <FileText size={20} />
                                        <span>{language === 'tr' ? 'Teklif Al' : 'Get Quote'}</span>
                                    </button>
                                    <a href="/catalog" className="btn-secondary-v2">
                                        <Eye size={20} />
                                        <span>{language === 'tr' ? 'Katalog' : 'Catalog'}</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="showroom-header">
                <a href="/" className="back-link">
                    <ChevronLeft size={20} />
                    <span>{language === 'tr' ? 'Ana Sayfa' : 'Home'}</span>
                </a>
                <h1>{language === 'tr' ? 'Sanal Showroom' : 'Virtual Showroom'}</h1>
                <div className="current-location">
                    <MapPin size={16} />
                    <span>{currentNodeInfo?.name}</span>
                </div>
            </div>

            {/* Mini Map / Location Buttons */}
            <div className="showroom-minimap">
                <div className="minimap-title">
                    <Navigation size={16} />
                    <span>{language === 'tr' ? 'Hızlı Geçiş' : 'Quick Jump'}</span>
                </div>
                <div className="minimap-nodes">
                    {tourNodes.map(node => (
                        <button
                            key={node.id}
                            className={`minimap-node ${currentNode === node.id ? 'active' : ''}`}
                            onClick={() => goToNode(node.id)}
                        >
                            {node.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Panorama Viewer */}
            <div className="showroom-viewer-container">
                {isLoading && (
                    <div className="showroom-loading">
                        <div className="loading-spinner"></div>
                        <span>{language === 'tr' ? 'Yükleniyor...' : 'Loading...'}</span>
                    </div>
                )}
                <div ref={containerRef} className="panorama-container" />
            </div>
        </div>
    );
};

export default Showroom;
