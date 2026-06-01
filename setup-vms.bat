@echo off
title Configuracao Central VMS - CamerasLive
chcp 65001 >nul

echo ===================================================
echo   CONFIGURADOR CENTRAL VMS - CAMERASLIVE
echo ===================================================
echo.
echo Este script ira verificar os requisitos e instalar
echo todas as dependencias necessarias para o projeto.
echo.

:: 1. Verificar se o Node.js esta instalado
echo [1/4] Verificando se o Node.js esta instalado...
where node >nul 2>nul
if %errorlevel% equ 0 goto NODE_INSTALLED

echo.
echo ❌ [ERRO] Node.js nao foi encontrado no sistema!
echo O projeto requer Node.js v18 ou superior.
echo Por favor, faca o download e instale em: https://nodejs.org/
echo.
pause
exit /b 1

:NODE_INSTALLED
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo  v Node.js detectado (%NODE_VER%)
echo.

:: 2. Verificar se o FFmpeg esta instalado
echo [2/4] Verificando se o FFmpeg esta instalado...
where ffmpeg >nul 2>nul
if %errorlevel% equ 0 goto FFMPEG_INSTALLED

echo.
echo ⚠️ [AVISO] FFmpeg nao foi encontrado no PATH do seu sistema!
echo O FFmpeg eh fundamental para que a transcodificacao de streams RTSP funcione.
echo.
echo Para instalar no Windows:
echo 1. Baixe o FFmpeg (build completo) em: https://ffmpeg.org/download.html
echo 2. Extraia os arquivos (ex: em C:\ffmpeg)
echo 3. Adicione o caminho da pasta bin (ex: C:\ffmpeg\bin) as Variaveis de Ambiente do Sistema (PATH)
echo.
echo A instalacao das dependencias do Node.js continuara, mas lembre-se de configurar o FFmpeg depois!
echo.
set /p FFMPEG_CONFIRM="Deseja continuar a instalacao das dependencias mesmo assim? (S/N): "
if /i "%FFMPEG_CONFIRM%" equ "S" goto FFMPEG_CONTINUE
echo.
echo Instalacao cancelada pelo usuario.
pause
exit /b 0

:FFMPEG_CONTINUE
echo.
goto START_INSTALL

:FFMPEG_INSTALLED
echo  v FFmpeg detectado no PATH do sistema.
echo.

:START_INSTALL
:: Configurar arquivo de variaveis de ambiente (.env) para o backend
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        echo [INFO] Criando arquivo backend\.env a partir de .env.example...
        copy "backend\.env.example" "backend\.env" >nul
    )
)

:: 3. Instalar dependencias da raiz
echo [3/4] Instalando dependencias da raiz (Workspace)...
cd /d "%~dp0"
call npm install --legacy-peer-deps
if %errorlevel% equ 0 goto ROOT_INSTALL_OK

echo.
echo ❌ [ERRO] Houve um problema ao instalar as dependencias da raiz.
echo Verifique sua conexao ou permissoes e tente novamente.
echo.
pause
exit /b 1

:ROOT_INSTALL_OK
echo.

:: 4. Instalar dependencias de todos os submodulos (Frontend + Backend)
echo [4/4] Instalando dependencias do Frontend e Backend...
call npm run install-all
if %errorlevel% equ 0 goto SUB_INSTALL_OK

echo.
echo ❌ [ERRO] Falha ao instalar dependencias do Frontend/Backend.
echo Tente executar "npm install" manualmente dentro das pastas 'frontend' e 'backend'.
echo.
pause
exit /b 1

:SUB_INSTALL_OK
echo.

echo ===================================================
echo  🎉 CONFIGURACAO CONCLUIDA COM SUCESSO!
echo ===================================================
echo.
echo  Tudo foi instalado e configurado perfeitamente!
echo.
echo  Passos seguintes:
echo  1. Feche esta janela.
echo  2. De dois cliques em "start-vms.bat" para rodar o projeto.
echo.
echo ===================================================
echo.
pause
exit
