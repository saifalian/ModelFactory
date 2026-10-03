@echo off
setlocal
echo Starting LiquidityAI Agent Platform...

:: Set paths
set VENV_PATH=backend\venv
set PYTHON_EXE=%VENV_PATH%\Scripts\python.exe

if not exist %PYTHON_EXE% (
    echo [ERROR] Virtual environment not found at %VENV_PATH%
    pause
    exit /b
)

:: Run the GUI only (the GUI will spawn the backend silently)
"%PYTHON_EXE%" gui.py

echo.
echo Application closed.
pause
