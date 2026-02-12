import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listBoards, createBoard, deleteBoard, updateBoard } from '../services/api';
import CreateBoardModal from '../components/CreateBoardModal';

export default function BoardListPage() {
    const [boards, setBoards] = useState([]);
    const [filter, setFilter] = useState(null); // null=all, 'active', 'dormant'
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchBoards = async () => {
        setLoading(true);
        const data = await listBoards(filter);
        setBoards(data);
        setLoading(false);
    };

    useEffect(() => { fetchBoards(); }, [filter]);

    const handleCreate = async (data) => {
        await createBoard(data);
        fetchBoards();
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (confirm('Delete this board permanently?')) {
            await deleteBoard(id);
            fetchBoards();
        }
    };

    const handleToggleStatus = async (e, board) => {
        e.stopPropagation();
        const newStatus = board.status === 'active' ? 'dormant' : 'active';
        await updateBoard(board.id, { status: newStatus });
        fetchBoards();
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">📋 My Boards</h1>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    + New Board
                </button>
            </div>

            <div className="filter-tabs">
                <button className={`filter-tab ${filter === null ? 'active' : ''}`} onClick={() => setFilter(null)}>All</button>
                <button className={`filter-tab ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Active</button>
                <button className={`filter-tab ${filter === 'dormant' ? 'active' : ''}`} onClick={() => setFilter('dormant')}>Dormant</button>
            </div>

            {loading ? (
                <div className="loading">Loading boards...</div>
            ) : boards.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <div className="empty-state-title">No boards yet</div>
                    <div className="empty-state-desc">Create your first board to start organizing your work.</div>
                    <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Board</button>
                </div>
            ) : (
                <div className="board-grid">
                    {boards.map((board) => (
                        <div key={board.id} className="board-card" onClick={() => navigate(`/board/${board.id}`)}>
                            <div className="board-card-title">{board.title}</div>
                            <div className="board-card-desc">{board.description || 'No description'}</div>
                            <div className="board-card-footer">
                                <span className={`badge badge-${board.status}`}>{board.status}</span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button className="btn-icon" onClick={(e) => handleToggleStatus(e, board)} title={board.status === 'active' ? 'Set dormant' : 'Activate'}>
                                        {board.status === 'active' ? '😴' : '⚡'}
                                    </button>
                                    <button className="btn-icon" onClick={(e) => handleDelete(e, board.id)} title="Delete board" style={{ color: 'var(--accent-red)' }}>
                                        🗑
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreate && (
                <CreateBoardModal
                    onClose={() => setShowCreate(false)}
                    onCreate={handleCreate}
                />
            )}
        </div>
    );
}
