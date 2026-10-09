import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listBoards, getBoard, createBoard, deleteBoard, updateBoard } from '../services/api';
import CreateBoardModal from '../components/CreateBoardModal';
import { createBoardExportWorkbook, flattenBoardTasks, serializeBoardExportJson, serializeBoardTasksCsv } from '../utils/boardExport';

export default function BoardListPage() {
    const [boards, setBoards] = useState([]);
    const [filter, setFilter] = useState(null); // null=all, 'active', 'dormant'
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(null);
    const [exportError, setExportError] = useState('');
    const navigate = useNavigate();

    const fetchBoards = useCallback(async () => {
        setLoading(true);
        const data = await listBoards(filter);
        setBoards(data);
        setLoading(false);
    }, [filter]);

    useEffect(() => { fetchBoards(); }, [fetchBoards]);

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

    const handleExport = async (format) => {
        const selectedBoards = [...boards];
        if (selectedBoards.length === 0 || exporting) return;

        setExporting(format);
        setExportError('');
        try {
            const details = await Promise.all(selectedBoards.map((board) => getBoard(board.id)));
            let content;
            let mimeType;
            let extension = format;

            if (format === 'csv') {
                content = serializeBoardTasksCsv(flattenBoardTasks(details));
                mimeType = 'text/csv;charset=utf-8';
            } else if (format === 'json') {
                content = serializeBoardExportJson(details);
                mimeType = 'application/json;charset=utf-8';
            } else {
                const workbook = await createBoardExportWorkbook(details);
                content = await workbook.xlsx.writeBuffer();
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                extension = 'xlsx';
            }

            const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `boards-${filter || 'all'}.${extension}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Board export failed:', error);
            setExportError('Export failed. No file was downloaded; please try again.');
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">📋 My Boards</h1>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    + Create Board
                </button>
                <div style={{ display: 'flex', gap: '8px' }} aria-label="Export boards">
                    {['csv', 'xlsx', 'json'].map((format) => (
                        <button
                            key={format}
                            className="btn btn-secondary"
                            onClick={() => handleExport(format)}
                            disabled={loading || boards.length === 0 || exporting !== null}
                            aria-label={`Export ${format.toUpperCase()}`}
                        >
                            {exporting === format ? 'Exporting…' : format.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {exportError && <div role="alert">{exportError}</div>}
            {exporting && <div role="status">Preparing {exporting.toUpperCase()} export…</div>}

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
