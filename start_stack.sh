#!/bin/bash

SESSION="kanban-stack"

# Check if session exists
tmux has-session -t $SESSION 2>/dev/null

if [ $? != 0 ]; then
  # Create new session detached
  tmux new-session -d -s $SESSION -n "Dev"

  # Pane 1 (Top): Backend
  # Use uv run to ensure dependencies are met
  tmux send-keys -t $SESSION:0.0 'cd backend && uv run uvicorn app.main:app --reload' C-m
  
  # Split vertically (top/bottom)
  tmux split-window -v -p 66 -t $SESSION:0
  
  # Pane 2 (Middle): Frontend
  tmux send-keys -t $SESSION:0.1 'cd frontend && npm run dev' C-m
  
  # Split vertically again the bottom pane
  tmux split-window -v -p 50 -t $SESSION:0.1
  
  # Pane 3 (Bottom): MCP Tool
  tmux send-keys -t $SESSION:0.2 'cd mcp-tool && uv run kanban-mcp' C-m
  
  # Select pane 0
  tmux select-pane -t $SESSION:0.0
fi

# Attach to session
tmux attach -t $SESSION
