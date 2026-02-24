@echo off
echo Finding your server's IP address...
echo.

echo Local IP Addresses:
ipconfig | findstr "IPv4"

echo.
echo Public IP Address:
curl -s ifconfig.me

echo.
echo.
echo To fix click tracking for external access:
echo 1. Update APP_BASE_URL in .env file to use your server IP
echo 2. Example: APP_BASE_URL=http://192.168.1.100:5000
echo 3. Example: APP_BASE_URL=http://YOUR_PUBLIC_IP:5000
echo 4. Restart the backend server after updating
echo.
pause
