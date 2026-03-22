# Script para iniciar o servidor de desenvolvimento
# Execute com: powershell -ExecutionPolicy Bypass -File iniciar.ps1

$env:NODE_ENV = "development"
$nodeExec = (Get-Command node).Source
$nextScript = Join-Path $PSScriptRoot "node_modules\next\dist\bin\next"

Write-Host "Iniciando CRM Servicios Ambulancia..." -ForegroundColor Cyan
Write-Host "Acesse: http://localhost:3000" -ForegroundColor Green
Write-Host ""

& $nodeExec $nextScript dev --turbopack --port 3000
