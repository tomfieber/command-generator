# Contributing to Penetration Testing Command Generator

Thank you for your interest in contributing to the Penetration Testing Command Generator! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker to report bugs or suggest features
- Provide detailed information including steps to reproduce
- Include system information (OS, Node.js version, Docker version)

### Feature Requests
- Open a GitHub issue with the "enhancement" label
- Describe the use case and expected behavior
- Include mockups or examples if applicable

### Code Contributions

1. **Fork the Repository**
   ```bash
   git fork https://github.com/your-username/pentesting.git
   cd pentesting
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow existing code style and conventions
   - Add comments for complex logic
   - Update documentation if needed

4. **Test Your Changes**
   ```bash
   # Local development
   npm run dev
   
   # Docker testing
   docker-compose up --build -d
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add: brief description of your changes"
   ```

6. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📋 Development Guidelines

### Code Style

#### Frontend (React)
- Use functional components with hooks
- Follow React best practices and patterns
- Use meaningful variable and function names
- Keep components small and focused

#### Backend (Node.js/Express)
- Use async/await for asynchronous operations
- Implement proper error handling
- Follow RESTful API conventions
- Use meaningful HTTP status codes

#### Database (MongoDB)
- Use proper indexing for performance
- Validate data with Mongoose schemas
- Handle database errors gracefully

### File Organization
```
pentesting/
├── backend/
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routes
│   ├── middleware/       # Custom middleware
│   ├── seeders/          # Database seeders
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── utils/        # Helper functions
│   │   └── App.js        # Main component
│   └── public/
└── docker-compose.yml
```

### Commit Message Format
Use clear, descriptive commit messages:
```
Type: Brief description

- Add: New feature or functionality
- Fix: Bug fixes
- Update: Modifications to existing features
- Remove: Deleted code or features
- Docs: Documentation updates
- Style: Code formatting changes
- Refactor: Code restructuring
```

### Testing

#### Manual Testing Checklist
- [ ] Application starts without errors
- [ ] All CRUD operations work correctly
- [ ] Drag-and-drop functionality works
- [ ] Placeholder replacement works with various inputs
- [ ] Error handling displays appropriate messages
- [ ] Responsive design works on different screen sizes

#### Docker Testing
```bash
# Build and test Docker image
docker-compose up --build -d
docker-compose logs -f

# Test API endpoints
curl http://localhost:9000/api/categories
curl http://localhost:9000/api/commands

# Clean up
docker-compose down -v
```

## 🎯 Areas for Contribution

### High Priority
- **Testing Framework**: Add automated tests for frontend and backend
- **Performance Optimization**: Improve loading times and responsiveness
- **Security Enhancements**: Add authentication and authorization
- **Mobile Responsiveness**: Improve mobile user experience

### Medium Priority
- **Command Templates**: Add more penetration testing command templates
- **Export/Import**: Add functionality to export/import command sets
- **Theme Customization**: Add multiple theme options
- **Search Enhancement**: Improve search functionality with filters

### Low Priority
- **Documentation**: Improve inline documentation and comments
- **Logging**: Add comprehensive logging system
- **Monitoring**: Add health checks and monitoring endpoints
- **Internationalization**: Add support for multiple languages

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment Information**
   - Operating System and version
   - Node.js version
   - Docker version (if using Docker)
   - Browser and version (for frontend issues)

2. **Steps to Reproduce**
   - Detailed step-by-step instructions
   - Expected behavior vs. actual behavior
   - Screenshots or error messages

3. **Additional Context**
   - Any recent changes to your environment
   - Related issues or discussions

## 🔍 Code Review Process

1. **Automated Checks**
   - Code must build successfully
   - Docker containers must start without errors
   - No console errors in browser

2. **Manual Review**
   - Code follows project conventions
   - Changes are well-documented
   - No security vulnerabilities introduced

3. **Testing**
   - New features include appropriate tests
   - Existing functionality is not broken
   - Performance is not significantly impacted

## 📝 Documentation Standards

- Update README.md for new features
- Add inline comments for complex logic
- Update API documentation for endpoint changes
- Include usage examples for new functionality

## 🙋 Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check the README.md and inline comments

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the ISC License.

Thank you for contributing to the Penetration Testing Command Generator! 🔐
