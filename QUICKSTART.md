# Quick Start Guide

Get the Penetration Testing Command Generator up and running in minutes.

## 🚀 Option 1: Docker (Recommended)

**Prerequisites:** Docker and Docker Compose

```bash
# 1. Clone the repository
git clone https://github.com/your-username/pentesting.git
cd pentesting

# 2. Start the application
docker-compose up --build -d

# 3. Open your browser
open http://localhost:9000
```

That's it! The application will be running with a pre-seeded database.

## 💻 Option 2: Local Development

**Prerequisites:** Node.js 18+, MongoDB 7.0+

```bash
# 1. Clone and setup
git clone https://github.com/your-username/pentesting.git
cd pentesting

# 2. Install all dependencies
npm run install:all

# 3. Start MongoDB (choose your method)
brew services start mongodb/brew/mongodb-community  # macOS
sudo systemctl start mongod                         # Linux
net start MongoDB                                   # Windows

# 4. Seed the database
npm run seed

# 5. Start development servers
npm run dev

# 6. Open your browser
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

## 📱 First Steps

1. **Explore Categories**: Click on "General" in the left sidebar
2. **Enter Target Info**: Fill in domain, IP, ports, or filename
3. **Generate Commands**: Click "Generate Commands"
4. **Copy & Use**: Click "Copy" on any command to use it

## 🛠️ Quick Commands

```bash
# Stop the application
docker-compose down

# View logs
docker-compose logs -f

# Reset database
docker-compose down -v
docker-compose up --build -d

# Clean Docker cache
docker system prune -a
```

## ❓ Need Help?

- Check the [README.md](README.md) for detailed documentation
- Open an issue on GitHub for problems
- See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

Happy penetration testing! 🔐
