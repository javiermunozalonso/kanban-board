import { useState } from 'react';

export default function CreateBoardModal({ onClose, onCreate }) {
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
                <h2>✨ Create New Board</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Board Title</label>
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Q1 Sprint, Product Roadmap"
                        />
                    </div>
                    <div className="form-group">
                        <label>Description (optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this board..."
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading || !title.trim()}>
                            {loading ? 'Creating...' : 'Create Board'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
