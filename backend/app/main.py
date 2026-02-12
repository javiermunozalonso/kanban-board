"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import boards, cards, columns, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    await init_db()
    yield


app = FastAPI(
    title="Kanban Board API",
    description="REST API for managing Kanban boards, columns, and cards.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(boards.router)
app.include_router(columns.router)
app.include_router(cards.router)
app.include_router(dashboard.router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
