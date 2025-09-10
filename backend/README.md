# Sales Swift CRM Backend

A Node.js Express backend API for the Sales Swift CRM application.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **User Management**: CRUD operations for users with roles (rep, manager, admin)
- **Lead Management**: Track leads with statuses (New, Contacted, Qualified)
- **Opportunity Management**: Manage sales opportunities with stages (Discovery, Proposal, Won, Lost)
- **Dashboard Stats**: Get aggregated statistics for dashboard
- **Data Validation**: Input validation using express-validator
- **CORS Support**: Cross-origin resource sharing enabled

## Database Schema

### Users
```json
{
  "id": "u123",
  "name": "Alice",
  "email": "alice@acme.com",
  "password": "...",
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

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login and get JWT token

### Users
- `GET /api/users` - Get all users (requires authentication)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user

### Leads
- `GET /api/leads` - Get all leads (supports ?ownerId filter)
- `GET /api/leads/:id` - Get lead by ID
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Opportunities
- `GET /api/opportunities` - Get all opportunities (supports ?ownerId and ?stage filters)
- `GET /api/opportunities/:id` - Get opportunity by ID
- `POST /api/opportunities` - Create new opportunity
- `PUT /api/opportunities/:id` - Update opportunity
- `DELETE /api/opportunities/:id` - Delete opportunity

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (supports ?ownerId filter)

### Health Check
- `GET /api/health` - Server health check

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Sample Data

The database comes with sample data:
- **Users**: Alice (rep), Bob Manager (manager), Carol Admin (admin)
- **Leads**: Bob Buyer, Sarah Customer, Mike Prospect
- **Opportunities**: Various deals in different stages

## Environment Variables

- `PORT`: Server port (default: 3001)
- `JWT_SECRET`: Secret key for JWT tokens (default: 'your-secret-key')

## Development

The backend uses:
- **Express.js** for the web framework
- **CORS** for cross-origin requests
- **JWT** for authentication
- **express-validator** for input validation
- **UUID** for generating unique IDs
- **bcryptjs** for password hashing (ready for production use)

## Notes

- Passwords are stored in plain text for demo purposes. In production, use bcrypt for hashing.
- The database is stored in JSON format in `../public/db.json`
- All timestamps are handled by the application logic
- Error handling includes proper HTTP status codes and error messages
