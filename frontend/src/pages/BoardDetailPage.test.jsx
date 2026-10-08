import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getBoard } from '../services/api';
import BoardDetailPage from './BoardDetailPage';

const { captureDndContextProps } = vi.hoisted(() => ({
    captureDndContextProps: vi.fn(),
}));

vi.mock('@dnd-kit/core', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        DndContext: (props) => {
            captureDndContextProps(props);
            return props.children;
        },
        DragOverlay: ({ children }) => (
            <div data-testid="drag-overlay">{children}</div>
        ),
    };
});

vi.mock('../services/api', () => ({
    getBoard: vi.fn(),
    createCard: vi.fn(),
    deleteCard: vi.fn(),
    moveCard: vi.fn(),
    getBoardDashboard: vi.fn(),
}));

vi.mock('../components/Column', () => ({
    default: () => <div data-testid="column" />,
}));

const board = {
    id: 'board-1',
    title: 'Wide board',
    status: 'active',
    columns: [{ id: 'column-1', title: 'Backlog', cards: [] }],
};

function renderBoard() {
    return render(
        <MemoryRouter initialEntries={['/board/board-1']}>
            <Routes>
                <Route path="/board/:boardId" element={<BoardDetailPage />} />
            </Routes>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    getBoard.mockResolvedValue(board);
});

afterEach(cleanup);

describe('BoardDetailPage drag auto-scroll', () => {
    it('restricts horizontal auto-scroll to the edge zone while preserving vertical auto-scroll', async () => {
        renderBoard();

        await waitFor(() => expect(captureDndContextProps).toHaveBeenCalled());

        expect(captureDndContextProps.mock.lastCall[0].autoScroll).toEqual({
            threshold: { x: 0.08, y: 0.2 },
        });
    });

    it('keeps the dragged card visible in an overlay while crossing columns', async () => {
        renderBoard();

        await waitFor(() => expect(captureDndContextProps).toHaveBeenCalled());

        const onDragStart = captureDndContextProps.mock.lastCall[0].onDragStart;
        expect(onDragStart).toBeTypeOf('function');

        act(() => {
            onDragStart({
                active: { data: { current: { card: { id: 'card-1', title: 'Follow the pointer' } } } },
            });
        });

        expect(screen.getByTestId('drag-overlay').textContent).toContain('Follow the pointer');
    });
});
