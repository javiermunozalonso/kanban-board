import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { listBoards } from '../services/api';
import BoardListPage from './BoardListPage';

vi.mock('../services/api', () => ({
    listBoards: vi.fn(), getBoard: vi.fn(), createBoard: vi.fn(), deleteBoard: vi.fn(), updateBoard: vi.fn(),
}));
vi.mock('../components/CreateBoardModal', () => ({ default: () => null }));

afterEach(() => cleanup());

describe('BoardListPage create action', () => {
    it.each([
        ['boards exist', [{ id: 'board-1', title: 'Existing board', status: 'active' }]],
        ['the list is empty', []],
    ])('shows one Create Board action when %s', async (_state, boards) => {
        listBoards.mockResolvedValue(boards);
        render(<MemoryRouter><BoardListPage /></MemoryRouter>);

        await screen.findByRole('button', { name: /Create Board/ });
        if (boards.length === 0) await screen.findByText('No boards yet');

        expect(screen.getAllByRole('button', { name: /Create Board/ })).toHaveLength(1);
        expect(screen.queryByRole('button', { name: /New Board/ })).toBeNull();
    });
});
