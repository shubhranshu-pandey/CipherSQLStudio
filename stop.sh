#!/bin/bash

echo "Stopping CipherSQLStudio..."

# Stop Docker containers
echo "Stopping databases..."
docker-compose down

echo "CipherSQLStudio stopped successfully!"
echo ""
echo "To start again, run: ./start.sh"