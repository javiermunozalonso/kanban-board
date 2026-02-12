import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import CardItem from './CardItem';
import CreateCardModal from './CreateCardModal';

export default function Column({ column, onCreateCard, onDeleteCard, onViewCardDetail }) {
    const [collapsed, setCollapsed] = useState(column.collapsed);
    const [showAddCard, setShowAddCard] = useState(false);

    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
        data: { type: 'column', column },
    });

    const cardIds = (column.cards || []).map((c) => c.id);

    if (collapsed) {
        return (
            <div className="kanban-column collapsed" onClick={() => setCollapsed(false)}>
                <div className="column-collapsed-content">
                    <span className="column-count">{column.cards?.length || 0}</span>
                    <span>{column.title}</span>
                </div>
            </div>
        );
    }

    return (
        <div
            className="kanban-column"
            style={isOver ? { borderColor: 'var(--accent-purple)', boxShadow: 'var(--shadow-glow)' } : {}}
        >
            <div className="column-header" onClick={() => setCollapsed(true)}>
                <span className="column-title">{column.title}</span>
                <span className="column-count">{column.cards?.length || 0}</span>
            </div>

            <div ref={setNodeRef} className="column-cards">
                <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                    {(column.cards || []).map((card) => (
                        <CardItem
                            key={card.id}
                            card={card}
                            onDelete={onDeleteCard}
                            onViewDetail={onViewCardDetail}
                        />
                    ))}
                </SortableContext>
            </div>

            <button className="add-card-btn" onClick={() => setShowAddCard(true)}>
                + Add Card
            </button>

            {showAddCard && (
                <CreateCardModal
                    columnTitle={column.title}
                    onClose={() => setShowAddCard(false)}
                    onCreate={(data) => onCreateCard(column.id, data)}
                />
            )}
        </div>
    );
}
