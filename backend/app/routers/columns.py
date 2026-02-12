"""Column CRUD and reorder endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Board, Column
from app.schemas import ColumnCreate, ColumnReorder, ColumnResponse, ColumnUpdate

router = APIRouter(tags=["columns"])


@router.post(
    "/api/boards/{board_id}/columns", response_model=ColumnResponse, status_code=201
)
async def create_column(
    board_id: str, data: ColumnCreate, db: AsyncSession = Depends(get_db)
):
    """Add a new column to a board."""
    # Verify board exists
    result = await db.execute(select(Board).where(Board.id == board_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Board not found")

    # Determine position
    if data.position is not None:
        position = data.position
    else:
        max_result = await db.execute(
            select(Column.position)
            .where(Column.board_id == board_id)
            .order_by(Column.position.desc())
            .limit(1)
        )
        max_pos = max_result.scalar_one_or_none()
        position = (max_pos + 1) if max_pos is not None else 0

    col = Column(board_id=board_id, title=data.title, position=position)
    db.add(col)
    await db.flush()
    return col


# NOTE: /reorder MUST be defined before /{column_id} to avoid route shadowing
@router.put("/api/columns/reorder", response_model=list[ColumnResponse])
async def reorder_columns(data: ColumnReorder, db: AsyncSession = Depends(get_db)):
    """Reorder columns by providing an ordered list of column IDs."""
    columns = []
    for i, col_id in enumerate(data.column_ids):
        result = await db.execute(select(Column).where(Column.id == col_id))
        col = result.scalar_one_or_none()
        if not col:
            raise HTTPException(
                status_code=404, detail=f"Column {col_id} not found"
            )
        col.position = i
        columns.append(col)

    await db.flush()
    return columns


@router.put("/api/columns/{column_id}", response_model=ColumnResponse)
async def update_column(
    column_id: str, data: ColumnUpdate, db: AsyncSession = Depends(get_db)
):
    """Update column title, position, or collapsed state."""
    result = await db.execute(select(Column).where(Column.id == column_id))
    col = result.scalar_one_or_none()
    if not col:
        raise HTTPException(status_code=404, detail="Column not found")

    if data.title is not None:
        col.title = data.title
    if data.position is not None:
        col.position = data.position
    if data.collapsed is not None:
        col.collapsed = data.collapsed

    await db.flush()
    return col


@router.delete("/api/columns/{column_id}", status_code=204)
async def delete_column(column_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a column and all its cards via cascade."""
    result = await db.execute(select(Column).where(Column.id == column_id))
    col = result.scalar_one_or_none()
    if not col:
        raise HTTPException(status_code=404, detail="Column not found")
    await db.delete(col)

