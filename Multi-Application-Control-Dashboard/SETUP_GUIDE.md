# 🎯 Control Dashboard - Setup & Implementation Guide

## 📦 Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
```bash
# Copy example to .env
cp .env.example .env

# Edit .env and set:
MONGODB_URI=mongodb://localhost:27017/control-dashboard
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
```

### 3. Start MongoDB (Local)
```bash
# Windows (if MongoDB installed locally)
mongod

# Or using Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Seed Initial Data (Optional)
```bash
npm run seed
```

### 5. Start Backend
```bash
# Development (watch mode)
npm run dev

# Production
npm run build && npm run prod
```

Backend will run at: `http://localhost:3000`

---

## 🎨 Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Create Environment Files
```bash
# Create src/environments/environment.ts
# Create src/environments/environment.prod.ts
```

### 3. Configure API URL
Update `environment.ts`:
```typescript
export const environment = {
  apiUrl: 'http://localhost:3000/api',
  production: false,
};
```

### 4. Start Frontend
```bash
ng serve --open
```

Frontend will run at: `http://localhost:4200`

---

## 🔐 RBAC System Overview

### User Roles

#### 1. **Super Admin** 👑
- Full system access
- Create/edit/delete users
- Assign roles to users
- Control module access
- Enable/disable modules
- View all analytics

#### 2. **Admin** 👤
- Limited admin rights
- Create/edit content for assigned modules
- View module analytics
- Cannot manage users or system settings

#### 3. **Viewer** 👁️
- Read-only access
- View only assigned modules
- No create/edit/delete permissions

### Module Assignment
Each user can be assigned specific modules:
- 📚 Study Notes
- ▶️ YouTube
- 💼 LinkedIn
- ✍️ Blog

---

## 📊 Database Collections

### Users
```
{
  email: string (unique)
  username: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string
  role: ObjectId (ref: Role)
  assignedModules: ObjectId[] (ref: Module)
  isSuperAdmin: boolean
  isActive: boolean
  lastLogin: Date
  preferences: {}
}
```

### Roles
```
{
  name: 'super_admin' | 'admin' | 'viewer'
  displayName: string
  description: string
  permissions: string[]
}
```

### Modules
```
{
  name: 'study_notes' | 'youtube' | 'linkedin' | 'blog'
  displayName: string
  isEnabled: boolean
  contentCount: number
  settings: {}
}
```

### Content Collections
- **StudyNotes**: title, content, category, tags, views
- **YouTubeContent**: title, videoUrl, category, views, likes
- **LinkedInPost**: title, content, status, scheduledFor, impressions
- **BlogPost**: title, content, category, status, views

---

## 🔗 API Endpoints

### Authentication
```
POST   /api/auth/login              - Login user
POST   /api/auth/register           - Register (Super Admin only)
GET    /api/auth/me                 - Get current user details
POST   /api/auth/refresh            - Refresh JWT token
```

### Study Notes (CRUD + Search)
```
GET    /api/study-notes             - Get all notes (paginated)
GET    /api/study-notes/:id         - Get note by ID
POST   /api/study-notes             - Create note (Admin+)
PUT    /api/study-notes/:id         - Update note (Admin+)
DELETE /api/study-notes/:id         - Delete note (Admin+)
GET    /api/study-notes/search/:q   - Search notes
```

### YouTube (CRUD + Trending)
```
GET    /api/youtube                 - Get all videos
GET    /api/youtube/:id             - Get video by ID
POST   /api/youtube                 - Create video (Admin+)
PUT    /api/youtube/:id             - Update video (Admin+)
DELETE /api/youtube/:id             - Delete video (Admin+)
GET    /api/youtube/trending        - Get trending videos
```

### LinkedIn (CRUD + Publishing)
```
GET    /api/linkedin                - Get all posts
GET    /api/linkedin/:id            - Get post by ID
POST   /api/linkedin                - Create post (Admin+)
PUT    /api/linkedin/:id            - Update post (Admin+)
POST   /api/linkedin/:id/publish    - Publish post (Admin+)
DELETE /api/linkedin/:id            - Delete post (Admin+)
GET    /api/linkedin/:id/analytics  - Get post analytics
```

### Blog (CRUD + Publishing)
```
GET    /api/blog                    - Get all posts
GET    /api/blog/:id                - Get post by ID
POST   /api/blog                    - Create post (Admin+)
PUT    /api/blog/:id                - Update post (Admin+)
POST   /api/blog/:id/publish        - Publish post (Admin+)
POST   /api/blog/:id/draft          - Save draft (Admin+)
DELETE /api/blog/:id                - Delete post (Admin+)
```

### Users (Admin Only)
```
GET    /api/users                   - Get all users (Super Admin)
GET    /api/users/:id               - Get user by ID
PUT    /api/users/:id               - Update user profile
POST   /api/users/:id/assign-modules - Assign modules (Super Admin)
POST   /api/users/:id/assign-role   - Assign role (Super Admin)
POST   /api/users/:id/promote       - Promote to admin (Super Admin)
POST   /api/users/:id/deactivate    - Deactivate user (Super Admin)
DELETE /api/users/:id               - Delete user (Super Admin)
```

### Modules
```
GET    /api/modules                 - Get all modules
GET    /api/modules/:id             - Get module by ID
POST   /api/modules/:id/enable      - Enable module (Super Admin)
POST   /api/modules/:id/disable     - Disable module (Super Admin)
GET    /api/modules/stats           - Get module statistics
```

---

## 🧪 Testing the System

### 1. Create Super Admin User
```bash
# Direct DB insert or via registration endpoint
# Email: admin@example.com
# Password: AdminPass123!
```

### 2. Login
```bash
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "AdminPass123!"
}

# Response includes JWT token
```

### 3. Create Regular Admin
```bash
POST /api/users
{
  "email": "editor@example.com",
  "username": "editor",
  "firstName": "Editor",
  "lastName": "User",
  "password": "EditorPass123!",
  "role": "admin"
}
```

### 4. Assign Modules to User
```bash
POST /api/users/{userId}/assign-modules
{
  "moduleIds": ["module_id_1", "module_id_2"]
}
```

### 5. Create Content
```bash
POST /api/study-notes (requires auth token)
{
  "title": "React Basics",
  "content": "...",
  "category": "Frontend",
  "tags": ["react", "javascript"]
}
```

---

## 📁 Project Structure

```
control-dashboard/
├── backend/
│   ├── src/
│   │   ├── main.ts                 ✅ Entry point
│   │   ├── app.module.ts           ✅ Main module
│   │   ├── auth/
│   │   │   ├── auth.service.ts     ✅ Auth logic
│   │   │   ├── auth.controller.ts  ✅ Auth routes
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts ✅ JWT
│   │   │   ├── guards/
│   │   │   │   └── roles.guard.ts  ✅ RBAC
│   │   │   └── decorators/
│   │   │       └── roles.decorator.ts ✅ Role decorator
│   │   ├── users/
│   │   │   ├── users.service.ts    ✅ User ops
│   │   │   ├── users.controller.ts ✅ User routes
│   │   │   └── schemas/
│   │   │       └── user.schema.ts  ✅ User model
│   │   ├── modules/
│   │   │   ├── modules.service.ts  ✅ Module ops
│   │   │   └── schemas/
│   │   │       └── module.schema.ts ✅ Module model
│   │   ├── study-notes/            ✅ Complete
│   │   ├── youtube/                ✅ Complete
│   │   ├── linkedin/               ✅ Complete
│   │   └── blog/                   ✅ Complete
│   ├── .env.example                ✅ Config template
│   └── package.json                ✅ Dependencies
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── core/
    │   │   │   ├── guards/
    │   │   │   │   ├── auth.guard.ts        ✅ Auth guard
    │   │   │   │   └── role.guard.ts        ✅ Role guard
    │   │   │   ├── interceptors/
    │   │   │   │   └── auth.interceptor.ts  ✅ JWT interceptor
    │   │   │   └── services/
    │   │   │       ├── auth.service.ts      ✅ Auth service
    │   │   │       └── api.service.ts       ✅ API service
    │   │   ├── features/
    │   │   │   ├── auth/                    ⏳ TODO
    │   │   │   ├── dashboard/               ✅ Dashboard
    │   │   │   ├── study-notes/             ⏳ TODO
    │   │   │   ├── youtube/                 ⏳ TODO
    │   │   │   ├── linkedin/                ⏳ TODO
    │   │   │   ├── blog/                    ⏳ TODO
    │   │   │   └── admin/                   ⏳ TODO
    │   │   └── shared/
    │   │       ├── components/
    │   │       │   ├── sidebar/             ✅ Sidebar
    │   │       │   └── navbar/              ⏳ TODO
    │   │       └── layouts/                 ⏳ TODO
    │   └── environments/                    ⏳ TODO
    └── package.json
```

---

## 🚀 Next Steps

### Backend
- [x] Database schemas
- [x] Authentication & JWT
- [x] RBAC with guards
- [x] Service layer
- [x] API controllers
- [ ] Audit logging
- [ ] Analytics endpoints
- [ ] Error handling middleware

### Frontend
- [x] Core services (Auth, API)
- [x] Route guards
- [x] HTTP interceptors
- [x] Dashboard
- [ ] Login/Register pages
- [ ] Module components (CRUD)
- [ ] Admin panel
- [ ] Forms with validation
- [ ] Toast notifications
- [ ] Dark/Light mode

---

## 🔒 Security Best Practices

✅ **Implemented:**
- JWT token authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- HTTP-only cookies ready
- CORS configuration

**To Add:**
- Rate limiting
- Request validation
- SQL injection prevention (using Mongoose)
- XSS protection
- CSRF tokens
- Helmet.js for security headers
- Environment variable validation

---

## 📞 Support & Resources

- Angular 20 Docs: https://angular.io
- NestJS Docs: https://docs.nestjs.com
- MongoDB Docs: https://docs.mongodb.com
- Tailwind CSS: https://tailwindcss.com

---

**Created with ❤️ by Coding Terminals Team**
