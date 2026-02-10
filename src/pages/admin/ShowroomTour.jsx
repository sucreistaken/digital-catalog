import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, Edit, GripVertical, Loader2, Database, X, Save, Link as LinkIcon, Image, Eye, EyeOff, Upload, Crosshair, Navigation, MousePointerClick, RotateCcw } from 'lucide-react';
import { Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/core/index.css';
import { showroomApi, productsApi } from '../../utils/api';
import '../Dashboard.css';

const ShowroomTour = () => {
    const [nodes, setNodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);
    const [toast, setToast] = useState(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNode, setEditingNode] = useState(null);

    // Drag & Drop
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);
    const [isSavingOrder, setIsSavingOrder] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        loadNodes();
    }, []);

    const loadNodes = async () => {
        try {
            setLoading(true);
            const data = await showroomApi.getAll();
            setNodes(data);
        } catch (err) {
            console.error('Showroom nodes yüklenemedi:', err);
            showToast('Veriler yüklenemedi', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async () => {
        if (!confirm('Mevcut showroom verileri silinip varsayılan veriler yüklenecek. Devam?')) return;
        try {
            setIsSeeding(true);
            const result = await showroomApi.seed();
            showToast(`${result.count} node eklendi`);
            await loadNodes();
        } catch (err) {
            console.error('Seed error:', err);
            showToast('Seed başarısız!', 'error');
        } finally {
            setIsSeeding(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bu node silinecek. Devam?')) return;
        try {
            await showroomApi.delete(id);
            setNodes(nodes.filter(n => n._id !== id));
            showToast('Node silindi');
        } catch (err) {
            console.error('Delete error:', err);
            showToast('Silme başarısız!', 'error');
        }
    };

    const handleToggleActive = async (node) => {
        try {
            const updated = await showroomApi.update(node._id, { isActive: !node.isActive });
            setNodes(nodes.map(n => n._id === updated._id ? updated : n));
            showToast(updated.isActive ? 'Node aktif' : 'Node pasif');
        } catch (err) {
            showToast('Güncelleme başarısız!', 'error');
        }
    };

    // Drag handlers
    const handleDragStart = (e, node) => {
        setDraggedItem(node);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging');
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const handleDragOver = (e, node) => {
        e.preventDefault();
        if (!draggedItem || draggedItem._id === node._id) return;
        setDragOverItem(node);
    };

    const handleDragLeave = () => {
        setDragOverItem(null);
    };

    const handleDrop = async (e, targetNode) => {
        e.preventDefault();
        if (!draggedItem || draggedItem._id === targetNode._id) return;

        const newNodes = [...nodes];
        const draggedIndex = newNodes.findIndex(n => n._id === draggedItem._id);
        const targetIndex = newNodes.findIndex(n => n._id === targetNode._id);

        const [removed] = newNodes.splice(draggedIndex, 1);
        newNodes.splice(targetIndex, 0, removed);

        setNodes(newNodes);
        setDraggedItem(null);
        setDragOverItem(null);

        try {
            setIsSavingOrder(true);
            await showroomApi.reorder(newNodes.map(n => n._id));
            showToast('Sıralama güncellendi');
        } catch (err) {
            showToast('Sıralama kaydedilemedi!', 'error');
            loadNodes();
        } finally {
            setIsSavingOrder(false);
        }
    };

    const openAddModal = () => {
        setEditingNode(null);
        setIsModalOpen(true);
    };

    const openEditModal = (node) => {
        setEditingNode(node);
        setIsModalOpen(true);
    };

    const handleSaveNode = async (nodeData) => {
        try {
            if (editingNode) {
                const updated = await showroomApi.update(editingNode._id, nodeData);
                setNodes(nodes.map(n => n._id === updated._id ? updated : n));
                showToast('Node güncellendi');
            } else {
                const created = await showroomApi.create(nodeData);
                setNodes([...nodes, created]);
                showToast('Node eklendi');
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Save error:', err);
            showToast('Kaydetme başarısız!', 'error');
        }
    };

    if (loading) {
        return (
            <div className="admin-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 size={32} className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="admin-page">
            {toast && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', padding: '12px 24px', borderRadius: '8px',
                    background: toast.type === 'error' ? '#ef4444' : '#22c55e', color: 'white', fontWeight: '500',
                    zIndex: 10000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    {toast.message}
                </div>
            )}

            <header className="admin-header">
                <div>
                    <h1 className="text-h2">Showroom Tur</h1>
                    <p className="text-body">Sanal tur noktalarını yönetin</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={handleSeed} disabled={isSeeding}>
                        {isSeeding ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
                        Varsayılan Verileri Yükle
                    </button>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={18} />
                        Node Ekle
                    </button>
                </div>
            </header>

            {nodes.length === 0 ? (
                <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <Image size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Henüz showroom verisi yok</p>
                    <p style={{ fontSize: '0.9rem' }}>Varsayılan verileri yükleyerek başlayın veya yeni node ekleyin.</p>
                </div>
            ) : (
                <>
                    <p style={{
                        fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                        <GripVertical size={16} />
                        Sıralamayı değiştirmek için kartları sürükleyip bırakın
                        {isSavingOrder && <Loader2 size={14} className="animate-spin" style={{ marginLeft: '8px' }} />}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {nodes.map(node => (
                            <div
                                key={node._id}
                                className="card"
                                draggable
                                onDragStart={(e) => handleDragStart(e, node)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, node)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, node)}
                                style={{
                                    cursor: 'grab',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                    borderLeft: dragOverItem && dragOverItem._id === node._id
                                        ? '3px solid var(--color-primary)'
                                        : '3px solid transparent',
                                    opacity: !node.isActive ? 0.6 : 1,
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                            >
                                {/* Drag handle + order */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '40px' }}>
                                    <GripVertical size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                                        #{node.order}
                                    </span>
                                </div>

                                {/* Small thumbnail */}
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: 'var(--radius-sm)',
                                    backgroundImage: `url(${node.panoramaImage})`,
                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                    background: node.panoramaImage ? undefined : '#f0f0f0',
                                    flexShrink: 0
                                }}>
                                    {node.panoramaImage && (
                                        <div style={{
                                            width: '100%', height: '100%', borderRadius: 'var(--radius-sm)',
                                            backgroundImage: `url(${node.panoramaImage})`,
                                            backgroundSize: 'cover', backgroundPosition: 'center'
                                        }} />
                                    )}
                                </div>

                                {/* Name & info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <h3 style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {node.name}
                                        </h3>
                                        <span style={{
                                            fontSize: '0.7rem', background: 'var(--color-bg-secondary)',
                                            padding: '1px 6px', borderRadius: '8px', color: 'var(--color-text-muted)',
                                            flexShrink: 0
                                        }}>
                                            {node.nodeId}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>
                                            <LinkIcon size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                                            {node.links?.length || 0} bağlantı
                                        </span>
                                        {node.links && node.links.length > 0 && (
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                ({node.links.map(l => l.targetNodeId).join(', ')})
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleToggleActive(node); }}
                                        style={{
                                            background: 'none', border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-sm)', padding: '5px 7px', cursor: 'pointer',
                                            color: node.isActive ? '#22c55e' : '#ef4444',
                                            display: 'flex', alignItems: 'center'
                                        }}
                                        title={node.isActive ? 'Pasife al' : 'Aktif et'}
                                    >
                                        {node.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => openEditModal(node)}
                                        style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => handleDelete(node._id)}
                                        style={{ padding: '5px 7px', color: '#ef4444', borderColor: '#ef4444' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Node Edit/Create Modal */}
            {isModalOpen && (
                <NodeModal
                    node={editingNode}
                    allNodes={nodes}
                    onSave={handleSaveNode}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

// ---- Node Edit Modal ----
const MODES = { VIEW: 'view', ARROW: 'arrow' };

const NodeModal = ({ node, allNodes, onSave, onClose }) => {
    const [form, setForm] = useState({
        nodeId: node?.nodeId || '',
        name: node?.name || '',
        panoramaImage: node?.panoramaImage || '',
        isActive: node?.isActive ?? true,
        defaultYaw: node?.defaultYaw || 0,
        defaultPitch: node?.defaultPitch || 0,
        links: node?.links?.map(l => ({ ...l })) || []
    });
    const [uploading, setUploading] = useState(false);
    const [mode, setMode] = useState(MODES.VIEW);
    const [activeLinkIndex, setActiveLinkIndex] = useState(null);
    const [feedback, setFeedback] = useState(null); // { text, color }
    const fileInputRef = useRef(null);
    const previewContainerRef = useRef(null);
    const previewViewerRef = useRef(null);
    const modeRef = useRef(mode);
    const activeLinkRef = useRef(activeLinkIndex);

    // Keep refs in sync
    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { activeLinkRef.current = activeLinkIndex; }, [activeLinkIndex]);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploading(true);
            const result = await productsApi.uploadShowroomImage(file);
            handleChange('panoramaImage', result.url);
        } catch (err) {
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const showFeedback = (text, color = '#34C759') => {
        setFeedback({ text, color });
        setTimeout(() => setFeedback(null), 1200);
    };

    // Initialize panorama preview viewer
    useEffect(() => {
        if (!form.panoramaImage || !previewContainerRef.current) return;

        const timer = setTimeout(() => {
            if (!previewContainerRef.current) return;

            if (previewViewerRef.current) {
                previewViewerRef.current.destroy();
                previewViewerRef.current = null;
            }

            try {
                previewViewerRef.current = new Viewer({
                    container: previewContainerRef.current,
                    panorama: form.panoramaImage,
                    navbar: false,
                    loadingTxt: '',
                    defaultYaw: form.defaultYaw || 0,
                    defaultPitch: form.defaultPitch || 0,
                    touchmoveTwoFingers: false,
                    mousewheelCtrlKey: false,
                });

                previewViewerRef.current.addEventListener('click', (e) => {
                    const currentMode = modeRef.current;
                    const currentLinkIdx = activeLinkRef.current;

                    if (currentMode === MODES.VIEW) {
                        // Set initial view direction
                        setForm(prev => ({
                            ...prev,
                            defaultYaw: e.data.yaw,
                            defaultPitch: e.data.pitch
                        }));
                        showFeedback('Başlangıç bakış açısı ayarlandı!');
                    } else if (currentMode === MODES.ARROW && currentLinkIdx !== null) {
                        // Set arrow position
                        setForm(prev => {
                            const newLinks = [...prev.links];
                            if (newLinks[currentLinkIdx]) {
                                newLinks[currentLinkIdx] = {
                                    ...newLinks[currentLinkIdx],
                                    yaw: e.data.yaw,
                                    pitch: e.data.pitch
                                };
                            }
                            return { ...prev, links: newLinks };
                        });
                        showFeedback('Ok konumu ayarlandı!');
                    }
                });
            } catch (err) {
                console.error('Preview viewer init error:', err);
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            if (previewViewerRef.current) {
                previewViewerRef.current.destroy();
                previewViewerRef.current = null;
            }
        };
    }, [form.panoramaImage]);

    // When switching to VIEW mode, rotate to current defaultYaw/defaultPitch
    const switchToViewMode = () => {
        setMode(MODES.VIEW);
        setActiveLinkIndex(null);
        if (previewViewerRef.current) {
            previewViewerRef.current.animate({
                yaw: form.defaultYaw || 0,
                pitch: form.defaultPitch || 0,
                speed: '3rpm'
            });
        }
    };

    const switchToArrowMode = () => {
        setMode(MODES.ARROW);
    };

    // Navigate viewer to selected link's position
    const selectLink = useCallback((index) => {
        setActiveLinkIndex(index);
        setMode(MODES.ARROW);
        if (previewViewerRef.current && form.links[index]) {
            previewViewerRef.current.animate({
                yaw: form.links[index].yaw || 0,
                pitch: form.links[index].pitch || 0,
                speed: '3rpm'
            });
        }
    }, [form.links]);

    // Link management
    const addLink = () => {
        const viewerPos = previewViewerRef.current?.getPosition();
        setForm(prev => ({
            ...prev,
            links: [...prev.links, {
                targetNodeId: '',
                yaw: viewerPos?.yaw || 0,
                pitch: viewerPos?.pitch || 0
            }]
        }));
        setMode(MODES.ARROW);
        setTimeout(() => setActiveLinkIndex(form.links.length), 50);
    };

    const removeLink = (index) => {
        setForm(prev => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index)
        }));
        if (activeLinkIndex === index) setActiveLinkIndex(null);
        else if (activeLinkIndex !== null && activeLinkIndex > index) setActiveLinkIndex(activeLinkIndex - 1);
    };

    const updateLink = (index, field, value) => {
        setForm(prev => {
            const newLinks = [...prev.links];
            newLinks[index] = { ...newLinks[index], [field]: value };
            return { ...prev, links: newLinks };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.nodeId || !form.name || !form.panoramaImage) return;
        onSave(form);
    };

    const otherNodes = allNodes.filter(n => n.nodeId !== form.nodeId);
    const isViewMode = mode === MODES.VIEW;
    const borderColor = isViewMode ? '#3b82f6' : '#34C759';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="export-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '820px', maxHeight: '90vh', overflow: 'auto' }}>
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>
                <div style={{ padding: '24px' }}>
                    <h2 style={{ margin: '0 0 20px', fontSize: '1.25rem' }}>
                        {node ? 'Node Düzenle' : 'Yeni Node'}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        {/* Basic fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px' }}>
                                    Node ID *
                                </label>
                                <input
                                    type="text"
                                    value={form.nodeId}
                                    onChange={e => handleChange('nodeId', e.target.value)}
                                    placeholder="fabrika-1"
                                    required
                                    disabled={!!node}
                                    style={{
                                        width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)', fontSize: '0.9rem',
                                        background: node ? 'var(--color-bg-secondary)' : 'var(--color-bg-card)'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px' }}>
                                    Ad *
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => handleChange('name', e.target.value)}
                                    placeholder="Fabrika 1"
                                    required
                                    style={{
                                        width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)', fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Panorama image upload */}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px' }}>
                                Panorama Görsel *
                            </label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={form.panoramaImage}
                                    onChange={e => handleChange('panoramaImage', e.target.value)}
                                    placeholder="/showroom/fabrika-1.JPG"
                                    required
                                    style={{
                                        flex: 1, padding: '8px 12px', border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)', fontSize: '0.9rem'
                                    }}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}
                                >
                                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                    Yükle
                                </button>
                            </div>
                        </div>

                        {/* ===== PANORAMA PREVIEW + MODE TABS ===== */}
                        {form.panoramaImage && (
                            <div style={{ marginBottom: '16px' }}>
                                {/* Mode Tabs */}
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', background: 'var(--color-bg-secondary)', borderRadius: '10px', padding: '3px' }}>
                                    <button
                                        type="button"
                                        onClick={switchToViewMode}
                                        style={{
                                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                            padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                            fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.15s',
                                            background: isViewMode ? '#3b82f6' : 'transparent',
                                            color: isViewMode ? 'white' : 'var(--color-text-muted)'
                                        }}
                                    >
                                        <Eye size={14} />
                                        Başlangıç Bakış Açısı
                                    </button>
                                    <button
                                        type="button"
                                        onClick={switchToArrowMode}
                                        style={{
                                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                            padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                            fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.15s',
                                            background: !isViewMode ? '#34C759' : 'transparent',
                                            color: !isViewMode ? 'white' : 'var(--color-text-muted)'
                                        }}
                                    >
                                        <Navigation size={14} />
                                        Ok Konumları
                                    </button>
                                </div>

                                {/* Panorama Viewer */}
                                <div style={{ position: 'relative' }}>
                                    <div
                                        ref={previewContainerRef}
                                        style={{
                                            width: '100%',
                                            height: '300px',
                                            borderRadius: 'var(--radius-md)',
                                            overflow: 'hidden',
                                            border: `2px solid ${borderColor}`,
                                            transition: 'border-color 0.2s'
                                        }}
                                    />
                                    {/* Crosshair overlay */}
                                    <div style={{
                                        position: 'absolute', top: '50%', left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        pointerEvents: 'none', zIndex: 10
                                    }}>
                                        <Crosshair size={30} color={feedback ? feedback.color : 'rgba(255,255,255,0.7)'}
                                            style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.6))', transition: 'color 0.2s' }} />
                                    </div>

                                    {/* Mode label (top-left) */}
                                    <div style={{
                                        position: 'absolute', top: '8px', left: '8px', pointerEvents: 'none', zIndex: 10,
                                        background: isViewMode ? 'rgba(59,130,246,0.85)' : 'rgba(52,199,89,0.85)',
                                        backdropFilter: 'blur(8px)', color: 'white', padding: '4px 10px',
                                        borderRadius: '6px', fontSize: '0.7rem', fontWeight: '600',
                                        display: 'flex', alignItems: 'center', gap: '4px', transition: 'background 0.2s'
                                    }}>
                                        <MousePointerClick size={12} />
                                        {isViewMode ? 'Tıkla = Başlangıç bakışı' : activeLinkIndex !== null ? 'Tıkla = Ok konumu' : 'Aşağıdan bir ok seçin'}
                                    </div>

                                    {/* Feedback banner */}
                                    {feedback && (
                                        <div style={{
                                            position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
                                            background: feedback.color, color: 'white', padding: '6px 16px',
                                            borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600',
                                            pointerEvents: 'none', zIndex: 10,
                                            animation: 'fadeIn 0.15s ease'
                                        }}>
                                            {feedback.text}
                                        </div>
                                    )}
                                </div>

                                {/* View mode info */}
                                {isViewMode && (
                                    <div style={{
                                        marginTop: '8px', padding: '8px 12px', background: 'rgba(59,130,246,0.06)',
                                        border: '1px solid rgba(59,130,246,0.15)', borderRadius: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                    }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                            Ziyaretçi bu node'a girdiğinde bakacağı yön
                                        </span>
                                        <span style={{
                                            fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: '600',
                                            background: 'var(--color-bg-card)', padding: '2px 8px', borderRadius: '4px'
                                        }}>
                                            {Math.round(((form.defaultYaw * 180 / Math.PI) % 360 + 360) % 360)}° / {Math.round(form.defaultPitch * 180 / Math.PI)}°
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Active toggle */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={e => handleChange('isActive', e.target.checked)}
                                    style={{ width: '16px', height: '16px' }}
                                />
                                Aktif
                            </label>
                        </div>

                        {/* ===== LINKS SECTION (Arrow mode content) ===== */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>
                                    <Navigation size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                    Yön Okları ({form.links.length})
                                </h3>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={addLink}
                                    style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                                >
                                    <Plus size={14} />
                                    Ok Ekle
                                </button>
                            </div>

                            {form.links.length === 0 && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                    Henüz yön oku yok. Diğer nodelara geçiş okları ekleyin.
                                </p>
                            )}

                            {form.links.map((link, index) => {
                                const isActive = activeLinkIndex === index && mode === MODES.ARROW;
                                const yawDeg = Math.round(((link.yaw * 180 / Math.PI) % 360 + 360) % 360);
                                const pitchDeg = Math.round(link.pitch * 180 / Math.PI);
                                const targetNode = allNodes.find(n => n.nodeId === link.targetNodeId);
                                return (
                                    <div key={index} style={{
                                        border: isActive ? '2px solid #34C759' : '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: isActive ? '11px' : '12px', marginBottom: '6px',
                                        background: isActive ? 'rgba(52,199,89,0.04)' : 'var(--color-bg-secondary)',
                                        cursor: 'pointer', transition: 'all 0.15s'
                                    }}
                                        onClick={() => selectLink(index)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {/* Link number */}
                                            <div style={{
                                                width: '24px', height: '24px', borderRadius: '6px',
                                                background: isActive ? '#34C759' : 'var(--color-bg-card)',
                                                color: isActive ? 'white' : 'var(--color-text-muted)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.7rem', fontWeight: '700', flexShrink: 0
                                            }}>
                                                {index + 1}
                                            </div>

                                            {/* Target selector */}
                                            <div style={{ flex: 1 }} onClick={e => e.stopPropagation()}>
                                                <select
                                                    value={link.targetNodeId}
                                                    onChange={e => updateLink(index, 'targetNodeId', e.target.value)}
                                                    style={{
                                                        width: '100%', padding: '5px 8px', border: '1px solid var(--color-border)',
                                                        borderRadius: 'var(--radius-sm)', fontSize: '0.8rem'
                                                    }}
                                                >
                                                    <option value="">Hedef Node...</option>
                                                    {otherNodes.map(n => (
                                                        <option key={n.nodeId} value={n.nodeId}>{n.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Position badge */}
                                            <span style={{
                                                fontSize: '0.65rem', padding: '3px 6px', borderRadius: '4px',
                                                background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                                                color: 'var(--color-text-muted)', whiteSpace: 'nowrap', fontFamily: 'monospace'
                                            }}>
                                                {yawDeg}°
                                            </span>

                                            {/* Delete */}
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeLink(index); }}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    color: '#ef4444', display: 'flex', alignItems: 'center', padding: '4px'
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        {/* Active: instruction */}
                                        {isActive && (
                                            <div style={{
                                                marginTop: '8px', fontSize: '0.75rem', color: '#34C759', fontWeight: '500',
                                                display: 'flex', alignItems: 'center', gap: '4px'
                                            }}>
                                                <MousePointerClick size={12} />
                                                Panoramada {targetNode?.name || 'hedef node'} yönüne tıklayın
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                İptal
                            </button>
                            <button type="submit" className="btn btn-primary">
                                <Save size={16} />
                                {node ? 'Güncelle' : 'Ekle'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ShowroomTour;
