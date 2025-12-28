#!/bin/bash
echo "🚀 Quick Deploy - Frontend + PostgreSQL (Backend on Vercel)..."
sudo docker compose -f docker-compose.prod.yml up -d --build