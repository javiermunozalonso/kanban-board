import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGlobalBoard } from '../services/api';
import { getColumnColor } from '../services/columnColors';

export default function GlobalBoardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getGlobalBoard().then((d) => {
            setData(d);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="loading">Loading global board...</div>;

    const columns = data?.columns || [];

    return (
        <div style={{ padding: '24px 32px' }}>
            <div className="page-header">
                <h1 className="page-title">🌐 Global Board</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    All cards from active boards at a glance
                </p>
            </div>

            <div className="kanban-board">
                {columns.map((col) => {
                    const colColor = getColumnColor(col.title);
                    return (
                        <div
                            key={col.title}
                            className="kanban-column"
                            style={{ borderTop: `3px solid ${colColor.border}` }}
                        >
                            <div className="column-header">
                                <span className="column-title" style={{ color: colColor.border }}>
                                    {col.title}
                                </span>
                                <span className="column-count">{col.cards.length}</span>
                            </div>

                            <div className="column-cards">
                                {col.cards.map((card) => (
                                    <div
                                        key={card.id}
                                        className="card-item"
                                        style={{
                                            borderLeft: `3px solid ${colColor.border}`,
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => navigate(`/board/${card.board_id}`)}
                                    >
                                        <div className="card-item-title">{card.title}</div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: 'var(--accent-purple-light)',
                                            marginTop: '4px',
                                            fontWeight: 500,
                                        }}>
                                            📋 {card.board_title}
                                        </div>
                                        {card.description && (
                                            <div className="card-item-desc" style={{ marginTop: '4px' }}>
                                                {card.description}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {col.cards.length === 0 && (
                                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                                        No cards
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
