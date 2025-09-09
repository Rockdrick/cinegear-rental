# MVD Assist Equipment Management System

A comprehensive equipment management system built with React, Node.js, and PostgreSQL. This system helps manage gear inventory, projects, clients, team members, and bookings for film production companies.

## 🚀 Features

### 📦 Gear Inventory Management
- **Complete CRUD Operations**: Create, read, update, and delete gear items
- **Advanced Filtering**: Filter by category, condition, status, type, location, and make
- **Search Functionality**: Real-time search across all gear items
- **Pagination**: Support for 20, 50, 100, and 300 items per page
- **Detailed Item Information**: Name, make, model, serial number, category, condition, location, notes, acquisition date, purchase price, and status

### 👥 Team Management
- **User Management**: Add, edit, and manage team members
- **Role-Based Permissions**: Granular permission system for different user roles
- **User Profiles**: Complete user information including contact details

### 🎬 Project Management
- **Project Tracking**: Create and manage film projects
- **Client Integration**: Link projects to clients
- **Status Management**: Track project status (Planned, Active, Completed, On Hold, Cancelled)
- **Calendar Integration**: Visual calendar showing active projects

### 🏢 Client Management
- **Client Database**: Complete client information management
- **Contact Details**: Name, contact person, email, phone, address
- **Project Linking**: Associate clients with projects

### 📅 Dashboard & Analytics
- **Real-time Dashboard**: Overview of gear, projects, and recent activity
- **Calendar View**: Visual representation of active projects
- **Quick Actions**: Easy access to common tasks

### 🔐 Security & Permissions
- **JWT Authentication**: Secure user authentication
- **Role-Based Access Control**: Granular permissions system
- **Protected Routes**: Secure API endpoints

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **React Query** for data fetching
- **date-fns** for date manipulation

### Backend
- **Node.js** with TypeScript
- **Express.js** for API server
- **PostgreSQL** for database
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** for cross-origin requests

### Database
- **PostgreSQL** with comprehensive schema
- **Foreign Key Relationships** for data integrity
- **JSONB** for flexible permission storage

## 📁 Project Structure

```
MVDAssistEquipos/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── middleware/      # Authentication & validation
│   │   ├── routes/          # API routes
│   │   ├── config/          # Database configuration
│   │   └── index.ts         # Server entry point
│   ├── database/
│   │   ├── migrations/      # Database schema
│   │   └── seeds/           # Initial data
│   └── package.json
├── lovab-filmops-hub-main/  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API client and utilities
│   │   └── i18n/            # Internationalization
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MVDAssistEquipos
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../lovab-filmops-hub-main
   npm install
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb mvdassist_equipos
   
   # Run migrations (from backend directory)
   cd backend
   psql -U postgres -d mvdassist_equipos -f database/migrations/001_initial_schema.sql
   psql -U postgres -d mvdassist_equipos -f database/seeds/001_initial_data.sql
   ```

5. **Configure environment variables**
   ```bash
   # Backend .env file
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

6. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd lovab-filmops-hub-main
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 🔑 Default Login

- **Email**: admin@mvdassist.com
- **Password**: password123

## 📊 Database Schema

The system uses a comprehensive PostgreSQL schema with the following main tables:

- **users**: User accounts and profiles
- **roles**: User roles and permissions
- **items**: Gear inventory items
- **categories**: Item categories
- **conditions**: Item conditions
- **item_locations**: Storage locations
- **projects**: Film projects
- **clients**: Client information
- **bookings**: Equipment bookings

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Gear Management
- `GET /api/items` - Get all gear items
- `GET /api/items/:id` - Get specific item
- `PUT /api/items/:id` - Update item
- `POST /api/items` - Create new item
- `DELETE /api/items/:id` - Delete item

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client

### Reference Data
- `GET /api/categories` - Get categories
- `GET /api/conditions` - Get conditions
- `GET /api/locations` - Get locations

## 🎨 UI Components

The system uses a modern, responsive design with:
- **Fleet Brand Colors**: Yellow and Blue theme
- **Card-based Layout**: Clean, organized interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Theme switching capability
- **Accessible Components**: WCAG compliant UI elements

## 🔐 Permissions System

The system includes a comprehensive permission system:

- **View Gear Inventory**: Can view gear items
- **Edit Gear Inventory**: Can create, update, and delete gear
- **View Bookings**: Can view equipment bookings
- **Edit Bookings**: Can manage bookings
- **View Projects**: Can view projects
- **Edit Projects**: Can manage projects
- **View Team**: Can view team members
- **Edit Team**: Can manage team members

## 🚀 Deployment

### Backend Deployment
1. Build the TypeScript code
2. Set up PostgreSQL database
3. Configure environment variables
4. Deploy to your preferred hosting platform

### Frontend Deployment
1. Build the React application
2. Deploy to a static hosting service (Vercel, Netlify, etc.)
3. Configure API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support and questions, please contact the development team.

---

**MVD Assist Equipment Management System** - Streamlining film production equipment management since 2024.