@echo off
title Configuração Central VMS - CamerasLive
chcp 65001 >nul

echo ===================================================
echo   CONFIGURADOR CENTRAL VMS - CAMERASLIVE
echo ===================================================
echo.
echo Este script irá verificar os pré-requisitos e instalar
echo todas as dependências necessárias para o projeto.
echo.

:: 1. Verificar se o Node.js está instalado
echo [1/4] Verificando se o Node.js está instalado...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ❌ [ERRO] Node.js não foi encontrado no sistema!
    echo O projeto requer Node.js v18 ou superior.
    echo Por favor, faça o download e instale em: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo  V Node.js detectado (%NODE_VER%)
echo.

:: 2. Verificar se o FFmpeg está instalado
echo [2/4] Verificando se o FFmpeg está instalado...
where ffmpeg >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ⚠️ [AVISO] FFmpeg não foi encontrado no PATH do seu sistema!
    echo O FFmpeg é fundamental para que a transcodificação de streams RTSP funcione.
    echo.
    echo Para instalar no Windows:
    echo 1. Baixe o FFmpeg (build completo) em: https://ffmpeg.org/download.html
    echo 2. Extraia os arquivos (ex: em C:\ffmpeg)
    echo 3. Adicione o caminho da pasta 'bin' (ex: C:\ffmpeg\bin) às Variáveis de Ambiente do Sistema (PATH)
    echo.
    echo A instalação das dependências do Node.js continuará, mas lembre-se de configurar o FFmpeg depois!
    echo.
    set /p FFMPEG_CONFIRM="Deseja continuar a instalação das dependências mesmo assim? (S/N): "
    if /i "%FFMPEG_CONFIRM%" neq "S" (
        echo Instalação cancelada pelo usuário.
        exit /b 0
    )
    echo.
) else (
    echo  V FFmpeg detectado no PATH do sistema.
    echo.
)

:: 3. Instalar dependências da raiz
echo [3/4] Instalando dependências da raiz (Workspace)...
cd /d "%~dp0"
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ [ERRO] Houve um problema ao instalar as dependências da raiz.
    echo Verifique sua conexão ou permissões e tente novamente.
    echo.
    pause
    exit /b 1
)
echo.

:: 4. Instalar dependências de todos os submódulos (Frontend + Backend)
echo [4/4] Instalando dependências do Frontend e Backend...
call npm run install-all
if %errorlevel% neq 0 (
    echo.
    echo ❌ [ERRO] Falha ao instalar dependências do Frontend/Backend.
    echo Tente executar "npm install" manualmente dentro das pastas 'frontend' e 'backend'.
    echo.
    pause
    exit /b 1
)
echo.

echo ===================================================
echo  🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!
echo ===================================================
echo.
echo  Tudo foi instalado e configurado perfeitamente!
echo.
echo  Passos seguintes:
echo  1. Feche esta janela.
echo  2. Dê dois cliques em "start-vms.bat" para rodar o projeto.
echo.
echo ===================================================
echo.
pause
exit
