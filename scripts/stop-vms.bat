@echo off
title Encerrador VMS - CamerasLive
chcp 65001 >nul

echo ==========================================
echo  Encerrando Central VMS e liberando portas
echo ==========================================
echo.

echo [1/3] Parando processos do Backend (porta 42200)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :42200') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo [2/3] Parando processos do Stream (porta 42300)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :42300') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo [3/3] Parando processos do Frontend (porta 42100)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :42100') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo ==========================================
echo  Todos os processos VMS foram encerrados!
echo ==========================================
echo.
timeout /t 3 >nul
exit
