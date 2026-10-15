Write-Host "=== Tunnel Watch - DocSexprime ===" -ForegroundColor Cyan
Write-Host "Surveillance active - redemarrage automatique" -ForegroundColor Green
Write-Host ""

while ($true) {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Demarrage du tunnel..." -ForegroundColor Yellow
    & npx localtunnel --port 3000 --subdomain docsexprime-tunisie
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Tunnel arrete. Redemarrage dans 2s..." -ForegroundColor Red
    Start-Sleep -Seconds 2
}
