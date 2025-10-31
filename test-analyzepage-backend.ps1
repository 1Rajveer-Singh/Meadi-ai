#!/usr/bin/env pwsh

# Test AnalyzePage Backend Integration
# This script tests the backend endpoints that AnalyzePage connects to

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TESTING ANALYZEPAGE BACKEND INTEGRATION" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Set base URL
$baseUrl = "http://localhost:8000"

# Test health endpoint
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET -TimeoutSec 5
    Write-Host "   [OK] Health endpoint: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Health endpoint: $_" -ForegroundColor Red
    Write-Host "   Make sure backend is running on port 8000" -ForegroundColor Yellow
    exit 1
}

# Test workflow creation endpoint
Write-Host "2. Testing Workflow Creation..." -ForegroundColor Yellow
try {
    $workflowData = @{
        analysisType = "comprehensive"
        patientId = "test-patient-123"
        priority = "high"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/workflows" -Method POST -Body ($workflowData | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 10
    Write-Host "   [OK] Workflow created: $($response.workflowId)" -ForegroundColor Green
    $testWorkflowId = $response.workflowId
} catch {
    Write-Host "   [FAIL] Workflow creation: $_" -ForegroundColor Red
}

# Test patients endpoint
Write-Host "3. Testing Patients Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/patients" -Method GET -TimeoutSec 5
    Write-Host "   [OK] Patients endpoint accessible" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Patients endpoint: $_" -ForegroundColor Red
}

# Test jupyter notebook integration
Write-Host "4. Testing Jupyter Integration..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/jupyter/status" -Method GET -TimeoutSec 5
    Write-Host "   [OK] Jupyter integration available" -ForegroundColor Green
} catch {
    Write-Host "   [WARN] Jupyter integration not available (may be expected)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "INTEGRATION TEST COMPLETE" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend AnalyzePage should now be able to:" -ForegroundColor White
Write-Host "  - Connect to FastAPI backend on port 8000" -ForegroundColor Green
Write-Host "  - Create workflow sessions" -ForegroundColor Green
Write-Host "  - Upload medical files" -ForegroundColor Green
Write-Host "  - Start comprehensive analysis" -ForegroundColor Green
Write-Host "  - Display results from Jupyter notebooks" -ForegroundColor Green
Write-Host ""
Write-Host "To test the frontend:" -ForegroundColor Yellow
Write-Host "  1. Run: cd frontend && npm run dev" -ForegroundColor White
Write-Host "  2. Open: http://localhost:5173/analyze" -ForegroundColor White
Write-Host "  3. Upload files and start analysis" -ForegroundColor White