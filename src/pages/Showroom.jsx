import React, { useState, useRef, useEffect } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';
import { MapPin, ChevronLeft, Maximize, Minimize, ChevronDown, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { showroomApi } from '../utils/api';
import './Showroom.css';

// Yön sabitleri (radyan) — fallback verisi için
const NORTH = 0;
const EAST = Math.PI / 2;
const SOUTH = Math.PI;
const WEST = -Math.PI / 2;

// Fallback statik veri (API başarısız olursa kullanılır)
const fallbackTourNodes = [
    {
        id: 'fabrika-1', name: 'Fabrika 1', panorama: '/showroom/fabrika-1.JPG',
        links: [{ nodeId: 'fabrika-2', yaw: SOUTH }]
    },
    {
        id: 'fabrika-2', name: 'Fabrika 2', panorama: '/showroom/fabrika-2.JPG',
        links: [{ nodeId: 'fabrika-1', yaw: NORTH }, { nodeId: 'fabrika-3', yaw: SOUTH }]
    },
    {
        id: 'fabrika-3', name: 'Fabrika 3', panorama: '/showroom/fabrika-3.JPG',
        links: [{ nodeId: 'fabrika-2', yaw: NORTH }, { nodeId: 'fabrika-4', yaw: SOUTH }]
    },
    {
        id: 'fabrika-4', name: 'Fabrika 4', panorama: '/showroom/fabrika-4.JPG',
        links: [{ nodeId: 'fabrika-3', yaw: NORTH }, { nodeId: 'fabrika-5', yaw: SOUTH }]
    },
    {
        id: 'fabrika-5', name: 'Fabrika 5', panorama: '/showroom/fabrika-5.JPG',
        links: [{ nodeId: 'fabrika-4', yaw: NORTH }, { nodeId: 'fabrika-6', yaw: EAST }]
    },
    {
        id: 'fabrika-6', name: 'Fabrika 6', panorama: '/showroom/fabrika-6.JPG',
        links: [{ nodeId: 'fabrika-5', yaw: WEST }, { nodeId: 'fabrika-7', yaw: NORTH }]
    },
    {
        id: 'fabrika-7', name: 'Fabrika 7', panorama: '/showroom/fabrika-7.JPG',
        links: [{ nodeId: 'fabrika-6', yaw: SOUTH }, { nodeId: 'fabrika-8', yaw: NORTH }]
    },
    {
        id: 'fabrika-8', name: 'Fabrika 8', panorama: '/showroom/fabrika-8.JPG',
        links: [{ nodeId: 'fabrika-7', yaw: SOUTH }, { nodeId: 'fabrika-9', yaw: NORTH }]
    },
    {
        id: 'fabrika-9', name: 'Fabrika 9', panorama: '/showroom/fabrika-9.JPG',
        links: [{ nodeId: 'fabrika-8', yaw: SOUTH }, { nodeId: 'fabrika-10', yaw: NORTH }]
    },
    {
        id: 'fabrika-10', name: 'Fabrika 10', panorama: '/showroom/fabrika-10.JPG',
        links: [{ nodeId: 'fabrika-9', yaw: SOUTH }, { nodeId: 'fabrika-11', yaw: NORTH }]
    },
    {
        id: 'fabrika-11', name: 'Fabrika 11', panorama: '/showroom/fabrika-11.JPG',
        links: [{ nodeId: 'fabrika-10', yaw: SOUTH }, { nodeId: 'fabrika-12', yaw: NORTH }]
    },
    {
        id: 'fabrika-12', name: 'Fabrika 12', panorama: '/showroom/fabrika-12.JPG',
        links: [{ nodeId: 'fabrika-11', yaw: SOUTH }]
    },
];

const Showroom = () => {
    const { language } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);
    const [currentNode, setCurrentNode] = useState(null);
    const [tourNodes, setTourNodes] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [navOpen, setNavOpen] = useState(false);
    const [error, setError] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(0);
    const viewerRef = useRef(null);
    const containerRef = useRef(null);
    const pageRef = useRef(null);
    const navScrollRef = useRef(null);

    // Fetch tour nodes from API
    useEffect(() => {
        const fetchNodes = async () => {
            let nodes = [];
            try {
                const apiNodes = await showroomApi.getAll();
                if (apiNodes && apiNodes.length > 0) {
                    nodes = apiNodes
                        .filter(n => n.isActive !== false && n.panoramaImage)
                        .map(n => ({
                            id: n.nodeId,
                            name: n.name,
                            panorama: n.panoramaImage,
                            defaultYaw: n.defaultYaw || 0,
                            defaultPitch: n.defaultPitch || 0,
                            links: (n.links || []).map(l => ({
                                nodeId: l.targetNodeId,
                                yaw: l.yaw,
                                pitch: l.pitch || 0
                            }))
                        }));
                }
            } catch (err) {
                console.warn('Showroom API erişilemedi, fallback veriler kullanılıyor:', err);
                nodes = fallbackTourNodes;
            }

            if (nodes.length === 0) {
                nodes = fallbackTourNodes;
            }

            // Filter out links that reference non-existent nodes
            const validIds = new Set(nodes.map(n => n.id));
            const cleanedNodes = nodes.map(n => ({
                ...n,
                links: n.links.filter(l => validIds.has(l.nodeId))
            }));

            setTourNodes(cleanedNodes);
            setCurrentNode(cleanedNodes[0]?.id || null);
        };
        fetchNodes();
    }, []);

    // Initialize Virtual Tour
    useEffect(() => {
        if (tourNodes.length === 0 || !currentNode) return;

        const initTimer = setTimeout(() => {
            if (!containerRef.current) return;

            setIsLoading(true);
            setError(null);

            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }

            // Ensure startNodeId exists in nodes
            const validIds = new Set(tourNodes.map(n => n.id));
            const startId = validIds.has(currentNode) ? currentNode : tourNodes[0].id;

            const nodes = tourNodes.map(node => ({
                id: node.id,
                panorama: node.panorama,
                name: node.name,
                panoData: { defaultYaw: node.defaultYaw || 0, defaultPitch: node.defaultPitch || 0 },
                links: node.links
                    .filter(link => validIds.has(link.nodeId))
                    .map(link => ({
                        nodeId: link.nodeId,
                        position: { yaw: link.yaw, pitch: link.pitch || 0 },
                        markerStyle: {
                            size: { width: 80, height: 80 }
                        }
                    }))
            }));

            try {
                viewerRef.current = new Viewer({
                    container: containerRef.current,
                    loadingTxt: '',
                    navbar: false,
                    defaultZoomLvl: 0,
                    minFov: 30,
                    maxFov: 90,
                    plugins: [
                        [VirtualTourPlugin, {
                            positionMode: 'manual',
                            renderMode: '3d',
                            nodes: nodes,
                            startNodeId: startId,
                            linksOnCompass: true,
                        }],
                    ],
                });

                const virtualTour = viewerRef.current.getPlugin(VirtualTourPlugin);

                virtualTour.addEventListener('node-changed', (e) => {
                    setCurrentNode(e.node.id);

                    // Find node data to get defaultYaw/defaultPitch
                    const nodeData = tourNodes.find(n => n.id === e.node.id);
                    if (nodeData && (nodeData.defaultYaw !== undefined || nodeData.defaultPitch !== undefined)) {
                        // Animate to the saved default view
                        setTimeout(() => {
                            viewerRef.current.animate({
                                yaw: nodeData.defaultYaw || 0,
                                pitch: nodeData.defaultPitch || 0,
                                zoom: 0,
                                speed: '10rpm'
                            });
                        }, 100);
                    }
                });

                viewerRef.current.addEventListener('ready', () => {
                    setIsLoading(false);

                    // Set initial view for first node
                    const firstNodeData = tourNodes.find(n => n.id === startId);
                    if (firstNodeData && (firstNodeData.defaultYaw !== undefined || firstNodeData.defaultPitch !== undefined)) {
                        setTimeout(() => {
                            viewerRef.current.animate({
                                yaw: firstNodeData.defaultYaw || 0,
                                pitch: firstNodeData.defaultPitch || 0,
                                zoom: 0,
                                speed: '10rpm'
                            });
                        }, 100);
                    }
                });
            } catch (err) {
                console.error('Viewer init error:', err);
                setIsLoading(false);
                setError(language === 'tr' ? 'Showroom yüklenemedi. Sayfayı yenileyin.' : 'Showroom failed to load. Please refresh.');
            }

        }, 100);

        return () => {
            clearTimeout(initTimer);
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, [language, tourNodes]);

    // Fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            pageRef.current?.requestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    // Scroll active node into view in nav strip
    useEffect(() => {
        if (navScrollRef.current) {
            const activeBtn = navScrollRef.current.querySelector('.nav-node.active');
            if (activeBtn) {
                activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }, [currentNode]);

    // Navigate to specific node
    const goToNode = (nodeId) => {
        if (viewerRef.current) {
            const virtualTour = viewerRef.current.getPlugin(VirtualTourPlugin);
            virtualTour.setCurrentNode(nodeId);
        }
        setNavOpen(false);
    };

    const currentNodeInfo = tourNodes.find(n => n.id === currentNode);
    const currentIndex = tourNodes.findIndex(n => n.id === currentNode);

    // Zoom slider control
    const handleZoomChange = (e) => {
        const value = parseInt(e.target.value);
        setZoomLevel(value);
        if (viewerRef.current) {
            viewerRef.current.zoom(value);
        }
    };

    return (
        <div className="showroom-page" ref={pageRef}>
            {/* Panorama Viewer - Full screen */}
            <div className="showroom-viewer-container">
                {isLoading && (
                    <div className="showroom-loading">
                        <div className="loading-spinner"></div>
                    </div>
                )}
                {error && (
                    <div className="showroom-loading" style={{ background: 'rgba(0,0,0,0.9)' }}>
                        <p style={{ color: 'white', fontSize: '1rem', textAlign: 'center', maxWidth: '300px' }}>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                marginTop: '12px', padding: '10px 24px', background: '#34C759', color: 'white',
                                border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer'
                            }}
                        >
                            {language === 'tr' ? 'Yenile' : 'Refresh'}
                        </button>
                    </div>
                )}
                <div ref={containerRef} className="panorama-container" />
            </div>

            {/* Overlay: Top left - Back button */}
            <a href="/" className="showroom-back-btn">
                <ChevronLeft size={20} />
                <span>{language === 'tr' ? 'Ana Sayfa' : 'Home'}</span>
            </a>

            {/* Overlay: Top right - Fullscreen toggle */}
            <button className="showroom-fullscreen-btn" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>

            {/* Overlay: Bottom left - Zoom slider */}
            <div className="showroom-zoom-slider">
                <Search size={16} />
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={zoomLevel}
                    onChange={handleZoomChange}
                    className="zoom-range"
                />
            </div>

            {/* Overlay: Bottom - Compact nav strip */}
            <div className="showroom-bottom-bar">
                {/* Current location indicator + toggle */}
                <button className="showroom-current-loc" onClick={() => setNavOpen(!navOpen)}>
                    <MapPin size={14} />
                    <span className="loc-name">{currentNodeInfo?.name || '...'}</span>
                    {currentIndex >= 0 && <span className="loc-counter">{currentIndex + 1}/{tourNodes.length}</span>}
                    <ChevronDown size={14} className={`loc-chevron ${navOpen ? 'open' : ''}`} />
                </button>

                {/* Expandable node list */}
                {navOpen && (
                    <div className="showroom-nav-strip" ref={navScrollRef}>
                        {tourNodes.map((node, i) => (
                            <button
                                key={node.id}
                                className={`nav-node ${currentNode === node.id ? 'active' : ''}`}
                                onClick={() => goToNode(node.id)}
                            >
                                <span className="nav-node-num">{i + 1}</span>
                                <span className="nav-node-name">{node.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Showroom;
