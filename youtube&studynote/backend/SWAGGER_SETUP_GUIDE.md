# 📚 SWAGGER API DOCUMENTATION SETUP GUIDE

## ✅ What Was Added

Your backend now has complete Swagger/OpenAPI 3.0 documentation with:

- ✅ **Swagger UI** at `/api-docs` - Interactive API browser
- ✅ **OpenAPI 3.0 Spec** - Full API specification
- ✅ **All endpoints documented** - Videos, Notes, Auth, Interview Questions
- ✅ **Request/Response examples** - Schema definitions for all models
- ✅ **Interactive testing** - Try API calls directly from UI

---

## 🚀 Getting Started

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- `swagger-ui-express` - Renders Swagger UI
- `swagger-jsdoc` - Parses JSDoc comments to generate OpenAPI spec

### Step 2: Start Your Server

```bash
npm run dev:watch
```

### Step 3: Access Swagger UI

Open your browser and go to:

```
http://localhost:3000/api-docs
```

You should see a beautiful interactive API documentation interface! 📖

---

## 📖 How Swagger Works

### File Structure

```
backend/
├── config/
│   └── swagger.config.js          ← Swagger configuration
├── routes/
│   ├── video.routes.js            ← Video endpoints with @swagger docs
│   ├── note.routes.js             ← Note endpoints with @swagger docs
│   ├── auth.routes.js             ← Auth endpoints with @swagger docs
│   └── interviewQuestion.routes.js ← Interview question endpoints
├── server.js                       ← Swagger UI setup
└── package.json                    ← Swagger dependencies
```

### How It Works

1. **JSDoc Comments** - Each route has `@swagger` comments describing the endpoint
2. **swagger-jsdoc** - Reads these comments and generates OpenAPI spec
3. **Swagger UI** - Displays the spec as interactive documentation
4. **Express middleware** - Serves the documentation at `/api-docs`

---

## 📝 Understanding the Documentation

### Endpoint Documentation Example

```javascript
/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: Get all videos
 *     tags: [Videos]
 *     description: Retrieve all videos from the database
 *     responses:
 *       200:
 *         description: List of all videos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Video'
 */
router.get('/', videoController.getAllVideos);
```

**Breakdown:**
- `summary` - Short endpoint description
- `tags` - Groups endpoints by category
- `description` - Detailed explanation
- `responses` - Possible response codes and formats
- `$ref` - Reference to reusable schema definitions

---

## 🎯 Available Endpoints

### Videos API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/videos` | Get all videos |
| GET | `/api/videos/upcoming` | Get upcoming videos |
| GET | `/api/videos/{id}` | Get video by MongoDB ID |
| GET | `/api/videos/youtube/{videoId}` | Get by YouTube ID |
| POST | `/api/videos` | Create new video |
| PUT | `/api/videos/{id}` | Update video |
| DELETE | `/api/videos/{id}` | Delete video |
| POST | `/api/videos/bulk` | Bulk upsert videos |

### Notes API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes |
| GET | `/api/notes/search` | Search notes |
| GET | `/api/notes/category/{category}` | Get by category |
| GET | `/api/notes/{id}` | Get note by ID |
| POST | `/api/notes` | Create note |
| PUT | `/api/notes/{id}` | Update note |
| DELETE | `/api/notes/{id}` | Delete note |
| POST | `/api/notes/bulk` | Bulk upsert notes |

### Auth API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/config` | Get auth configuration |
| POST | `/api/auth/login` | Admin login |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

---

## 🧪 Testing APIs with Swagger UI

1. **Open Swagger UI**: `http://localhost:3000/api-docs`

2. **Expand an endpoint** - Click on any endpoint to see details

3. **Click "Try it out"** - Enable the endpoint for testing

4. **Fill in parameters** - Enter any required path/query parameters

5. **Click "Execute"** - Send the request

6. **View response** - See the API response in real-time

---

## 📊 Schema Definitions

Your API includes these pre-defined schemas:

### Video Schema
```json
{
  "videoId": "string",
  "title": "string",
  "description": "string",
  "thumbnail": "string",
  "duration": "string",
  "views": 0,
  "publishedAt": "2026-01-05T00:00:00Z"
}
```

### Note Schema
```json
{
  "title": "string",
  "content": "string",
  "category": "string",
  "tags": ["string"]
}
```

### InterviewQuestion Schema
```json
{
  "question": "string",
  "answer": "string",
  "videoId": "string",
  "difficulty": "easy|medium|hard",
  "category": "string"
}
```

---

## 🔧 Customizing Swagger Documentation

### Add Documentation to New Endpoints

Add JSDoc comments above your routes:

```javascript
/**
 * @swagger
 * /api/custom:
 *   post:
 *     summary: Your endpoint summary
 *     tags: [CustomTag]
 *     description: Detailed description
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field1:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success response
 *       400:
 *         description: Error response
 */
router.post('/custom', yourController.customFunction);
```

### Add New Schemas

Update `config/swagger.config.js`:

```javascript
components: {
    schemas: {
        YourSchema: {
            type: 'object',
            properties: {
                field1: { type: 'string' },
                field2: { type: 'number' }
            }
        }
    }
}
```

---

## 🔐 Security

### Current Setup

- Documentation is public at `/api-docs`
- No authentication required to view docs

### To Protect Swagger UI (Production)

```javascript
const swaggerAuth = (req, res, next) => {
    const token = req.headers.authorization;
    if (token === `Bearer ${process.env.SWAGGER_TOKEN}`) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Protect Swagger UI
app.use('/api-docs', swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

---

## 📱 Using with Postman

Swagger exports an OpenAPI spec that Postman understands:

1. Open Postman
2. Click "Import"
3. Paste: `http://localhost:3000/api-docs/json`
4. All endpoints imported automatically! 📚

---

## 🚀 Deployment

### On Render

Swagger documentation is automatically available:

```
https://your-render-domain.com/api-docs
```

No extra configuration needed! The documentation follows your app to production.

---

## 📚 Useful Links

- [Swagger/OpenAPI Docs](https://swagger.io/docs/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)
- [OpenAPI 3.0 Spec](https://spec.openapis.org/oas/v3.0.0)

---

## ✨ Features of Your Swagger Setup

✅ **Interactive UI** - Try API calls directly  
✅ **Auto-generated** - JSDoc comments → OpenAPI spec  
✅ **Organized by tags** - Videos, Notes, Auth sections  
✅ **Full schemas** - Request/response definitions  
✅ **Error responses** - Shows all possible errors  
✅ **Parameter validation** - Shows required fields  
✅ **Type definitions** - Clear data types for all fields  
✅ **Production ready** - Works on Render deployment  

---

## 🎉 You're All Set!

Your API is now professionally documented! 📖

**Next Steps:**
1. Start the server: `npm run dev:watch`
2. Open Swagger: `http://localhost:3000/api-docs`
3. Test endpoints interactively
4. Share documentation link with frontend team

**Pro Tip:** Keep JSDoc comments updated with your code to maintain accurate documentation! 💡
