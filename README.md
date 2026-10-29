# Akatsuki's Draft — Backend

Backend for **Nodevember 4.0: AI-Enabled Content Sharing Platform**.

Features implemented from the task brief:
- User registration and login with hashed passwords and JWT authentication.
- User and admin roles.
- Create, edit, delete and list personal posts/drafts.
- Public endpoints only show approved posts.
- Admin approval/rejection workflow.
- Gemini-powered content improvement saved as a **new draft**, leaving the original unchanged.
- Optional document/image attachment for AI improvement using the Gemini Files API.
- MongoDB persistence and basic error handling.

## Requirements
- Node.js 20+ recommended
- MongoDB local instance or MongoDB Atlas
- Google AI Studio Gemini API key

## Setup
```bash
npm install
cp .env.example .env
```
Edit `.env` and set `MONGODB_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`. Keep `.env` private; it is ignored by Git.

Run:
```bash
npm run dev
```
API defaults to `http://localhost:5000`. Use `npm start` for normal start.

## Authentication
Register or log in to receive a JWT. Send it on protected routes as:
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Public registration always creates a `user`. For the first admin account, register normally and promote that account directly in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```
Do not expose public admin-role selection.

## API routes

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register user |
| POST | `/auth/login` | Public | Login and receive JWT |
| GET | `/auth/me` | JWT | Current user details |
| POST | `/posts` | JWT | Create a draft or pending post |
| GET | `/posts` | Public | List approved posts |
| GET | `/posts/:id` | Public | Get one approved post |
| GET | `/posts/my-posts` | JWT | List own posts and drafts |
| PATCH | `/posts/:id` | Owner/admin | Update own post |
| DELETE | `/posts/:id` | Owner/admin | Delete own post |
| GET | `/admin/posts/pending` | Admin | List pending posts |
| PATCH | `/admin/posts/approve/:id` | Admin | Approve a post |
| PATCH | `/admin/posts/reject/:id` | Admin | Reject a post |
| POST | `/ai/improve/:postId` | Owner/admin JWT | Create improved version as a new draft |

### Create a post example
`POST /posts`
```json
{
  "title": "My first post",
  "description": "A short introduction",
  "content": "The full article content goes here.",
  "category": "Technology",
  "status": "draft"
}
```
Use `status: "pending"` to submit it for admin review. Users cannot set a post directly to `approved` or `rejected`.

### Improve content with Gemini
`POST /ai/improve/:postId` with `Authorization: Bearer ...`.
- Without an attachment: send an empty POST body.
- With an attachment: use `multipart/form-data` with field name `file`.
- Accepted attachment types: PDF, TXT, Markdown, PNG, JPG/JPEG, WEBP; max 15 MB.
- The AI result is stored as a new draft with a new ID and `improvedFrom` reference. The original stays unchanged.

The Gemini model used is `gemini-2.5-flash`. Check Google's current Gemini API documentation and model availability for your account if you need to change it.

## Notes
- `image` is currently a URL/string field; this project does not implement image hosting.
- For production, also add request rate limiting, stronger schema validation, logging/monitoring, and a dedicated admin bootstrap procedure.
- Configure `CLIENT_ORIGIN` to the exact frontend origin(s) separated by commas. Do not use permissive CORS in production.
- Never commit `.env` or share your JWT secret/API key.
