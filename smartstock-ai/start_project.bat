@echo off
echo ============================================
echo   SmartStock AI - Starting Application
echo ============================================
echo.

REM Start Backend server
echo [1/2] Starting Backend API on port 3000...
start "SmartStock Backend" cmd /k "cd /d "D:\project ik 5\smartstock-ai\api" && node server.js"

timeout /t 3 /nobreak > nul

REM Start Frontend dev server
echo [2/2] Starting Frontend on port 5173...
start "SmartStock Frontend" cmd /k "cd /d "D:\project ik 5\smartstock-ai" && npm run dev"

timeout /t 5 /nobreak > nul

REM Open browser
echo.
echo Opening browser...
start http://localhost:5173

echo.
echo ============================================
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:5173
echo ============================================
echo   Press any key to close this window...
pause > nul
