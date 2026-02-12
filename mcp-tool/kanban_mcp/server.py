"""MCP Server for Kanban Board API control."""

import asyncio
import json
from typing import Any

import httpx
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool

API_BASE = "http://localhost:8000/api"

server = Server("kanban-mcp")
client = httpx.AsyncClient(base_url=API_BASE, timeout=30.0)


async def _request(method: str, path: str, **kwargs) -> dict | list | str:
    """Make an HTTP request and return JSON or status text."""
    resp = await client.request(method, path, **kwargs)
    if resp.status_code == 204:
        return "Success (no content)"
    resp.raise_for_status()
    return resp.json()


@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="list_boards",
            description="List all Kanban boards. Optionally filter by status: 'active' or 'dormant'.",
            inputSchema={
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["active", "dormant"],
                        "description": "Filter by board status",
                    }
                },
            },
        ),
        Tool(
            name="create_board",
            description="Create a new Kanban board with default columns (BACKLOG, WORK IN PROGRESS, DONE, STOPPED, ARCHIVE).",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Board title"},
                    "description": {"type": "string", "description": "Board description"},
                },
                "required": ["title"],
            },
        ),
        Tool(
            name="get_board",
            description="Get full board detail including columns and cards.",
            inputSchema={
                "type": "object",
                "properties": {
                    "board_id": {"type": "string", "description": "Board UUID"},
                },
                "required": ["board_id"],
            },
        ),
        Tool(
            name="update_board",
            description="Update a board's title, description, or status (active/dormant).",
            inputSchema={
                "type": "object",
                "properties": {
                    "board_id": {"type": "string", "description": "Board UUID"},
                    "title": {"type": "string", "description": "New title"},
                    "description": {"type": "string", "description": "New description"},
                    "status": {"type": "string", "enum": ["active", "dormant"], "description": "New status"},
                },
                "required": ["board_id"],
            },
        ),
        Tool(
            name="delete_board",
            description="Permanently delete a board and all its columns and cards.",
            inputSchema={
                "type": "object",
                "properties": {
                    "board_id": {"type": "string", "description": "Board UUID"},
                },
                "required": ["board_id"],
            },
        ),
        Tool(
            name="create_card",
            description="Create a new card in a specific column.",
            inputSchema={
                "type": "object",
                "properties": {
                    "column_id": {"type": "string", "description": "Column UUID"},
                    "title": {"type": "string", "description": "Card title"},
                    "description": {"type": "string", "description": "Card description"},
                },
                "required": ["column_id", "title"],
            },
        ),
        Tool(
            name="update_card",
            description="Update a card's title or description.",
            inputSchema={
                "type": "object",
                "properties": {
                    "card_id": {"type": "string", "description": "Card UUID"},
                    "title": {"type": "string", "description": "New title"},
                    "description": {"type": "string", "description": "New description"},
                },
                "required": ["card_id"],
            },
        ),
        Tool(
            name="move_card",
            description="Move a card to a different column and/or position.",
            inputSchema={
                "type": "object",
                "properties": {
                    "card_id": {"type": "string", "description": "Card UUID"},
                    "target_column_id": {"type": "string", "description": "Target column UUID"},
                    "position": {"type": "integer", "description": "Position in target column (0-based)", "default": 0},
                },
                "required": ["card_id", "target_column_id"],
            },
        ),
        Tool(
            name="delete_card",
            description="Permanently delete a card.",
            inputSchema={
                "type": "object",
                "properties": {
                    "card_id": {"type": "string", "description": "Card UUID"},
                },
                "required": ["card_id"],
            },
        ),
        Tool(
            name="get_card_audit",
            description="Get the complete audit trail for a card, showing all state changes.",
            inputSchema={
                "type": "object",
                "properties": {
                    "card_id": {"type": "string", "description": "Card UUID"},
                },
                "required": ["card_id"],
            },
        ),
        Tool(
            name="manage_columns",
            description="Add, update, delete, or reorder columns on a board.",
            inputSchema={
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string",
                        "enum": ["add", "update", "delete", "reorder"],
                        "description": "Action to perform",
                    },
                    "board_id": {"type": "string", "description": "Board UUID (required for add/reorder)"},
                    "column_id": {"type": "string", "description": "Column UUID (required for update/delete)"},
                    "title": {"type": "string", "description": "Column title (for add/update)"},
                    "position": {"type": "integer", "description": "Column position (for add/update)"},
                    "collapsed": {"type": "boolean", "description": "Collapsed state (for update)"},
                    "column_ids": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Ordered column IDs (for reorder)",
                    },
                },
                "required": ["action"],
            },
        ),
        Tool(
            name="get_board_dashboard",
            description="Get analytics dashboard for a specific board: card counts, distribution, recent activity.",
            inputSchema={
                "type": "object",
                "properties": {
                    "board_id": {"type": "string", "description": "Board UUID"},
                },
                "required": ["board_id"],
            },
        ),
        Tool(
            name="get_general_dashboard",
            description="Get aggregated dashboard across all active boards.",
            inputSchema={"type": "object", "properties": {}},
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    try:
        result = await _dispatch(name, arguments)
        text = json.dumps(result, indent=2, default=str) if isinstance(result, (dict, list)) else str(result)
        return [TextContent(type="text", text=text)]
    except httpx.HTTPStatusError as e:
        error_detail = e.response.text
        return [TextContent(type="text", text=f"Error {e.response.status_code}: {error_detail}")]
    except Exception as e:
        return [TextContent(type="text", text=f"Error: {str(e)}")]


async def _dispatch(name: str, args: dict[str, Any]) -> Any:
    """Route tool calls to the appropriate API endpoint."""

    if name == "list_boards":
        params = {"status": args["status"]} if args.get("status") else {}
        return await _request("GET", "/boards", params=params)

    elif name == "create_board":
        body = {"title": args["title"]}
        if args.get("description"):
            body["description"] = args["description"]
        return await _request("POST", "/boards", json=body)

    elif name == "get_board":
        return await _request("GET", f"/boards/{args['board_id']}")

    elif name == "update_board":
        body = {}
        for key in ("title", "description", "status"):
            if args.get(key):
                body[key] = args[key]
        return await _request("PUT", f"/boards/{args['board_id']}", json=body)

    elif name == "delete_board":
        return await _request("DELETE", f"/boards/{args['board_id']}")

    elif name == "create_card":
        body = {"title": args["title"]}
        if args.get("description"):
            body["description"] = args["description"]
        return await _request("POST", f"/columns/{args['column_id']}/cards", json=body)

    elif name == "update_card":
        body = {}
        for key in ("title", "description"):
            if args.get(key):
                body[key] = args[key]
        return await _request("PUT", f"/cards/{args['card_id']}", json=body)

    elif name == "move_card":
        body = {
            "column_id": args["target_column_id"],
            "position": args.get("position", 0),
        }
        return await _request("PUT", f"/cards/{args['card_id']}/move", json=body)

    elif name == "delete_card":
        return await _request("DELETE", f"/cards/{args['card_id']}")

    elif name == "get_card_audit":
        card = await _request("GET", f"/cards/{args['card_id']}")
        return card.get("audit_logs", []) if isinstance(card, dict) else card

    elif name == "manage_columns":
        action = args["action"]
        if action == "add":
            body = {"title": args["title"]}
            if args.get("position") is not None:
                body["position"] = args["position"]
            return await _request("POST", f"/boards/{args['board_id']}/columns", json=body)
        elif action == "update":
            body = {}
            for key in ("title", "position", "collapsed"):
                if args.get(key) is not None:
                    body[key] = args[key]
            return await _request("PUT", f"/columns/{args['column_id']}", json=body)
        elif action == "delete":
            return await _request("DELETE", f"/columns/{args['column_id']}")
        elif action == "reorder":
            return await _request("PUT", "/columns/reorder", json={"column_ids": args["column_ids"]})

    elif name == "get_board_dashboard":
        return await _request("GET", f"/boards/{args['board_id']}/dashboard")

    elif name == "get_general_dashboard":
        return await _request("GET", "/dashboard")

    raise ValueError(f"Unknown tool: {name}")


def main():
    """Run the MCP server."""
    asyncio.run(_run())


async def _run():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    main()
