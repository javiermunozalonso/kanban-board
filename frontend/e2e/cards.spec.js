import process from 'node:process';
import { expect, test } from '@playwright/test';

const apiBaseUrl = process.env.PW_API_BASE_URL || 'http://127.0.0.1:8173/api';
let boardId;

test.beforeEach(async ({ request }) => {
    const boardResponse = await request.post(`${apiBaseUrl}/boards`, {
        data: { title: `Playwright board ${Date.now()}`, description: 'E2E fixture' },
    });
    expect(boardResponse.ok()).toBeTruthy();
    const board = await boardResponse.json();
    boardId = board.id;

    const cardResponse = await request.post(
        `${apiBaseUrl}/columns/${board.columns[0].id}/cards`,
        { data: { title: 'Original card title', description: 'Original description' } },
    );
    expect(cardResponse.ok()).toBeTruthy();
});

test.afterEach(async ({ request }) => {
    if (boardId) {
        const response = await request.delete(`${apiBaseUrl}/boards/${boardId}`);
        expect(response.ok()).toBeTruthy();
    }
    boardId = undefined;
});

test('gestiona observaciones independientes y con seguimiento temporal desde el detalle de tarjeta', async ({ page }) => {
    await page.goto(`/board/${boardId}`);
    await page.getByTitle('View details').click();
    await page.getByRole('button', { name: /observations/i }).click();

    const observations = page.getByRole('dialog', { name: 'Card observations' });
    await observations.getByLabel('New observation').fill('Initial manual note');
    await observations.getByRole('button', { name: 'Add observation' }).click();
    await expect(observations.getByText('Initial manual note')).toBeVisible();
    await expect(observations.locator('time')).toHaveAttribute('datetime', /.+/);

    await observations.getByRole('button', { name: 'Edit Initial manual note' }).click();
    await observations.getByLabel('Edit observation').fill('Updated manual note');
    await observations.getByRole('button', { name: 'Save observation' }).click();
    await expect(observations.getByText('Updated manual note')).toBeVisible();

    await observations.getByRole('button', { name: 'Delete Updated manual note' }).click();
    await expect(observations.getByText('No observations yet.')).toBeVisible();
    await observations.getByRole('button', { name: 'Close observations' }).click();

    await page.getByRole('button', { name: /audit history/i }).click();
    const audit = page.getByRole('dialog', { name: 'Card audit history' });
    await expect(audit.getByText('created', { exact: true })).toBeVisible();
    await expect(audit.getByText('Initial manual note')).toHaveCount(0);
    await expect(audit.getByText('Updated manual note')).toHaveCount(0);
});

test('edita campos funcionales y registra los cambios en el historial de auditoría independiente', async ({ page }) => {
    await page.goto(`/board/${boardId}`);
    await page.getByTitle('View details').click();
    await page.getByRole('button', { name: /edit/i }).click();

    await page.getByLabel('Title').fill('Updated card title');
    await page.getByLabel('Description').fill('Updated description');
    await page.getByLabel('Column').selectOption({ label: 'WORK IN PROGRESS' });
    await page.getByLabel('Position').fill('0');
    await expect(page.getByLabel(/card id/i)).toHaveCount(0);
    await expect(page.getByLabel(/created at/i)).toHaveCount(0);
    await expect(page.getByLabel(/updated at/i)).toHaveCount(0);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Updated card title' })).toBeVisible();
    await expect(page.locator('.modal').first().getByText('Updated description', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /audit history/i }).click();

    const audit = page.getByRole('dialog', { name: 'Card audit history' });
    for (const field of ['title', 'description', 'column', 'position']) {
        await expect(audit.locator('.audit-field', { hasText: new RegExp(`^${field}$`) })).toBeVisible();
    }
    await expect(audit.getByText('Original card title')).toBeVisible();
    await expect(audit.getByText('Updated card title')).toBeVisible();
    await expect(audit.getByText('Original description')).toBeVisible();
    await expect(audit.getByText('Updated description')).toBeVisible();
});
