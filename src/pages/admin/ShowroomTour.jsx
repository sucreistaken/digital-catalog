import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, GripVertical, Loader2, Database, X, Save, Link as LinkIcon, Image, Eye, EyeOff, Upload } from 'lucide-react';
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
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
                                    padding: 0,
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Thumbnail */}
                                <div style={{
                                    height: '140px', background: '#f0f0f0', position: 'relative',
                                    backgroundImage: `url(${node.panoramaImage})`,
                                    backgroundSize: 'cover', backgroundPosition: 'center'
                                }}>
                                    <div style={{
                                        position: 'absolute', top: '8px', left: '8px',
                                        background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 8px',
                                        borderRadius: '4px', fontSize: '0.75rem'
                                    }}>
                                        #{node.order}
                                    </div>
                                    <div style={{
                                        position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px'
                                    }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleToggleActive(node); }}
                                            style={{
                                                background: 'rgba(0,0,0,0.6)', color: node.isActive ? '#22c55e' : '#ef4444',
                                                border: 'none', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer'
                                            }}
                                            title={node.isActive ? 'Pasife al' : 'Aktif et'}
                                        >
                                            {node.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div style={{ padding: '12px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <GripVertical size={16} style={{ color: 'var(--color-text-muted)' }} />
                                            <h3 style={{ margin: 0, fontSize: '1rem' }}>{node.name}</h3>
                                        </div>
                                        <span style={{
                                            fontSize: '0.75rem', background: 'var(--color-bg-secondary)',
                                            padding: '2px 8px', borderRadius: '12px', color: 'var(--color-text-muted)'
                                        }}>
                                            {node.nodeId}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                                        <LinkIcon size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                        {node.links?.length || 0} bağlantı
                                    </div>

                                    {/* Links summary */}
                                    {node.links && node.links.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                                            {node.links.map((link, i) => (
                                                <span key={i} style={{
                                                    fontSize: '0.7rem', background: 'var(--color-bg-secondary)',
                                                    padding: '2px 8px', borderRadius: '8px',
                                                    color: 'var(--color-text-muted)'
                                                }}>
                                                    {link.targetNodeId} ({Math.round(link.yaw * 180 / Math.PI)}°)
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => openEditModal(node)}
                                            style={{ flex: 1, padding: '6px 12px', fontSize: '0.85rem' }}
                                        >
                                            <Edit size={14} />
                                            Düzenle
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleDelete(node._id)}
                                            style={{ padding: '6px 12px', fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
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
const NodeModal = ({ node, allNodes, onSave, onClose }) => {
    const [form, setForm] = useState({
        nodeId: node?.nodeId || '',
        name: node?.name || '',
        panoramaImage: node?.panoramaImage || '',
        isActive: node?.isActive ?? true,
        links: node?.links?.map(l => ({ ...l })) || []
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploading(true);
            const result = await productsApi.uploadImage(file);
            handleChange('panoramaImage', result.imageUrl || result.url);
        } catch (err) {
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    // Link management
    const addLink = () => {
        setForm(prev => ({
            ...prev,
            links: [...prev.links, { targetNodeId: '', yaw: 0, pitch: 0 }]
        }));
    };

    const removeLink = (index) => {
        setForm(prev => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index)
        }));
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="export-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}>
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

                        {/* Panorama image */}
                        <div style={{ marginBottom: '16px' }}>
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
                            {form.panoramaImage && (
                                <div style={{
                                    marginTop: '8px', height: '100px', borderRadius: 'var(--radius-md)',
                                    backgroundImage: `url(${form.panoramaImage})`,
                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                    border: '1px solid var(--color-border)'
                                }} />
                            )}
                        </div>

                        {/* Active toggle */}
                        <div style={{ marginBottom: '20px' }}>
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

                        {/* Links section */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>
                                    <LinkIcon size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                    Bağlantılar
                                </h3>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={addLink}
                                    style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                                >
                                    <Plus size={14} />
                                    Bağlantı Ekle
                                </button>
                            </div>

                            {form.links.length === 0 && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px' }}>
                                    Henüz bağlantı yok. Diğer nodelara ok yönü ekleyin.
                                </p>
                            )}

                            {form.links.map((link, index) => {
                                const yawDeg = Math.round(((link.yaw * 180 / Math.PI) % 360 + 360) % 360);
                                return (
                                    <div key={index} style={{
                                        border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                                        padding: '12px', marginBottom: '8px', background: 'var(--color-bg-secondary)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>
                                                    Hedef Node
                                                </label>
                                                <select
                                                    value={link.targetNodeId}
                                                    onChange={e => updateLink(index, 'targetNodeId', e.target.value)}
                                                    style={{
                                                        width: '100%', padding: '6px 10px', border: '1px solid var(--color-border)',
                                                        borderRadius: 'var(--radius-sm)', fontSize: '0.85rem'
                                                    }}
                                                >
                                                    <option value="">Seçin...</option>
                                                    {otherNodes.map(n => (
                                                        <option key={n.nodeId} value={n.nodeId}>{n.name} ({n.nodeId})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeLink(index)}
                                                style={{
                                                    background: 'none', border: 'none', color: '#ef4444',
                                                    cursor: 'pointer', padding: '4px', marginTop: '16px'
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                    Yaw (Ok Yönü)
                                                </label>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '600', minWidth: '50px', textAlign: 'right' }}>
                                                    {yawDeg}°
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="360"
                                                    value={yawDeg}
                                                    onChange={e => {
                                                        const deg = parseInt(e.target.value);
                                                        const rad = deg * Math.PI / 180;
                                                        updateLink(index, 'yaw', rad);
                                                    }}
                                                    style={{ flex: 1, cursor: 'pointer' }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                                <span>0° Kuzey</span>
                                                <span>90° Doğu</span>
                                                <span>180° Güney</span>
                                                <span>270° Batı</span>
                                                <span>360°</span>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                    Pitch (Dikey Açı)
                                                </label>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '600', minWidth: '50px', textAlign: 'right' }}>
                                                    {Math.round(link.pitch * 180 / Math.PI)}°
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="-90"
                                                max="90"
                                                value={Math.round(link.pitch * 180 / Math.PI)}
                                                onChange={e => {
                                                    const deg = parseInt(e.target.value);
                                                    updateLink(index, 'pitch', deg * Math.PI / 180);
                                                }}
                                                style={{ width: '100%', cursor: 'pointer' }}
                                            />
                                        </div>
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
