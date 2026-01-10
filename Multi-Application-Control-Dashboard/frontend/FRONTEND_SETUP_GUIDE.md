# 🎨 Frontend Project Setup & Architecture Documentation

## 📊 Project Overview

This is a **Multi-Application Control Dashboard** frontend built with **Angular 19** using standalone components, **Tailwind CSS**, and a feature-based architecture with role-based access control (RBAC).

---

## 🏗️ Folder Structure

```
src/app/
├── core/                          # Core module (Singleton services)
│   ├── services/
│   │   ├── auth.service.ts        # Authentication & JWT management
│   │   └── permission.service.ts  # Permission & role checking
│   ├── guards/
│   │   ├── auth.guard.ts          # Authentication guard
│   │   └── role.guard.ts          # Role-based access guard
│   └── interceptors/
│       └── auth.interceptor.ts    # JWT token attachment & refresh
│
├── shared/                        # Shared components & utilities
│   ├── components/
│   │   ├── navbar/               # Top navigation bar
│   │   └── sidebar/              # Side navigation menu
│   ├── layouts/
│   │   └── layout.component.ts   # Main layout wrapper
│   └── pages/
│       └── access-denied/        # 403 error page
│
├── features/                      # Feature modules (Lazy loaded)
│   ├── auth/
│   │   └── login/               # Login page
│   │
│   ├── dashboard/               # Main dashboard
│   │
│   ├── study-notes/            # Study Notes module
│   │   ├── study-notes-list/
│   │   ├── study-notes-form/
│   │   └── study-notes-view/
│   │
│   ├── youtube/                 # YouTube module
│   │   ├── youtube-list/
│   │   ├── youtube-form/
│   │   └── youtube-view/
│   │
│   ├── linkedin/                # LinkedIn module
│   │   ├── linkedin-list/
│   │   ├── linkedin-form/
│   │   └── linkedin-view/
│   │
│   ├── blog/                    # Blog module
│   │   ├── blog-list/
│   │   ├── blog-form/
│   │   └── blog-view/
│   │
│   ├── admin/                   # Admin module (Super Admin & Admin only)
│   │   ├── admin-dashboard/
│   │   ├── user-management/
│   │   └── module-settings/
│   │
│   ├── profile/                 # User profile
│   │
│   └── settings/                # User settings
│
├── environments/                 # Environment configurations
│   ├── environment.ts           # Development
│   └── environment.prod.ts      # Production
│
├── app.routes.ts               # Main routing configuration
├── app.component.ts            # Root component
└── app.config.ts              # App configuration
```

---

## 🔐 Core Services & Guards

### AuthService (`core/services/auth.service.ts`)

**Key Methods:**
- `login(credentials)` - Authenticate user
- `register(userData)` - Register new user
- `logout()` - Clear session
- `getAccessToken()` - Get JWT token
- `getCurrentUser()` - Get logged-in user
- `refreshToken()` - Refresh expired token

**Observables:**
- `currentUser$` - Current user stream
- `isAuthenticated$` - Authentication status stream

### PermissionService (`core/services/permission.service.ts`)

**Key Methods:**
- `hasModuleAccess(moduleId)` - Check module access
- `canEdit()` - Check edit permission
- `canDelete()` - Check delete permission
- `canManageUsers()` - Super admin check
- `canManageModules()` - Super admin check
- `isViewer()` - Read-only user check
- `getAccessibleModules()` - Get user's accessible modules

### AuthGuard (`core/guards/auth.guard.ts`)

Protects routes requiring authentication:
```typescript
canActivate(): boolean | Observable<boolean>
```
- Checks if user has valid JWT token
- Redirects to login if not authenticated

### RoleGuard (`core/guards/role.guard.ts`)

Enforces role-based access control:
```typescript
canActivate(route, state): boolean
```
- Checks route's required roles (`route.data['roles']`)
- Redirects to access-denied if unauthorized
- Supports multiple roles per route

### AuthInterceptor (`core/interceptors/auth.interceptor.ts`)

Attaches JWT token to HTTP requests:
- Adds `Authorization: Bearer <token>` header
- Handles 401 responses with token refresh
- Logs user out on failed refresh

---

## 🛣️ App Routing Strategy

### Route Configuration Hierarchy

```
/
├── /auth
│   └── /auth/login                    [No Auth Required]
│
└── / (LayoutComponent)                [AuthGuard]
    ├── /dashboard
    ├── /study-notes                   [Lazy Loaded]
    │   ├── /study-notes (list)
    │   ├── /study-notes/create
    │   ├── /study-notes/:id (view)
    │   └── /study-notes/:id/edit
    ├── /youtube                       [Lazy Loaded]
    ├── /linkedin                      [Lazy Loaded]
    ├── /blog                          [Lazy Loaded]
    ├── /admin                         [RoleGuard: super_admin, admin]
    │   ├── /admin (dashboard)
    │   ├── /admin/users
    │   └── /admin/modules
    ├── /profile
    ├── /settings
    └── /access-denied
```

### Key Features:

1. **Authentication Flow**
   - Public: `/auth/login` (no guard)
   - Protected: All routes under `/` require `AuthGuard`
   - Role-Based: `/admin` requires `RoleGuard` with specific roles

2. **Lazy Loading**
   - Feature modules loaded on demand
   - Reduces initial bundle size
   - Improves page load performance

3. **Child Routes**
   - Modules have internal routing for list/create/view/edit
   - Each module is self-contained

---

## 🎯 Role-Based Access Control (RBAC) Flow

### User Roles

| Role | Permissions | Module Access | Admin Access |
|------|-------------|---------------|----|
| **Super Admin** 👑 | Full system access | All modules | Yes - User & Module Management |
| **Admin** 👤 | Content management | Assigned modules | Yes - Content only |
| **Viewer** 👁️ | Read-only | Assigned modules | No |

### Access Control Flow

```
Request → AuthGuard (Token Check)
    ↓
  Valid Token? → YES → RoleGuard (if needed)
    ↓                      ↓
   NO                  Has Required Role?
    ↓                      ↓
Redirect to Login     YES → Access Granted
                         ↓
                    NO → Redirect to Access-Denied
```

### Example: Admin Route Protection

```typescript
{
  path: 'admin',
  loadChildren: () => import('./admin.routes').then(m => m.ADMIN_ROUTES),
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['super_admin', 'admin'] }
}
```

### Runtime Permission Checking in Templates

```html
<!-- Show edit button only if user can edit -->
<button *ngIf="permissionService.canEdit()" (click)="editItem()">
  Edit
</button>

<!-- Show admin section only for admins -->
<a *ngIf="permissionService.canManageUsers()" routerLink="/admin/users">
  Manage Users
</a>
```

---

## 🎨 Component Architecture

### Shared Components

#### **Navbar** (`shared/components/navbar/`)
- User menu with role badge
- Logout functionality
- Profile & Settings links
- Sticky top positioning

#### **Sidebar** (`shared/components/sidebar/`)
- Dynamic menu items based on role
- Module access checking
- Collapsible design
- User info footer

#### **Layout** (`shared/layouts/layout.component.ts`)
- Combines Navbar + Sidebar + Router Outlet
- Used by all authenticated pages

### Feature Components

#### **Auth Module**
- **Login** - Email/password authentication with demo credentials

#### **Module Components** (Study Notes, YouTube, LinkedIn, Blog)
Each follows the pattern:
- **List** - Grid/table view with CRUD actions
- **Form** - Create/Edit with validation
- **View** - Detail page with engagement metrics

#### **Admin Module**
- **Dashboard** - Statistics & recent activity
- **User Management** - User CRUD operations
- **Module Settings** - Enable/disable modules

#### **User Pages**
- **Profile** - Edit user information
- **Settings** - Preferences, theme, security
- **Access Denied** - 403 error page

---

## 🎨 Tailwind CSS Setup

### Configuration Files

**tailwind.config.js**
```javascript
{
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#0EA5E9',
      }
    }
  }
}
```

**postcss.config.js** - Handles PostCSS processing for Tailwind

### Global Utilities (`src/styles.scss`)

```scss
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary { @apply px-4 py-2 bg-blue-500 text-white rounded-lg... }
  .card { @apply bg-white rounded-lg shadow-md p-6... }
  .badge-success { @apply inline-block px-3 py-1 bg-green-100... }
}
```

---

## 📦 Standalone Components

All components use Angular 19's standalone feature:

```typescript
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent { }
```

**Benefits:**
- No NgModule boilerplate
- Tree-shaking friendly
- Explicit dependencies
- Better code organization

---

## 🔄 Data Flow Architecture

### Authentication Flow

```
User Login
    ↓
LoginComponent (Form Submission)
    ↓
AuthService.login(credentials)
    ↓
HTTP POST to /api/auth/login
    ↓
Response: { accessToken, refreshToken, user }
    ↓
Store in localStorage
    ↓
Update currentUser$ & isAuthenticated$ BehaviorSubjects
    ↓
Navigate to /dashboard
```

### Permission Checking Flow

```
User Navigates to Protected Route
    ↓
RoleGuard.canActivate()
    ↓
AuthService.getCurrentUser()
    ↓
Check user.role against route.data['roles']
    ↓
Role Match? → YES → Allow Access
                ↓
            NO → Redirect to /access-denied
```

### Component Data Loading

```
Component ngOnInit()
    ↓
Load data from API Service
    ↓
Check PermissionService for CRUD permissions
    ↓
Conditionally show Edit/Delete buttons
    ↓
RxJS Observables manage data streams
```

---

## 🚀 HTTP Interceptor Pattern

**AuthInterceptor Flow:**

```
HTTP Request
    ↓
Check if token exists
    ↓
Attach Authorization header
    ↓
Send request
    ↓
Response 401 (Unauthorized)?
    ↓
YES → Call refreshToken()
    ↓
Retry original request with new token
    ↓
Failed refresh? → Logout user
```

---

## 📝 Environment Configuration

### Development (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

### Production (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api',
};
```

**Usage in Services:**
```typescript
import { environment } from '../../../environments/environment';

private apiUrl = `${environment.apiUrl}/auth`;
```

---

## ✅ Features Implemented

| Feature | Status | Details |
|---------|--------|---------|
| Standalone Components | ✅ | All components use standalone architecture |
| Tailwind CSS | ✅ | Complete styling with custom utilities |
| Authentication | ✅ | JWT-based with token refresh |
| RBAC System | ✅ | 3 roles with dynamic permissions |
| Route Guards | ✅ | AuthGuard & RoleGuard implemented |
| HTTP Interceptor | ✅ | Token attachment & 401 handling |
| Lazy Loading | ✅ | Feature modules loaded on demand |
| Responsive Design | ✅ | Mobile, tablet, desktop layouts |
| Error Handling | ✅ | Access denied page & error messages |
| Form Validation | ✅ | Reactive forms with validators |
| Dynamic Navigation | ✅ | Menu items based on user role |

---

## 🎯 Next Steps

### Backend Integration
1. Connect to actual API endpoints
2. Replace mock data with API calls
3. Implement error handling

### Frontend Enhancements
1. Add Toast notifications (ngx-toastr)
2. Implement dark mode toggle
3. Add search & filtering
4. Create reusable data table component
5. Add date picker for scheduling posts

### Features to Add
1. Edit/Delete functionality
2. Search & pagination
3. Analytics charts
4. User role assignment modal
5. Module assignment form
6. Password change modal
7. Activity logs viewer
8. Export data functionality

---

## 📚 Project Architecture Principles

### 1. **Separation of Concerns**
- **Core** - Singleton services, guards, interceptors
- **Shared** - Reusable components, utilities
- **Features** - Business logic, feature-specific components

### 2. **Role-Based Access Control**
- Checked at route level with guards
- Checked at component level with PermissionService
- Checked at button/element level in templates

### 3. **Reactive Programming**
- RxJS Observables for state management
- BehaviorSubjects for user state
- Async pipe for template subscriptions

### 4. **Lazy Loading**
- Feature modules loaded on demand
- Reduces initial bundle size
- Improves app performance

### 5. **Standalone Components**
- No NgModule boilerplate
- Explicit dependency declaration
- Better tree-shaking

---

## 🔧 Running the Project

```bash
# Install dependencies
npm install

# Development server
ng serve --open

# Build for production
ng build --configuration production

# Run tests
ng test
```

**Access Points:**
- Login: `http://localhost:4200/auth/login`
- Dashboard: `http://localhost:4200/dashboard`
- Demo Credentials:
  - Email: `admin@example.com`
  - Password: `AdminPass123!`

---

## 📞 Support & Resources

- [Angular 19 Documentation](https://angular.io)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [RxJS Documentation](https://rxjs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Created with ❤️ for Control Dashboard**
