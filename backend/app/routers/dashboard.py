"""General dashboard endpoint aggregating all active boards."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Board, Column
from app.schemas import BoardSummary, GeneralDashboardResponse

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=GeneralDashboardResponse)
async def get_general_dashboard(db: AsyncSession = Depends(get_db)):
    """Get aggregated dashboard for all boards."""
    result = await db.execute(
        select(Board).options(selectinload(Board.columns).selectinload(Column.cards))
    )
    all_boards = result.scalars().all()

    active_boards = [b for b in all_boards if b.status == "active"]
    dormant_boards = [b for b in all_boards if b.status == "dormant"]

    boards_summary: list[BoardSummary] = []
    global_distribution: dict[str, int] = {}
    total_cards = 0

    for board in active_boards:
        board_total = 0
        board_done = 0
        board_wip = 0

        for col in board.columns:
            count = len(col.cards)
            board_total += count
            total_cards += count

            # Aggregate global distribution
            global_distribution[col.title] = (
                global_distribution.get(col.title, 0) + count
            )

            if col.title in ("DONE", "ARCHIVE"):
                board_done += count
            elif col.title == "WORK IN PROGRESS":
                board_wip += count

        boards_summary.append(
            BoardSummary(
                board_id=board.id,
                title=board.title,
                status=board.status,
                total=board_total,
                done=board_done,
                wip=board_wip,
            )
        )

    return GeneralDashboardResponse(
        active_boards=len(active_boards),
        dormant_boards=len(dormant_boards),
        total_cards=total_cards,
        boards_summary=boards_summary,
        global_distribution=global_distribution,
    )
