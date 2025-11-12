@echo off
echo ================================================
echo   StreamPresence - Discord Rich Presence
echo ================================================
echo.

REM Check if .env exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo Please create a .env file with your Discord Client ID
    echo See README.md for configuration details
    echo.
    pause
    exit /b 1
)

REM Check if venv exists
if not exist venv (
    echo [INFO] Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate venv and install requirements
echo [INFO] Installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt
echo.

REM Start the server
echo [INFO] Starting Discord Rich Presence server...
echo.
cd python
python app.py
