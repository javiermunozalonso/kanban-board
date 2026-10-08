import process from 'node:process';
import { defineConfig, devices } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDirectory = fileURLToPath(new URL('../backend/', import.meta.url));
const isolatedDatabaseDirectory = mkdtempSync(join(tmpdir(), 'kanban-playwright-'));
const apiPort = Number(process.env.PW_API_PORT || 8173);
const frontendPort = Number(process.env.PW_FRONTEND_PORT || 4173);
const apiBaseUrl = `http://127.0.0.1:${apiPort}/api`;
const frontendBaseUrl = `http://127.0.0.1:${frontendPort}`;
process.env.PW_API_BASE_URL = apiBaseUrl;

export default defineConfig({
    testDir: './e2e',
    outputDir: join(isolatedDatabaseDirectory, 'playwright-results'),
    fullyParallel: false,
    workers: 1,
    reporter: 'list',
    use: {
        ...devices['Desktop Chrome'],
        baseURL: frontendBaseUrl,
        trace: 'retain-on-failure',
    },
    webServer: [
        {
            command: `env -u PYTHONPATH uv --project "${backendDirectory}" run --python 3.13 uvicorn app.main:app --app-dir "${backendDirectory}" --host 127.0.0.1 --port ${apiPort}`,
            cwd: isolatedDatabaseDirectory,
            url: `${apiBaseUrl}/boards`,
            reuseExistingServer: false,
            timeout: 120_000,
        },
        {
            command: `npm run dev -- --host 127.0.0.1 --port ${frontendPort}`,
            env: { VITE_API_BASE_URL: apiBaseUrl },
            url: frontendBaseUrl,
            reuseExistingServer: false,
            timeout: 120_000,
        },
    ],
});
