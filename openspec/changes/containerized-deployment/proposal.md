## Why

El repositorio permite iniciar frontend, API y MCP localmente, pero no contiene imágenes ni configuración Docker para desplegarlos de forma reproducible. Se necesitan dos topologías seleccionables: una web (frontend + backend API) y otra que añada la interfaz MCP, manteniendo el protocolo stdio que utilizan los agentes.

## What Changes

- Añadir Dockerfiles multistage para frontend, backend API y adaptador MCP, en los directorios de sus proyectos respectivos.
- Añadir un `docker-compose.yml` en la raíz con un modo base (frontend + API) y un modo opcional con MCP.
- Mantener el backend como una capacidad lógica con interfaces REST y MCP; MCP seguirá comunicándose por stdio y delegando las operaciones en la API.
- Configurar las direcciones de API necesarias para comunicación entre contenedores y desde el navegador, y conservar los datos SQLite mediante almacenamiento persistente.
- Documentar construcción, arranque, selección de modo, conexión del cliente MCP y parada de los despliegues.

## Capabilities

### New Capabilities
- `containerized-deployment`: construcción y ejecución reproducible de las topologías Docker web y web+MCP.

### Modified Capabilities
- Ninguna. Los contratos funcionales REST y MCP existentes se mantienen; la nueva capacidad define empaquetado y operación del despliegue.

## Impact

- Archivos previstos: `frontend/Dockerfile`, `backend/Dockerfile`, `mcp-tool/Dockerfile`, `docker-compose.yml` y documentación de uso.
- Componentes: React/Vite, FastAPI/SQLAlchemy/SQLite y servidor MCP Python.
- La API usa actualmente SQLite con ruta relativa `./kanban.db`; el despliegue deberá conservar ese archivo en un volumen persistente.
- El frontend y el MCP tienen actualmente URLs de API fijadas a `http://localhost:8000/api`; la ejecución en contenedores requiere configuración que distinga el acceso del navegador del acceso interno MCP→API.
- MCP usa actualmente stdio (`uv run kanban-mcp`). El modo ampliado deberá permitir que un cliente agente arranque el proceso en el contenedor con stdin/stdout conectados; no se publicará MCP como servicio de red.
- No se sustituye ni elimina el flujo de desarrollo local con tmux.
