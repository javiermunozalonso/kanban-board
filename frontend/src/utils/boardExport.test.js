import { describe, expect, it } from 'vitest';
import { flattenBoardTasks } from './boardExport';

describe('flattenBoardTasks', () => {
    it('returns no task rows for a board without cards', () => {
        expect(flattenBoardTasks([
            { id: 'board-1', title: 'Empty', status: 'active', columns: [{ id: 'column-1', title: 'Backlog', cards: [] }] },
        ])).toEqual([]);
    });

    it('flattens cards from multiple boards with their board and column origins', () => {
        expect(flattenBoardTasks([
            {
                id: 'board-1', title: 'Alpha', status: 'active',
                columns: [{ id: 'column-1', title: 'Backlog', cards: [{ id: 'card-1', title: 'First', description: 'Details', position: 0, created_at: '2026-01-01', updated_at: '2026-01-02' }] }],
            },
            {
                id: 'board-2', title: 'Beta', status: 'dormant',
                columns: [{ id: 'column-2', title: 'Done', cards: [{ id: 'card-2', title: 'Second', description: null, position: 1, created_at: '2026-01-03', updated_at: '2026-01-04' }] }],
            },
        ])).toEqual([
            {
                card_id: 'card-1', title: 'First', description: 'Details', position: 0, created_at: '2026-01-01', updated_at: '2026-01-02',
                board_id: 'board-1', board_title: 'Alpha', board_status: 'active',
                column_id: 'column-1', column_title: 'Backlog',
            },
            {
                card_id: 'card-2', title: 'Second', description: null, position: 1, created_at: '2026-01-03', updated_at: '2026-01-04',
                board_id: 'board-2', board_title: 'Beta', board_status: 'dormant',
                column_id: 'column-2', column_title: 'Done',
            },
        ]);
    });
});
