@echo off
REM Lex Pre-Deployment Test Script for Windows

setlocal enabledelayedexpansion

echo.
echo ================================
echo Lex Pre-Deployment Test Suite
echo ================================
echo.

REM Check if both frontend and backend directories exist
if not exist "lex-frontend" (
    echo [X] Error: lex-frontend directory not found
    exit /b 1
)

if not exist "lex-backend" (
    echo [X] Error: lex-backend directory not found
    exit /b 1
)

echo [OK] Project structure verified
echo.

REM Check .env files
echo Checking environment variables...
if not exist "lex-frontend\.env" (
    echo [X] Frontend .env missing
    exit /b 1
)

if not exist "lex-backend\.env" (
    echo [X] Backend .env missing
    exit /b 1
)

echo [OK] .env files found
echo.

REM Build frontend
echo Building frontend for production...
cd lex-frontend
call npm run build >nul 2>&1

if %errorlevel% neq 0 (
    echo [X] Frontend build failed
    exit /b 1
)

echo [OK] Frontend build successful
if exist "dist" (
    for /f %%A in ('dir /b dist\* ^| find /c /v ""') do set FileCount=%%A
    echo     Output: dist\ with multiple files
)

cd ..

echo.
echo ================================
echo [OK] Pre-Deploy Checks Passed
echo ================================
echo.
echo Next steps:
echo.
echo 1) Start the backend ^(Terminal 1^):
echo    cd lex-backend ^&^& npm run dev
echo.
echo 2) Start the frontend ^(Terminal 2^):
echo    cd lex-frontend ^&^& npm run dev
echo.
echo 3) Open http://localhost:5173 and test:
echo    - Sign up with new email
echo    - Create a situation
echo    - Upload a document
echo    - Identify rights
echo    - Calculate deadlines
echo    - Ask Lex Counsel a question
echo    - Generate a Signal Letter
echo    - View the Timeline
echo.
echo 4) Check browser console and Network tab for any errors
echo.
echo 5) When satisfied, run deployment:
echo    firebase deploy --only hosting
echo.
pause
