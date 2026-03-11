#!/bin/bash

PID=$(netstat -ano 2>/dev/null | grep ":3000 " | grep "LISTENING" | awk '{print $5}' | head -1)

if [ -n "$PID" ]; then
  echo "Porta 3000 em uso pelo PID $PID. Encerrando..."
  powershell -Command "Stop-Process -Id $PID -Force" 2>/dev/null
  sleep 1
fi

echo "Subindo Docker..."
docker compose up --build -d

echo ""
docker compose ps
