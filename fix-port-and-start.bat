@echo off
echo Fixing Port 5000 Conflict...

echo Finding processes using port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing process %%a...
    taskkill /F /PID %%a
)

echo Port 5000 cleared!
echo Starting backend server...
cd /d "c:/Users/AnjaliGhumare/Desktop/mail-27-01-26/mail-marketing-app/mail-marketing-app/backend"
npm run dev

pause
