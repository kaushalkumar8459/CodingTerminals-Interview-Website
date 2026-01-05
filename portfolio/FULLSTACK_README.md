# 🚀 Full-Stack Portfolio Manager Application

A complete CRUD application with **Admin** and **Viewer** roles built with **Angular 18** (Frontend) and **Node.js + Express + MongoDB** (Backend).

---

## 📋 **Application Overview**

### **Two Roles:**

1. **👤 Admin Page** (`/admin`)
   - ✅ Create portfolio items
   - ✅ Read all portfolios
   - ✅ Update existing portfolios
   - ✅ Delete portfolios
   - ✅ View statistics dashboard

2. **👁️ Viewer Page** (`/viewer`)
   - ✅ View all portfolios (Read-only)
   - ✅ Filter by category and status
   - ❌ No create, update, or delete permissions

---

## 🏗️ **Technology Stack**

### **Backend:**
- Node.js + Express
- MongoDB + Mongoose
- RESTful API architecture
- CORS enabled

### **Frontend:**
- Angular 18 (Standalone Components)
- TypeScript
- SCSS
- HttpClient for API integration
- Reactive Forms

---

## 📁 **Project Structure**

```
portfolio/
├── backend/                    # Backend API
│   ├── models/
│   │   └── Portfolio.js       # MongoDB schema
│   ├── controllers/
│   │   └── portfolioController.js
│   ├── routes/
│   │   └── portfolioRoutes.js
│   ├── config/
│   │   └── database.js
│   ├── server.js              # Express server
│   ├── package.json
│   └── .env
│
├── src/                       # Angular Frontend
│   ├── app/
│   │   ├── pages/
│   │   │   ├── admin/         # Admin CRUD page
│   │   │   └── viewer/        # Viewer read-only page
│   │   ├── services/
│   │   │   └── portfolio.service.ts
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   └── styles.scss
└── README.md
```

---

## 🚀 **Installation & Setup**

### **Prerequisites:**
- Node.js (v18+)
- MongoDB installed and running
- Angular CLI (`npm install -g @angular/cli`)

---

### **Step 1: Install Backend Dependencies**

```bash
cd portfolio/backend
npm install
```

### **Step 2: Configure MongoDB**

Edit `backend/.env`:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/portfolio-manager
NODE_ENV=development
```

### **Step 3: Start Backend Server**

```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

**Backend will run at:** `http://localhost:3001`

---

### **Step 4: Install Frontend Dependencies**

```bash
cd portfolio
npm install
```

### **Step 5: Start Frontend**

```bash
ng serve
```

**Frontend will run at:** `http://localhost:4200`

---

## 📡 **API Endpoints**

### **Public Routes (Viewer & Admin):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio` | Get all portfolios |
| GET | `/api/portfolio/:id` | Get portfolio by ID |
| GET | `/api/portfolio/stats` | Get statistics |

### **Admin-Only Routes:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/portfolio` | Create new portfolio |
| PUT | `/api/portfolio/:id` | Update portfolio |
| DELETE | `/api/portfolio/:id` | Delete portfolio |

---

## 🎯 **Usage Guide**

### **1. Access Viewer Page (Public)**

Navigate to: `http://localhost:4200/viewer`

**Features:**
- View all portfolio projects
- Filter by category (Web Development, Mobile App, etc.)
- Filter by status (Completed, In Progress, Planned)
- View project details, technologies, and links
- **No editing capabilities**

---

### **2. Access Admin Dashboard**

Navigate to: `http://localhost:4200/admin`

**Features:**
- **Create:** Click "➕ Create New Portfolio" button
- **Read:** View all portfolios in card grid
- **Update:** Click "✏️ Edit" on any card
- **Delete:** Click "🗑️ Delete" on any card
- **Statistics:** View total projects and featured count

---

## 📊 **Data Flow Architecture**

```
┌─────────────┐
│   Angular   │
│  Frontend   │
│ (Viewer/    │
│  Admin)     │
└──────┬──────┘
       │
       │ HTTP Requests
       │ (Service Layer)
       ▼
┌─────────────┐
│  Portfolio  │
│   Service   │
│ (API calls) │
└──────┬──────┘
       │
       │ REST API
       ▼
┌─────────────┐
│   Express   │
│   Server    │
│ (Backend)   │
└──────┬──────┘
       │
       │ Mongoose
       ▼
┌─────────────┐
│   MongoDB   │
│  Database   │
└─────────────┘
```

---

## 🧪 **API Testing Examples**

### **Create Portfolio (Admin)**

```bash
curl -X POST http://localhost:3001/api/portfolio \
  -H "Content-Type: application/json" \
  -d '{
    "title": "E-Commerce Platform",
    "description": "Full-stack e-commerce application",
    "category": "Web Development",
    "technologies": ["Angular", "Node.js", "MongoDB"],
    "status": "completed",
    "featured": true
  }'
```

### **Get All Portfolios (Viewer)**

```bash
curl http://localhost:3001/api/portfolio
```

### **Update Portfolio (Admin)**

```bash
curl -X PUT http://localhost:3001/api/portfolio/{id} \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

### **Delete Portfolio (Admin)**

```bash
curl -X DELETE http://localhost:3001/api/portfolio/{id}
```

---

## 🔐 **Role-Based Access (Future Enhancement)**

Currently, routes are separated by pages. To add authentication:

1. Add JWT authentication to backend
2. Create login system
3. Add auth guards to Angular routes
4. Protect admin routes with middleware

---

## ✨ **Features Implemented**

### ✅ **Backend:**
- [x] MongoDB schema with validation
- [x] RESTful API with proper HTTP status codes
- [x] Request payload validation
- [x] Error handling middleware
- [x] CORS configuration
- [x] Clean folder structure (MVC pattern)

### ✅ **Frontend:**
- [x] Service layer for API integration
- [x] No hardcoded data - all from API
- [x] Separate Admin and Viewer components
- [x] Reactive state management
- [x] Form validation
- [x] Loading states
- [x] Error handling
- [x] Responsive design

---

## 🎨 **Screenshots**

### Admin Dashboard:
- Statistics cards (Total, Featured)
- Portfolio grid with Edit/Delete buttons
- Create/Edit modal form

### Viewer Page:
- Portfolio showcase
- Category and status filters
- Project details with technologies
- External links (GitHub, Live Demo)

---

## 🚀 **Deployment**

### **Backend (Render/Railway):**
```bash
# Build and deploy backend
cd backend
npm start
```

### **Frontend (Netlify/Vercel):**
```bash
# Build Angular app
ng build --configuration production
# Deploy dist/portfolio folder
```

---

## 📝 **Code Quality**

✅ **Clean Architecture:**
- Separation of concerns (Controllers, Services, Routes, Models)
- Reusable service layer
- Well-commented code

✅ **Best Practices:**
- TypeScript strict mode
- SCSS with component-scoped styles
- Standalone components (Angular 18)
- HTTP interceptors ready

---

## 🐛 **Troubleshooting**

### MongoDB Connection Error:
```bash
# Make sure MongoDB is running
mongod --dbpath /path/to/data
```

### Port Already in Use:
```bash
# Change port in backend/.env
PORT=3002
```

### CORS Error:
- Backend already configured for CORS
- Check if backend is running on port 3001

---

## 👨‍💻 **Author**

**Coding Terminals**
- YouTube: [@codingterminals](https://www.youtube.com/@codingterminals)

---

## 📄 **License**

MIT License - Free to use for learning and projects!

---

**🎉 Happy Coding! Build amazing things!**