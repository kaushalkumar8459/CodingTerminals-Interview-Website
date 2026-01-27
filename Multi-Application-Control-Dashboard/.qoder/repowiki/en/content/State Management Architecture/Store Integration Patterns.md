# Store Integration Patterns

<cite>
**Referenced Files in This Document**
- [admin-dashboard.store.ts](file://frontend/src/app/core/store/admin-dashboard.store.ts)
- [auth.store.ts](file://frontend/src/app/core/store/auth.store.ts)
- [blog.store.ts](file://frontend/src/app/core/store/blog.store.ts)
- [dashboard.store.ts](file://frontend/src/app/core/store/dashboard.store.ts)
- [module.store.ts](file://frontend/src/app/core/store/module.store.ts)
- [user.store.ts](file://frontend/src/app/core/store/user.store.ts)
- [auth.interceptor.ts](file://frontend/src/app/core/interceptors/auth.interceptor.ts)
- [error.interceptor.ts](file://frontend/src/app/core/interceptors/error.interceptor.ts)
- [admin-dashboard.component.ts](file://frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.ts)
- [login.component.ts](file://frontend/src/app/features/auth/login/login.component.ts)
- [admin-dashboard.service.ts](file://frontend/src/app/core/services/admin-dashboard.service.ts)
- [auth.service.ts](file://frontend/src/app/core/services/auth.service.ts)
- [blog.service.ts](file://frontend/src/app/core/services/blog.service.ts)
- [api.service.ts](file://frontend/src/app/core/services/api.service.ts)
- [toast.service.ts](file://frontend/src/app/core/services/toast.service.ts)
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
This document explains store integration patterns implemented in the frontend, focusing on:
- Service-layer integration via Angular services and RxJS Observables
- Interceptor patterns for HTTP request/response transformation and error propagation
- Component-store communication, subscriptions, and lifecycle management
- Loading state management and robust error handling strategies

The patterns demonstrate how stores encapsulate state, orchestrate asynchronous operations, and expose computed signals for reactive UI updates. Interceptors centralize authentication and error handling, while services abstract HTTP concerns and provide typed contracts for backend interactions.

## Project Structure
The frontend organizes integration concerns into three layers:
- Services: Typed HTTP clients per domain (authentication, blog, admin dashboard, modules, users)
- Stores: NGRX Signals-based stores managing domain state and derived computations
- Interceptors: HTTP interceptors for auth and error handling
- Components: UI layer subscribing to store signals and invoking store actions

```mermaid
graph TB
subgraph "Components"
AdminComp["AdminDashboardComponent"]
LoginComponent["LoginComponent"]
end
subgraph "Stores"
AuthStore["AuthStore"]
AdminStore["AdminDashboardStore"]
BlogStore["BlogStore"]
DashboardStore["DashboardStore"]
ModuleStore["ModuleStore"]
UserStore["UserStore"]
end
subgraph "Services"
AuthService["AuthService"]
AdminService["AdminDashboardService"]
BlogService["BlogService"]
ApiService["ApiService"]
end
subgraph "HTTP Layer"
AuthInterceptor["AuthInterceptor"]
ErrorInterceptor["ErrorInterceptor"]
end
AdminComp --> AdminStore
LoginComponent --> AuthStore
AdminStore --> AdminService
AuthStore --> AuthService
BlogStore --> BlogService
DashboardStore --> AdminService
ModuleStore --> ApiService
UserStore --> ApiService
AuthService --> AuthInterceptor
AdminService --> AuthInterceptor
BlogService --> AuthInterceptor
AuthInterceptor --> ErrorInterceptor
```

**Diagram sources**
- [admin-dashboard.component.ts](file://frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.ts#L37-L45)
- [login.component.ts](file://frontend/src/app/features/auth/login/login.component.ts#L14-L18)
- [auth.store.ts](file://frontend/src/app/core/store/auth.store.ts#L35-L103)
- [admin-dashboard.store.ts](file://frontend/src/app/core/store/admin-dashboard.store.ts#L39-L128)
- [blog.store.ts](file://frontend/src/app/core/store/blog.store.ts#L41-L137)
- [dashboard.store.ts](file://frontend/src/app/core/store/dashboard.store.ts#L38-L152)
- [module.store.ts](file://frontend/src/app/core/store/module.store.ts#L31-L73)
- [user.store.ts](file://frontend/src/app/core/store/user.store.ts#L41-L120)
- [auth.service.ts](file://frontend/src/app/core/services/auth.service.ts#L31-L111)
- [admin-dashboard.service.ts](file://frontend/src/app/core/services/admin-dashboard.service.ts#L43-L75)
- [blog.service.ts](file://frontend/src/app/core/services/blog.service.ts#L60-L106)
- [api.service.ts](file://frontend/src/app/core/services/api.service.ts#L16-L67)
- [auth.interceptor.ts](file://frontend/src/app/core/interceptors/auth.interceptor.ts#L8-L44)
- [error.interceptor.ts](file://frontend/src/app/core/interceptors/error.interceptor.ts#L10-L71)

**Section sources**
- [admin-dashboard.store.ts](file://frontend/src/app/core/store/admin-dashboard.store.ts#L1-L307)
- [auth.store.ts](file://frontend/src/app/core/store/auth.store.ts#L1-L223)
- [blog.store.ts](file://frontend/src/app/core/store/blog.store.ts#L1-L332)
- [dashboard.store.ts](file://frontend/src/app/core/store/dashboard.store.ts#L1-L367)
- [module.store.ts](file://frontend/src/app/core/store/module.store.ts#L1-L175)
- [user.store.ts](file://frontend/src/app/core/store/user.store.ts#L1-L329)
- [auth.interceptor.ts](file://frontend/src/app/core/interceptors/auth.interceptor.ts#L1-L46)
- [error.interceptor.ts](file://frontend/src/app/core/interceptors/error.interceptor.ts#L1-L153)
- [admin-dashboard.component.ts](file://frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.ts#L1-L162)
- [login.component.ts](file://frontend/src/app/features/auth/login/login.component.ts#L1-L96)
- [admin-dashboard.service.ts](file://frontend/src/app/core/services/admin-dashboard.service.ts#L1-L113)
- [auth.service.ts](file://frontend/src/app/core/services/auth.service.ts#L1-L161)
- [blog.service.ts](file://frontend/src/app/core/services/blog.service.ts#L1-L145)
- [api.service.ts](file://frontend/src/app/core/services/api.service.ts#L1-L76)

## Core Components
This section outlines the primary building blocks of the store integration patterns.

- Signal-based stores with state, computed signals, and methods
- Service abstractions for HTTP operations with typed contracts
- Interceptors for automatic auth header injection and error handling
- Components subscribing to store signals and invoking store actions

Key characteristics:
- Stores use NGRX Signals primitives to define state, computed derivations, and methods
- Methods orchestrate async operations using RxJS Observables and patchState for updates
- Interceptors transform requests/responses and propagate errors centrally
- Components remain thin, delegating all data operations to stores/services

**Section sources**
- [auth.store.ts](file://frontend/src/app/core/store/auth.store.ts#L35-L103)
- [admin-dashboard.store.ts](file://frontend/src/app/core/store/admin-dashboard.store.ts#L39-L128)
- [blog.store.ts](file://frontend/src/app/core/store/blog.store.ts#L41-L137)
- [dashboard.store.ts](file://frontend/src/app/core/store/dashboard.store.ts#L38-L152)
- [module.store.ts](file://frontend/src/app/core/store/module.store.ts#L31-L73)
- [user.store.ts](file://frontend/src/app/core/store/user.store.ts#L41-L120)
- [auth.interceptor.ts](file://frontend/src/app/core/interceptors/auth.interceptor.ts#L8-L44)
- [error.interceptor.ts](file://frontend/src/app/core/interceptors/error.interceptor.ts#L10-L71)

## Architecture Overview
The integration follows a unidirectional data flow:
- Components trigger store actions
- Stores call services to fetch or mutate data
- Services perform HTTP requests and return Observables
- Interceptors enrich requests and normalize errors
- Stores update state via patchState and expose computed signals to components

```mermaid
sequenceDiagram
participant Comp as "Component"
participant Store as "Signal Store"
participant Service as "Service"
participant HTTP as "HttpClient"
participant Inter as "Interceptors"
Comp->>Store : "Action call"
Store->>Service : "Invoke operation"
Service->>HTTP : "HTTP request"
HTTP->>Inter : "Outgoing request"
Inter-->>HTTP : "Add auth headers / retry"
HTTP-->>Inter : "Response or error"
Inter-->>Service : "Transformed response"
Service-->>Store : "Observable result"
Store->>Store : "patchState(update)"
Store-->>Comp : "Computed signal update"
```

**Diagram sources**
- [admin-dashboard.component.ts](file://frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.ts#L42-L45)
- [admin-dashboard.store.ts](file://frontend/src/app/core/store/admin-dashboard.store.ts#L75-L128)
- [admin-dashboard.service.ts](file://frontend/src/app/core/services/admin-dashboard.service.ts#L51-L75)
- [auth.interceptor.ts](file://frontend/src/app/core/interceptors/auth.interceptor.ts#L11-L44)
- [error.interceptor.ts](file://frontend/src/app/core/interceptors/error.interceptor.ts#L17-L25)

## Detailed Component Analysis

### Authentication Store and Interceptors
The authentication flow integrates:
- AuthStore manages tokens, user info, and login/register flows
- AuthInterceptor automatically attaches Authorization headers and handles 401 token refresh
- ErrorInterceptor centralizes HTTP error handling and user feedback

```mermaid
sequenceDiagram
participant C as "LoginComponent"
participant S as "AuthStore"
participant A as "AuthService"
participant H as "HttpClient"
participant I as "AuthInterceptor"
participant EI as "ErrorInterceptor"
C->>S : "login(credentials)"
S->>A : "login(credentials)"
A->>H : "POST /auth/login"
H->>I : "Attach Authorization?"
I-->>H : "No token yet"
H-->>I : "Response"
I-->>A : "Response"
A-->>S : "LoginResponse"
S->>S : "patchState(token, user)"
S-->>C : "isLoading=false, success"
Note over H,EI : "On subsequent requests, I adds Authorization header"
H->>EI : "Any HTTP error"
EI-->>C : "Toast + navigation"
```

**Diagram sources**
- [login.component.ts](file://frontend/src/app/features/auth/login/login.component.ts#L71-L80)
- [auth.store.ts](file://frontend/src/app/core/store/auth.store.ts#L105-L128)
- [auth.service.ts](file://frontend/src/app/core/services/auth.service.ts#L60-L71)
- [auth.interceptor.ts](file://frontend/src/app/core/interceptors/auth.interceptor.ts#L11-L44)
- [error.interceptor.ts](file://frontend/src/app/core/interceptors/error.interceptor.ts#L17-L71)

**Section sources**
- [auth.store.ts](file://frontend/src/app/core/store/auth.store.ts#L35-L221)
- [auth.interceptor.ts](file://frontend/src/app/core/interceptors/auth.interceptor.ts#L8-L44)
- [error.interceptor.ts](file://frontend/src/app/core/interceptors/error.interceptor.ts#L10-L153)
- [login.component.ts](file://frontend/src/app/features/auth/login/login.component.ts#L14-L96)

### Admin Dashboard Store and Service Integration
AdminDashboardStore orchestrates multiple async loads and exposes computed signals for UI rendering. It integrates with AdminDashboardService to fetch metrics, recent users, and module statuses.

```mermaid
sequenceDiagram
participant AC as "AdminDashboardComponent"
participant ADS as "AdminDashboardStore"
participant ADSvc as "AdminDashboardService"
participant H as "HttpClient"
AC->>ADS : "loadAdminDashboardData()"
ADS->>ADS : "patchState(loading=true)"
ADS->>H : "GET /admin/dashboard/metrics"
ADS->>H : "GET /admin/dashboard/recent-users"
ADS->>H : "GET /admin/dashboard/modules"
H-->>ADS : "metrics, recentUsers, moduleStatuses"
ADS->>ADS : "Transform to stats + patchState"
ADS-->>AC : "isLoading=false, hasData=true"
```

**Diagram sources**
- [admin-dashboard.component.ts](file://frontend/src/app/features/admin/admin-dashboard/admin-dashboard/admin-dashboard.component.ts#L42-L45)
- [admin-dashboard.store.ts](file://frontend/src/app/core/store/admin-dashboard.store.ts#L75-L128)
- [admin-dashboard.service.ts](file://frontend/src/app/core/services/admin-dashboard.service.ts#L51-L75)

**Section sources**
- [admin-dashboard.store.ts](file://frontend/src/app/core/store/admin-dashboard.store.ts#L39-L307)
- [admin-dashboard.service.ts](file://frontend/src/app/core/services/admin-dashboard.service.ts#L43-L113)
- [admin-dashboard.component.ts](file://frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.ts#L37-L162)

### Blog Store: Filtering, Pagination, and CRUD Operations
BlogStore demonstrates advanced patterns:
- Computed signals for pagination and filtering
- UI flags for long-running operations (publishing/deleting)
- Centralized error/success messaging

```mermaid
flowchart TD
Start(["User triggers action"]) --> Action{"Action Type?"}
Action --> |Load Posts| Load["patchState(loading=true)<br/>fetch posts<br/>patchState(posts,total)"]
Action --> |Create Post| Create["patchState(loading=true)<br/>create via service<br/>reload posts"]
Action --> |Update Post| Update["mark updating<br/>update via service<br/>replace in list"]
Action --> |Publish/Unpublish/Delete| LongOp["toggle UI flag<br/>execute service call<br/>update list or reload"]
Action --> |Filter/Search| Filter["update filters<br/>reload posts"]
Action --> |Pagination| Page["update page<br/>reload posts"]
Load --> Error{"Error?"}
Create --> Error
Update --> Error
LongOp --> Error
Filter --> Done(["UI reflects state"])
Page --> Done
Error --> Handle["patchState(error)<br/>console.error"]
Handle --> Done
```

**Diagram sources**
- [blog.store.ts](file://frontend/src/app/core/store/blog.store.ts#L55-L330)

**Section sources**
- [blog.store.ts](file://frontend/src/app/core/store/blog.store.ts#L41-L332)
- [blog.service.ts](file://frontend/src/app/core/services/blog.service.ts#L60-L145)

### Dashboard Store: Metrics and Activity Aggregation
DashboardStore mirrors AdminDashboardStore’s pattern but focuses on general platform metrics and recent activities.

```mermaid
sequenceDiagram
participant DS as "DashboardStore"
participant DSvc as "AdminDashboardService"
participant H as "HttpClient"
DS->>DS : "patchState(loading=true)"
DS->>H : "GET /admin/dashboard/metrics"
DS->>H : "GET /admin/dashboard/recent-activities"
H-->>DS : "metrics, activities"
DS->>DS : "transform to stats + patchState"
```

**Diagram sources**
- [dashboard.store.ts](file://frontend/src/app/core/store/dashboard.store.ts#L97-L152)
- [admin-dashboard.service.ts](file://frontend/src/app/core/services/admin-dashboard.service.ts#L51-L68)

**Section sources**
- [dashboard.store.ts](file://frontend/src/app/core/store/dashboard.store.ts#L38-L367)
- [admin-dashboard.service.ts](file://frontend/src/app/core/services/admin-dashboard.service.ts#L43-L97)

### Module Store: Batch Updates and Change Tracking
ModuleStore tracks UI changes and batches updates to the backend.

```mermaid
flowchart TD
Init["loadModules()"] --> List["Render modules with flags"]
List --> Toggle["toggleModule(enabled)"]
Toggle --> Save["saveModuleChanges()"]
Save --> Validate{"Has changes?"}
Validate --> |No| Noop["patchState(error='No changes')"]
Validate --> |Yes| Call["updateModules(batch)"]
Call --> Success["patchState(success)<br/>clear flags"]
Call --> Failure["patchState(error)<br/>revert flags"]
```

**Diagram sources**
- [module.store.ts](file://frontend/src/app/core/store/module.store.ts#L52-L145)

**Section sources**
- [module.store.ts](file://frontend/src/app/core/store/module.store.ts#L31-L175)

### User Store: Filtering, Role Management, and Bulk Actions
UserStore supports complex filtering, pagination, and role/status updates with optimistic UI flags.

**Section sources**
- [user.store.ts](file://frontend/src/app/core/store/user.store.ts#L41-L329)

### Interceptor Patterns: Automatic Store Updates and Error Propagation
- AuthInterceptor: Adds Authorization header and retries on 401 by refreshing the token
- ErrorInterceptor: Retries transient failures, maps HTTP status codes to user-friendly messages, navigates on auth failures, and shows toasts

```mermaid
flowchart TD
Req["HTTP Request"] --> AuthI["AuthInterceptor"]
AuthI --> Resp{"401 Unauthorized?"}
Resp --> |Yes| Refresh["refreshToken()"]
Refresh --> Retry["Retry original request with new token"]
Resp --> |No| Pass["Forward response"]
Retry --> Pass
Pass --> ErrorI["ErrorInterceptor"]
ErrorI --> RetryPolicy{"Retry count exceeded?"}
RetryPolicy --> |Yes| Map["Map status -> toast/navigation"]
RetryPolicy --> |No| Retry
Map --> End["Component receives error"]
```

**Diagram sources**
- [auth.interceptor.ts](file://frontend/src/app/core/interceptors/auth.interceptor.ts#L11-L44)
- [error.interceptor.ts](file://frontend/src/app/core/interceptors/error.interceptor.ts#L17-L71)

**Section sources**
- [auth.interceptor.ts](file://frontend/src/app/core/interceptors/auth.interceptor.ts#L8-L46)
- [error.interceptor.ts](file://frontend/src/app/core/interceptors/error.interceptor.ts#L10-L153)

### Component-Store Communication and Lifecycle Management
- Components inject stores and subscribe to computed signals for reactive UI updates
- Components call store methods instead of invoking services directly
- Stores manage loading/error/success states and clear them after timeouts where appropriate
- Memory leak prevention: avoid manual subscriptions; rely on Angular signals and keep subscriptions scoped to component lifecycles

Examples:
- AdminDashboardComponent calls store methods and reads isLoading/hasData signals
- LoginComponent reads loading/error/success signals and delegates submission to AuthStore

**Section sources**
- [admin-dashboard.component.ts](file://frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.ts#L37-L162)
- [login.component.ts](file://frontend/src/app/features/auth/login/login.component.ts#L14-L96)

## Dependency Analysis
The integration exhibits low coupling and high cohesion:
- Stores depend on services, not on each other
- Services depend on HttpClient and environment configuration
- Interceptors depend on services for token refresh and navigation
- Components depend on stores for state and actions

```mermaid
graph LR
AC["AdminDashboardComponent"] --> ADS["AdminDashboardStore"]
LC["LoginComponent"] --> AS["AuthStore"]
ADS --> ADSvc["AdminDashboardService"]
AS --> AuthService["AuthService"]
BlogS["BlogStore"] --> BlogSvc["BlogService"]
DShS["DashboardStore"] --> ADSvc
ModS["ModuleStore"] --> APIService["ApiService"]
US["UserStore"] --> APIService
AuthService --> AI["AuthInterceptor"]
ADSvc --> AI
BlogSvc --> AI
AI --> EI["ErrorInterceptor"]
```

**Diagram sources**
- [admin-dashboard.component.ts](file://frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.ts#L37-L45)
- [login.component.ts](file://frontend/src/app/features/auth/login/login.component.ts#L14-L18)
- [admin-dashboard.store.ts](file://frontend/src/app/core/store/admin-dashboard.store.ts#L39-L75)
- [auth.store.ts](file://frontend/src/app/core/store/auth.store.ts#L35-L105)
- [blog.store.ts](file://frontend/src/app/core/store/blog.store.ts#L41-L66)
- [dashboard.store.ts](file://frontend/src/app/core/store/dashboard.store.ts#L38-L101)
- [module.store.ts](file://frontend/src/app/core/store/module.store.ts#L31-L55)
- [user.store.ts](file://frontend/src/app/core/store/user.store.ts#L41-L70)
- [admin-dashboard.service.ts](file://frontend/src/app/core/services/admin-dashboard.service.ts#L43-L75)
- [auth.service.ts](file://frontend/src/app/core/services/auth.service.ts#L31-L111)
- [blog.service.ts](file://frontend/src/app/core/services/blog.service.ts#L60-L106)
- [api.service.ts](file://frontend/src/app/core/services/api.service.ts#L16-L67)
- [auth.interceptor.ts](file://frontend/src/app/core/interceptors/auth.interceptor.ts#L8-L44)
- [error.interceptor.ts](file://frontend/src/app/core/interceptors/error.interceptor.ts#L10-L71)

**Section sources**
- [admin-dashboard.store.ts](file://frontend/src/app/core/store/admin-dashboard.store.ts#L1-L307)
- [auth.store.ts](file://frontend/src/app/core/store/auth.store.ts#L1-L223)
- [blog.store.ts](file://frontend/src/app/core/store/blog.store.ts#L1-L332)
- [dashboard.store.ts](file://frontend/src/app/core/store/dashboard.store.ts#L1-L367)
- [module.store.ts](file://frontend/src/app/core/store/module.store.ts#L1-L175)
- [user.store.ts](file://frontend/src/app/core/store/user.store.ts#L1-L329)
- [auth.interceptor.ts](file://frontend/src/app/core/interceptors/auth.interceptor.ts#L1-L46)
- [error.interceptor.ts](file://frontend/src/app/core/interceptors/error.interceptor.ts#L1-L153)
- [admin-dashboard.service.ts](file://frontend/src/app/core/services/admin-dashboard.service.ts#L1-L113)
- [auth.service.ts](file://frontend/src/app/core/services/auth.service.ts#L1-L161)
- [blog.service.ts](file://frontend/src/app/core/services/blog.service.ts#L1-L145)
- [api.service.ts](file://frontend/src/app/core/services/api.service.ts#L1-L76)

## Performance Considerations
- Prefer batched async operations where possible (e.g., Promise.all) to reduce round trips
- Use computed signals to minimize recomputations and avoid redundant DOM updates
- Keep UI flags granular to provide immediate feedback without blocking the entire list
- Limit concurrent long-running operations and surface progress indicators
- Use interceptors to centralize retries and caching strategies at the HTTP layer

## Troubleshooting Guide
Common issues and resolutions:
- 401 Unauthorized: AuthInterceptor attempts token refresh; on failure, clears auth state and routes to login
- Network errors: ErrorInterceptor retries once, then maps status codes to user feedback and navigation
- Conflicts/Validation errors: ErrorInterceptor surfaces warnings/info toasts with server-provided messages
- Service unavailability: ErrorInterceptor displays temporary unavailability messages

Operational tips:
- Inspect store loading/error/success signals in components to diagnose UI state
- Verify interceptor order in the HTTP provider chain to ensure proper header injection and error handling
- Confirm environment.apiUrl correctness and CORS configuration

**Section sources**
- [auth.interceptor.ts](file://frontend/src/app/core/interceptors/auth.interceptor.ts#L22-L44)
- [error.interceptor.ts](file://frontend/src/app/core/interceptors/error.interceptor.ts#L17-L153)
- [auth.store.ts](file://frontend/src/app/core/store/auth.store.ts#L155-L174)
- [admin-dashboard.store.ts](file://frontend/src/app/core/store/admin-dashboard.store.ts#L121-L128)

## Conclusion
The store integration patterns establish a clean separation of concerns:
- Stores encapsulate state and async orchestration
- Services abstract HTTP and provide typed contracts
- Interceptors handle cross-cutting concerns (auth, retries, error mapping)
- Components remain declarative and reactive

These patterns improve maintainability, testability, and developer productivity while ensuring robust error handling and responsive UIs.