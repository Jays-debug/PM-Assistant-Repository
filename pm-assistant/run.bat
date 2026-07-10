@echo off
title PM Vehicle Tracking System Launcher
echo ====================================================
echo      PM VEHICLE MAINTENANCE TRACKING SYSTEM
echo ====================================================
echo.

rem Check python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.12 or newer.
    pause
    exit /b 1
)

rem Set directory to script location
cd /d "%~dp0"

rem Check if virtual environment exists, if not, create it
if exist venv goto :venv_exists
echo [INFO] Creating Python virtual environment (venv)...
python -m venv venv
if errorlevel 1 (
    echo [ERROR] Failed to create virtual environment.
    pause
    exit /b 1
)
echo [SUCCESS] Virtual environment created successfully.

:venv_exists

rem Activate virtual environment
echo [INFO] Activating virtual environment...
call .\venv\Scripts\activate

rem Install/Upgrade dependencies
echo [INFO] Checking and installing dependencies from requirements.txt...
pip install -r requirements.txt
if errorlevel 1 (
    echo [WARNING] Failed to install some dependencies. Trying manual install...
    pip install fastapi uvicorn sqlalchemy requests apscheduler
)

rem Open web browser
echo [INFO] Opening Web Browser...
start "" "http://127.0.0.1:8050/"

rem Start Uvicorn backend server
echo [INFO] Starting FastAPI Uvicorn server...
echo.
uvicorn main:app --host 127.0.0.1 --port 8050
if errorlevel 1 (
    echo.
    echo [ERROR] Server terminated unexpectedly.
    pause
)
