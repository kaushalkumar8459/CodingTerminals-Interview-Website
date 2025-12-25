# Roadmap Backend Server

This Node.js server allows you to manage your roadmap content through the admin panel without manually editing JSON files.

## 📋 Prerequisites

- Node.js installed (Download from: https://nodejs.org/)

## 🚀 Setup Instructions

### Step 1: Install Dependencies
Open Command Prompt or Terminal and navigate to the backend folder:
```bash
cd "c:\Users\kkumar37\OneDrive - Capgemini\Desktop\Training\Angular-JavaScript-Interview-Roadmap-2025\roadmap\backend"
npm install
```

### Step 2: Start the Server
```bash
npm start
```

You should see:
```
🚀 Server is running!
📝 Admin Panel: http://localhost:3000/admin.html
👁️  Roadmap: http://localhost:3000/roadmap.html
📡 API: http://localhost:3000/api/roadmap

✨ Ready to manage your roadmap!
```

### Step 3: Use the Admin Panel
1. Open your browser
2. Go to: **http://localhost:3000/admin.html**
3. Add/edit videos, topics, and interview questions
4. Click "Save All Changes" - it will **directly update roadmap.json** file!
5. View your roadmap at: **http://localhost:3000/roadmap.html**

## 📝 Features

- ✅ Add/Edit/Delete video entries
- ✅ Manage topics covered
- ✅ Manage interview questions
- ✅ Edit upcoming topic
- ✅ Auto-save to roadmap.json
- ✅ No manual file editing needed!

## ⚠️ Important

**Keep the server running while using the admin panel!**

Press `Ctrl+C` in the terminal to stop the server.

## 🔧 API Endpoints

- `GET /api/roadmap` - Get current roadmap data
- `POST /api/roadmap` - Save roadmap data

## 📁 File Structure

```
roadmap/
├── admin.html          # Admin panel interface
├── roadmap.html        # Public roadmap view
├── roadmap.json        # Data file (auto-updated)
└── backend/
    ├── server.js       # Node.js server
    ├── package.json    # Dependencies
    └── README.md       # This file
```
