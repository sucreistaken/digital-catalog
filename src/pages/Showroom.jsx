import React, { useState, useRef, useEffect } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';
import { MapPin, Navigation, ChevronLeft } from 'lucide-react';
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
    const [currentNode, setCurrentNode] = useState('fabrika-1');
    const [tourNodes, setTourNodes] = useState(fallbackTourNodes);
    const viewerRef = useRef(null);
    const containerRef = useRef(null);
    const tourDataLoaded = useRef(false);

    // Fetch tour nodes from API
    useEffect(() => {
        const fetchNodes = async () => {
            try {
                const apiNodes = await showroomApi.getAll();
                if (apiNodes && apiNodes.length > 0) {
                    // Map API format to viewer format
                    const mapped = apiNodes
                        .filter(n => n.isActive !== false)
                        .map(n => ({
                            id: n.nodeId,
                            name: n.name,
                            panorama: n.panoramaImage,
                            links: (n.links || []).map(l => ({
                                nodeId: l.targetNodeId,
                                yaw: l.yaw,
                                pitch: l.pitch || 0
                            }))
                        }));
                    setTourNodes(mapped);
                    if (mapped.length > 0) {
                        setCurrentNode(mapped[0].id);
                    }
                }
            } catch (err) {
                console.warn('Showroom API erişilemedi, fallback veriler kullanılıyor:', err);
            }
            tourDataLoaded.current = true;
        };
        fetchNodes();
    }, []);

    // Initialize Virtual Tour
    useEffect(() => {
        if (!tourDataLoaded.current) return;

        const initTimer = setTimeout(() => {
            if (!containerRef.current) return;

            setIsLoading(true);

            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }

            // Build nodes for virtual tour
            const nodes = tourNodes.map(node => ({
                id: node.id,
                panorama: node.panorama,
                name: node.name,
                links: node.links.map(link => ({
                    nodeId: link.nodeId,
                    position: { yaw: link.yaw, pitch: link.pitch || 0 },
                    markerStyle: {
                        size: { width: 80, height: 80 }
                    }
                }))
            }));

            viewerRef.current = new Viewer({
                container: containerRef.current,
                loadingTxt: 'Yükleniyor...',
                navbar: ['zoom', 'caption', 'fullscreen'],
                plugins: [
                    [VirtualTourPlugin, {
                        positionMode: 'manual',
                        renderMode: '3d',
                        nodes: nodes,
                        startNodeId: currentNode,
                        linksOnCompass: true,
                    }],
                ],
            });

            const virtualTour = viewerRef.current.getPlugin(VirtualTourPlugin);

            // Listen for node changes
            virtualTour.addEventListener('node-changed', (e) => {
                setCurrentNode(e.node.id);
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
    }, [language, tourNodes]);

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
