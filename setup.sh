#!/bin/bash

# CipherSQLStudio Setup Script
echo "Setting up CipherSQLStudio..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

echo "Node.js and npm are installed"

# Backend setup
echo "Setting up backend..."
cd backend
npm install
echo "Backend dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created backend .env file from example"
    echo "Please update the .env file with your database credentials"
fi

cd ..

# Frontend setup
echo "Setting up frontend..."
cd frontend
npm install
echo "Frontend dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created frontend .env file from example"
fi

cd ..

echo ""
echo "Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Set up PostgreSQL database and run: backend/src/scripts/setupPostgresSchema.sql"
echo "2. Set up MongoDB database"
echo "3. Update .env files with your database credentials"
echo "4. Run 'npm run seed' in backend directory to populate sample assignments"
echo "5. Start backend: cd backend && npm run dev"
echo "6. Start frontend: cd frontend && npm run dev"
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo "Backend will be available at: http://localhost:5000"