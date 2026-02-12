"""Integration tests for Board endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_board(client: AsyncClient):
    """Creating a board should return it with default columns."""
    resp = await client.post("/api/boards", json={"title": "Test Board", "description": "A test"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Test Board"
    assert data["status"] == "active"
    assert len(data["columns"]) == 5
    column_titles = [c["title"] for c in data["columns"]]
    assert "BACKLOG" in column_titles
    assert "WORK IN PROGRESS" in column_titles
    assert "DONE" in column_titles
    assert "STOPPED" in column_titles
    assert "ARCHIVE" in column_titles


@pytest.mark.asyncio
async def test_list_boards(client: AsyncClient):
    """Should list boards with optional status filter."""
    await client.post("/api/boards", json={"title": "Active Board"})
    resp = await client.get("/api/boards")
    assert resp.status_code == 200
    assert len(resp.json()) == 1

    # Filter by status
    resp = await client.get("/api/boards?status=dormant")
    assert resp.status_code == 200
    assert len(resp.json()) == 0


@pytest.mark.asyncio
async def test_get_board(client: AsyncClient):
    """Should get full board detail."""
    create_resp = await client.post("/api/boards", json={"title": "Detail Board"})
    board_id = create_resp.json()["id"]

    resp = await client.get(f"/api/boards/{board_id}")
    assert resp.status_code == 200
    assert resp.json()["title"] == "Detail Board"
    assert len(resp.json()["columns"]) == 5


@pytest.mark.asyncio
async def test_update_board(client: AsyncClient):
    """Should update board fields."""
    create_resp = await client.post("/api/boards", json={"title": "Old Title"})
    board_id = create_resp.json()["id"]

    resp = await client.put(
        f"/api/boards/{board_id}",
        json={"title": "New Title", "status": "dormant"},
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "New Title"
    assert resp.json()["status"] == "dormant"


@pytest.mark.asyncio
async def test_delete_board(client: AsyncClient):
    """Should delete board."""
    create_resp = await client.post("/api/boards", json={"title": "To Delete"})
    board_id = create_resp.json()["id"]

    resp = await client.delete(f"/api/boards/{board_id}")
    assert resp.status_code == 204

    resp = await client.get(f"/api/boards/{board_id}")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_board_not_found(client: AsyncClient):
    resp = await client.get("/api/boards/nonexistent")
    assert resp.status_code == 404
