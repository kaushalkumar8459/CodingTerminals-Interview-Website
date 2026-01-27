# 🎯 Control Dashboard - Unified Application Management System

## 📊 Project Architecture

### Directory Structure
```
control-dashboard/
├── backend/                          # NestJS Backend
│   ├── src/
│   │   ├── auth/                    # Authentication & JWT
│   │   ├── users/                   # User Management
│   │   ├── roles/                   # Role-Based Access Control
│   │   ├── permissions/             # Permission Management
│   │   ├── modules/                 # Module Management
│   │   ├── study-notes/             # Study Notes Module
│   │   ├── youtube/                 # YouTube Module
│   │   ├── linkedin/                # LinkedIn Module
│   │   ├── blog/                    # Blog Module
│   │   ├── analytics/               # Analytics Service
│   │   ├── audit-logs/              # Audit Trail
│   │   └── common/                  # Shared utilities
│   ├── package.json
│   └── .env
│
├── frontend/                         # Angular 20 Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/                # Login/Logout
│   │   │   ├── dashboard/           # Main Dashboard
│   │   │   ├── layout/              # Sidebar, Navbar
│   │   │   ├── modules/             # Module Components
│   │   │   │   ├── study-notes/
│   │   │   │   ├── youtube/
│   │   │   │   ├── linkedin/
│   │   │   │   └── blog/
│   │   │   ├── admin/               # Admin Panel
│   │   │   │   ├── user-management/
│   │   │   │   ├── role-management/
│   │   │   │   └── module-settings/
│   │   │   ├── guards/              # Route Guards
│   │   │   ├── services/            # API Services
│   │   │   └── interceptors/        # HTTP Interceptors
│   │   ├── assets/
│   │   └── styles/
│   └── package.json
│
└── README.md
```

## 🔐 Role Hierarchy

### 1. Super Admin
- Full system access
- User management (create, edit, delete, promote)
- Role & permission assignment
- Module enable/disable
- View all analytics

### 2. Admin
- Content management for assigned modules
- Cannot manage users
- Cannot access system settings
- View module-specific analytics

### 3. Viewer
- Read-only access
- Can view assigned modules only
- No create/edit/delete permissions

## 🧩 Modules Overview

1. **Study Notes** - Create, manage, organize study materials
2. **YouTube** - Manage video content and playlists
3. **LinkedIn** - Schedule and manage LinkedIn posts
4. **Blog** - Write and publish blog articles

## 🔄 Core Features

✅ JWT-based Authentication
✅ Role-Based Access Control (RBAC)
✅ Dynamic Module Assignment
✅ Module Enable/Disable
✅ User Management
✅ Activity Logging & Audit Trail
✅ Analytics Dashboard
✅ Responsive UI with Tailwind CSS
✅ Dark/Light Mode Support

## 🚀 Tech Stack

**Frontend:**
- Angular 20
- TypeScript
- Tailwind CSS
- RxJS (Signals/SignalStore)
- Angular Material (optional)

**Backend:**
- NestJS
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Class Validators

**Database:**
- MongoDB
- Collections: Users, Roles, Permissions, Modules, Content, AuditLogs

---

## 📝 Next Steps

1. Create Backend Project (NestJS)
2. Create Frontend Project (Angular 20)
3. Set up Database Models
4. Implement Authentication
5. Set up RBAC System
6. Create Module CRUD Operations
7. Build UI Components
8. Implement Module Management
9. Add Analytics & Logging
10. Deploy & Test
