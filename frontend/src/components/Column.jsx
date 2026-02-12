import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import CardItem from './CardItem';
import CreateCardModal from './CreateCardModal';
import { getColumnColor } from '../services/columnColors';

export default function Column({ column, onCreateCard, onDeleteCard, onViewCardDetail }) {
    const [collapsed, setCollapsed] = useState(column.collapsed);
    const [showAddCard, setShowAddCard] = useState(false);

    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
        data: { type: 'column', column },
    });

    const cardIds = (column.cards || []).map((c) => c.id);
    const colColor = getColumnColor(column.title);

    if (collapsed) {
        return (
            <div className="kanban-column collapsed" onClick={() => setCollapsed(false)}
                style={{ borderTop: `3px solid ${colColor.border}` }}>
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
            style={{
                borderTop: `3px solid ${colColor.border}`,
                ...(isOver ? { borderColor: colColor.border, boxShadow: `0 0 20px ${colColor.bg}` } : {}),
            }}
        >
            <div className="column-header" onClick={() => setCollapsed(true)}>
                <span className="column-title" style={{ color: colColor.border }}>{column.title}</span>
                <span className="column-count">{column.cards?.length || 0}</span>
            </div>

            <div ref={setNodeRef} className="column-cards">
                <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                    {(column.cards || []).map((card) => (
                        <CardItem
                            key={card.id}
                            card={card}
                            columnColor={colColor.border}
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
