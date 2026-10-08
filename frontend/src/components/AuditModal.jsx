export default function AuditModal({ auditLogs = [], onClose }) {
    const entries = [...auditLogs].sort((left, right) => (
        new Date(right.changed_at) - new Date(left.changed_at)
    ));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <section
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="audit-title"
                onClick={(event) => event.stopPropagation()}
                style={{ maxWidth: '600px' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 id="audit-title">Card audit history</h2>
                    <button className="btn-icon" onClick={onClose} aria-label="Close audit history">✕</button>
                </div>
                {entries.length ? (
                    <div className="audit-timeline" aria-live="polite">
                        {entries.map((entry) => (
                            <article key={entry.id} className="audit-entry">
                                <div className="audit-dot" />
                                <div>
                                    <div>
                                        <span className="audit-field">{entry.field_changed}</span>
                                    </div>
                                    <dl>
                                        <div>
                                            <dt>Previous value</dt>
                                            <dd>{entry.old_value ?? '—'}</dd>
                                        </div>
                                        <div>
                                            <dt>New value</dt>
                                            <dd>{entry.new_value ?? '—'}</dd>
                                        </div>
                                    </dl>
                                    <time className="audit-time" dateTime={entry.changed_at}>
                                        {new Date(entry.changed_at).toLocaleString()}
                                    </time>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : <p>No audit entries yet.</p>}
            </section>
        </div>
    );
}
