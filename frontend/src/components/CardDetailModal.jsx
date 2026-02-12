import { useState, useEffect } from 'react';
import { getCard, updateCard } from '../services/api';

export default function CardDetailModal({ cardId, onClose, onUpdate }) {
    const [card, setCard] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCard(cardId).then((data) => {
            setCard(data);
            setTitle(data.title);
            setDescription(data.description || '');
            setLoading(false);
        });
    }, [cardId]);

    const handleSave = async () => {
        const updates = {};
        if (title !== card.title) updates.title = title;
        if (description !== (card.description || '')) updates.description = description;
        if (Object.keys(updates).length > 0) {
            await updateCard(cardId, updates);
            onUpdate?.();
            setEditing(false);
            // Re-fetch card to get updated audit logs
            const updated = await getCard(cardId);
            setCard(updated);
        } else {
            setEditing(false);
        }
    };

    if (loading) return <div className="modal-overlay"><div className="modal"><div className="loading">Loading...</div></div></div>;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>📋 Card Detail</h2>
                    <button className="btn-icon" onClick={onClose} style={{ fontSize: '18px' }}>✕</button>
                </div>

                {editing ? (
                    <>
                        <div className="form-group">
                            <label>Title</label>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Save</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{card.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                {card.description || 'No description'}
                            </p>
                            <button className="btn btn-secondary" style={{ marginTop: '12px' }} onClick={() => setEditing(true)}>
                                ✏️ Edit
                            </button>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                                📜 Audit Trail
                            </h3>
                            {card.audit_logs?.length > 0 ? (
                                <div className="audit-timeline">
                                    {card.audit_logs.map((log) => (
                                        <div key={log.id} className="audit-entry">
                                            <div className="audit-dot" />
                                            <div>
                                                <div>
                                                    <span className="audit-field">{log.field_changed}</span>
                                                    {log.old_value && <span style={{ color: 'var(--text-muted)' }}> from "{log.old_value}"</span>}
                                                    {log.new_value && <span> → "{log.new_value}"</span>}
                                                </div>
                                                <div className="audit-time">
                                                    {new Date(log.changed_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No audit entries yet.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
