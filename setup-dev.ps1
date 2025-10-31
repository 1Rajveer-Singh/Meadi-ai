#!/usr/bin/env pwsh

# Medical AI Platform - Local Development Setup Script
# Sets up .venv and installs dependencies for fast local development

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "MEDICAL AI PLATFORM - LOCAL DEV SETUP" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>$null
    if ($pythonVersion) {
        Write-Host "[OK] Python found: $pythonVersion" -ForegroundColor Green
    } else {
        throw "Python not found"
    }
} catch {
    Write-Host "[ERROR] Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://python.org" -ForegroundColor Yellow
    exit 1
}

# Navigate to backend directory
Set-Location backend

Write-Host ""
Write-Host "Setting up Python virtual environment..." -ForegroundColor Yellow

# Remove existing .venv if it exists
if (Test-Path ".venv") {
    Write-Host "Removing existing .venv..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .venv
}

# Create virtual environment
Write-Host "Creating new virtual environment..." -ForegroundColor Yellow
python -m venv .venv

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
if (Test-Path ".venv\Scripts\Activate.ps1") {
    .\.venv\Scripts\Activate.ps1
} else {
    Write-Host "[ERROR] Failed to create virtual environment" -ForegroundColor Red
    exit 1
}

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install dependencies
Write-Host ""
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
Write-Host "(This may take a few minutes)" -ForegroundColor Gray

pip install -r requirements-dev.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[OK] Python environment setup complete!" -ForegroundColor Green

# Go back to root directory
Set-Location ..

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "SETUP COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start Docker services:  .\start-services.ps1" -ForegroundColor White
Write-Host "  2. Start Python backend:   .\start-backend-local.ps1" -ForegroundColor White
Write-Host "  3. Start frontend:         .\start-frontend.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Or use the all-in-one:      .\start-dev.ps1" -ForegroundColor Green
Write-Host ""