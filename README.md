# Penetration Testing Command Generator

A comprehensive MERN stack application for generating and managing penetration testing commands. This tool serves as an intelligent cheat sheet for cybersecurity professionals, featuring dynamic placeholder substitution, drag-and-drop organization, and full CRUD operations for commands and categories.

![Penetration Testing Command Generator](https://img.shields.io/badge/Tech-MERN%20Stack-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-ISC-yellow)

## 🚀 Features

### Core Functionality
- **Flexible Input System**: Enter any combination of domain, IP addresses, ports, and filenames
- **Smart Placeholder Replacement**: Only replaces placeholders for fields that are filled
- **Multi-Category Support**: Organize commands by testing categories and phases
- **Copy-to-Clipboard**: One-click command copying for immediate use
- **Search Functionality**: Quick command discovery across all categories

### Management Features
- **Drag-and-Drop Reordering**: Reorganize commands and categories with visual feedback
- **Full CRUD Operations**: Create, read, update, and delete commands and categories
- **Accordion Navigation**: Expandable/collapsible category menus
- **Inline Editing**: Edit category names and descriptions directly in the interface
- **Admin Panel**: Complete management interface for categories and commands

### User Experience
- **Dark Hacker Theme**: Professional cybersecurity-focused design
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Immediate feedback and database persistence
- **Error Handling**: User-friendly error messages and validation

## 🏗️ Architecture

### Frontend (React)
- **React 19** with modern hooks and functional components
- **@dnd-kit** for drag-and-drop functionality
- **Axios** for API communication
- **CSS3** with custom hacker-themed styling

### Backend (Node.js/Express)
- **Express.js 5** RESTful API
- **Mongoose** ODM for MongoDB integration
- **CORS** enabled for cross-origin requests
- **Environment-based configuration**

### Database (MongoDB)
- **Categories Collection**: Hierarchical category structure with ordering
- **Commands Collection**: Command storage with metadata and relationships
- **Automatic seeding**: Pre-populated with common penetration testing commands

## 🐳 Quick Start with Docker (Recommended)

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/pentesting.git
   cd pentesting
   ```

2. **Start the application**
   ```bash
   docker-compose up --build -d
   ```

3. **Access the application**
   - Open your browser to `http://localhost:9000`
   - The database will be automatically seeded with sample commands

4. **View logs (optional)**
   ```bash
   docker-compose logs -f
   ```

5. **Stop the application**
   ```bash
   docker-compose down
   ```

## 💻 Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB 7.0+
- Git

### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**
   ```bash
   # Create .env file in backend directory
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/pentesting
   NODE_ENV=development
   ```

3. **Start MongoDB**
   ```bash
   # macOS with Homebrew
   brew services start mongodb/brew/mongodb-community
   
   # Linux with systemd
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```

3. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001`

### Full Development Mode

From the root directory:
```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend concurrently
npm run dev
```

## 📖 Usage Guide

### Basic Usage

1. **Select a Category**: Click on any category in the left navigation to expand it
2. **Enter Target Information**: Fill in any combination of:
   - **Domain**: `example.com`, `target.local`
   - **IP/Range**: `192.168.1.100`, `10.0.0.0/24`
   - **Ports**: `80,443,8080`, `1-65535`
   - **Filename**: `output.txt`, `results.json`

3. **Generate Commands**: Click "Generate Commands" to apply your inputs
4. **Copy Commands**: Use the "Copy" button on any command to copy it to clipboard

### Placeholder System

The application supports four placeholder types:

- `{domain}` → Replaced with domain input
- `{ip/range}` → Replaced with IP/range input
- `{ports}` → Replaced with ports input
- `{filename}` → Replaced with filename input

**Example:**
```bash
# Original command
nmap -p {ports} {ip/range} -o {filename}

# With inputs: ports="80,443", ip/range="192.168.1.0/24", filename="scan.txt"
nmap -p 80,443 192.168.1.0/24 -o scan.txt

# Partial input: only ports="22,80,443" 
nmap -p 22,80,443 {ip/range} -o {filename}
```

### Command Management

#### Adding Commands
1. Click "Add Command" button
2. Fill in command details:
   - **Name**: Descriptive command name
   - **Command**: The actual command with placeholders
   - **Description**: Purpose and usage notes
   - **Category**: Select appropriate category
   - **Phase**: Testing phase (Reconnaissance, Scanning, etc.)
   - **Tags**: Keywords for search

#### Editing Commands
1. Click the edit (✏️) button on any command
2. Modify fields as needed
3. Click "Save Changes"

#### Reordering Commands
1. Use the drag handle (⋮⋮) on any command
2. Drag to desired position
3. Changes are automatically saved

### Category Management

#### Adding Categories
1. Click "Add Category" button
2. Enter category details:
   - **Name**: Category display name
   - **Type**: Category identifier
   - **Description**: Category purpose

#### Managing Categories
1. Click "Edit Categories" button
2. Available actions:
   - **Rename**: Click edit button and modify inline
   - **Reorder**: Drag categories to new positions
   - **Delete**: Click delete button (⚠️ This removes all commands in the category)

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/pentesting

# CORS (optional)
FRONTEND_URL=http://localhost:3000
```

#### Docker Environment
```env
NODE_ENV=production
MONGODB_URI=mongodb://mongodb:27017/pentesting
```

### Database Collections

#### Categories Schema
```javascript
{
  name: String,           // Display name
  type: String,           // Unique identifier
  description: String,    // Category description
  order: Number,          // Display order
  isDefault: Boolean,     // System category flag
  parentCategory: ObjectId // Hierarchical reference
}
```

#### Commands Schema
```javascript
{
  name: String,           // Command name
  command: String,        // Command with placeholders
  description: String,    // Usage description
  category: ObjectId,     // Category reference
  phase: String,          // Testing phase
  tags: [String],         // Search keywords
  order: Number           // Display order within category
}
```

## 🛠️ API Endpoints

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `PUT /api/categories/reorder` - Reorder categories

### Commands
- `GET /api/commands` - List all commands
- `GET /api/commands?category=:type` - Filter by category
- `POST /api/commands` - Create new command
- `PUT /api/commands/:id` - Update command
- `DELETE /api/commands/:id` - Delete command
- `PUT /api/commands/reorder` - Reorder commands

### Search
- `GET /api/search?q=:query` - Search commands by name/description/tags

## 📦 Dependencies

### Backend Dependencies
```json
{
  "express": "^5.1.0",           // Web framework
  "mongoose": "^8.16.4",         // MongoDB ODM
  "cors": "^2.8.5",              // Cross-origin resource sharing
  "dotenv": "^17.2.0"            // Environment variable management
}
```

### Frontend Dependencies
```json
{
  "react": "^19.1.0",            // UI framework
  "react-dom": "^19.1.0",        // React DOM rendering
  "axios": "^1.10.0",            // HTTP client
  "@dnd-kit/core": "^6.3.1",     // Drag and drop core
  "@dnd-kit/sortable": "^10.0.0", // Sortable drag and drop
  "@dnd-kit/utilities": "^3.2.2"  // Drag and drop utilities
}
```

### Development Dependencies
```json
{
  "nodemon": "^3.1.10",          // Backend hot reload
  "react-scripts": "^5.0.1",     // React build tools
  "concurrently": "^9.2.0"       // Run multiple commands
}
```

## 🐛 Troubleshooting

### Common Issues

**Docker Issues:**
```bash
# Permission denied
sudo docker-compose up --build -d

# Port already in use
docker-compose down
lsof -ti:9000 | xargs kill -9

# Clear Docker cache
docker system prune -a
```

**Database Connection Issues:**
```bash
# Check MongoDB status
brew services list | grep mongo  # macOS
sudo systemctl status mongod     # Linux

# Reset database
docker-compose down -v
docker-compose up --build -d
```

**Frontend Build Issues:**
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Memory issues during build
export NODE_OPTIONS="--max_old_space_size=8192"
```

### Log Files
```bash
# Docker logs
docker-compose logs app
docker-compose logs mongodb

# Local development
tail -f backend/logs/app.log
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add comments for complex logic
- Update tests for new features
- Update documentation for API changes
- Ensure Docker builds successfully

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with the MERN stack
- Drag and drop functionality powered by @dnd-kit
- Inspired by the cybersecurity community's need for efficient tooling

## 📞 Support

For support, feature requests, or bug reports, please open an issue on GitHub.
   
   Create a `.env` file in the `backend` directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/pentesting
   PORT=5000
   ```

5. **Seed the database**
   ```bash
   cd backend
   npm run seed
   ```

## Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The API will be available at http://localhost:5000

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```
   The application will be available at http://localhost:3000

### Production Mode

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend**
   ```bash
   cd backend
   npm start
   ```

## Usage

1. **Select Category**: Choose from Web Application, Internal Network, or External Network testing
2. **Enter Domain**: Input your target domain in the domain field
3. **Generate Commands**: Click "Generate Commands" to populate all commands with your domain
4. **Copy Commands**: Use the copy button to copy individual commands to your clipboard
5. **Add New Content**: Use the Admin Panel to add new categories or commands

## API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/type/:type` - Get categories by type
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Commands
- `GET /api/commands` - Get all commands
- `GET /api/commands/category/:categoryId` - Get commands by category
- `GET /api/commands/phase/:phase` - Get commands by phase
- `POST /api/commands/generate` - Generate commands with domain substitution
- `POST /api/commands` - Create new command
- `PUT /api/commands/:id` - Update command
- `DELETE /api/commands/:id` - Delete command

## Database Schema

### Category Model
- `name`: String (required, unique)
- `type`: String (Web Application, Internal Network, External Network)
- `description`: String

### Command Model
- `name`: String (required)
- `command`: String (required) - Use `{domain}` as placeholder
- `description`: String
- `category`: ObjectId (reference to Category)
- `phase`: String (Reconnaissance, Scanning, Enumeration, etc.)
- `tags`: Array of Strings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Security Note

This tool is intended for authorized penetration testing and security research only. Always ensure you have proper authorization before testing any systems.
