# Getting Started

<cite>
**Referenced Files in This Document**
- [backend/package.json](file://backend/package.json)
- [frontend/package.json](file://frontend/package.json)
- [backend/.env.example](file://backend/.env.example)
- [backend/.env](file://backend/.env)
- [backend/src/main.ts](file://backend/src/main.ts)
- [backend/src/app.module.ts](file://backend/src/app.module.ts)
- [backend/src/superadminscript/seed.ts](file://backend/src/superadminscript/seed.ts)
- [backend/readme.md](file://backend/readme.md)
- [frontend/README.md](file://frontend/README.md)
- [frontend/src/environments/environment.ts](file://frontend/src/environments/environment.ts)
- [frontend/src/app/app.config.ts](file://frontend/src/app/app.config.ts)
- [backend/nest-cli.json](file://backend/nest-cli.json)
- [frontend/angular.json](file://frontend/angular.json)
- [backend/tsconfig.json](file://backend/tsconfig.json)
- [frontend/tsconfig.json](file://frontend/tsconfig.json)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Environment Setup](#environment-setup)
5. [Database Initialization](#database-initialization)
6. [First Run](#first-run)
7. [Development Workflow](#development-workflow)
8. [Build Processes](#build-processes)
9. [Basic Usage Examples](#basic-usage-examples)
10. [Verification Steps](#verification-steps)
11. [Troubleshooting](#troubleshooting)
12. [Conclusion](#conclusion)

## Introduction
This guide helps you set up and run the Multi-Application-Control-Dashboard locally. It covers prerequisites, installation, environment configuration, database initialization, first run, development server startup, build processes, basic usage, verification, and troubleshooting.

## Prerequisites
Ensure the following tools are installed on your machine:
- Node.js (LTS recommended)
- Angular CLI (installed globally)
- Nest CLI (installed globally)
- MongoDB (local or remote instance)

These tools are required to build and run both the backend (NestJS) and frontend (Angular) applications.

**Section sources**
- [backend/package.json](file://backend/package.json#L18-L44)
- [frontend/package.json](file://frontend/package.json#L25-L41)

## Installation
Follow these steps to install dependencies for both backend and frontend:

1. Open a terminal in the repository root.
2. Install backend dependencies:
   - Navigate to the backend directory and run the package manager install command.
3. Install frontend dependencies:
   - Navigate to the frontend directory and run the package manager install command.

After installation, both applications are ready to configure and run.

**Section sources**
- [backend/package.json](file://backend/package.json#L1-L45)
- [frontend/package.json](file://frontend/package.json#L1-L43)

## Environment Setup
Configure environment variables for both backend and frontend:

Backend (.env):
- Copy the example environment file to .env and adjust values as needed.
- Set application port, environment mode, MongoDB connection URI, JWT secret and expiration, CORS origin, and optional database seeding flag.

Frontend (environment.ts):
- Update the API base URL and endpoint prefix to match your backend host and port.

Key environment variables:
- Backend: PORT, NODE_ENV, MONGODB_URI, JWT_SECRET, JWT_EXPIRATION, CORS_ORIGIN, SEED_DATABASE
- Frontend: apiUrl, apiBaseUrl

**Section sources**
- [backend/.env.example](file://backend/.env.example#L1-L20)
- [backend/src/main.ts](file://backend/src/main.ts#L45-L50)
- [frontend/src/environments/environment.ts](file://frontend/src/environments/environment.ts#L1-L5)

## Database Initialization
Initialize the database with seed data using the provided script:

1. Build the backend:
   - Run the build script in the backend directory.
2. Seed the database:
   - Execute the seed script to create initial users and roles.

The seed script creates:
- A Super Admin user
- An Admin user
- A Viewer user

It also prints the demo credentials for quick login.

**Section sources**
- [backend/readme.md](file://backend/readme.md#L1-L6)
- [backend/src/superadminscript/seed.ts](file://backend/src/superadminscript/seed.ts#L10-L98)

## First Run
Complete the first run by starting both the backend and frontend:

Backend:
- Start in development mode with auto-reload.
- Confirm the server logs show the port, environment, and database connection details.

Frontend:
- Start the Angular development server.
- Open the browser to the Angular app URL.

Verify cross-origin allowance:
- The backend enables CORS for the frontend origin and localhost addresses.

**Section sources**
- [backend/src/main.ts](file://backend/src/main.ts#L5-L50)
- [frontend/README.md](file://frontend/README.md#L5-L13)

## Development Workflow
During development, use the following commands:

Backend:
- Development watch mode for automatic restarts on changes.
- Debug mode for debugging support.

Frontend:
- Serve the application with live reload.
- Build for development or production configurations.

Both applications use TypeScript and modern toolchains configured in their respective configuration files.

**Section sources**
- [backend/package.json](file://backend/package.json#L8-L16)
- [frontend/package.json](file://frontend/package.json#L4-L10)
- [backend/tsconfig.json](file://backend/tsconfig.json#L1-L24)
- [frontend/tsconfig.json](file://frontend/tsconfig.json#L1-L28)

## Build Processes
Build both applications for production:

Backend:
- Compile TypeScript to JavaScript.
- Output is placed under the dist directory.

Frontend:
- Build the Angular application for production with optimizations.
- Assets are emitted to the dist folder.

Configuration:
- Nest CLI settings define output directories and asset handling.
- Angular builder settings define production and development configurations.

**Section sources**
- [backend/package.json](file://backend/package.json#L9-L16)
- [frontend/package.json](file://frontend/package.json#L7-L10)
- [backend/nest-cli.json](file://backend/nest-cli.json#L1-L10)
- [frontend/angular.json](file://frontend/angular.json#L17-L74)

## Basic Usage Examples
After successful setup, log in using the seeded credentials:
- Super Admin
- Admin
- Viewer

Use the frontend interface to navigate features and manage content. Authentication and authorization are enforced via guards and interceptors configured in the frontend application.

**Section sources**
- [backend/src/superadminscript/seed.ts](file://backend/src/superadminscript/seed.ts#L78-L89)
- [frontend/src/app/app.config.ts](file://frontend/src/app/app.config.ts#L10-L33)

## Verification Steps
Confirm your installation is working:

Backend:
- Check that the server starts on the configured port.
- Verify CORS is enabled for the frontend origin.
- Ensure the global prefix is set for API routes.

Frontend:
- Confirm the development server runs and serves the Angular app.
- Verify the environment configuration points to the backend API.

Database:
- Confirm MongoDB connectivity via the configured URI.
- Optionally run the seed script to populate initial data.

**Section sources**
- [backend/src/main.ts](file://backend/src/main.ts#L8-L50)
- [frontend/src/environments/environment.ts](file://frontend/src/environments/environment.ts#L1-L5)
- [backend/src/app.module.ts](file://backend/src/app.module.ts#L18-L36)

## Troubleshooting
Common setup issues and resolutions:

- Port conflicts:
  - Change the backend PORT in the environment file if port 3000 or 4200 is in use.
- MongoDB connection failures:
  - Verify the MONGODB_URI value matches your MongoDB instance.
  - Ensure the database service is running and accessible.
- CORS errors:
  - Confirm the frontend origin is included in the backend CORS configuration.
- Angular dev server not starting:
  - Clear node_modules and reinstall frontend dependencies.
- Nest build fails:
  - Ensure TypeScript and Nest CLI versions are compatible.
  - Check for missing environment files or incorrect paths.

**Section sources**
- [backend/.env.example](file://backend/.env.example#L5-L16)
- [backend/src/main.ts](file://backend/src/main.ts#L8-L31)
- [frontend/README.md](file://frontend/README.md#L5-L13)
- [backend/package.json](file://backend/package.json#L18-L44)
- [frontend/package.json](file://frontend/package.json#L25-L41)

## Conclusion
You now have the Multi-Application-Control-Dashboard running locally. Use the provided scripts and environment configuration to develop, build, and maintain the application. Refer to the troubleshooting section if you encounter issues during setup.