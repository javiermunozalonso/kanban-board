"""SQLAlchemy ORM models for the Kanban application."""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# --- Helpers ---

def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


# --- Models ---

class Board(Base):
    __tablename__ = "boards"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("active", "dormant", name="board_status"), default="active", nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    columns: Mapped[list["Column"]] = relationship(
        "Column", back_populates="board", cascade="all, delete-orphan",
        order_by="Column.position"
    )


class Column(Base):
    __tablename__ = "columns"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    board_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("boards.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    collapsed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    board: Mapped["Board"] = relationship("Board", back_populates="columns")
    cards: Mapped[list["Card"]] = relationship(
        "Card", back_populates="column", cascade="all, delete-orphan",
        order_by="Card.position"
    )


class Card(Base):
    __tablename__ = "cards"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    column_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("columns.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    column: Mapped["Column"] = relationship("Column", back_populates="cards")
    audit_logs: Mapped[list["CardAuditLog"]] = relationship(
        "CardAuditLog", back_populates="card", cascade="all, delete-orphan",
        order_by="CardAuditLog.changed_at.desc()"
    )


class CardAuditLog(Base):
    __tablename__ = "card_audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    card_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("cards.id", ondelete="CASCADE"), nullable=False
    )
    field_changed: Mapped[str] = mapped_column(String(100), nullable=False)
    old_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    new_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    card: Mapped["Card"] = relationship("Card", back_populates="audit_logs")
