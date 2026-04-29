#!/bin/bash

# Qzit Quiz Generator - Setup Script for macOS/Linux
# This script helps set up the project on macOS/Linux

echo ""
echo "===================================="
echo " Qzit - Quiz Generator Setup"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please download and install Node.js from https://nodejs.org/"
    echo ""
    exit 1
fi

echo "[✓] Node.js is installed: $(node --version)"
echo "[✓] npm is installed: $(npm --version)"
echo ""

# Backend setup
echo "===================================="
echo "Setting up Backend..."
echo "===================================="
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install backend dependencies"
        exit 1
    fi
    echo "[✓] Backend dependencies installed"
else
    echo "[✓] Backend dependencies already installed"
fi

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "[✓] Created .env file"
    echo "   Please edit backend/.env with your MongoDB connection string"
else
    echo "[✓] .env file already exists"
fi

cd ..

# Frontend setup
echo ""
echo "===================================="
echo "Setting up Frontend..."
echo "===================================="
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install frontend dependencies"
        exit 1
    fi
    echo "[✓] Frontend dependencies installed"
else
    echo "[✓] Frontend dependencies already installed"
fi

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "[✓] Created .env file"
else
    echo "[✓] .env file already exists"
fi

cd ..

echo ""
echo "===================================="
echo "Setup Complete!"
echo "===================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Make sure MongoDB is running:"
echo "   - Run: brew services start mongodb-community"
echo "   - Or use MongoDB Atlas (cloud)"
echo ""
echo "2. Edit backend/.env file:"
echo "   - Add your MongoDB connection string"
echo "   - Default: mongodb://localhost:27017/qzit"
echo ""
echo "3. Start the backend (Terminal 1):"
echo "   cd backend"
echo "   npm start"
echo ""
echo "4. Start the frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "5. Frontend will open at http://localhost:3000"
echo ""
echo "For more details, see:"
echo "- QUICKSTART.md - Quick start guide"
echo "- README.md - Full documentation"
echo "- INSTALLATION.md - Detailed installation guide"
echo ""
