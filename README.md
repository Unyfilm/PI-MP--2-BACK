# Movie Streaming Platform - Backend

## 📚 Project Overview

Backend API for a movie streaming platform built with Node.js, Express, TypeScript, and MongoDB. This is **Mini Project #2** focused on creating a complete streaming platform with user management, movie catalog, favorites, ratings, and comments functionality.

## 🛠 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, bcryptjs
- **File Upload**: Multer
- **Media Storage**: Cloudinary
- **External APIs**: Pexels API
- **Deployment**: Render

## 📁 Project Structure

```
src/
├── config/          # Configuration files
│   ├── database.ts  # MongoDB connection setup
│   └── environment.ts # Environment variables management
├── controllers/     # Request handlers
│   ├── userController.ts
│   └── movieController.ts
├── middleware/      # Express middleware
│   ├── auth.ts     # Authentication middleware
│   └── validation.ts # Input validation middleware
├── models/         # MongoDB/Mongoose models
│   ├── User.ts
│   └── Movie.ts
├── routes/         # API route definitions
│   ├── userRoutes.ts
│   └── movieRoutes.ts
├── types/          # TypeScript type definitions
│   ├── user.types.ts
│   ├── movie.types.ts
│   └── api.types.ts
├── utils/          # Utility functions
│   ├── auth.utils.ts
│   ├── validation.utils.ts
│   └── response.utils.ts
├── app.ts          # Express app configuration
└── server.ts       # Server entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account
- Cloudinary account (optional, for media storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PI-MP--2-BACK
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env file with your actual values
   ```

4. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PEXELS_API_KEY=your_pexels_api_key
   ```

### Development

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test
```

## 📡 API Endpoints

### Authentication & Users

```
POST   /api/auth/register     # Register new user
POST   /api/auth/login        # User login
GET    /api/users/profile     # Get user profile (Private)
PUT    /api/users/profile     # Update user profile (Private)
DELETE /api/users/account     # Delete user account (Private)
```

### Movies

```
GET    /api/movies            # Get all movies (with pagination/filters)
GET    /api/movies/search     # Search movies
GET    /api/movies/trending   # Get trending movies
GET    /api/movies/:id        # Get movie by ID
POST   /api/movies            # Create movie (Admin only)
PUT    /api/movies/:id        # Update movie (Admin only)
DELETE /api/movies/:id        # Delete movie (Admin only)
```

### System

```
GET    /health               # Health check endpoint
GET    /                     # API information
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📝 Sprint Planning

### Sprint 1: User Management + Movie Exploration
- ✅ User registration, login, logout
- ✅ Password recovery functionality
- ✅ Account management (edit, delete)
- ✅ Movie catalog exploration
- ✅ Video playback controls

### Sprint 2: Favorites and Ratings
- 🔄 Favorite movies functionality
- 🔄 Movie rating system (1-5 stars)
- 🔄 User rating management

### Sprint 3: Comments and Subtitles
- ⏳ Movie comments CRUD
- ⏳ Subtitle management (Spanish/English)
- ⏳ Subtitle toggle functionality

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📦 Deployment

### Render Deployment

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

### Build Commands

```bash
# Build command
npm run build

# Start command
npm start
```

## 🔧 Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use meaningful variable and function names
- Write JSDoc comments for all functions
- Keep code in English

### API Response Format

```typescript
// Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "timestamp": "2024-01-01T00:00:00.000Z"
}

// Error Response
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description",
  "timestamp": "2024-01-01T00:00:00.000Z"
}

// Paginated Response
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🚨 Error Handling

The API implements comprehensive error handling:

- Input validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Resource not found (404)
- Server errors (500)

## 📄 Documentation

- All functions include JSDoc comments
- TypeScript interfaces define data structures
- API endpoints are documented with route comments

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes with proper tests
3. Ensure code follows style guidelines
4. Submit a pull request with description

## 📞 Support

For questions or support, please contact the development team or create an issue in the repository.

---

**Team Roles:**
- **Backend Developer**: Server logic, API endpoints, database management
- **Frontend Developer**: User interface, React components, user experience
- **Database Manager**: MongoDB schemas, queries, data optimization
- **Project Manager**: Sprint planning, task coordination, version control
- **QA Tester**: User testing, accessibility validation, bug reporting

Ahora con text de github funcionando
