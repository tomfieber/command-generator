# Docker Deployment Guide

## Quick Start with Docker Compose

1. **Build and start the application:**
   ```bash
   npm run docker:up
   ```

2. **Access the application:**
   - Open your browser and go to: `http://localhost:9000`

3. **Seed the database (if needed):**
   ```bash
   docker exec -it pentesting-app sh -c "cd backend && node seeders/seedDatabase.js"
   ```

4. **View logs:**
   ```bash
   npm run docker:logs
   ```

5. **Stop the application:**
   ```bash
   npm run docker:down
   ```

## Manual Docker Build

1. **Build the image:**
   ```bash
   npm run docker:build
   ```

2. **Run with external MongoDB:**
   ```bash
   docker run -p 9000:9000 -e MONGODB_URI=mongodb://your-mongo-host:27017/pentesting pentesting-app
   ```

## Available NPM Scripts

- `npm run docker:build` - Build the Docker image
- `npm run docker:run` - Run the container (requires external MongoDB)
- `npm run docker:up` - Start with Docker Compose (includes MongoDB)
- `npm run docker:down` - Stop Docker Compose services
- `npm run docker:logs` - View application logs

## Environment Variables

- `NODE_ENV` - Set to 'production' for production build
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Port to run the application on (default: 9000)

## Architecture

The Docker setup includes:
- **Multi-stage build** for optimized image size
- **MongoDB 7** for database
- **Health checks** for both services
- **Production-ready configuration** with security best practices
- **Automatic database seeding** on first run

## Ports

- **Application**: `9000` (configurable)
- **MongoDB**: `27017` (for external access)

## Data Persistence

MongoDB data is persisted in a Docker volume named `mongodb_data`.

## Troubleshooting

1. **Check if services are healthy:**
   ```bash
   docker-compose ps
   ```

2. **View logs:**
   ```bash
   docker-compose logs app
   docker-compose logs mongodb
   ```

3. **Reset database:**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```
