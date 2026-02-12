import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

export default function CardItem({ card, onDelete, onViewDetail }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: card.id, data: { type: 'card', card } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`card-item ${isDragging ? 'dragging' : ''}`}
        >
            <div className="card-item-title">{card.title}</div>
            {card.description && <div className="card-item-desc">{card.description}</div>}
            <div className="card-actions">
                <button
                    className="btn-icon"
                    onClick={(e) => { e.stopPropagation(); onViewDetail(card.id); }}
                    title="View details"
                >
                    📋
                </button>
                <button
                    className="btn-icon"
                    onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                    title="Delete card"
                    style={{ color: 'var(--accent-red)' }}
                >
                    🗑
                </button>
            </div>
        </div>
    );
}
