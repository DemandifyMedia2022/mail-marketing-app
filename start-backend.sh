#!/bin/bash

echo "🔧 Fixing Port 5000 Conflict..."

# Find and kill processes using port 5000
echo "📡 Finding processes using port 5000..."
PIDS=$(netstat -ano | grep :5000 | grep LISTENING | awk '{print $5}')

if [ -n "$PIDS" ]; then
    for PID in $PIDS; do
        echo "⚠️  Killing process $PID..."
        taskkill /F /PID $PID 2>/dev/null || kill -9 $PID 2>/dev/null
    done
    echo "✅ Port 5000 cleared!"
else
    echo "✅ Port 5000 is already free"
fi

# Wait a moment for processes to fully terminate
sleep 2

# Start backend server
echo "🚀 Starting backend server..."
cd "c:/Users/AnjaliGhumare/Desktop/mail-27-01-26/mail-marketing-app/mail-marketing-app/backend"
npm run dev
