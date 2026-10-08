# Pruebas de navegador

Las pruebas E2E cubren recorridos de usuario para observaciones, edición avanzada y auditoría. Se ejecutan con el frontend y el backend levantados por Playwright; cada ejecución usa un directorio temporal nuevo como directorio de trabajo del backend, por lo que SQLite crea allí su base de datos y no reutiliza `backend/kanban.db`. Cada caso elimina el tablero de prueba al terminar.

## Requisitos y ejecución

Se necesitan Node.js, `uv` con Python 3.13 disponible y Chromium de Playwright. En una instalación nueva:

```sh
NODE_ENV=development npm ci --include=dev
npx playwright install chromium
npm run test:e2e
```

Vitest continúa separado y excluye `e2e/`; sus pruebas se ejecutan con `npm test`. Los puertos por defecto son `8173` para la API y `4173` para Vite. Se pueden cambiar con `PW_API_PORT` y `PW_FRONTEND_PORT`.

## Validación de la implementación

Validado el 8 de octubre de 2026:

| Comando | Resultado |
| --- | --- |
| `NODE_ENV=development npm run test:e2e` | 2 pruebas E2E aprobadas. |
| `NODE_ENV=development npm test` | 5 archivos y 15 pruebas aprobados. |
| `env -u PYTHONPATH uv --directory backend run --python 3.13 --extra dev pytest -q` | 22 pruebas aprobadas. |
| `NODE_ENV=development npm run build` | Compilación correcta; Vite avisa que el bundle principal supera 500 kB. |
| `npx eslint e2e/cards.spec.js playwright.config.js` | Correcto. |
| `openspec validate --all` | 11 elementos válidos, 0 fallidos. |

`npm run lint` global sigue reportando 4 errores y 1 aviso en `src/pages/BoardDetailPage.jsx` y `src/pages/BoardListPage.jsx`; no corresponden a los archivos E2E ni de configuración de Playwright de este cambio.
