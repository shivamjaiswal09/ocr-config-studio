#!/bin/bash

# Run Script - Start PDF Template Engine
# This script sets up PATH and starts the application

set -e

echo "=========================================="
echo "Starting PDF Template Engine"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${YELLOW}→ $1${NC}"; }

# Add Postgres.app to PATH for this session
export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"

cd "/Users/admin/Desktop/PDF template"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please restart your terminal."
    exit 1
fi
print_success "Node.js found: $(node --version)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL not found in PATH"
    print_info "Make sure Postgres.app is running (check for 🐘 in menu bar)"
    exit 1
fi
print_success "PostgreSQL found: $(psql --version | awk '{print $3}')"

# Check if Postgres is running
if ! pg_isready -h localhost &> /dev/null; then
    print_error "PostgreSQL is not running"
    print_info "Please open Postgres.app and make sure it's running (🐘 icon in menu bar)"
    exit 1
fi
print_success "PostgreSQL is running"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies (first time only)..."
    npm install --silent
    print_success "Dependencies installed"
    echo ""
fi

# Create database if it doesn't exist
print_info "Setting up database..."
if psql -lqt | cut -d \| -f 1 | grep -qw pdf_template_engine; then
    print_success "Database exists"
else
    createdb pdf_template_engine
    print_success "Database created"
fi
echo ""

# Run migrations
print_info "Setting up database tables..."
npm run migrate
print_success "Database ready"
echo ""

# Start server
echo "=========================================="
echo -e "${GREEN}🎉 Starting Server${NC}"
echo "=========================================="
echo ""
echo -e "${GREEN}API: http://localhost:3000${NC}"
echo -e "${GREEN}Health: http://localhost:3000/health${NC}"
echo ""
echo "Press Ctrl+C to stop"
echo ""
echo "=========================================="
echo ""

npm run dev

