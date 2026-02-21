@echo off
echo ================================
echo Healthcare Backend Server
echo ================================
echo.

cd backend

echo Checking if MongoDB is running...
echo If you get connection errors, make sure MongoDB is installed and running.
echo.

echo Starting backend server...
echo Server will run on http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo ================================
echo.

npm start
