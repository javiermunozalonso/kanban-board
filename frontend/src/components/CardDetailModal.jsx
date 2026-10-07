import { useState, useEffect } from 'react';
import { getBoard, getCard, moveCard, updateCard } from '../services/api';

export default function CardDetailModal({ cardId, boardId, columns = [], onClose, onUpdate }) {
    const [card, setCard] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [columnId, setColumnId] = useState('');
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        getCard(cardId).then((data) => {
            setCard(data);
            setTitle(data.title);
            setDescription(data.description || '');
            setColumnId(data.column_id);
            setLoading(false);
        });
    }, [cardId]);

    const handleSave = async () => {
        const updates = {};
        if (title !== card.title) updates.title = title;
        if (description !== (card.description || '')) updates.description = description;
        const columnChanged = columnId !== card.column_id;

        if (Object.keys(updates).length === 0 && !columnChanged) {
            setEditing(false);
            return;
        }

        setSaving(true);
        setError('');

        try {
            let targetColumn;
            if (columnChanged) {
                const board = await getBoard(boardId);
                targetColumn = board.columns?.find((column) => column.id === columnId);
                if (!targetColumn) {
                    throw new Error('The selected column is no longer available.');
                }
            }

            const results = await Promise.allSettled([
                Object.keys(updates).length > 0 ? updateCard(cardId, updates) : Promise.resolve(),
                columnChanged
                    ? moveCard(cardId, {
                        column_id: columnId,
                        position: targetColumn.cards?.length || 0,
                    })
                    : Promise.resolve(),
            ]);
            const failedOperation = results.find((result) => result.status === 'rejected');
            if (failedOperation) throw failedOperation.reason;

            const [updated] = await Promise.all([getCard(cardId), onUpdate?.()]);
            setCard(updated);
            setTitle(updated.title);
            setDescription(updated.description || '');
            setColumnId(updated.column_id);
            setEditing(false);
        } catch (saveError) {
            setError(saveError.message === 'The selected column is no longer available.'
                ? saveError.message
                : 'Could not save all card changes. The latest saved data has been reloaded.');

            const [, cardResult] = await Promise.allSettled([onUpdate?.(), getCard(cardId)]);
            if (cardResult.status === 'fulfilled') {
                setCard(cardResult.value);
                setTitle(cardResult.value.title);
                setDescription(cardResult.value.description || '');
                setColumnId(cardResult.value.column_id);
            }
        } finally {
            setSaving(false);
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
                        {error && (
                            <div role="alert" style={{ color: 'var(--accent-red)', marginBottom: '12px' }}>
                                {error}
                            </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="card-title">Title</label>
                            <input id="card-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="card-description">Description</label>
                            <textarea id="card-description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="card-column">Column</label>
                            <select
                                id="card-column"
                                value={columnId}
                                onChange={(e) => setColumnId(e.target.value)}
                                disabled={saving}
                            >
                                {columns.map((column) => (
                                    <option key={column.id} value={column.id}>{column.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save'}
                            </button>
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
