@echo off
title CamerasLive VMS Launcher
chcp 65001 >nul

:: Styling header
echo =====================================================================
echo                CAMERASLIVE VMS - CENTRAL DE MONITORAMENTO            
echo =====================================================================
echo.

:: Step 1: Resilient Port Clean Sweep (Prevent Address-In-Use EADDRINUSE conflicts!)
echo [1/4] Higienizando portas locais (5000, 9999, 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9999') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    taskkill /f /pid %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul

:: Step 2: Bootstrap REST API and WebSockets Backend Server in background
echo [2/4] Iniciando Servidor VMS Backend...
start /min "VMS Backend" cmd /c "cd backend && npm run dev"

:: Step 3: Bootstrap Vite and React Widescreen Frontend in background
echo [3/4] Iniciando Interface VMS Frontend...
start /min "VMS Frontend" cmd /c "cd frontend && npm run dev"

:: Step 4: Open default browser and launch VMS dashboard
echo [4/4] Inicializando Painel no Navegador...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo =====================================================================
echo  STATUS: Central VMS iniciada com sucesso em segundo plano!
echo  
echo  * Para encerrar os servidores de vídeo e liberar as portas do PC,
echo    pressione QUALQUER TECLA nesta janela.
echo =====================================================================
echo.
pause >nul

:: Step 5: Graceful clean teardown of Node.js child processes and ports
echo.
echo [!] Encerrando servidores e limpando portas...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9999') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    taskkill /f /pid %%a >nul 2>&1
)
echo [OK] Central de monitoramento encerrada. PC limpo!
timeout /t 2 /nobreak >nul
