import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Column from './Column';

const { useDroppable } = vi.hoisted(() => ({
    useDroppable: vi.fn(),
}));

vi.mock('@dnd-kit/core', () => ({ useDroppable }));
vi.mock('@dnd-kit/sortable', () => ({
    SortableContext: ({ children }) => children,
    verticalListSortingStrategy: vi.fn(),
}));
vi.mock('./CardItem', () => ({ default: () => null }));
vi.mock('./CreateCardModal', () => ({ default: () => null }));

describe('Column drop target', () => {
    beforeEach(() => {
        useDroppable.mockReturnValue({ setNodeRef: vi.fn(), isOver: true });
    });

    it('highlights the column when the drag target is over it', () => {
        const { container } = render(
            <Column
                column={{ id: 'done', title: 'DONE', cards: [] }}
                onCreateCard={vi.fn()}
                onDeleteCard={vi.fn()}
                onViewCardDetail={vi.fn()}
            />,
        );

        expect(screen.getByText('DONE').closest('.kanban-column').style.boxShadow)
            .toBe('0 0 20px rgba(16, 185, 129, 0.12)');
        expect(container.querySelector('.column-cards')).not.toBeNull();
    });
});
