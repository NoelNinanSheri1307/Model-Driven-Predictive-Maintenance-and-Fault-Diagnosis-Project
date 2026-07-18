# Start Anomaly Detection System

$backendDir = "interface\backend"
$frontendDir = "interface\frontend"
$audioApiDir = "..\AI_Predictive_Maintenance_Audio\api"

Write-Host "Starting Unified Predictive Maintenance Suite..." -ForegroundColor Cyan

# 1. Start Video Backend (Port 8000)
Write-Host "Launching Video Backend (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $backendDir; python main.py"

# 2. Start Audio Backend (Port 8001)
Write-Host "Launching Audio Backend (Port 8001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $audioApiDir; uvicorn main:app --port 8001"

# 3. Start RUL Backend (Port 8002)
Write-Host "Launching RUL Backend (Port 8002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $backendDir; python rul_backend.py"

# 4. Start Frontend
Write-Host "Launching Main Frontend (Vite)..." -ForegroundColor Yellow
cd $frontendDir
npm run dev
