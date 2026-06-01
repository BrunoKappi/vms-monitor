@echo off
title Iniciador VMS - CamerasLive
chcp 65001 >nul

echo ==========================================
echo  Iniciando Central VMS (Backend + Frontend)...
echo ==========================================
echo.

echo [1/2] Iniciando servidores unificados...
start "VMS Central" cmd /k "cd /d %~dp0 && npm run dev"

echo [2/2] Abrindo painel no navegador...
timeout /t 5 /nobreak >nul
start http://localhost:42100

echo.
echo ==========================================
echo  Central VMS iniciada com sucesso!
echo  Mantenha a janela do terminal aberta.
echo  Para desligar, execute o "stop-vms.bat".
echo ==========================================
echo.
timeout /t 4 >nul
exit
