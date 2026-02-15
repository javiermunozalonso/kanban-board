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
