#!/bin/bash

# Admin UI Setup Script
# Run this in a separate terminal after the main server is running

set -e

echo "=========================================="
echo "Setting up Admin UI..."
echo "=========================================="
echo ""

cd "/Users/admin/Desktop/PDF template/admin-ui"

# Install dependencies
echo "Installing dependencies..."
npm install --silent

echo ""
echo "=========================================="
echo "✓ Admin UI Setup Complete!"
echo "=========================================="
echo ""
echo "Starting Admin UI..."
echo ""
echo "Admin UI will be available at: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start the admin UI
npm run dev

