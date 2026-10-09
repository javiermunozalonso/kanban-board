import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { getBoard, listBoards } from '../services/api';
import * as boardExport from '../utils/boardExport';
import BoardListPage from './BoardListPage';

vi.mock('../services/api', () => ({
    listBoards: vi.fn(), getBoard: vi.fn(), createBoard: vi.fn(), deleteBoard: vi.fn(), updateBoard: vi.fn(),
}));
vi.mock('../components/CreateBoardModal', () => ({ default: () => null }));

const boardList = [
    { id: 'active-1', title: 'Active board', status: 'active' },
    { id: 'dormant-1', title: 'Dormant board', status: 'dormant' },
];
const details = {
    'active-1': { ...boardList[0], columns: [{ id: 'column-a', title: 'WORK IN PROGRESS', cards: [{ id: 'card-a', title: 'Task A' }] }] },
    'dormant-1': { ...boardList[1], columns: [{ id: 'column-d', title: 'DONE', cards: [{ id: 'card-d', title: 'Task D' }] }] },
};
let downloadedBlob;
let downloadedFilename;
let anchorClick;

function renderPage() {
    return render(<MemoryRouter><BoardListPage /></MemoryRouter>);
}

beforeEach(() => {
    vi.clearAllMocks();
    downloadedBlob = null;
    downloadedFilename = null;
    anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click() {
        downloadedFilename = this.download;
    });
    Object.defineProperty(URL, 'createObjectURL', {
        configurable: true,
        value: vi.fn((blob) => { downloadedBlob = blob; return 'blob:export'; }),
    });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    listBoards.mockImplementation((status) => Promise.resolve(
        status ? boardList.filter((board) => board.status === status) : boardList,
    ));
    getBoard.mockImplementation((id) => Promise.resolve(details[id]));
});

afterEach(() => {
    cleanup();
    anchorClick.mockRestore();
});

describe('BoardListPage exports', () => {
    it.each([
        ['All', null, ['active-1', 'dormant-1']],
        ['Active', 'active', ['active-1']],
        ['Dormant', 'dormant', ['dormant-1']],
    ])('exports only boards shown by the %s filter', async (filterName, status, expectedIds) => {
        renderPage();
        await screen.findByText('Active board');
        if (filterName !== 'All') {
            fireEvent.click(screen.getByRole('button', { name: filterName }));
            await waitFor(() => expect(listBoards).toHaveBeenLastCalledWith(status));
        }

        fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));
        await waitFor(() => expect(anchorClick).toHaveBeenCalled());

        expect(getBoard.mock.calls.map(([id]) => id)).toEqual(expectedIds);
        expect(downloadedFilename).toBe(`boards-${status || 'all'}.csv`);
        expect(downloadedBlob.type).toBe('text/csv;charset=utf-8');
    });

    it.each([
        ['XLSX', 'boards-all.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        ['JSON', 'boards-all.json', 'application/json;charset=utf-8'],
    ])('downloads %s with the expected file type', async (format, filename, mimeType) => {
        renderPage();
        await screen.findByText('Active board');
        fireEvent.click(screen.getByRole('button', { name: `Export ${format}` }));
        await waitFor(() => expect(anchorClick).toHaveBeenCalled());

        expect(downloadedFilename).toBe(filename);
        expect(downloadedBlob.type).toBe(mimeType);
        expect(getBoard).toHaveBeenCalledTimes(2);
        if (format === 'JSON') {
            const data = JSON.parse(await downloadedBlob.text());
            expect(Object.keys(data)).toEqual(['tasks', 'aggregations']);
            expect(data.tasks.map((task) => task.board_id)).toEqual(['active-1', 'dormant-1']);
            expect(data.aggregations.boards.map((board) => board.board_status)).toEqual(['active', 'dormant']);
        }
    });

    it('disables exports when the visible filter has no boards', async () => {
        listBoards.mockResolvedValue([]);
        renderPage();

        await screen.findByText('No boards yet');
        for (const format of ['CSV', 'XLSX', 'JSON']) {
            expect(screen.getByRole('button', { name: `Export ${format}` }).disabled).toBe(true);
        }
        expect(getBoard).not.toHaveBeenCalled();
    });

    it('shows progress and disables export actions until the file is ready', async () => {
        let resolveDetails;
        getBoard.mockReturnValue(new Promise((resolve) => { resolveDetails = resolve; }));
        renderPage();
        await screen.findByText('Active board');
        fireEvent.click(screen.getByRole('button', { name: 'Export JSON' }));

        expect((await screen.findByRole('status')).textContent).toContain('Preparing JSON export');
        for (const format of ['CSV', 'XLSX', 'JSON']) {
            expect(screen.getByRole('button', { name: `Export ${format}` }).disabled).toBe(true);
        }

        resolveDetails(details['active-1']);
        await waitFor(() => expect(anchorClick).toHaveBeenCalled());
    });

    it('does not download when file generation fails', async () => {
        const serializeJson = vi.spyOn(boardExport, 'serializeBoardExportJson')
            .mockImplementationOnce(() => { throw new Error('serialization failed'); });
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        renderPage();
        await screen.findByText('Active board');
        fireEvent.click(screen.getByRole('button', { name: 'Export JSON' }));

        expect((await screen.findByRole('alert')).textContent).toContain('No file was downloaded');
        expect(anchorClick).not.toHaveBeenCalled();
        serializeJson.mockRestore();
        consoleError.mockRestore();
    });

    it('does not download a partial file when any board detail fails', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        getBoard.mockRejectedValueOnce(new Error('request failed'));
        renderPage();
        await screen.findByText('Active board');
        fireEvent.click(screen.getByRole('button', { name: 'Export JSON' }));

        expect((await screen.findByRole('alert')).textContent).toContain('No file was downloaded');
        expect(anchorClick).not.toHaveBeenCalled();
        consoleError.mockRestore();
    });
});
