import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { getBoard, createCard, deleteCard, moveCard, getBoardDashboard } from '../services/api';
import Column from '../components/Column';
import CardDetailModal from '../components/CardDetailModal';
import BoardDashboard from '../components/BoardDashboard';

export default function BoardDetailPage() {
    const { boardId } = useParams();
    const [board, setBoard] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [showDashboard, setShowDashboard] = useState(false);
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [loading, setLoading] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const fetchBoard = useCallback(async () => {
        const data = await getBoard(boardId);
        setBoard(data);
        setLoading(false);
    }, [boardId]);

    const fetchDashboard = useCallback(async () => {
        const data = await getBoardDashboard(boardId);
        setDashboard(data);
    }, [boardId]);

    useEffect(() => {
        fetchBoard();
    }, [fetchBoard]);

    useEffect(() => {
        if (showDashboard) fetchDashboard();
    }, [showDashboard, fetchDashboard]);

    const handleCreateCard = async (columnId, data) => {
        await createCard(columnId, data);
        fetchBoard();
    };

    const handleDeleteCard = async (cardId) => {
        if (confirm('Delete this card?')) {
            await deleteCard(cardId);
            fetchBoard();
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeCard = active.data?.current?.card;
        if (!activeCard) return;

        // Determine target column
        let targetColumnId;
        let targetPosition = 0;

        if (over.data?.current?.type === 'column') {
            targetColumnId = over.id;
            // Place at end of column
            const targetCol = board.columns.find((c) => c.id === targetColumnId);
            targetPosition = targetCol?.cards?.length || 0;
        } else if (over.data?.current?.type === 'card') {
            const overCard = over.data.current.card;
            targetColumnId = overCard.column_id;
            targetPosition = overCard.position;
        } else {
            targetColumnId = over.id;
        }

        if (activeCard.column_id === targetColumnId && activeCard.position === targetPosition) return;

        await moveCard(activeCard.id, { column_id: targetColumnId, position: targetPosition });
        fetchBoard();
    };

    if (loading) return <div className="loading">Loading board...</div>;
    if (!board) return <div className="loading">Board not found</div>;

    return (
        <div style={{ padding: '24px 32px' }}>
            <div className="board-detail-header">
                <Link to="/" className="back-link">← Back</Link>
                <h1>{board.title}</h1>
                <span className={`badge badge-${board.status}`}>{board.status}</span>
                <button
                    className={`btn ${showDashboard ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setShowDashboard(!showDashboard)}
                >
                    📊 {showDashboard ? 'Hide Dashboard' : 'Show Dashboard'}
                </button>
            </div>

            {showDashboard && <BoardDashboard dashboard={dashboard} />}

            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <div className="kanban-board">
                    {(board.columns || []).map((col) => (
                        <Column
                            key={col.id}
                            column={col}
                            onCreateCard={handleCreateCard}
                            onDeleteCard={handleDeleteCard}
                            onViewCardDetail={setSelectedCardId}
                        />
                    ))}
                </div>
            </DndContext>

            {selectedCardId && (
                <CardDetailModal
                    cardId={selectedCardId}
                    onClose={() => setSelectedCardId(null)}
                    onUpdate={fetchBoard}
                />
            )}
        </div>
    );
}
