# Script para baixar e instalar o FFmpeg localmente no projeto CamerasLive
$ErrorActionPreference = "Stop"

$zipUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
$zipFile = "ffmpeg.zip"
$extractDir = "ffmpeg-temp"
$binDir = "backend/bin"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "        INSTALADOR AUTOMATICO DO FFMPEG" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "O FFmpeg sera instalado localmente para que o projeto"
Write-Host "funcione sem a necessidade de instalacoes manuais."
Write-Host ""

if (-not (Test-Path $binDir)) {
    Write-Host "[1/4] Criando diretorio de binarios em $binDir..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $binDir | Out-Null
} else {
    Write-Host "[1/4] Diretorio de binarios $binDir pronto." -ForegroundColor Green
}

try {
    Write-Host "[2/4] Baixando FFmpeg (~90MB)... Isso pode levar de 30s a 2min dependendo da sua conexao." -ForegroundColor Yellow
    # Exibe barra de progresso no console
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipFile -UseBasicParsing
    
    Write-Host "[3/4] Extraindo o executavel..." -ForegroundColor Yellow
    if (Test-Path $extractDir) {
        Remove-Item -Path $extractDir -Recurse -Force | Out-Null
    }
    Expand-Archive -Path $zipFile -DestinationPath $extractDir -Force
    
    Write-Host "[4/4] Copiando executavel para a pasta de binarios..." -ForegroundColor Yellow
    $ffmpegExe = Get-ChildItem -Path $extractDir -Filter ffmpeg.exe -Recurse | Select-Object -First 1
    if ($ffmpegExe) {
        Copy-Item -Path $ffmpegExe.FullName -Destination "$binDir/ffmpeg.exe" -Force
        Write-Host ""
        Write-Host "v FFmpeg instalado localmente com sucesso em: $binDir/ffmpeg.exe" -ForegroundColor Green
    } else {
        throw "Nao foi possivel encontrar o arquivo ffmpeg.exe dentro do pacote extraido."
    }
}
catch {
    Write-Host ""
    Write-Host "[ERRO] Ocorreu uma falha na instalacao automatica do FFmpeg:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Por favor, tente rodar este script novamente ou faca a instalacao manual."
}
finally {
    # Limpeza
    Write-Host ""
    Write-Host "Limpando arquivos temporarios de instalacao..." -ForegroundColor Gray
    if (Test-Path $zipFile) {
        Remove-Item -Path $zipFile -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path $extractDir) {
        Remove-Item -Path $extractDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "===================================================" -ForegroundColor Cyan
