#!/bin/bash

# Simple Setup - No Password Required
# This checks what's installed and guides you through manual installation

set -e

echo "=========================================="
echo "PDF Template Engine - Simple Setup"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${BLUE}→ $1${NC}"; }
print_warning() { echo -e "${YELLOW}! $1${NC}"; }

NEED_INSTALL=false

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not found"
    print_warning "Download from: https://nodejs.org/"
    print_warning "Choose version 18 LTS"
    NEED_INSTALL=true
fi
echo ""

# Check PostgreSQL
echo "Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version | awk '{print $3}')
    print_success "PostgreSQL installed: $PG_VERSION"
    
    # Try to start PostgreSQL if not running
    if ! pg_isready &> /dev/null; then
        print_warning "PostgreSQL not running. Trying to start..."
        # Try different ways to start postgres
        if command -v brew &> /dev/null; then
            brew services start postgresql@14 &> /dev/null || brew services start postgresql &> /dev/null || true
        fi
        sleep 2
    fi
    
    if pg_isready &> /dev/null; then
        print_success "PostgreSQL is running"
    else
        print_warning "PostgreSQL installed but not running"
        print_info "Try: brew services start postgresql@14"
    fi
else
    print_error "PostgreSQL not found"
    print_warning "Download from: https://postgresapp.com/ (easiest)"
    print_warning "Or: https://www.postgresql.org/download/macosx/"
    NEED_INSTALL=true
fi
echo ""

if [ "$NEED_INSTALL" = true ]; then
    echo "=========================================="
    echo -e "${RED}Missing Prerequisites${NC}"
    echo "=========================================="
    echo ""
    echo "Please install the missing software above, then run this script again."
    echo ""
    echo -e "${YELLOW}Quick Install Options:${NC}"
    echo ""
    echo "1. Node.js:"
    echo "   Visit: https://nodejs.org/"
    echo "   Download: 18.x LTS version"
    echo "   Install and restart terminal"
    echo ""
    echo "2. PostgreSQL (Easiest - Postgres.app):"
    echo "   Visit: https://postgresapp.com/"
    echo "   Download and drag to Applications"
    echo "   Click to start"
    echo ""
    echo "After installation, run: ./simple-setup.sh"
    echo ""
    exit 1
fi

# All prerequisites met, continue with setup
echo "=========================================="
print_success "All prerequisites met!"
echo "=========================================="
echo ""

cd "/Users/admin/Desktop/PDF template"

# Install dependencies
print_info "Installing dependencies..."
npm install --silent --no-progress
print_success "Dependencies installed"
echo ""

# Check/Create database
print_info "Setting up database..."
if psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw pdf_template_engine; then
    print_success "Database already exists"
else
    if createdb pdf_template_engine 2>/dev/null; then
        print_success "Database created"
    else
        print_error "Could not create database automatically"
        print_info "Please run manually: createdb pdf_template_engine"
        print_info "Or open psql and run: CREATE DATABASE pdf_template_engine;"
        echo ""
        read -p "Press Enter after creating the database..."
    fi
fi
echo ""

# Run migrations
print_info "Creating database tables..."
npm run migrate
print_success "Database setup complete"
echo ""

# All done
echo "=========================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Starting the server..."
echo ""
echo -e "${GREEN}Server will be at: http://localhost:3000${NC}"
echo ""
echo "Press Ctrl+C to stop"
echo ""
echo "=========================================="
echo ""

# Start server
npm run dev

