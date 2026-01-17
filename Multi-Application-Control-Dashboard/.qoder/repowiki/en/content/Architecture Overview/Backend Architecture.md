# Backend Architecture

<cite>
**Referenced Files in This Document**
- [main.ts](file://backend/src/main.ts)
- [app.module.ts](file://backend/src/app.module.ts)
- [auth.module.ts](file://backend/src/auth/auth.module.ts)
- [users.module.ts](file://backend/src/users/users.module.ts)
- [blog.module.ts](file://backend/src/blog/blog.module.ts)
- [auth.controller.ts](file://backend/src/auth/auth.controller.ts)
- [users.controller.ts](file://backend/src/users/users.controller.ts)
- [auth.service.ts](file://backend/src/auth/auth.service.ts)
- [users.service.ts](file://backend/src/users/users.service.ts)
- [blog.service.ts](file://backend/src/blog/blog.service.ts)
- [auth.guard.ts](file://backend/src/auth/guards/auth.guard.ts)
- [jwt.strategy.ts](file://backend/src/auth/strategies/jwt.strategy.ts)
- [local.strategy.ts](file://backend/src/auth/strategies/local.strategy.ts)
- [auth.dto.ts](file://backend/src/auth/dto/auth.dto.ts)
- [user.dto.ts](file://backend/src/users/dto/user.dto.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains the NestJS backend architecture for the Multi-Application Control Dashboard. It covers the module-based design, dependency injection, layered architecture (controllers, services, DTOs, schemas), middleware and guards, and the MongoDB/Mongoose data layer. It also includes architectural diagrams and practical guidance for developers and operators.

## Project Structure
The backend is organized around a central application module that composes feature modules. Each feature module encapsulates:
- A controller for HTTP endpoints
- A service for business logic
- Mongoose schemas/models via forFeature registration
- DTOs for request/response validation
- Guards and strategies for authentication/authorization
- Optional decorators for metadata extraction

```mermaid
graph TB
subgraph "Bootstrap"
MAIN["main.ts<br/>CORS, ValidationPipe, Global Prefix"]
APP["AppModule<br/>Root module imports"]
end
subgraph "Feature Modules"
AUTH["AuthModule<br/>AuthController, AuthService"]
USERS["UsersModule<br/>UsersController, UsersService"]
BLOG["BlogModule<br/>BlogController, BlogService"]
end
MAIN --> APP
APP --> AUTH
APP --> USERS
APP --> BLOG
```

**Diagram sources**
- [main.ts](file://backend/src/main.ts#L1-L54)
- [app.module.ts](file://backend/src/app.module.ts#L1-L41)
- [auth.module.ts](file://backend/src/auth/auth.module.ts#L1-L30)
- [users.module.ts](file://backend/src/users/users.module.ts#L1-L14)
- [blog.module.ts](file://backend/src/blog/blog.module.ts#L1-L14)

**Section sources**
- [main.ts](file://backend/src/main.ts#L1-L54)
- [app.module.ts](file://backend/src/app.module.ts#L1-L41)

## Core Components
- Application bootstrap and middleware pipeline:
  - CORS enabled for development origins
  - Global ValidationPipe enforcing whitelisting and transformation
  - Global API prefix set to api
- Root module composes all feature modules and database connection
- Feature modules encapsulate domain logic with clear boundaries

Key responsibilities:
- Controllers: HTTP endpoints, guards, request binding
- Services: Business logic, persistence orchestration
- DTOs: Validation and serialization contracts
- Schemas: Mongoose models for MongoDB collections
- Guards/Strategies: Authentication and authorization policies

**Section sources**
- [main.ts](file://backend/src/main.ts#L1-L54)
- [app.module.ts](file://backend/src/app.module.ts#L1-L41)

## Architecture Overview
The system follows a layered, module-driven architecture:
- Layered pattern: Controllers -> Services -> Mongoose Models
- DI container registers providers per module and exposes them via exports
- Cross-cutting concerns (validation, auth) applied globally or per controller

```mermaid
graph TB
CLIENT["Client"]
CTRL_AUTH["AuthController"]
CTRL_USERS["UsersController"]
SVC_AUTH["AuthService"]
SVC_USERS["UsersService"]
SVC_BLOG["BlogService"]
GUARD_JWT["JwtAuthGuard"]
GUARD_LOCAL["LocalAuthGuard"]
STRAT_JWT["JwtStrategy"]
STRAT_LOCAL["LocalStrategy"]
CLIENT --> CTRL_AUTH
CLIENT --> CTRL_USERS
CTRL_AUTH --> GUARD_LOCAL
CTRL_AUTH --> GUARD_JWT
CTRL_USERS --> GUARD_JWT
CTRL_AUTH --> SVC_AUTH
CTRL_USERS --> SVC_USERS
SVC_AUTH --> STRAT_LOCAL
SVC_AUTH --> STRAT_JWT
SVC_USERS --> STRAT_JWT
SVC_BLOG --> STRAT_JWT
```

**Diagram sources**
- [auth.controller.ts](file://backend/src/auth/auth.controller.ts#L1-L58)
- [users.controller.ts](file://backend/src/users/users.controller.ts#L1-L52)
- [auth.service.ts](file://backend/src/auth/auth.service.ts#L1-L125)
- [users.service.ts](file://backend/src/users/users.service.ts#L1-L78)
- [blog.service.ts](file://backend/src/blog/blog.service.ts#L1-L78)
- [auth.guard.ts](file://backend/src/auth/guards/auth.guard.ts#L1-L26)
- [jwt.strategy.ts](file://backend/src/auth/strategies/jwt.strategy.ts#L1-L25)
- [local.strategy.ts](file://backend/src/auth/strategies/local.strategy.ts#L1-L16)

## Detailed Component Analysis

### Authentication Module
- Purpose: Registration, login, profile retrieval, token refresh, logout
- Security: JWT access tokens, optional refresh tokens, bcrypt password hashing
- Guards: JwtAuthGuard, LocalAuthGuard, OptionalJwtAuthGuard
- Strategies: JWT extraction and validation, local username/password validation
- DTOs: Register, Login, RefreshToken, AuthResponse, ChangePassword

```mermaid
sequenceDiagram
participant C as "Client"
participant AC as "AuthController"
participant AG as "LocalAuthGuard"
participant LS as "LocalStrategy"
participant AS as "AuthService"
participant JM as "JWTService"
C->>AC : "POST /api/auth/login"
AC->>AG : "Validate credentials"
AG->>LS : "Authenticate with email/password"
LS->>AS : "validateUser(email,password)"
AS-->>LS : "User payload or error"
LS-->>AG : "User or error"
AG-->>AC : "User or error"
AC->>AS : "login(user)"
AS->>JM : "Sign access/refresh tokens"
AS-->>AC : "AuthResponse"
AC-->>C : "AuthResponse"
```

**Diagram sources**
- [auth.controller.ts](file://backend/src/auth/auth.controller.ts#L1-L58)
- [auth.guard.ts](file://backend/src/auth/guards/auth.guard.ts#L1-L26)
- [local.strategy.ts](file://backend/src/auth/strategies/local.strategy.ts#L1-L16)
- [auth.service.ts](file://backend/src/auth/auth.service.ts#L1-L125)

**Section sources**
- [auth.module.ts](file://backend/src/auth/auth.module.ts#L1-L30)
- [auth.controller.ts](file://backend/src/auth/auth.controller.ts#L1-L58)
- [auth.service.ts](file://backend/src/auth/auth.service.ts#L1-L125)
- [auth.guard.ts](file://backend/src/auth/guards/auth.guard.ts#L1-L26)
- [jwt.strategy.ts](file://backend/src/auth/strategies/jwt.strategy.ts#L1-L25)
- [local.strategy.ts](file://backend/src/auth/strategies/local.strategy.ts#L1-L16)
- [auth.dto.ts](file://backend/src/auth/dto/auth.dto.ts#L1-L58)

### Users Module
- Purpose: CRUD operations, role assignment, module assignment, password changes, search
- Security: Requires JWT for protected endpoints
- Persistence: Mongoose model for User collection

```mermaid
flowchart TD
Start(["UsersController endpoint"]) --> Guard["JwtAuthGuard"]
Guard --> ServiceCall["UsersService method"]
ServiceCall --> DB["Mongoose Model<User>"]
DB --> ServiceResult["Return DTO(s)"]
ServiceResult --> End(["HTTP Response"])
```

**Diagram sources**
- [users.controller.ts](file://backend/src/users/users.controller.ts#L1-L52)
- [users.service.ts](file://backend/src/users/users.service.ts#L1-L78)

**Section sources**
- [users.module.ts](file://backend/src/users/users.module.ts#L1-L14)
- [users.controller.ts](file://backend/src/users/users.controller.ts#L1-L52)
- [users.service.ts](file://backend/src/users/users.service.ts#L1-L78)
- [user.dto.ts](file://backend/src/users/dto/user.dto.ts#L1-L62)

### Blog Module
- Purpose: Manage blog posts (CRUD), publishing workflow, author lookup, search, stats
- Persistence: Mongoose model for BlogPost collection
- Populated relations: Author field populated with selected fields

```mermaid
flowchart TD
Entry(["BlogService method"]) --> Query["Build Mongoose query"]
Query --> Exec["Execute with populate/find/findOneAndUpdate"]
Exec --> Result["Return typed result"]
Result --> Exit(["Caller"])
```

**Diagram sources**
- [blog.module.ts](file://backend/src/blog/blog.module.ts#L1-L14)
- [blog.service.ts](file://backend/src/blog/blog.service.ts#L1-L78)

**Section sources**
- [blog.module.ts](file://backend/src/blog/blog.module.ts#L1-L14)
- [blog.service.ts](file://backend/src/blog/blog.service.ts#L1-L78)

### Middleware Pipeline and Global Exception Handling
- CORS: Permissive configuration for development origins; logs blocked origins
- ValidationPipe: Whitelist enforcement, forbidNonWhitelisted, transform
- Global prefix: All routes prefixed with api
- No explicit global exception filter configured; rely on Nest default behavior

Operational notes:
- Adjust allowedOrigins in production deployments
- ValidationPipe ensures strict DTO-bound inputs

**Section sources**
- [main.ts](file://backend/src/main.ts#L1-L54)

### Dependency Injection and Provider Lifecycle
- Providers are registered per module and exported for cross-module consumption
- Services receive Mongoose models via @InjectModel with proper schema registration
- Guards and strategies are singletons managed by Nest’s DI container
- AuthService depends on JwtService and injected UserModel

```mermaid
classDiagram
class AppModule
class AuthModule
class UsersModule
class BlogModule
class AuthController
class AuthService
class UsersService
class BlogService
class JwtAuthGuard
class LocalAuthGuard
class JwtStrategy
class LocalStrategy
AppModule --> AuthModule
AppModule --> UsersModule
AppModule --> BlogModule
AuthModule --> AuthController
AuthModule --> AuthService
AuthModule --> JwtAuthGuard
AuthModule --> LocalAuthGuard
AuthModule --> JwtStrategy
AuthModule --> LocalStrategy
UsersModule --> UsersController
UsersModule --> UsersService
BlogModule --> BlogController
BlogModule --> BlogService
```

**Diagram sources**
- [app.module.ts](file://backend/src/app.module.ts#L1-L41)
- [auth.module.ts](file://backend/src/auth/auth.module.ts#L1-L30)
- [users.module.ts](file://backend/src/users/users.module.ts#L1-L14)
- [blog.module.ts](file://backend/src/blog/blog.module.ts#L1-L14)

**Section sources**
- [auth.module.ts](file://backend/src/auth/auth.module.ts#L1-L30)
- [users.module.ts](file://backend/src/users/users.module.ts#L1-L14)
- [blog.module.ts](file://backend/src/blog/blog.module.ts#L1-L14)

## Dependency Analysis
- AppModule composes all feature modules and database connection
- Feature modules depend on MongooseModule.forFeature for their models
- Controllers depend on services; services depend on Mongoose models
- Guards and strategies are injected into controllers/services as needed

```mermaid
graph LR
APP["AppModule"] --> AUTH["AuthModule"]
APP --> USERS["UsersModule"]
APP --> BLOG["BlogModule"]
AUTH --> AC["AuthController"]
AUTH --> AS["AuthService"]
USERS --> UC["UsersController"]
USERS --> US["UsersService"]
BLOG --> BC["BlogController"]
BLOG --> BS["BlogService"]
```

**Diagram sources**
- [app.module.ts](file://backend/src/app.module.ts#L1-L41)
- [auth.module.ts](file://backend/src/auth/auth.module.ts#L1-L30)
- [users.module.ts](file://backend/src/users/users.module.ts#L1-L14)
- [blog.module.ts](file://backend/src/blog/blog.module.ts#L1-L14)

**Section sources**
- [app.module.ts](file://backend/src/app.module.ts#L1-L41)

## Performance Considerations
- Prefer lean queries by selecting only required fields (avoid returning passwords)
- Use pagination for list endpoints when data grows
- Index frequently queried fields (email, author, status) in MongoDB
- Cache infrequent reads (e.g., static configuration) at the service level
- Keep DTOs minimal and avoid unnecessary transformations

## Troubleshooting Guide
Common issues and resolutions:
- Validation errors: Ensure DTOs match class-validator constraints; check ValidationPipe configuration
- Authentication failures: Verify JWT_SECRET and JWT_REFRESH_SECRET; confirm passport strategies are registered
- CORS errors: Confirm client origin is allowed; review allowedHeaders/methods
- 401/403 responses: Confirm JwtAuthGuard is applied and Authorization header is present
- Mongoose errors: Verify model names and schema registrations in forFeature

Operational checks:
- Confirm MongoDB URI in environment variables
- Review server logs for CORS block messages
- Validate DTO payloads against class-validator rules

**Section sources**
- [main.ts](file://backend/src/main.ts#L1-L54)
- [auth.service.ts](file://backend/src/auth/auth.service.ts#L1-L125)
- [auth.guard.ts](file://backend/src/auth/guards/auth.guard.ts#L1-L26)

## Conclusion
The backend employs a clean, module-centric architecture with strong separation of concerns. Controllers are thin, services encapsulate business logic, and Mongoose provides a straightforward persistence layer. Global middleware enforces validation and cross-origin policies, while guards and strategies manage authentication securely. This design supports scalability, testability, and maintainability across feature modules.