import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
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
        return data;
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
        if (!over || active.id === over.id) return;

        const activeCard = active.data?.current?.card;
        if (!activeCard) return;

        let targetColumnId;
        let targetPosition;

        if (over.data?.current?.type === 'column') {
            // Dropped on a column directly → append at end
            targetColumnId = over.id;
            const targetCol = board.columns.find((c) => c.id === targetColumnId);
            const cards = targetCol?.cards || [];
            // If moving to same column, don't count the dragged card
            targetPosition = activeCard.column_id === targetColumnId
                ? cards.length - 1
                : cards.length;
        } else if (over.data?.current?.type === 'card') {
            // Dropped on another card → take its position
            const overCard = over.data.current.card;
            targetColumnId = overCard.column_id;

            if (activeCard.column_id === targetColumnId) {
                // Same column reorder: use the over card's current position
                targetPosition = overCard.position;
            } else {
                // Cross-column: insert at the over card's position
                targetPosition = overCard.position;
            }
        } else {
            targetColumnId = over.id;
            targetPosition = 0;
        }

        // Skip no-op moves
        if (activeCard.column_id === targetColumnId && activeCard.position === targetPosition) return;

        try {
            await moveCard(activeCard.id, { column_id: targetColumnId, position: targetPosition });
        } catch (err) {
            console.error('Move failed:', err);
        }
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
                    boardId={boardId}
                    columns={board.columns || []}
                    onClose={() => setSelectedCardId(null)}
                    onUpdate={fetchBoard}
                />
            )}
        </div>
    );
}
