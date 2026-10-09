import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import { createBoardExportWorkbook } from './boardExport';

describe('createBoardExportWorkbook', () => {
    it('creates task and dashboard worksheets with combined and per-board values', async () => {
        const workbook = await createBoardExportWorkbook([
            {
                id: 'board-1', title: 'Alpha', status: 'active',
                columns: [
                    { id: 'column-1', title: 'WORK IN PROGRESS', cards: [{ id: 'card-1', title: 'Task' }] },
                    { id: 'column-2', title: 'DONE', cards: [{ id: 'card-2', title: 'Finished' }] },
                ],
            },
            { id: 'board-2', title: 'Beta', status: 'dormant', columns: [] },
        ]);
        const buffer = await workbook.xlsx.writeBuffer();
        const parsed = new ExcelJS.Workbook();
        await parsed.xlsx.load(buffer);

        expect(parsed.worksheets.map((sheet) => sheet.name)).toEqual(['Tasks', 'Dashboard']);
        expect(parsed.getWorksheet('Tasks').getRow(1).values).toEqual([
            undefined, 'card_id', 'title', 'description', 'position', 'created_at', 'updated_at',
            'board_id', 'board_title', 'board_status', 'column_id', 'column_title',
        ]);
        expect(parsed.getWorksheet('Tasks').rowCount).toBe(3);
        const dashboard = parsed.getWorksheet('Dashboard');
        expect(dashboard.getCell('A2').value).toBe('total_cards');
        expect(dashboard.getCell('B2').value).toBe(2);
        expect(dashboard.getCell('A10').value).toBe('board_id');
        expect(dashboard.getCell('A11').value).toBe('board-1');
        expect(dashboard.getCell('G11').value).toBe(1);
        expect(dashboard.getCell('H11').value).toBe(1);
        expect(dashboard.getCell('A12').value).toBe('board-2');
        expect(dashboard.getCell('D12').value).toBe(0);
    });
});
