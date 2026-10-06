# Kanban Board

A full-stack Kanban board management application with a **React** frontend, **Python (FastAPI)** backend, and an **MCP tool** for agentic control.

## Architecture

| Component | Technology | Directory |
|-----------|-----------|-----------|
| Frontend | React 18 + Vite | `frontend/` |
| Backend | FastAPI + SQLAlchemy + SQLite | `backend/` |
| MCP Tool | Python MCP SDK | `mcp-tool/` |

## Quick Start

### Backend

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### MCP Tool

```bash
cd mcp-tool
uv sync
uv run kanban-mcp
```

## Docker Deployment

Docker Engine and the Docker Compose plugin are required. The Compose file provides two modes: the default web stack (API + frontend) and an optional MCP adapter that remains an stdio process.

### Web stack (API + frontend)

```bash
docker compose up --build -d
docker compose ps
```

Open <http://localhost:8080>. The API is published at <http://localhost:8000/api>. To use different host ports, set `FRONTEND_PORT` and/or `API_PORT` (for example, in a root `.env` file). The frontend build argument `VITE_API_BASE_URL` must be a URL reachable by the user's browser; its default is `http://localhost:8000/api`. Rebuild the frontend after changing it:

```bash
docker compose build --no-cache frontend
docker compose up -d
```

SQLite is stored in the named `kanban-data` volume, mounted at `/data` in the API container. It survives container recreation. `docker compose down` preserves it; `docker compose down -v` deletes the database and all its data.

### Add the MCP stdio adapter

Keep the web stack running, then launch MCP as an interactive process from the repository root:

```bash
docker compose --profile mcp run --rm -i mcp
```

Configure the agent/client to run that command with the repository root as its working directory and connect to the process stdin/stdout. The MCP adapter uses `KANBAN_API_BASE` to reach `http://backend-api:8000/api` on the Compose network. It does not expose or listen on a network port. The default web stack does not start MCP.

### Stop

```bash
docker compose down
```

### Configuration variables

| Variable | Default | Used by |
|----------|---------|---------|
| `FRONTEND_PORT` | `8080` | Host port for the web UI |
| `API_PORT` | `8000` | Host port for the REST API |
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | Browser-side frontend API URL, baked in at build time |
| `KANBAN_API_BASE` | `http://backend-api:8000/api` | MCP-to-API URL on the internal Compose network |

## Unified Startup (Tmux)

To launch **Backend**, **Frontend**, and **MCP Tool** simultaneously in a split-pane tmux session:

```bash
./start_stack.sh
```

**Commands:**

- **Stop all**: `tmux kill-session -t kanban-stack`
- **Detach**: `Ctrl+b` then `d`
- **Re-attach**: `./start_stack.sh` or `tmux attach -t kanban-stack`

## Documentation

- [Implementation Plan](planning/implementation_plan.md)
- [Technical Documentation](planning/technical_doc.md)
- [Product Documentation](planning/product_doc.md)
- [Task Tracker](planning/task.md)
