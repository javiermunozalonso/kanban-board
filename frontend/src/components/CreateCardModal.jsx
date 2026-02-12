import { useState } from 'react';

export default function CreateCardModal({ columnTitle, onClose, onCreate }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);
        try {
            await onCreate({ title: title.trim(), description: description.trim() || null });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>➕ Add Card to {columnTitle}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Card Title</label>
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Fix login bug, Design homepage"
                        />
                    </div>
                    <div className="form-group">
                        <label>Description (optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details..."
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading || !title.trim()}>
                            {loading ? 'Adding...' : 'Add Card'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
