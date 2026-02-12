/**
 * Column-based color mapping for card borders and column accents.
 */
const COLUMN_COLORS = {
    'BACKLOG': { border: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)' },
    'WORK IN PROGRESS': { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
    'DONE': { border: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
    'STOPPED': { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
    'ARCHIVE': { border: '#6b7280', bg: 'rgba(107, 114, 128, 0.12)' },
};

const DEFAULT_COLOR = { border: '#a78bfa', bg: 'rgba(167, 139, 250, 0.12)' };

export function getColumnColor(columnTitle) {
    return COLUMN_COLORS[columnTitle?.toUpperCase()] || DEFAULT_COLOR;
}

export default COLUMN_COLORS;
