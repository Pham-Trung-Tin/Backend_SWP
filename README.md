# NoSmoke Backend API Documentation

## Overview

This project is a backend API built with Node.js, Express, and MySQL database. It provides endpoints for user authentication, user management, and membership management for the NoSmoke application. The API includes a membership system with free, premium, and pro tiers.

## Project Structure

The project is organized as follows:

```
backend-api
├── src
│   ├── config
│   │   └── database.js          # Database connection configuration
│   ├── controllers
│   │   ├── authController.js     # Handles authentication requests
│   │   ├── userController.js     # Manages user-related operations
│   │   └── membershipController.js # Handles membership-related operations
│   ├── middleware
│   │   ├── auth.js               # Authentication middleware
│   │   └── errorHandler.js       # Error handling middleware
│   ├── models
│   │   ├── User.js               # User model definition
│   │   └── Membership.js         # Membership model definition
│   ├── routes
│   │   ├── authRoutes.js         # Authentication routes
│   │   ├── userRoutes.js         # User management routes
│   │   └── membershipRoutes.js    # Membership management routes
│   ├── utils
│   │   └── index.js              # Utility functions
│   ├── app.js                    # Main application file
│   └── server.js                 # Server entry point
├── .env                          # Environment variables
├── .gitignore                    # Files to ignore in git
├── package.json                  # NPM configuration file
└── README.md                     # Project documentation
```

## Setup Instructions

1. **Install Dependencies**
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

2. **Configure MySQL Database**
   - Make sure you have MySQL installed and running
   - Create the database and tables using the SQL script:
   ```bash
   mysql -u root -p < src/config/database.sql
   ```

3. **Configure Environment Variables**
   Edit the `.env` file in the root directory with your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=nosmoke
   
   PORT=5000
   NODE_ENV=development
   
   JWT_SECRET=nosmoke_secret_key
   JWT_EXPIRES_IN=7d
   ```

4. **Run the Application**
   Start the server using:
   ```bash
   npm run dev
   ```
   
   For production:
   ```bash
   npm start
   ```

5. **API Endpoints**
   The following endpoints are available:
   - **Authentication**
     - `POST /api/auth/register` - Register a new user
     - `POST /api/auth/login` - Login a user
     - `GET /api/auth/me` - Get authenticated user info
   
   - **User Management** (All require authentication)
     - `GET /api/users/profile` - Get current user's profile
     - `PUT /api/users/profile` - Update user profile
     - `POST /api/users/change-password` - Change user password
   
   - **Membership Management**
     - `GET /api/memberships` - Get all memberships (public)
     - `GET /api/memberships/type/:type` - Get membership by type (public)
     - `POST /api/memberships/subscribe` - Subscribe to a membership (requires authentication)
     - `GET /api/memberships/subscription` - Get user's active subscription (requires authentication)
     - `POST /api/memberships/check-access` - Check if user has access to a feature (requires authentication)

## Usage Guidelines

- Ensure that your database is running and accessible.
- Use Postman or any API client to test the endpoints.
- Handle errors gracefully using the provided error handling middleware.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.