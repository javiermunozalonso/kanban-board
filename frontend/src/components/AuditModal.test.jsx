import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AuditModal from './AuditModal';

afterEach(cleanup);

describe('AuditModal', () => {
    it('shows audit changes from newest to oldest with their values and timestamps', () => {
        render(
            <AuditModal
                onClose={vi.fn()}
                auditLogs={[
                    {
                        id: 'old',
                        field_changed: 'description',
                        old_value: 'First',
                        new_value: 'Second',
                        changed_at: '2026-10-07T10:00:00Z',
                    },
                    {
                        id: 'new',
                        field_changed: 'title',
                        old_value: 'Draft',
                        new_value: 'Final',
                        changed_at: '2026-10-08T10:00:00Z',
                    },
                ]}
            />,
        );

        const entries = screen.getAllByRole('article');
        expect(entries).toHaveLength(2);
        expect(entries[0].textContent).toContain('title');
        expect(entries[1].textContent).toContain('description');
        expect(screen.getAllByText('Previous value')).toHaveLength(2);
        expect(screen.getByText('Draft')).toBeTruthy();
        expect(screen.getByText('Final')).toBeTruthy();
        expect(screen.getByText('Second')).toBeTruthy();
        expect(entries[0].querySelector('time').getAttribute('datetime'))
            .toBe('2026-10-08T10:00:00Z');
    });

    it('shows an empty state when there are no audit events', () => {
        render(<AuditModal onClose={vi.fn()} />);

        expect(screen.getByText('No audit entries yet.')).toBeTruthy();
    });
});
