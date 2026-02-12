"""Board CRUD and dashboard endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Board, Card, CardAuditLog, Column
from app.schemas import (
    BoardCreate,
    BoardDashboardResponse,
    BoardDetailResponse,
    BoardResponse,
    BoardUpdate,
    ColumnDetailResponse,
)

router = APIRouter(prefix="/api/boards", tags=["boards"])

DEFAULT_COLUMNS = [
    {"title": "BACKLOG", "position": 0},
    {"title": "WORK IN PROGRESS", "position": 1},
    {"title": "DONE", "position": 2},
    {"title": "STOPPED", "position": 3},
    {"title": "ARCHIVE", "position": 4},
]


@router.get("", response_model=list[BoardResponse])
async def list_boards(
    status: str | None = Query(None, pattern="^(active|dormant)$"),
    db: AsyncSession = Depends(get_db),
):
    """List all boards, optionally filtered by status."""
    query = select(Board).order_by(Board.created_at.desc())
    if status:
        query = query.where(Board.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=BoardDetailResponse, status_code=201)
async def create_board(data: BoardCreate, db: AsyncSession = Depends(get_db)):
    """Create a new board with default columns."""
    board = Board(title=data.title, description=data.description)
    db.add(board)
    await db.flush()

    for col_data in DEFAULT_COLUMNS:
        col = Column(board_id=board.id, **col_data)
        db.add(col)

    await db.flush()

    # Reload with columns
    result = await db.execute(
        select(Board)
        .options(selectinload(Board.columns).selectinload(Column.cards))
        .where(Board.id == board.id)
    )
    board = result.scalar_one()
    return _board_detail_response(board)


@router.get("/{board_id}", response_model=BoardDetailResponse)
async def get_board(board_id: str, db: AsyncSession = Depends(get_db)):
    """Get board detail with columns and cards."""
    result = await db.execute(
        select(Board)
        .options(selectinload(Board.columns).selectinload(Column.cards))
        .where(Board.id == board_id)
    )
    board = result.scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return _board_detail_response(board)


@router.put("/{board_id}", response_model=BoardResponse)
async def update_board(
    board_id: str, data: BoardUpdate, db: AsyncSession = Depends(get_db)
):
    """Update board title, description, or status."""
    result = await db.execute(select(Board).where(Board.id == board_id))
    board = result.scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    if data.title is not None:
        board.title = data.title
    if data.description is not None:
        board.description = data.description
    if data.status is not None:
        if data.status not in ("active", "dormant"):
            raise HTTPException(status_code=400, detail="Invalid status")
        board.status = data.status

    await db.flush()
    return board


@router.delete("/{board_id}", status_code=204)
async def delete_board(board_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a board and all its columns/cards via cascade."""
    result = await db.execute(select(Board).where(Board.id == board_id))
    board = result.scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    await db.delete(board)


@router.get("/{board_id}/dashboard", response_model=BoardDashboardResponse)
async def get_board_dashboard(board_id: str, db: AsyncSession = Depends(get_db)):
    """Get atomic dashboard for a single board."""
    result = await db.execute(
        select(Board)
        .options(selectinload(Board.columns).selectinload(Column.cards))
        .where(Board.id == board_id)
    )
    board = result.scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    cards_per_column: dict[str, int] = {}
    total_cards = 0
    for col in board.columns:
        cards_per_column[col.title] = len(col.cards)
        total_cards += len(col.cards)

    # Recent activity: last 10 audit logs for this board's cards
    card_ids = [card.id for col in board.columns for card in col.cards]
    recent_activity: list[dict] = []
    if card_ids:
        audit_result = await db.execute(
            select(CardAuditLog)
            .where(CardAuditLog.card_id.in_(card_ids))
            .order_by(CardAuditLog.changed_at.desc())
            .limit(10)
        )
        for log in audit_result.scalars().all():
            recent_activity.append({
                "card_id": log.card_id,
                "field_changed": log.field_changed,
                "old_value": log.old_value,
                "new_value": log.new_value,
                "changed_at": log.changed_at.isoformat(),
            })

    # Created vs completed (simple count)
    done_col_titles = {"DONE", "ARCHIVE"}
    done_count = sum(
        len(col.cards) for col in board.columns if col.title in done_col_titles
    )

    return BoardDashboardResponse(
        board_id=board.id,
        board_title=board.title,
        total_cards=total_cards,
        cards_per_column=cards_per_column,
        recent_activity=recent_activity,
        created_vs_completed={"created": total_cards, "completed": done_count},
    )


def _board_detail_response(board: Board) -> dict:
    """Convert Board ORM object to response dict with nested columns/cards."""
    return {
        "id": board.id,
        "title": board.title,
        "description": board.description,
        "status": board.status,
        "created_at": board.created_at,
        "updated_at": board.updated_at,
        "columns": [
            ColumnDetailResponse(
                id=col.id,
                board_id=col.board_id,
                title=col.title,
                position=col.position,
                collapsed=col.collapsed,
                created_at=col.created_at,
                cards=[
                    {
                        "id": card.id,
                        "column_id": card.column_id,
                        "title": card.title,
                        "description": card.description,
                        "position": card.position,
                        "created_at": card.created_at,
                        "updated_at": card.updated_at,
                    }
                    for card in col.cards
                ],
            )
            for col in sorted(board.columns, key=lambda c: c.position)
        ],
    }
