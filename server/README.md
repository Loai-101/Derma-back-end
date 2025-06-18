# Derma Backend Server

## Project Structure
```
server/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middlewares/    # Custom middlewares
├── models/         # Database models
├── routes/         # API routes
├── utils/          # Utility functions
├── app.js          # Express app setup
├── server.js       # Server entry point
└── package.json    # Project dependencies
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/derma
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

3. Start the development server:
```bash
npm run dev
```

## Coding Standards

### General
- Use ES6+ features
- Follow the Airbnb JavaScript Style Guide
- Use meaningful variable and function names
- Write comments for complex logic
- Keep functions small and focused

### File Structure
- One class/component per file
- Group related files in directories
- Use index.js for exports

### Error Handling
- Use try-catch blocks for async operations
- Implement proper error middleware
- Log errors using Winston

### Security
- Use environment variables for sensitive data
- Implement rate limiting
- Use Helmet for security headers
- Validate input data
- Sanitize user inputs

### API Design
- Use RESTful conventions
- Version your APIs (e.g., /api/v1/...)
- Return consistent response formats
- Implement proper status codes

### Database
- Use Mongoose schemas for data validation
- Implement proper indexing
- Use transactions when needed
- Handle database errors properly

### Testing
- Write unit tests for critical functions
- Implement integration tests
- Use proper test naming conventions

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with nodemon
- `npm test`: Run tests
- `npm run lint`: Run ESLint 