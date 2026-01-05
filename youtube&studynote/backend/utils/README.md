# Backend Utility Scripts

This folder contains utility scripts for managing the MongoDB database and testing the application.

---

## 📋 Available Scripts

### 1. **testMongoDB.js** - Connection Test
Tests MongoDB Atlas connection and verifies server readiness.

**Usage:**
```bash
node backend/utils/testMongoDB.js
```

**What it does:**
- ✅ Tests connection to MongoDB Atlas
- ✅ Verifies database credentials
- ✅ Checks read/write permissions
- ✅ Lists existing collections
- ✅ Provides troubleshooting tips

---

### 2. **checkDatabase.js** - Database Inspector
Inspects MongoDB database and lists all collections with details.

**Usage:**
```bash
node backend/utils/checkDatabase.js
```

**What it does:**
- 📊 Lists all databases in your cluster
- 📁 Shows all collections in codingTerminals database
- 📄 Displays document counts for each collection
- 🔍 Shows sample field structure
- 💡 Provides helpful database management tips

---

### 3. **seedTestData.js** - Create Test Data
Creates sample data for testing the application.

**Usage:**
```bash
node backend/utils/seedTestData.js
```

**What it creates:**
- 📺 2 sample videos (Angular & React)
- 📝 2 sample notes (JavaScript & CSS)
- ❓ 3 sample interview questions

**Note:** All test data is marked with `isTestData: true` flag for easy cleanup.

---

### 4. **clearTestData.js** - Remove Test Data
Removes all test data from the database.

**Usage:**
```bash
node backend/utils/clearTestData.js
```

**What it does:**
- 🧹 Removes all documents marked as test data
- 📊 Shows deletion summary
- ✅ Keeps your real production data intact

---

## 🚀 Quick Start Workflow

### First Time Setup:
```bash
# 1. Test your MongoDB connection
node backend/utils/testMongoDB.js

# 2. Check database status
node backend/utils/checkDatabase.js

# 3. Create test data (optional)
node backend/utils/seedTestData.js

# 4. Start your server
npm start
```

### During Development:
```bash
# Check what's in your database
node backend/utils/checkDatabase.js

# Clear test data when needed
node backend/utils/clearTestData.js
```

---

## 📚 Models Used

These scripts work with the modern model architecture:

- **Video** - YouTube video documents
- **Note** - Study notes documents  
- **InterviewQuestion** - Interview Q&A documents
- **User** - Authentication users (not managed by these scripts)

---

## 🔧 Configuration

All scripts use the `MONGODB_CLOUD` environment variable from your `.env` file:

```env
MONGODB_CLOUD=mongodb+srv://username:password@cluster0.crjph.mongodb.net/codingTerminals
```

If `.env` is not found, scripts will use the fallback connection string.

---

## ⚠️ Important Notes

1. **Test Data Flag**: All test data has `isTestData: true` to prevent accidental deletion of real data
2. **Production Safety**: Never run these scripts on production without backing up first
3. **Network Access**: Ensure your IP is whitelisted in MongoDB Atlas Network Access
4. **Permissions**: Database user needs "Read and write to any database" role

---

## 💡 Troubleshooting

If scripts fail to connect:

1. ✓ Check internet connection
2. ✓ Verify `.env` file has correct `MONGODB_CLOUD` value
3. ✓ Whitelist your IP in MongoDB Atlas → Network Access
4. ✓ Verify database user credentials in Database Access
5. ✓ Ensure MongoDB Atlas cluster is active

---

## 📞 Support

For issues or questions, refer to:
- MongoDB Atlas Dashboard: https://cloud.mongodb.com
- Project Documentation: See root README.md
