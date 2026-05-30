@echo off
title Iniciador VMS - CamerasLive
chcp 65001 >nul

echo ==========================================
echo  Iniciando Central VMS...
echo ==========================================
echo.

echo [1/3] Iniciando Servidor Backend...
start "VMS Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo [2/3] Iniciando Servidor Frontend...
start "VMS Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo [3/3] Abrindo painel no navegador...
timeout /t 3 /nobreak >nul
start http://localhost:42100

echo.
echo ==========================================
echo  Central VMS iniciada com sucesso!
echo  Mantenha as janelas do terminal abertas.
echo  Para desligar, execute o "stop-vms.bat".
echo ==========================================
echo.
timeout /t 4 >nul
exit
