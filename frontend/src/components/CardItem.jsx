import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function CardItem({ card, columnColor, onDelete, onViewDetail, boardLabel }) {
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
        borderLeft: columnColor ? `3px solid ${columnColor}` : undefined,
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
            {boardLabel && (
                <div style={{ fontSize: '11px', color: 'var(--accent-purple-light)', marginBottom: '4px', fontWeight: 500 }}>
                    📋 {boardLabel}
                </div>
            )}
            {card.description && <div className="card-item-desc">{card.description}</div>}
            <div className="card-actions">
                {onViewDetail && (
                    <button
                        className="btn-icon"
                        onClick={(e) => { e.stopPropagation(); onViewDetail(card.id); }}
                        title="View details"
                    >
                        📋
                    </button>
                )}
                {onDelete && (
                    <button
                        className="btn-icon"
                        onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                        title="Delete card"
                        style={{ color: 'var(--accent-red)' }}
                    >
                        🗑
                    </button>
                )}
            </div>
        </div>
    );
}
