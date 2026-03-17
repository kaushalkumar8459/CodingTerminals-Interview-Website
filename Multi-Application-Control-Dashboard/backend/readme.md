# Backend Setup Guide

## Prerequisites

Before setting up the backend, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (either locally installed or cloud-based like MongoDB Atlas)

## Installation Steps

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Copy the `.env.example` file to create your own `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your environment-specific values, particularly the MongoDB connection string:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=your_jwt_expiration_time
   ```

## Running the Application

### Development Mode
To run the application in development mode with auto-reload:

```bash
npm run start:dev
```

### Production Mode
To build and run the application in production mode:

```bash
npm run build
npm run start:prod
```

## Database Seeding

To create demo credentials for super admin, admin, and viewer accounts, you need to execute the seed script for new database setup.

### Execute Seed Script

1. Build the application:
   ```bash
   npm run build
   ```

2. Run the seed script:
   ```bash
   node dist/superadminscript/seed.js
   ```

This will create the following demo accounts:

- **Super Admin**: admin@example.com / AdminPass123!
- **Admin**: editor@example.com / EditorPass123!
- **Viewer**: viewer@example.com / ViewerPass123!

## Other Available Scripts

- `npm run build` - Compile TypeScript files
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with auto-reload
- `npm run start:debug` - Start in debug mode
- `npm run test` - Run unit tests
- `npm run test:watch` - Run unit tests in watch mode
- `npm run lint` - Lint the codebase
- `npm run format` - Format the codebase with prettier