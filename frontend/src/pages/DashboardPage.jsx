import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGeneralDashboard } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ef4444'];

export default function DashboardPage() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getGeneralDashboard().then((data) => {
            setDashboard(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="loading">Loading dashboard...</div>;
    if (!dashboard) return null;

    const distData = Object.entries(dashboard.global_distribution).map(([name, value]) => ({ name, value }));
    const boardsData = dashboard.boards_summary.map((b) => ({
        name: b.title.length > 15 ? b.title.slice(0, 15) + '…' : b.title,
        total: b.total,
        done: b.done,
        wip: b.wip,
        board_id: b.board_id,
    }));

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">📊 General Dashboard</h1>
            </div>

            <div className="dashboard-grid">
                <div className="stat-card">
                    <div className="stat-label">Active Boards</div>
                    <div className="stat-value">{dashboard.active_boards}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Dormant Boards</div>
                    <div className="stat-value" style={{ WebkitTextFillColor: 'var(--accent-yellow)' }}>{dashboard.dormant_boards}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Cards</div>
                    <div className="stat-value">{dashboard.total_cards}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="chart-container">
                    <div className="chart-title">Global Card Distribution</div>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={distData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={{ fill: '#a0a0b8', fontSize: 12 }}>
                                {distData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <div className="chart-title">Cards by Board</div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={boardsData}>
                            <XAxis dataKey="name" tick={{ fill: '#a0a0b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#a0a0b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} labelStyle={{ color: '#e8e8f0' }} />
                            <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Total" />
                            <Bar dataKey="done" fill="#10b981" radius={[4, 4, 0, 0]} name="Done" />
                            <Bar dataKey="wip" fill="#3b82f6" radius={[4, 4, 0, 0]} name="WIP" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {dashboard.boards_summary.length > 0 && (
                <div className="chart-container">
                    <div className="chart-title">Board Summary</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Board</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Total</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>WIP</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Done</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Progress</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboard.boards_summary.map((b) => (
                                <tr
                                    key={b.board_id}
                                    style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                                    onClick={() => navigate(`/board/${b.board_id}`)}
                                >
                                    <td style={{ padding: '12px', fontWeight: 500 }}>{b.title}</td>
                                    <td style={{ textAlign: 'right', padding: '12px' }}>{b.total}</td>
                                    <td style={{ textAlign: 'right', padding: '12px', color: 'var(--accent-blue)' }}>{b.wip}</td>
                                    <td style={{ textAlign: 'right', padding: '12px', color: 'var(--accent-green)' }}>{b.done}</td>
                                    <td style={{ textAlign: 'right', padding: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                            <div style={{ width: '80px', height: '6px', background: 'var(--bg-glass)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${b.total > 0 ? (b.done / b.total) * 100 : 0}%`, background: 'var(--accent-green)', borderRadius: '3px', transition: 'width 0.3s' }} />
                                            </div>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                {b.total > 0 ? Math.round((b.done / b.total) * 100) : 0}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
