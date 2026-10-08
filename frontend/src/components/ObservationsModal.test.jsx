import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createCardObservation,
    deleteCardObservation,
    listCardObservations,
    updateCardObservation,
} from '../services/api';
import ObservationsModal from './ObservationsModal';

vi.mock('../services/api', () => ({
    createCardObservation: vi.fn(),
    deleteCardObservation: vi.fn(),
    listCardObservations: vi.fn(),
    updateCardObservation: vi.fn(),
}));

const observations = [
    { id: 'obs-1', content: 'First note', created_at: '2026-10-08T10:00:00Z', updated_at: '2026-10-08T10:00:00Z' },
    { id: 'obs-2', content: 'Second note', created_at: '2026-10-08T09:00:00Z', updated_at: '2026-10-08T09:00:00Z' },
];

beforeEach(() => {
    vi.clearAllMocks();
    listCardObservations.mockResolvedValue(observations);
    createCardObservation.mockImplementation(async (_cardId, data) => ({ id: 'obs-3', ...data }));
    updateCardObservation.mockImplementation(async (_cardId, _id, data) => ({ id: 'obs-1', ...data }));
    deleteCardObservation.mockResolvedValue(undefined);
});

afterEach(cleanup);

describe('ObservationsModal', () => {
    it('lists and creates observations without involving audit entries', async () => {
        render(<ObservationsModal cardId="card-1" onClose={vi.fn()} />);

        expect(await screen.findByText('First note')).toBeTruthy();
        expect(screen.getByText('Second note')).toBeTruthy();
        expect(listCardObservations).toHaveBeenCalledWith('card-1');

        fireEvent.change(screen.getByLabelText('New observation'), {
            target: { value: 'Third note' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Add observation' }));

        await waitFor(() => expect(createCardObservation).toHaveBeenCalledWith('card-1', {
            content: 'Third note',
        }));
        expect(await screen.findByText('Third note')).toBeTruthy();
        expect(screen.queryByText(/audit/i)).toBeNull();
    });

    it('edits and deletes an observation', async () => {
        render(<ObservationsModal cardId="card-1" onClose={vi.fn()} />);
        await screen.findByText('First note');

        fireEvent.click(screen.getByRole('button', { name: 'Edit First note' }));
        fireEvent.change(screen.getByLabelText('Edit observation'), {
            target: { value: 'Edited note' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Save observation' }));
        await waitFor(() => expect(updateCardObservation).toHaveBeenCalledWith(
            'card-1', 'obs-1', { content: 'Edited note' },
        ));
        expect(await screen.findByText('Edited note')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: 'Delete Second note' }));
        await waitFor(() => expect(deleteCardObservation).toHaveBeenCalledWith('card-1', 'obs-2'));
        await waitFor(() => expect(screen.queryByText('Second note')).toBeNull());
    });
});
