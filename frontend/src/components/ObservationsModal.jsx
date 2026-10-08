import { useEffect, useState } from 'react';
import {
    createCardObservation,
    deleteCardObservation,
    listCardObservations,
    updateCardObservation,
} from '../services/api';

export default function ObservationsModal({ cardId, onClose }) {
    const [observations, setObservations] = useState([]);
    const [content, setContent] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        listCardObservations(cardId)
            .then((items) => {
                if (active) setObservations(items);
            })
            .catch(() => {
                if (active) setError('Could not load observations.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [cardId]);

    const handleCreate = async (event) => {
        event.preventDefault();
        if (!content.trim()) return;
        setSaving(true);
        setError('');
        try {
            const observation = await createCardObservation(cardId, { content: content.trim() });
            setObservations((items) => [observation, ...items]);
            setContent('');
        } catch {
            setError('Could not create the observation.');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (observationId) => {
        if (!editingContent.trim()) return;
        setSaving(true);
        setError('');
        try {
            const updated = await updateCardObservation(
                cardId, observationId, { content: editingContent.trim() },
            );
            setObservations((items) => [
                updated,
                ...items.filter((item) => item.id !== observationId),
            ]);
            setEditingId(null);
            setEditingContent('');
        } catch {
            setError('Could not update the observation.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (observationId) => {
        setSaving(true);
        setError('');
        try {
            await deleteCardObservation(cardId, observationId);
            setObservations((items) => items.filter((item) => item.id !== observationId));
        } catch {
            setError('Could not delete the observation.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <section
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="observations-title"
                onClick={(event) => event.stopPropagation()}
                style={{ maxWidth: '600px' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 id="observations-title">Card observations</h2>
                    <button className="btn-icon" onClick={onClose} aria-label="Close observations">✕</button>
                </div>

                {error && <div role="alert" style={{ color: 'var(--accent-red)' }}>{error}</div>}

                <form onSubmit={handleCreate}>
                    <div className="form-group">
                        <label htmlFor="new-observation">New observation</label>
                        <textarea
                            id="new-observation"
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            disabled={saving}
                        />
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={saving || !content.trim()}>
                        Add observation
                    </button>
                </form>

                {loading ? <div className="loading">Loading...</div> : (
                    <div className="observation-list" aria-live="polite">
                        {observations.length ? observations.map((observation) => (
                            <article className="observation-entry" key={observation.id}>
                                {editingId === observation.id ? (
                                    <>
                                        <div className="form-group">
                                            <label htmlFor={`edit-observation-${observation.id}`}>Edit observation</label>
                                            <textarea
                                                id={`edit-observation-${observation.id}`}
                                                value={editingContent}
                                                onChange={(event) => setEditingContent(event.target.value)}
                                                disabled={saving}
                                            />
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleUpdate(observation.id)}
                                            disabled={saving || !editingContent.trim()}
                                        >Save observation</button>
                                        <button className="btn btn-secondary" onClick={() => setEditingId(null)} disabled={saving}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <p>{observation.content}</p>
                                        <time dateTime={observation.updated_at}>
                                            {new Date(observation.updated_at).toLocaleString()}
                                        </time>
                                        <div className="modal-actions">
                                            <button
                                                className="btn btn-secondary"
                                                aria-label={`Edit ${observation.content}`}
                                                onClick={() => {
                                                    setEditingId(observation.id);
                                                    setEditingContent(observation.content);
                                                }}
                                                disabled={saving}
                                            >Edit</button>
                                            <button
                                                className="btn btn-secondary"
                                                aria-label={`Delete ${observation.content}`}
                                                onClick={() => handleDelete(observation.id)}
                                                disabled={saving}
                                            >Delete</button>
                                        </div>
                                    </>
                                )}
                            </article>
                        )) : <p>No observations yet.</p>}
                    </div>
                )}
            </section>
        </div>
    );
}
