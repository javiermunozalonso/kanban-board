"""Pydantic v2 schemas for request/response validation."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# --- Board ---

class BoardCreate(BaseModel):
    title: str
    description: Optional[str] = None


class BoardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # "active" | "dormant"


class BoardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime


class BoardDetailResponse(BoardResponse):
    columns: list["ColumnDetailResponse"] = []


# --- Column ---

class ColumnCreate(BaseModel):
    title: str
    position: Optional[int] = None


class ColumnUpdate(BaseModel):
    title: Optional[str] = None
    position: Optional[int] = None
    collapsed: Optional[bool] = None


class ColumnReorder(BaseModel):
    column_ids: list[str]


class ColumnResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    board_id: str
    title: str
    position: int
    collapsed: bool
    created_at: datetime


class ColumnDetailResponse(ColumnResponse):
    cards: list["CardResponse"] = []


# --- Card ---

class CardCreate(BaseModel):
    title: str
    description: Optional[str] = None


class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    column_id: Optional[str] = None
    position: Optional[int] = None


class CardMove(BaseModel):
    column_id: str
    position: int


class CardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    column_id: str
    title: str
    description: Optional[str]
    position: int
    created_at: datetime
    updated_at: datetime


class CardDetailResponse(CardResponse):
    audit_logs: list["AuditLogResponse"] = []


# --- Card Observation ---

class CardObservationCreate(BaseModel):
    content: str


class CardObservationUpdate(BaseModel):
    content: str


class CardObservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    card_id: str
    content: str
    created_at: datetime
    updated_at: datetime


# --- Audit Log ---

class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    card_id: str
    field_changed: str
    old_value: Optional[str]
    new_value: Optional[str]
    changed_at: datetime


# --- Dashboard ---

class BoardDashboardResponse(BaseModel):
    board_id: str
    board_title: str
    total_cards: int
    cards_per_column: dict[str, int]
    recent_activity: list[dict]
    created_vs_completed: dict[str, int]


class BoardSummary(BaseModel):
    board_id: str
    title: str
    status: str
    total: int
    done: int
    wip: int


class GeneralDashboardResponse(BaseModel):
    active_boards: int
    dormant_boards: int
    total_cards: int
    boards_summary: list[BoardSummary]
    global_distribution: dict[str, int]
