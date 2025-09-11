# Sales Swift CRM

A modern, full-stack CRM application built with React, TypeScript, Node.js, and Express. Features role-based access control, lead management, opportunity tracking, and real-time dashboard analytics.

note: if the  demo login details are not working try view demo button to see manager portal

## 🚀 Features

### ✅ **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Rep, Manager, Admin)
- Protected routes and automatic token management
- Secure login/logout functionality

### ✅ **Lead Management**
- Complete CRUD operations for leads
- Lead status tracking (New, Contacted, Qualified)
- Search and filter functionality
- Role-based data filtering (Reps see own data, Managers see all)

### ✅ **Opportunity Management**
- Full CRUD operations for opportunities
- Opportunity stage tracking (Discovery, Proposal, Won, Lost)
- Value tracking and currency formatting
- Pipeline analytics

### ✅ **Lead to Opportunity Conversion**
- Convert qualified leads to opportunities
- Set opportunity details (title, value, stage)
- Automatic lead status update to "Qualified"

### ✅ **Dashboard Analytics**
- Real-time statistics and metrics
- Pipeline value tracking
- Win rate calculations
- Visual breakdowns by status and stage

### ✅ **Modern UI/UX**
- Responsive design with Tailwind CSS
- Beautiful shadcn/ui components
- Loading states and error handling
- Toast notifications for user feedback

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Routing**: React Router DOM
- **State Management**: React Context API
- **UI Components**: shadcn/ui with Tailwind CSS
- **HTTP Client**: Fetch API with custom service layer
- **Authentication**: JWT tokens with localStorage

### Backend (Node.js + Express)
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Authentication**: JWT with bcryptjs
- **Validation**: express-validator
- **Database**: JSON file (db.json)
- **CORS**: Enabled for frontend integration

## 📁 Project Structure

```
sales-swift-crm-main/
├── backend/                 # Node.js Express backend
│   ├── package.json
│   ├── server.js           # Main server file
│   └── README.md
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # shadcn/ui components
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx
│   ├── services/          # API service layer
│   │   └── api.ts
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Leads.tsx
│   │   ├── Opportunities.tsx
│   │   └── Login.tsx
│   └── hooks/             # Custom React hooks
├── public/
│   └── db.json            # JSON database
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### 1. Start the Backend Server

**Windows:**
```bash
start-backend.bat
```

**Linux/Mac:**
```bash
chmod +x start-backend.sh
./start-backend.sh
```

**Manual:**
```bash
cd backend
npm install
npm run dev
```



### 2. Start the Frontend

```bash
npm install
npm run dev
```

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Sales Rep | alice@acme.com | password123 |
| Manager | bob@acme.com | password123 |
| Admin | carol@acme.com | password123 |

## 📊 Database Schema

### Users
```json
{
  "id": "u123",
  "name": "Alice",
  "email": "alice@acme.com",
  "password": "password123",
  "role": "rep" // rep | manager | admin
}
```

### Leads
```json
{
  "id": "l001",
  "name": "Bob Buyer",
  "email": "bob@buyer.com",
  "phone": "9999999999",
  "status": "New", // New | Contacted | Qualified
  "ownerId": "u123"
}
```

### Opportunities
```json
{
  "id": "o001",
  "title": "Bob Buyer – First Deal",
  "value": 5000,
  "stage": "Discovery", // Discovery | Proposal | Won | Lost
  "ownerId": "u123",
  "leadId": "l001"
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user

### Leads
- `GET /api/leads?ownerId=:id` - Get leads (filtered by owner)
- `GET /api/leads/:id` - Get lead by ID
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Opportunities
- `GET /api/opportunities?ownerId=:id&stage=:stage` - Get opportunities
- `GET /api/opportunities/:id` - Get opportunity by ID
- `POST /api/opportunities` - Create new opportunity
- `PUT /api/opportunities/:id` - Update opportunity
- `DELETE /api/opportunities/:id` - Delete opportunity

### Dashboard
- `GET /api/dashboard/stats?ownerId=:id` - Get dashboard statistics

## 🎯 Role-Based Access Control

### Sales Rep (`rep`)
- Can only see their own leads and opportunities
- Can create, edit, and delete their own records
- Can convert their leads to opportunities

### Manager (`manager`)
- Can see all leads and opportunities
- Can manage all records across the team
- Has full access to dashboard analytics

### Admin (`admin`)
- Full system access
- Can manage users and system settings
- Complete administrative privileges

## 🛠️ Development

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm start            # Start production server
```

## 🧪 Testing

The application includes sample data for testing:
- 3 users with different roles
- 3 sample leads
- 3 sample opportunities

## 🔧 Configuration

### Environment Variables
- `PORT`: Backend server port (default: 3001)
- `JWT_SECRET`: Secret key for JWT tokens

### Database
The application uses a JSON file (`public/db.json`) as the database. In production, consider migrating to a proper database like PostgreSQL or MongoDB.

## 📝 Features Implemented

✅ **Authentication & RBAC (JWT + roles)**
✅ **CRUD operations for Leads**
✅ **CRUD operations for Opportunities**
✅ **Convert a Lead → Opportunity**
✅ **Role filtering: Rep sees own data, Manager sees all**
✅ **Simple frontend UI with tables and forms**

## 🚀 Deployment

### Prerequisites
1. Deploy the backend first to a hosting service (Railway, Heroku, Render, etc.)
2. Note the backend URL for environment variable configuration

### Backend Deployment

#### Option 1: Railway
1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select the `backend` folder
4. Railway will automatically detect it's a Node.js app
5. Add environment variable: `JWT_SECRET=your-secret-key-here`
6. Deploy and note the URL (e.g., `https://your-app.railway.app`)

#### Option 2: Render
1. Go to [Render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`
6. Add environment variable: `JWT_SECRET=your-secret-key-here`
7. Deploy and note the URL

### Frontend Deployment (Vercel)

1. **Set Environment Variable in Vercel:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-backend-url.com/api`
   - Make sure to set it for "Production", "Preview", and "Development"

2. **Deploy:**
   ```bash
   npm run build
   # Deploy the dist folder to Vercel
   ```

### Environment Variables

Create a `.env.local` file for local development:
```env
VITE_API_URL=http://localhost:3001/api
```

For production, set the environment variable in your hosting platform:
```env
VITE_API_URL=https://your-backend-url.com/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support or questions, please open an issue in the repository.