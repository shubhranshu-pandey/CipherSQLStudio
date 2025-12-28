#!/bin/bash

echo "Starting CipherSQLStudio..."

# Start Docker containers (PostgreSQL only - MongoDB Atlas used for assignments)
echo "Starting PostgreSQL database..."
docker-compose up -d

# Wait for database to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Check database health
echo "Checking database health..."
docker-compose ps

echo ""
echo "CipherSQLStudio is ready!"
echo ""
echo "Services:"
echo "Frontend: http://localhost:3002"
echo "Backend API: http://localhost:5002"
echo "Backend Health: http://localhost:5002/api/health"
echo ""
echo "Databases:"
echo "PostgreSQL: localhost:5432 (user: postgres, db: sqlstudio_sandbox)"
echo "MongoDB: Using Atlas (cloud) - Configure MONGODB_URI in backend/.env"
echo ""
echo "To start the development servers:"
echo "Backend:  cd backend && npm run dev"
echo "Frontend: cd frontend && npm run dev"
echo ""
echo "Next steps:"
echo "1. Update MONGODB_URI in backend/.env with your Atlas connection string"
echo "2. Run: cd backend && node src/scripts/simpleSeed.js (to seed assignments)"
echo ""
echo "To stop PostgreSQL: docker-compose down"