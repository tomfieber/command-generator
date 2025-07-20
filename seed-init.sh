#!/bin/bash
set -e

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be fully ready..."
sleep 10

# Use the Node.js seeder
echo "Running database seeder..."
cd /app/backend && node seeders/seedDatabase.js

echo "Database seeding completed!"
