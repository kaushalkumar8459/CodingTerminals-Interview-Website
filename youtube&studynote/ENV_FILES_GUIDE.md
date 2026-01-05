# 📋 ENVIRONMENT FILES CONFIGURATION GUIDE

## 🎯 Overview

Instead of manually setting environment variables in Render dashboard, you can now use **environment files** that are loaded automatically based on the deployment environment.

## 📁 File Structure

```
backend/
├── .env                    ← Current environment (not committed)
├── .env.development        ← Development settings (committed)
├── .env.staging            ← Staging settings (committed)
├── .env.production         ← Production settings (committed)
├── .env.example            ← Template reference
└── env-loader.js           ← Script that loads correct .env file
```

---

## 🚀 How It Works

### Automatic Environment Detection

```bash
# Development
NODE_ENV=development npm start
→ Loads .env.development

# Staging
NODE_ENV=staging npm start
→ Loads .env.staging

# Production
NODE_ENV=production npm start
→ Loads .env.production
```

### Loading Priority

```
1. .env.{NODE_ENV} file (e.g., .env.production)
2. Render dashboard variables (override file values)
3. .env fallback
4. Process defaults
```

---

## 📝 Quick Start

### Step 1: Local Development

Copy development settings to your `.env`:

```bash
cd backend

# Option A: Manual copy
cp .env.development .env

# Option B: Update manually
# Edit .env with your local MongoDB connection
```

Then run:
```bash
npm run dev:watch
```

You'll see:
```
📂 Loading environment: DEVELOPMENT
📄 Environment file: /path/to/.env.development
✅ Found .env.development file

╔══════════════════════════════════════════════════════╗
║        ENVIRONMENT CONFIGURATION LOADED               ║
╠══════════════════════════════════════════════════════╣
║ Environment:    development                          ║
║ Port:           3000                                 ║
║ Database:       local                                ║
║ JWT Expiry:     24h                                  ║
║ Log Level:      debug                                ║
╠══════════════════════════════════════════════════════╣
║ Frontend URL:   http://localhost:3000                ║
║ API URL:        http://localhost:3000/api            ║
╚══════════════════════════════════════════════════════╝
```

### Step 2: Deploy to Render (Staging)

1. **Update .env.staging** with your staging credentials:
```bash
MONGODB_CLOUD=mongodb+srv://staging-user:password@cluster.mongodb.net/codingTerminals-staging
JWT_SECRET=your-staging-secret-key
SESSION_SECRET=your-staging-session-secret
```

2. **Commit to Git**:
```bash
git add .env.staging render.yaml
git commit -m "Add staging environment configuration"
git push origin main
```

3. **Deploy on Render**:
   - Render will automatically detect `render.yaml`
   - Set `NODE_ENV=staging` in Render dashboard
   - Render will load `.env.staging` automatically

### Step 3: Deploy to Render (Production)

1. **Update .env.production** with your production credentials:
```bash
MONGODB_CLOUD=mongodb+srv://prod-user:password@cluster.mongodb.net/codingTerminals-prod
JWT_SECRET=your-production-secret-key
SESSION_SECRET=your-production-session-secret
```

2. **Commit to Git**:
```bash
git add .env.production
git commit -m "Add production environment configuration"
git push origin main
```

3. **Deploy on Render**:
   - Render will load `.env.production` automatically
   - Add sensitive variables in Render dashboard as backup

---

## 🔐 Security Best Practices

### ✅ Safe to Commit

These files are safe because they use placeholder values:
- `render.yaml`
- `.env.development` (dev credentials only)
- `.env.staging` (placeholder values)
- `.env.production` (placeholder values)
- `.env.example`
- `env-loader.js`

### ❌ Never Commit

Add to `.gitignore` (already done):
- `.env` (actual local credentials)
- Real MongoDB passwords
- Real JWT secrets
- Real API keys

### Verify .gitignore

```bash
cat backend/.gitignore
```

Should include:
```
node_modules/
.env
*.log
.DS_Store
```

---

## 🔧 Environment Variables Reference

### Development (.env.development)

```bash
NODE_ENV=development
PORT=3000
DB_ENVIRONMENT=local
MONGODB_LOCAL=mongodb://localhost:27017/codingTerminals
JWT_SECRET=dev-secret-key
LOG_LEVEL=debug
```

### Staging (.env.staging)

```bash
NODE_ENV=staging
PORT=3000
DB_ENVIRONMENT=cloud
MONGODB_CLOUD=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=staging-secret-key
LOG_LEVEL=info
```

### Production (.env.production)

```bash
NODE_ENV=production
PORT=3000
DB_ENVIRONMENT=cloud
MONGODB_CLOUD=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=production-secret-key
LOG_LEVEL=warn
```

---

## 🧪 Testing Locally

### Test Development Environment

```bash
# Set development environment
NODE_ENV=development npm start

# Check console output - should show:
# ✅ Environment: development
# ✅ Database: local
# ✅ Log Level: debug
```

### Test Staging Environment Locally

```bash
# Set staging environment (if MongoDB cloud available)
NODE_ENV=staging npm start

# Check console output - should show:
# ✅ Environment: staging
# ✅ Database: cloud
# ✅ Log Level: info
```

### Test Production Environment Locally

```bash
# Set production environment
NODE_ENV=production npm start

# Check console output - should show:
# ✅ Environment: production
# ✅ Database: cloud
# ✅ Log Level: warn
```

---

## 📡 Render Deployment

### Option 1: Using render.yaml (Recommended)

```bash
# 1. Commit render.yaml to root of repository
git add render.yaml
git commit -m "Add Render deployment configuration"
git push origin main

# 2. Go to Render dashboard
# 3. Connect GitHub repo
# 4. Render will auto-detect render.yaml
# 5. Set sensitive environment variables in dashboard
```

### Option 2: Manual Setup

If not using render.yaml:

1. Create Web Service on Render
2. Set environment variables:
   - `NODE_ENV=production`
   - `MONGODB_CLOUD=mongodb+srv://...`
   - `JWT_SECRET=your-secret`
3. Build command: `cd backend && npm install`
4. Start command: `cd backend && npm start`

---

## 🔄 Switching Environments

### Locally Switch Between Environments

```bash
# Development with auto-reload
NODE_ENV=development npm run dev:watch

# Staging
NODE_ENV=staging npm run staging:watch

# Production
NODE_ENV=production npm start
```

### Check Which Environment is Loaded

```bash
# In Node.js REPL
node
> require('dotenv').config()
> console.log(process.env.NODE_ENV)
```

---

## ❓ Troubleshooting

### Issue: "Cannot find .env file"

**Solution:** 
```bash
# Check if file exists
ls -la backend/.env.*

# Verify correct NODE_ENV is set
echo $NODE_ENV

# Make sure you're in correct directory
cd backend
NODE_ENV=development npm start
```

### Issue: Wrong environment loaded

**Solution:**
```bash
# Check which file was loaded
# Look at console output for:
# "📂 Loading environment: PRODUCTION"

# Verify NODE_ENV
echo $NODE_ENV

# If Windows, use:
echo %NODE_ENV%
```

### Issue: Missing environment variables

**Solution:**
```bash
# Check all loaded variables
node -e "require('dotenv').config(); console.log(process.env)"

# Verify MONGODB_CLOUD is set
node -e "require('./env-loader'); console.log(process.env.MONGODB_CLOUD)"
```

---

## 📚 Files Reference

| File | Purpose | Commit? | Contains |
|------|---------|---------|----------|
| `.env` | Current environment | ❌ No | Actual secrets |
| `.env.development` | Dev template | ✅ Yes | Dev values |
| `.env.staging` | Staging template | ✅ Yes | Placeholder values |
| `.env.production` | Production template | ✅ Yes | Placeholder values |
| `.env.example` | Reference template | ✅ Yes | All possible variables |
| `env-loader.js` | Loader script | ✅ Yes | Auto-loading logic |
| `render.yaml` | Render config | ✅ Yes | Deployment settings |

---

## 🚀 Next Steps

1. ✅ Review environment files created
2. ✅ Update `.env.staging` with your staging MongoDB credentials
3. ✅ Update `.env.production` with production credentials  
4. ✅ Test locally: `NODE_ENV=development npm run dev:watch`
5. ✅ Commit to Git: `git push origin main`
6. ✅ Deploy to Render

---

**Status:** ✅ Environment file system ready  
**Security:** ✅ Credentials protected  
**Flexibility:** ✅ Multiple environment support