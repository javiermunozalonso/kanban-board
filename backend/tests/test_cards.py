"""Integration tests for Card endpoints."""

from datetime import datetime

import pytest
from httpx import AsyncClient
from sqlalchemy import inspect

from app.database import Base
from app.models import Card


async def _create_board_with_card(client: AsyncClient) -> tuple[dict, dict]:
    """Helper: create a board and a card in its first column."""
    board_resp = await client.post("/api/boards", json={"title": "Card Test Board"})
    board = board_resp.json()
    col_id = board["columns"][0]["id"]  # BACKLOG

    card_resp = await client.post(
        f"/api/columns/{col_id}/cards",
        json={"title": "Test Card", "description": "Desc"},
    )
    card = card_resp.json()
    return board, card


@pytest.mark.asyncio
async def test_create_card(client: AsyncClient):
    """Should create a card in a column."""
    board, card = await _create_board_with_card(client)
    assert card["title"] == "Test Card"
    assert card["position"] == 0


@pytest.mark.asyncio
async def test_get_card_with_audit(client: AsyncClient):
    """Should return card with audit trail."""
    _, card = await _create_board_with_card(client)
    resp = await client.get(f"/api/cards/{card['id']}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Test Card"
    assert len(data["audit_logs"]) >= 1  # At least 'created' entry


@pytest.mark.asyncio
async def test_update_card(client: AsyncClient):
    """Should update card and create audit logs."""
    _, card = await _create_board_with_card(client)

    resp = await client.put(
        f"/api/cards/{card['id']}", json={"title": "Updated Title"}
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated Title"

    # Check audit
    detail = await client.get(f"/api/cards/{card['id']}")
    logs = detail.json()["audit_logs"]
    title_logs = [l for l in logs if l["field_changed"] == "title"]
    assert len(title_logs) == 1
    assert title_logs[0]["old_value"] == "Test Card"
    assert title_logs[0]["new_value"] == "Updated Title"


@pytest.mark.asyncio
async def test_move_card(client: AsyncClient):
    """Should move card to another column and record audit."""
    board, card = await _create_board_with_card(client)
    wip_col = next(c for c in board["columns"] if c["title"] == "WORK IN PROGRESS")

    resp = await client.put(
        f"/api/cards/{card['id']}/move",
        json={"column_id": wip_col["id"], "position": 0},
    )
    assert resp.status_code == 200
    assert resp.json()["column_id"] == wip_col["id"]

    # Check audit for column change
    detail = await client.get(f"/api/cards/{card['id']}")
    logs = detail.json()["audit_logs"]
    col_logs = [l for l in logs if l["field_changed"] == "column"]
    assert len(col_logs) == 1
    assert col_logs[0]["old_value"] == "BACKLOG"
    assert col_logs[0]["new_value"] == "WORK IN PROGRESS"


@pytest.mark.asyncio
async def test_delete_card(client: AsyncClient):
    """Should delete card."""
    _, card = await _create_board_with_card(client)
    resp = await client.delete(f"/api/cards/{card['id']}")
    assert resp.status_code == 204

    resp = await client.get(f"/api/cards/{card['id']}")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_card_observation_model_is_registered(database_engine):
    """Observations have their own table and cascade with their card."""
    assert "card_observations" in Base.metadata.tables
    assert "observations" in Card.__mapper__.relationships
    foreign_keys = inspect(Base.metadata.tables["card_observations"]).foreign_keys
    assert any(fk.ondelete == "CASCADE" for fk in foreign_keys)
    async with database_engine.connect() as connection:
        table_exists = await connection.run_sync(
            lambda sync_connection: inspect(sync_connection).has_table("card_observations")
        )
    assert table_exists


@pytest.mark.asyncio
async def test_card_observation_crud_is_separate_from_audit(client: AsyncClient):
    """Observation operations persist independently from the audit trail."""
    _, card = await _create_board_with_card(client)
    path = f"/api/cards/{card['id']}/observations"

    created = await client.post(path, json={"content": "First observation"})
    assert created.status_code == 201
    observation = created.json()
    assert observation["content"] == "First observation"
    assert observation["card_id"] == card["id"]
    assert observation["created_at"]
    assert observation["updated_at"]

    updated = await client.put(
        f"{path}/{observation['id']}", json={"content": "Edited observation"}
    )
    assert updated.status_code == 200
    assert updated.json()["content"] == "Edited observation"
    updated_created_at = datetime.fromisoformat(updated.json()["created_at"])
    original_created_at = datetime.fromisoformat(observation["created_at"])
    assert updated_created_at.replace(tzinfo=None) == original_created_at.replace(
        tzinfo=None
    )

    listed = await client.get(path)
    assert listed.status_code == 200
    assert [item["id"] for item in listed.json()] == [observation["id"]]

    detail = await client.get(f"/api/cards/{card['id']}")
    assert detail.json()["audit_logs"] == detail.json()["audit_logs"][:1]

    deleted = await client.delete(f"{path}/{observation['id']}")
    assert deleted.status_code == 204
    assert (await client.get(path)).json() == []


@pytest.mark.asyncio
async def test_card_observation_endpoints_return_404_for_missing_entities(
    client: AsyncClient,
):
    """Observation endpoints report missing cards and observations as 404."""
    missing_card_path = "/api/cards/missing/observations"
    assert (await client.get(missing_card_path)).status_code == 404
    assert (
        await client.post(missing_card_path, json={"content": "orphan"})
    ).status_code == 404
    assert (
        await client.put(
            f"{missing_card_path}/missing", json={"content": "update"}
        )
    ).status_code == 404
    assert (await client.delete(f"{missing_card_path}/missing")).status_code == 404
