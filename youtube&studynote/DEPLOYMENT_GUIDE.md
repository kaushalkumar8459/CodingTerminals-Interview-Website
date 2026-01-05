# 🚀 DEPLOYMENT GUIDE - ENVIRONMENT-BASED URL SWITCHING

This guide explains how to deploy your application with automatic environment-based URL switching.

## 📋 Table of Contents
1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [How It Works](#how-it-works)
4. [Deployment Steps](#deployment-steps)
5. [Environment Variables](#environment-variables)
6. [Testing](#testing)

---

## 🎯 Overview

Your application now supports **3 environments**:
- **Development** (localhost)
- **Staging** (staging server)
- **Production** (live server)

The URLs automatically switch based on the hostname and environment variables.

---

## 📁 File Structure

```
youtube&studynote/
├── config/
│   ├── app.config.js              ← Main frontend config
│   ├── environment.config.js       ← Auto-detection utility
│   └── app.config.js              ← Backend config
├── backend/
│   ├── server.js
│   ├── package.json               ← Updated with build scripts
│   ├── .env                       ← Your environment variables (not committed)
│   ├── .env.example               ← Template for .env
│   └── config/
│       └── environment.config.js  ← Backend environment config
└── auth/
    ├── auth.js                    ← Already uses APP_CONFIG
    └── login.html
```

---

## 🔄 How It Works

### Frontend URL Switching

The `environment.config.js` auto-detects the environment:

```javascript
// Automatically detects based on hostname
localhost:3000        → Development
staging-app.render.com → Staging  
your-domain.com       → Production
```

Example usage in your code:

```javascript
// Get current environment
const env = EnvironmentConfig.getEnvironment();  // 'development', 'staging', or 'production'

// Get API URL
const apiUrl = EnvironmentConfig.getApiUrl('/api/videos');
// Output: 'http://localhost:3000/api/videos' (in dev)
//         'https://your-domain.com/api/videos' (in prod)

// Make API request
EnvironmentConfig.fetchApi('/api/videos', {
    method: 'GET'
}).then(data => console.log(data));
```

### Backend URL Switching

The `backend/config/environment.config.js` reads `NODE_ENV`:

```javascript
// Automatically selects config based on NODE_ENV
NODE_ENV=development → Dev config
NODE_ENV=staging     → Staging config
NODE_ENV=production  → Prod config
```

---

## 📦 Deployment Steps

### Step 1: Local Development

```bash
# Install dependencies
cd backend
npm install

# Run development server
npm run dev:watch
# or
npm run dev:start
```

**Environment:** Development  
**API URL:** http://localhost:3000

---

### Step 2: Deploy to Render (Staging)

#### Create `.env` file for Staging:

```bash
# In backend/.env
NODE_ENV=staging
PORT=3000
DB_ENVIRONMENT=cloud
MONGODB_CLOUD=mongodb+srv://your-username:your-password@cluster0.mongodb.net/codingTerminals
JWT_SECRET=your-staging-secret
SESSION_SECRET=your-staging-session-secret
STAGING_FRONTEND_URL=https://staging-app.render.com
STAGING_BACKEND_URL=https://staging-api.render.com
```

#### In Render Dashboard:

1. Go to **Environment Variables**
2. Add:
   ```
   NODE_ENV=staging
   MONGODB_CLOUD=mongodb+srv://...
   JWT_SECRET=your-staging-secret
   ```

3. Deploy command: `cd backend && npm run staging`

---

### Step 3: Deploy to Render (Production)

#### Create `.env` file for Production:

```bash
# In backend/.env
NODE_ENV=production
PORT=3000
DB_ENVIRONMENT=cloud
MONGODB_CLOUD=mongodb+srv://your-username:your-password@cluster0.mongodb.net/codingTerminals
JWT_SECRET=your-production-secret
SESSION_SECRET=your-production-session-secret
PROD_FRONTEND_URL=https://your-domain.com
PROD_BACKEND_URL=https://your-domain.com
```

#### In Render Dashboard:

1. Go to **Environment Variables**
2. Add:
   ```
   NODE_ENV=production
   MONGODB_CLOUD=mongodb+srv://...
   JWT_SECRET=your-production-secret
   ```

3. Deploy command: `cd backend && npm run prod`

---

## 🔧 Environment Variables

### Development
| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_ENV` | `development` | Tells backend it's dev |
| `MONGODB_LOCAL` | `mongodb://localhost:27017/codingTerminals` | Local MongoDB |
| `JWT_SECRET` | `dev-secret-key` | Dev JWT secret |
| `PORT` | `3000` | Server port |

### Staging
| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_ENV` | `staging` | Tells backend it's staging |
| `MONGODB_CLOUD` | `mongodb+srv://...` | Cloud MongoDB |
| `JWT_SECRET` | `staging-secret-key` | Staging JWT secret |
| `STAGING_FRONTEND_URL` | `https://staging-app.render.com` | Staging frontend domain |
| `STAGING_BACKEND_URL` | `https://staging-api.render.com` | Staging backend domain |

### Production
| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_ENV` | `production` | Tells backend it's production |
| `MONGODB_CLOUD` | `mongodb+srv://...` | Cloud MongoDB |
| `JWT_SECRET` | `prod-secret-key` | Production JWT secret |
| `PROD_FRONTEND_URL` | `https://your-domain.com` | Production frontend domain |
| `PROD_BACKEND_URL` | `https://your-domain.com` | Production backend domain |

---

## 🧪 Testing

### Check Environment Detection

Open browser console and run:

```javascript
// Check current environment
console.log(EnvironmentConfig.getEnvironment());

// Check API URL
console.log(EnvironmentConfig.getApiBaseUrl());

// Make test API call
EnvironmentConfig.fetchApi('/api/health').then(data => console.log(data));
```

### Verify Console Output

When page loads, you should see:

```
╔══════════════════════════════════════════╗
║   ENVIRONMENT CONFIGURATION              ║
╠══════════════════════════════════════════╣
║ Environment: PRODUCTION                  ║
║ Frontend URL: https://your-domain.com    ║
║ API Base URL: https://your-domain.com    ║
║ Hostname: your-domain.com                ║
║ Protocol: https:                         ║
╚══════════════════════════════════════════╝
```

---

## 📝 Quick Reference

### Run Commands

```bash
# Development
npm run dev:watch          # Watch mode with nodemon
npm run dev:start          # One-time start

# Staging
npm run staging            # One-time start
npm run staging:watch      # Watch mode

# Production
npm run prod               # Start production
npm run build              # Build (no-op for Node)
npm run build:prod         # Build with NODE_ENV=production
```

### Update Render Deployment

When deploying to Render:

1. **Staging**: Set build command to `cd backend && npm run staging`
2. **Production**: Set build command to `cd backend && npm run prod`

Or use environment variables in Render Dashboard to control behavior.

---

## 🔒 Security Notes

1. ✅ Never commit `.env` file to Git
2. ✅ Use different JWT secrets for each environment
3. ✅ Never expose MongoDB credentials in frontend code
4. ✅ Always use HTTPS in production
5. ✅ Whitelist MongoDB Atlas IP in production
6. ✅ Use environment-specific database credentials

---

## 🆘 Troubleshooting

### API calls failing after deployment?

1. Check browser console for environment info
2. Verify API URLs in Network tab
3. Check CORS settings in backend
4. Verify MongoDB connection

### Getting localhost URLs in production?

1. Clear browser cache
2. Check `app.config.js` getEnvironmentConfig() function
3. Verify hostname detection logic

### Environment not switching?

1. Check `NODE_ENV` environment variable
2. Verify `.env` file is loaded correctly
3. Run `npm run build:prod` before deployment

---

## 📚 Additional Resources

- [Render Environment Variables](https://docs.render.com/environment-variables)
- [MongoDB Atlas IP Whitelist](https://docs.atlas.mongodb.com/security/ip-access-list/)
- [Express CORS](https://expressjs.com/en/resources/middleware/cors.html)

---

**Last Updated:** January 2026  
**Version:** 1.0.0