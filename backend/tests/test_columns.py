"""Integration tests for Column endpoints."""

import pytest
from httpx import AsyncClient


async def _create_board(client: AsyncClient) -> dict:
    resp = await client.post("/api/boards", json={"title": "Column Test Board"})
    return resp.json()


@pytest.mark.asyncio
async def test_create_column(client: AsyncClient):
    """Should add a column to a board."""
    board = await _create_board(client)
    resp = await client.post(
        f"/api/boards/{board['id']}/columns", json={"title": "CUSTOM"}
    )
    assert resp.status_code == 201
    assert resp.json()["title"] == "CUSTOM"
    assert resp.json()["position"] == 5  # After 5 defaults (0-4)


@pytest.mark.asyncio
async def test_update_column(client: AsyncClient):
    """Should update column properties."""
    board = await _create_board(client)
    col_id = board["columns"][0]["id"]

    resp = await client.put(
        f"/api/columns/{col_id}",
        json={"title": "RENAMED", "collapsed": True},
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "RENAMED"
    assert resp.json()["collapsed"] is True


@pytest.mark.asyncio
async def test_delete_column(client: AsyncClient):
    """Should delete a column."""
    board = await _create_board(client)
    col_id = board["columns"][0]["id"]

    resp = await client.delete(f"/api/columns/{col_id}")
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_reorder_columns(client: AsyncClient):
    """Should reorder columns."""
    board = await _create_board(client)
    col_ids = [c["id"] for c in board["columns"]]
    reversed_ids = list(reversed(col_ids))

    resp = await client.put(
        "/api/columns/reorder", json={"column_ids": reversed_ids}
    )
    assert resp.status_code == 200
    positions = [c["position"] for c in resp.json()]
    assert positions == list(range(len(col_ids)))
