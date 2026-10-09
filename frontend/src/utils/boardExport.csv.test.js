import { describe, expect, it } from 'vitest';
import { serializeBoardTasksCsv } from './boardExport';

describe('serializeBoardTasksCsv', () => {
    it('writes flat task rows with origin fields and escapes CSV-special values', () => {
        expect(serializeBoardTasksCsv([{
            card_id: 'card-1', title: 'Task, one', description: 'Said "go"\nnext', position: 0,
            created_at: '2026-01-01', updated_at: '2026-01-02',
            board_id: 'board-1', board_title: 'Alpha', board_status: 'active',
            column_id: 'column-1', column_title: 'WORK IN PROGRESS',
        }])).toBe([
            'card_id,title,description,position,created_at,updated_at,board_id,board_title,board_status,column_id,column_title',
            'card-1,"Task, one","Said ""go""\nnext",0,2026-01-01,2026-01-02,board-1,Alpha,active,column-1,WORK IN PROGRESS',
        ].join('\r\n'));
    });

    it('returns the header for an empty task set', () => {
        expect(serializeBoardTasksCsv([]).split('\r\n')).toHaveLength(1);
    });

    it('neutralizes spreadsheet formulas in user-controlled text', () => {
        const csv = serializeBoardTasksCsv([{ title: '=HYPERLINK("https://example.com")' }]);
        expect(csv.split('\r\n')[1]).toContain(String.raw`'=HYPERLINK(""https://example.com"")`);
    });
});
