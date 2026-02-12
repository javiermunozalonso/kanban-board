# Kanban Board — Walkthrough

## What Was Built

A full-stack Kanban board management application comprising three sub-projects:

### Backend (`backend/`)

- **FastAPI** REST API with async SQLAlchemy + SQLite
- 4 ORM models: `Board`, `Column`, `Card`, `CardAuditLog`
- CRUD endpoints for boards, columns, and cards
- Automatic audit trail on every card field change
- Two dashboard endpoints (atomic per-board + general aggregate)
- CORS and error handling middleware

### Frontend (`frontend/`)

- **React 18** SPA built with Vite
- **3 pages**: BoardList, BoardDetail, Dashboard
- **7 components**: Column (collapsible), CardItem (draggable), CardDetailModal (audit trail), CreateBoardModal, CreateCardModal, BoardDashboard (Recharts)
- Drag & drop via `@dnd-kit`
- Charts via `Recharts` (bar, pie)
- Dark theme with glassmorphism, gradients, and micro-animations

### MCP Tool (`mcp-tool/`)

- **13 tools** covering all API operations
- Stdio transport using the MCP SDK
- Tools: `list_boards`, `create_board`, `get_board`, `update_board`, `delete_board`, `create_card`, `update_card`, `move_card`, `delete_card`, `get_card_audit`, `manage_columns`, `get_board_dashboard`, `get_general_dashboard`

## What Was Tested

| Check | Result |
|-------|--------|
| Backend — 18 integration tests (pytest) | ✅ All passed |
| Frontend — Vite production build (741 modules) | ✅ Success |
| MCP Tool — Server import validation | ✅ OK |
| Backend — Server startup + health endpoint | ✅ `{"status":"ok"}` |

## How to Run

```bash
# Backend
cd backend && uv run uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev

# MCP Tool
cd mcp-tool && uv run kanban-mcp
```
