#!/bin/bash

echo "🚀 Deploying CipherSQLStudio Frontend + PostgreSQL..."
echo "Backend: Using Vercel (https://cipher-sql-studio-assignment-qikk-c8l2ris8x.vercel.app)"

# Stop existing containers
echo "Stopping existing containers..."
sudo docker compose -f docker-compose.prod.yml down

# Build and start containers
echo "Building and starting containers..."
sudo docker compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Check container status
echo "Checking container status..."
sudo docker compose -f docker-compose.prod.yml ps

# Check health
echo "Checking service health..."
echo "Frontend: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3330 || echo 'Not ready')"
echo "Backend (Vercel): $(curl -s -o /dev/null -w '%{http_code}' https://cipher-sql-studio-assignment-qikk-c8l2ris8x.vercel.app/api/health || echo 'Not ready')"

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "Services:"
echo "Frontend: http://localhost:3330"
echo "Backend API: https://cipher-sql-studio-assignment-qikk-c8l2ris8x.vercel.app/api (Vercel)"
echo "PostgreSQL: localhost:5544"
echo ""
echo "Architecture:"
echo "Frontend (Docker) → Backend (Vercel) → MongoDB Atlas"
echo "Frontend (Docker) → PostgreSQL (Docker) [for SQL sandbox]"
echo ""
echo "To view logs: sudo docker compose -f docker-compose.prod.yml logs -f"
echo "To stop: sudo docker compose -f docker-compose.prod.yml down"