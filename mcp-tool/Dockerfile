# syntax=docker/dockerfile:1
FROM python:3.12-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:0.12.23 /uv /uvx /bin/
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY kanban_mcp ./kanban_mcp
RUN uv sync --frozen --no-dev

FROM python:3.12-slim AS runtime
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    KANBAN_API_BASE=http://backend-api:8000/api
WORKDIR /app
COPY --from=builder /app/.venv /opt/venv
COPY --from=builder /app/kanban_mcp /app/kanban_mcp

ENTRYPOINT ["python", "-m", "kanban_mcp.server"]
