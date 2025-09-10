# Backend Deployment Guide

## Quick Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Deploy:**
   ```bash
   railway init
   railway up
   ```

4. **Set Environment Variables:**
   ```bash
   railway variables set JWT_SECRET=your-super-secret-jwt-key-here
   railway variables set FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

## Quick Deploy to Render

1. Go to [Render.com](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Set the following:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** `Node`
5. Add environment variables:
   - `JWT_SECRET`: your-super-secret-jwt-key-here
   - `FRONTEND_URL`: https://your-vercel-app.vercel.app
6. Deploy

## Environment Variables

- `PORT`: Server port (automatically set by hosting platform)
- `JWT_SECRET`: Secret key for JWT tokens (required)
- `FRONTEND_URL`: Frontend URL for CORS (optional, defaults to localhost)

## Database

The app uses a JSON file as database (`public/db.json`). In production, consider migrating to a proper database like PostgreSQL or MongoDB.

## Health Check

Once deployed, test your backend:
```bash
curl https://your-backend-url.com/api/health
```

Should return:
```json
{"status":"OK","timestamp":"2025-09-10T16:18:03.124Z"}
```