#!/bin/sh
set -e

echo "Starting Penetration Testing Command Generator..."

# Wait for MongoDB to be ready (if using Docker Compose)
if [ -n "$MONGODB_URI" ] && echo "$MONGODB_URI" | grep -q "mongodb://"; then
  echo "Waiting for MongoDB to start..."
  while ! nc -z mongodb 27017; do
    echo "MongoDB is unavailable - sleeping..."
    sleep 2
  done
  echo "MongoDB is ready!"
fi

# Navigate to backend directory
cd /app/backend

# Set environment variables for production
export NODE_ENV=production
export PORT=9000

# Start the backend server which now serves the frontend too
echo "Starting server on port 9000..."
exec node server.js
