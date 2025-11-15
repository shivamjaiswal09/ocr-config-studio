#!/bin/bash

cd "/Users/admin/Desktop/PDF template/admin-ui"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing admin UI dependencies..."
    npm install --silent
fi

echo ""
echo "=========================================="
echo "Starting Admin UI..."
echo "=========================================="
echo ""
echo "Admin UI will be at: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev

