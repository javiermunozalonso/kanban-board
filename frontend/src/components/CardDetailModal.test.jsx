import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getBoard, getCard, listCardObservations, moveCard, updateCard } from '../services/api';
import CardDetailModal from './CardDetailModal';

vi.mock('../services/api', () => ({
    getBoard: vi.fn(),
    getCard: vi.fn(),
    moveCard: vi.fn(),
    updateCard: vi.fn(),
    listCardObservations: vi.fn(),
    createCardObservation: vi.fn(),
    updateCardObservation: vi.fn(),
    deleteCardObservation: vi.fn(),
}));

const columns = [
    { id: 'todo', title: 'To Do', cards: [{ id: 'card-1' }] },
    { id: 'doing', title: 'In Progress', cards: [{ id: 'other-1' }, { id: 'other-2' }] },
];

const card = {
    id: 'card-1',
    column_id: 'todo',
    title: 'Write tests',
    description: 'Cover card movement',
    audit_logs: [],
};

function renderModal(onUpdate = vi.fn()) {
    return render(
        <CardDetailModal
            cardId="card-1"
            boardId="board-1"
            columns={columns}
            onClose={vi.fn()}
            onUpdate={onUpdate}
        />,
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    getCard.mockResolvedValue(card);
    getBoard.mockResolvedValue({ id: 'board-1', columns });
    moveCard.mockResolvedValue({});
    updateCard.mockResolvedValue({});
    listCardObservations.mockResolvedValue([]);
});

afterEach(cleanup);

describe('CardDetailModal column editing', () => {
    it('opens observations in their own modal from the card detail', async () => {
        renderModal();
        fireEvent.click(await screen.findByRole('button', { name: /observations/i }));

        expect(await screen.findByRole('dialog', { name: 'Card observations' })).toBeTruthy();
        expect(listCardObservations).toHaveBeenCalledWith('card-1');
    });

    it('shows the current column selected and the board columns as options', async () => {
        renderModal();
        fireEvent.click(await screen.findByRole('button', { name: /edit/i }));

        const columnSelect = screen.getByLabelText('Column');
        expect(columnSelect.value).toBe('todo');
        expect(screen.getByRole('option', { name: 'To Do' })).toBeTruthy();
        expect(screen.getByRole('option', { name: 'In Progress' })).toBeTruthy();
    });

    it('moves the card to the end of the selected column and refreshes its audit trail', async () => {
        const onUpdate = vi.fn();
        getCard
            .mockResolvedValueOnce(card)
            .mockResolvedValueOnce({
                ...card,
                column_id: 'doing',
                audit_logs: [{
                    id: 'audit-1',
                    field_changed: 'column',
                    old_value: 'To Do',
                    new_value: 'In Progress',
                    changed_at: '2026-10-07T10:00:00Z',
                }],
            });
        renderModal(onUpdate);
        fireEvent.click(await screen.findByRole('button', { name: /edit/i }));
        fireEvent.change(screen.getByLabelText('Column'), { target: { value: 'doing' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(moveCard).toHaveBeenCalledWith('card-1', {
            column_id: 'doing',
            position: 2,
        }));
        expect(updateCard).not.toHaveBeenCalled();
        expect(onUpdate).toHaveBeenCalledOnce();
        expect(await screen.findByText('column')).toBeTruthy();
    });

    it('saves title and description together with a column change', async () => {
        getCard
            .mockResolvedValueOnce(card)
            .mockResolvedValueOnce({
                ...card,
                title: 'Updated title',
                description: 'Updated description',
                column_id: 'doing',
            });
        renderModal();
        fireEvent.click(await screen.findByRole('button', { name: /edit/i }));
        fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated title' } });
        fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Updated description' } });
        fireEvent.change(screen.getByLabelText('Column'), { target: { value: 'doing' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(moveCard).toHaveBeenCalledWith('card-1', {
            column_id: 'doing',
            position: 2,
        }));
        expect(updateCard).toHaveBeenCalledWith('card-1', {
            title: 'Updated title',
            description: 'Updated description',
        });
    });

    it('does not request a move when the column is unchanged', async () => {
        renderModal();
        fireEvent.click(await screen.findByRole('button', { name: /edit/i }));
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(screen.getByText('Write tests')).toBeTruthy());
        expect(moveCard).not.toHaveBeenCalled();
        expect(getBoard).not.toHaveBeenCalled();
    });

    it('refreshes persisted values and reports an error if one save operation fails', async () => {
        const onUpdate = vi.fn();
        const persistedCard = { ...card, title: 'Persisted title' };
        getCard.mockResolvedValueOnce(card).mockResolvedValueOnce(persistedCard);
        moveCard.mockRejectedValueOnce(new Error('Move failed'));
        renderModal(onUpdate);
        fireEvent.click(await screen.findByRole('button', { name: /edit/i }));
        fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Persisted title' } });
        fireEvent.change(screen.getByLabelText('Column'), { target: { value: 'doing' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(await screen.findByRole('alert')).toBeTruthy();
        expect(screen.getByLabelText('Title').value).toBe('Persisted title');
        expect(screen.getByLabelText('Column').value).toBe('todo');
        expect(updateCard).toHaveBeenCalledWith('card-1', { title: 'Persisted title' });
        expect(moveCard).toHaveBeenCalledWith('card-1', { column_id: 'doing', position: 2 });
        expect(onUpdate).toHaveBeenCalledOnce();
    });

    it('refuses a move when the selected column no longer exists', async () => {
        getBoard.mockResolvedValueOnce({ id: 'board-1', columns: [columns[0]] });
        renderModal();
        fireEvent.click(await screen.findByRole('button', { name: /edit/i }));
        fireEvent.change(screen.getByLabelText('Column'), { target: { value: 'doing' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(await screen.findByRole('alert')).toBeTruthy();
        expect(moveCard).not.toHaveBeenCalled();
        expect(updateCard).not.toHaveBeenCalled();
    });
});
