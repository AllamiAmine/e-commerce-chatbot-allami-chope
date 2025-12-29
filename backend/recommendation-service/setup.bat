@echo off
REM ShopAI Recommendation Service - Windows Setup Script
REM Run this script to set up and train the recommendation model

echo ============================================
echo   ShopAI AI Recommendation Service Setup
echo ============================================
echo.

REM Check Python version
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

REM Create virtual environment
echo [1/5] Creating virtual environment...
if not exist "venv" (
    python -m venv venv
)

REM Activate virtual environment
echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo [3/5] Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

REM Create necessary directories
echo [4/5] Creating directories...
if not exist "models" mkdir models
if not exist "data\amazon" mkdir data\amazon
if not exist "logs" mkdir logs

REM Train the model
echo [5/5] Training the AI model...
echo.
echo Choose training option:
echo   1. Amazon dataset (recommended, ~5 min download + training)
echo   2. Synthetic data (faster, for testing)
echo   3. Skip training (configure manually later)
echo.
set /p choice="Enter your choice (1/2/3): "

if "%choice%"=="1" (
    echo.
    echo Training with Amazon dataset...
    python train.py --evaluate
) else if "%choice%"=="2" (
    echo.
    echo Training with synthetic data...
    python train.py --synthetic --evaluate
) else (
    echo.
    echo Skipping training. Run 'python train.py' manually later.
)

echo.
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo To start the service:
echo   1. Activate venv: venv\Scripts\activate
echo   2. Run: python -m uvicorn app.main:app --reload --port 8085
echo.
echo API will be available at: http://localhost:8085
echo API docs at: http://localhost:8085/docs
echo.
pause


