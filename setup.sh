#!/bin/bash

# PDF Template Engine - Automated Setup Script
# This script will install everything needed and start the application

set -e  # Exit on error

echo "=========================================="
echo "PDF Template Engine - Automated Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS"
    exit 1
fi

print_success "Running on macOS $(sw_vers -productVersion)"
echo ""

# Step 1: Install Homebrew
print_info "Step 1/7: Checking Homebrew..."
if ! command -v brew &> /dev/null; then
    echo "Homebrew not found. Installing Homebrew..."
    echo "You may be prompted for your password..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ $(uname -m) == 'arm64' ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    
    print_success "Homebrew installed"
else
    print_success "Homebrew already installed"
fi
echo ""

# Step 2: Install Node.js
print_info "Step 2/7: Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 18..."
    brew install node@18
    brew link node@18
    print_success "Node.js installed: $(node --version)"
else
    print_success "Node.js already installed: $(node --version)"
fi
echo ""

# Step 3: Install PostgreSQL
print_info "Step 3/7: Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL 14..."
    brew install postgresql@14
    brew link postgresql@14
    print_success "PostgreSQL installed"
else
    print_success "PostgreSQL already installed"
fi
echo ""

# Step 4: Start PostgreSQL
print_info "Step 4/7: Starting PostgreSQL..."
brew services start postgresql@14 2>/dev/null || brew services restart postgresql@14
sleep 3  # Wait for PostgreSQL to start
print_success "PostgreSQL is running"
echo ""

# Step 5: Create Database
print_info "Step 5/7: Setting up database..."
if psql -lqt | cut -d \| -f 1 | grep -qw pdf_template_engine; then
    print_success "Database 'pdf_template_engine' already exists"
else
    createdb pdf_template_engine
    print_success "Database 'pdf_template_engine' created"
fi
echo ""

# Step 6: Install Dependencies
print_info "Step 6/7: Installing application dependencies..."
cd "/Users/admin/Desktop/PDF template"
npm install --silent
print_success "Dependencies installed"
echo ""

# Step 7: Run Migrations
print_info "Step 7/7: Running database migrations..."
npm run migrate
print_success "Database tables created"
echo ""

# All done!
echo "=========================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Starting the server..."
echo ""
echo -e "${GREEN}API will be available at: http://localhost:3000${NC}"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "=========================================="
echo ""

# Start the development server
npm run dev

