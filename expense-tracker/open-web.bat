@echo off
REM Script para iniciar o servidor Next.js e abrir o navegador
cd /d "%~dp0"
echo Iniciando o site Expense Tracker...
start cmd /k "npm run dev"
timeout /t 5 /nobreak >nul
start http://localhost:3000
pause