# Kanban Board Application — Task List

## Phase 0: Planning & Documentation

- [x] Create implementation plan (`implementation_plan.md`)
- [x] Create task execution order (`task.md`)
- [x] Create technical documentation (`technical_doc.md`)
- [x] Create non-technical documentation (`product_doc.md`)
- [x] Create data model diagram
- [x] User approval of plan

## Phase 1: Project Scaffolding

- [x] Initialize Python backend project (`uv` + FastAPI)
- [x] Initialize React frontend project (Vite + React)
- [x] Initialize MCP tool project
- [x] Define project-level README

## Phase 2: Backend — Data Layer

- [x] Define SQLAlchemy models (Board, Column, Card, CardAuditLog)
- [x] Configure SQLite database with async support
- [x] Create Alembic migration setup
- [x] Generate initial migration

## Phase 3: Backend — API Layer

- [x] Implement Board CRUD endpoints
- [x] Implement Column CRUD endpoints
- [x] Implement Card CRUD endpoints (including move between columns)
- [x] Implement Card audit trail endpoint
- [x] Implement Board dashboard endpoint (atomic)
- [x] Implement General dashboard endpoint (all active boards)
- [x] Add request validation (Pydantic schemas)
- [x] Add error handling middleware
- [x] Add CORS configuration
- [x] Implement Global Board endpoint (`/api/dashboard/global-board`)

## Phase 4: Backend — Tests

- [x] Write unit tests for models
- [x] Write integration tests for API endpoints
- [x] Verify all tests pass

## Phase 5: Frontend — Foundation

- [x] Set up project structure (components, pages, hooks, services)
- [x] Configure API client (axios/fetch)
- [x] Configure routing (React Router)
- [x] Design system / global styles / theme

## Phase 6: Frontend — Board Management

- [x] Board list page (active / dormant toggle, delete)
- [x] Board creation form
- [x] Board detail view with columns
- [x] Column collapsing functionality
- [x] Column customization (add/remove/rename)

## Phase 7: Frontend — Card Management

- [x] Card component inside columns
- [x] Drag & drop between columns
- [x] Card creation form
- [x] Card detail / edit view
- [x] Card audit trail view
- [x] Card deletion

## Phase 8: Frontend — Dashboards & Views

- [x] Atomic dashboard per board
- [x] General dashboard for all active boards
- [x] Global Board page (all cards from active boards grouped by column)
- [x] Column-based card border colors (purple=Backlog, blue=WIP, green=Done, red=Stopped, gray=Archive)
- [x] Column header color accents

## Phase 9: MCP Tool

- [x] Define MCP tool server (stdio transport)
- [x] Implement tools: board CRUD, card CRUD, column management, dashboards
- [ ] Write MCP tool tests

## Phase 10: Integration & Verification

- [x] End-to-end smoke test (backend + frontend)
- [ ] Browser-based UI verification
- [x] MCP tool verification
- [ ] Final documentation review
