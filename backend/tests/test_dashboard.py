"""Integration tests for Dashboard endpoints."""

import pytest
from httpx import AsyncClient


async def _setup_board_with_cards(client: AsyncClient) -> dict:
    """Create a board and add cards to multiple columns."""
    resp = await client.post("/api/boards", json={"title": "Dashboard Board"})
    board = resp.json()

    backlog = next(c for c in board["columns"] if c["title"] == "BACKLOG")
    wip = next(c for c in board["columns"] if c["title"] == "WORK IN PROGRESS")
    done = next(c for c in board["columns"] if c["title"] == "DONE")

    # Add cards to BACKLOG
    for i in range(3):
        await client.post(
            f"/api/columns/{backlog['id']}/cards",
            json={"title": f"Backlog Card {i}"},
        )

    # Add cards to WIP
    for i in range(2):
        await client.post(
            f"/api/columns/{wip['id']}/cards",
            json={"title": f"WIP Card {i}"},
        )

    # Add cards to DONE
    await client.post(
        f"/api/columns/{done['id']}/cards",
        json={"title": "Done Card"},
    )

    return board


@pytest.mark.asyncio
async def test_board_dashboard(client: AsyncClient):
    """Should return atomic dashboard for a board."""
    board = await _setup_board_with_cards(client)

    resp = await client.get(f"/api/boards/{board['id']}/dashboard")
    assert resp.status_code == 200
    data = resp.json()
    assert data["board_id"] == board["id"]
    assert data["total_cards"] == 6
    assert data["cards_per_column"]["BACKLOG"] == 3
    assert data["cards_per_column"]["WORK IN PROGRESS"] == 2
    assert data["cards_per_column"]["DONE"] == 1
    assert data["created_vs_completed"]["created"] == 6
    assert data["created_vs_completed"]["completed"] == 1


@pytest.mark.asyncio
async def test_general_dashboard(client: AsyncClient):
    """Should return general dashboard for all active boards."""
    await _setup_board_with_cards(client)

    resp = await client.get("/api/dashboard")
    assert resp.status_code == 200
    data = resp.json()
    assert data["active_boards"] == 1
    assert data["total_cards"] == 6
    assert len(data["boards_summary"]) == 1
    assert data["boards_summary"][0]["total"] == 6


@pytest.mark.asyncio
async def test_general_dashboard_excludes_dormant(client: AsyncClient):
    """Dormant boards should not count in general dashboard totals."""
    board = await _setup_board_with_cards(client)
    # Set dormant
    await client.put(f"/api/boards/{board['id']}", json={"status": "dormant"})

    resp = await client.get("/api/dashboard")
    data = resp.json()
    assert data["active_boards"] == 0
    assert data["total_cards"] == 0
