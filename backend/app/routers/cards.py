"""Card CRUD, move, and audit trail endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Card, CardAuditLog, Column
from app.schemas import (
    AuditLogResponse,
    CardCreate,
    CardDetailResponse,
    CardMove,
    CardResponse,
    CardUpdate,
)

router = APIRouter(tags=["cards"])


def _create_audit_log(
    card_id: str, field: str, old_value: str | None, new_value: str | None
) -> CardAuditLog:
    """Create an audit log entry for a card field change."""
    return CardAuditLog(
        card_id=card_id,
        field_changed=field,
        old_value=str(old_value) if old_value is not None else None,
        new_value=str(new_value) if new_value is not None else None,
    )


@router.post(
    "/api/columns/{column_id}/cards", response_model=CardResponse, status_code=201
)
async def create_card(
    column_id: str, data: CardCreate, db: AsyncSession = Depends(get_db)
):
    """Create a card in a column."""
    result = await db.execute(select(Column).where(Column.id == column_id))
    col = result.scalar_one_or_none()
    if not col:
        raise HTTPException(status_code=404, detail="Column not found")

    # Determine position
    max_result = await db.execute(
        select(Card.position)
        .where(Card.column_id == column_id)
        .order_by(Card.position.desc())
        .limit(1)
    )
    max_pos = max_result.scalar_one_or_none()
    position = (max_pos + 1) if max_pos is not None else 0

    card = Card(
        column_id=column_id,
        title=data.title,
        description=data.description,
        position=position,
    )
    db.add(card)
    await db.flush()

    # Audit: card created
    audit = _create_audit_log(card.id, "created", None, col.title)
    db.add(audit)

    return card


@router.get("/api/cards/{card_id}", response_model=CardDetailResponse)
async def get_card(card_id: str, db: AsyncSession = Depends(get_db)):
    """Get card with full audit trail."""
    result = await db.execute(
        select(Card)
        .options(selectinload(Card.audit_logs))
        .where(Card.id == card_id)
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card


@router.put("/api/cards/{card_id}", response_model=CardResponse)
async def update_card(
    card_id: str, data: CardUpdate, db: AsyncSession = Depends(get_db)
):
    """Update card title and/or description."""
    result = await db.execute(select(Card).where(Card.id == card_id))
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    if data.title is not None and data.title != card.title:
        audit = _create_audit_log(card.id, "title", card.title, data.title)
        db.add(audit)
        card.title = data.title

    if data.description is not None and data.description != card.description:
        audit = _create_audit_log(
            card.id, "description", card.description, data.description
        )
        db.add(audit)
        card.description = data.description

    await db.flush()
    return card


@router.put("/api/cards/{card_id}/move", response_model=CardResponse)
async def move_card(
    card_id: str, data: CardMove, db: AsyncSession = Depends(get_db)
):
    """Move a card to a different column and/or position."""
    result = await db.execute(select(Card).where(Card.id == card_id))
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    # Verify target column exists
    col_result = await db.execute(select(Column).where(Column.id == data.column_id))
    target_col = col_result.scalar_one_or_none()
    if not target_col:
        raise HTTPException(status_code=404, detail="Target column not found")

    # Track column change
    if card.column_id != data.column_id:
        # Get source column title for audit
        src_result = await db.execute(
            select(Column).where(Column.id == card.column_id)
        )
        src_col = src_result.scalar_one()
        audit = _create_audit_log(
            card.id, "column", src_col.title, target_col.title
        )
        db.add(audit)
        card.column_id = data.column_id

    # Track position change
    if card.position != data.position:
        audit = _create_audit_log(
            card.id, "position", str(card.position), str(data.position)
        )
        db.add(audit)
        card.position = data.position

    await db.flush()
    return card


@router.delete("/api/cards/{card_id}", status_code=204)
async def delete_card(card_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a card and its audit trail via cascade."""
    result = await db.execute(select(Card).where(Card.id == card_id))
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    await db.delete(card)
