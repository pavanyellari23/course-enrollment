@echo off
REM Course Enrollment System Setup Script for Windows

echo ===================================
echo Course Enrollment System Setup
echo ===================================
echo.

REM Backend Setup
echo [1/4] Setting up backend...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
cd ..
echo Backend setup complete!
echo.

REM Frontend Setup
echo [2/4] Setting up frontend...
cd frontend
call npm install
cd ..
echo Frontend setup complete!
echo.

echo ===================================
echo Setup Complete!
echo ===================================
echo.
echo To run the application:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   venv\Scripts\activate
echo   uvicorn main:app --reload --port 8000
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   npm start
echo.
echo The frontend will open at http://localhost:3000
echo API docs available at http://localhost:8000/docs
echo.
pause
