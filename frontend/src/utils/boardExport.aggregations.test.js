import { describe, expect, it } from 'vitest';
import { buildBoardAggregations } from './boardExport';

describe('buildBoardAggregations', () => {
    it('returns combined counts and per-board breakdown including empty dormant boards', () => {
        const boards = [
            {
                id: 'board-1', title: 'Alpha', status: 'active', columns: [
                    { id: 'col-1', title: 'WORK IN PROGRESS', cards: [{ id: 'c1' }, { id: 'c2' }] },
                    { id: 'col-2', title: 'DONE', cards: [{ id: 'c3' }] },
                    { id: 'col-3', title: 'ARCHIVE', cards: [{ id: 'c4' }] },
                ],
            },
            {
                id: 'board-2', title: 'Beta', status: 'dormant', columns: [
                    { id: 'col-4', title: 'DONE', cards: [{ id: 'c5' }] },
                    { id: 'col-5', title: 'STOPPED', cards: [{ id: 'c6' }] },
                ],
            },
            { id: 'board-3', title: 'Empty', status: 'dormant', columns: [] },
        ];

        expect(buildBoardAggregations(boards)).toEqual({
            total_cards: 6,
            cards_per_column: { 'WORK IN PROGRESS': 2, DONE: 2, ARCHIVE: 1, STOPPED: 1 },
            done: 3,
            wip: 2,
            boards: [
                {
                    board_id: 'board-1', board_title: 'Alpha', board_status: 'active',
                    total_cards: 4,
                    cards_per_column: { 'WORK IN PROGRESS': 2, DONE: 1, ARCHIVE: 1 },
                    done: 2, wip: 2,
                },
                {
                    board_id: 'board-2', board_title: 'Beta', board_status: 'dormant',
                    total_cards: 2,
                    cards_per_column: { DONE: 1, STOPPED: 1 },
                    done: 1, wip: 0,
                },
                {
                    board_id: 'board-3', board_title: 'Empty', board_status: 'dormant',
                    total_cards: 0, cards_per_column: {}, done: 0, wip: 0,
                },
            ],
        });
    });
});
