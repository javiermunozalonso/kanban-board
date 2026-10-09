import { describe, expect, it } from 'vitest';
import { createBoardExportData, serializeBoardExportJson } from './boardExport';

const boards = [{
    id: 'board-1', title: 'Board', status: 'dormant',
    columns: [{ id: 'column-1', title: 'DONE', cards: [{ id: 'card-1', title: 'Task' }] }],
}];

describe('board export JSON data', () => {
    it('keeps flat tasks and aggregated dashboard in separate root properties', () => {
        const data = createBoardExportData(boards);

        expect(data.tasks[0]).toMatchObject({
            card_id: 'card-1', board_id: 'board-1', board_title: 'Board', board_status: 'dormant',
            column_id: 'column-1', column_title: 'DONE',
        });
        expect(data.aggregations).toMatchObject({
            total_cards: 1,
            done: 1,
            boards: [{ board_id: 'board-1', board_title: 'Board', board_status: 'dormant', total_cards: 1 }],
        });
        expect(Object.keys(data)).toEqual(['tasks', 'aggregations']);
    });

    it('serializes the export as valid JSON with both sections', () => {
        const parsed = JSON.parse(serializeBoardExportJson(boards));
        expect(parsed).toEqual(createBoardExportData(boards));
    });
});
