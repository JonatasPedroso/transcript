@echo off
timeout /t 10 /nobreak >nul
echo Iniciando Transcript Backend...
start cmd /k "cd transcript-backend && python transcript.py"

echo Iniciando Transcript Frontend...
start cmd /k "cd transcript-frontend && npm start"

echo Todos os serviços foram iniciados.
