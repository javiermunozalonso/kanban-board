import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ef4444'];

export default function BoardDashboard({ dashboard }) {
    if (!dashboard) return null;

    const columnData = Object.entries(dashboard.cards_per_column).map(([name, value]) => ({ name, value }));

    return (
        <div style={{ marginBottom: '32px' }}>
            <div className="dashboard-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Cards</div>
                    <div className="stat-value">{dashboard.total_cards}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Created</div>
                    <div className="stat-value">{dashboard.created_vs_completed.created}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Completed</div>
                    <div className="stat-value">{dashboard.created_vs_completed.completed}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="chart-container">
                    <div className="chart-title">Cards per Column</div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={columnData}>
                            <XAxis dataKey="name" tick={{ fill: '#a0a0b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#a0a0b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                                labelStyle={{ color: '#e8e8f0' }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {columnData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <div className="chart-title">Distribution</div>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={columnData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={{ fill: '#a0a0b8', fontSize: 11 }}>
                                {columnData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {dashboard.recent_activity?.length > 0 && (
                <div className="chart-container">
                    <div className="chart-title">Recent Activity</div>
                    <div className="audit-timeline">
                        {dashboard.recent_activity.map((entry, i) => (
                            <div key={i} className="audit-entry">
                                <div className="audit-dot" />
                                <div>
                                    <span className="audit-field">{entry.field_changed}</span>
                                    {entry.old_value && <span style={{ color: 'var(--text-muted)' }}> from "{entry.old_value}"</span>}
                                    {entry.new_value && <span> → "{entry.new_value}"</span>}
                                    <div className="audit-time">{new Date(entry.changed_at).toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
