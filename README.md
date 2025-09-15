# MVD Assist Equipment Management System

A comprehensive equipment management system built with React, Node.js, and PostgreSQL. This system helps manage gear inventory, projects, clients, team members, kit templates, and project assignments for film production companies.

## 🚀 Features

### 📦 Gear Inventory Management
- **Complete CRUD Operations**: Create, read, update, and delete gear items
- **Advanced Filtering**: Filter by category, condition, status, type, location, and make
- **Search Functionality**: Real-time search across all gear items
- **Pagination**: Support for 20, 50, 100, and 300 items per page
- **Detailed Item Information**: Name, make, model, serial number, category, condition, location, notes, acquisition date, purchase price, and status
- **Exclusive Usage Toggle**: Mark items as exclusive (one project at a time) or multi-project usage
- **CSV Import**: Bulk import gear items from CSV files with automatic UUID generation

### 🎒 Kit Template Management
- **Kit Templates**: Create reusable kit templates with predefined gear combinations
- **Template Library**: Manage a library of standard kits (DIT, Camera, Sound, Lighting)
- **Item Selection**: Add/remove items from kits with quantity management
- **Search Integration**: Find and add items to kits using advanced search
- **Project Integration**: Assign kit templates to projects for easy gear management

### 👥 Team Management
- **User Management**: Add, edit, and manage team members
- **Role-Based Permissions**: Granular permission system for different user roles
- **User Profiles**: Complete user information including contact details
- **Exclusive Usage Toggle**: Mark team members as exclusive (one project at a time) or multi-project
- **Project Assignments**: Assign team members to projects with date ranges
- **Calendar View**: Visual calendar showing team member assignments
- **Conflict Detection**: Automatic detection of exclusive user conflicts

### 🎬 Project Management
- **Project Tracking**: Create and manage film projects
- **Client Integration**: Link projects to clients
- **Status Management**: Track project status (Planned, Active, Completed, On Hold, Cancelled)
- **Team Assignment**: Assign team members to projects with specific date ranges
- **Gear Assignment**: Assign kit templates and loose gear items to projects
- **Calendar Integration**: Visual calendar showing active projects and assignments
- **Quick Actions**: "Add to Whole Project" for easy full-duration assignments

### 🏢 Client Management
- **Client Database**: Complete client information management
- **Contact Details**: Name, contact person, email, phone, address
- **Project Linking**: Associate clients with projects
- **Contact Management**: Multiple contacts per client with primary contact designation

### 📅 Calendar & Scheduling
- **Team Calendar View**: Visual calendar showing team member assignments across projects
- **Project Calendar**: Calendar view of all active projects
- **Date Range Management**: Flexible date range assignments for team and gear
- **Conflict Prevention**: Automatic detection of scheduling conflicts

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
│   ├── scripts/             # Utility scripts (CSV import, etc.)
│   └── package.json
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── gear/        # Gear-related components
│   │   │   ├── projects/    # Project-related components
│   │   │   ├── team/        # Team-related components
│   │   │   ├── kit/         # Kit template components
│   │   │   └── layout/      # Layout components
│   │   ├── pages/           # Application pages
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API client and utilities
│   │   └── i18n/            # Internationalization
│   └── package.json
├── package.json             # Root package.json for scripts
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
   cd ../frontend
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
   cd frontend
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

- **users**: User accounts and profiles with exclusive usage settings
- **roles**: User roles and permissions
- **items**: Gear inventory items with exclusive usage settings and UUIDs
- **categories**: Item categories
- **conditions**: Item conditions
- **item_locations**: Storage locations
- **projects**: Film projects with client and manager relationships
- **clients**: Client information
- **client_contacts**: Multiple contacts per client
- **project_team_members**: Team member assignments to projects with date ranges
- **project_roles**: Available project roles
- **kit_templates**: Reusable kit templates
- **kit_template_items**: Items within kit templates
- **project_kits**: Kit assignments to projects
- **project_kit_items**: Individual kit item assignments
- **project_loose_items**: Loose gear item assignments to projects

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

### Kit Templates
- `GET /api/kit-templates` - Get all kit templates
- `GET /api/kit-templates/:id` - Get specific kit template
- `POST /api/kit-templates` - Create kit template
- `PUT /api/kit-templates/:id` - Update kit template
- `DELETE /api/kit-templates/:id` - Delete kit template

### Team Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `GET /api/project-roles` - Get available project roles
- `POST /api/projects/:id/team` - Add team member to project
- `PUT /api/projects/:id/team/:memberId` - Update team member assignment
- `DELETE /api/projects/:id/team/:memberId` - Remove team member from project

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
- **View Kit Management**: Can view kit templates
- **Edit Kit Management**: Can create, update, and delete kit templates
- **View Projects**: Can view projects
- **Edit Projects**: Can manage projects and assignments
- **View Team**: Can view team members
- **Edit Team**: Can manage team members and project assignments
- **View Clients**: Can view client information
- **Edit Clients**: Can manage client information and contacts

## 📊 Data Import

### CSV Import
The system supports bulk import of gear items from CSV files:

1. **Format**: Use the provided CSV template with columns for brand, model, category, serial number, etc.
2. **Import Script**: Run `node scripts/import_inventory.js` from the backend directory
3. **UUID Generation**: Automatic UUID generation for each imported item
4. **Data Validation**: Automatic validation and error handling for duplicate serial numbers
5. **Category Mapping**: Automatic mapping of categories, conditions, and locations

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

## 🆕 Recent Updates

### Version 2.0 Features
- **Kit Template System**: Complete kit management with reusable templates
- **Enhanced Team Management**: Project assignments with date ranges and conflict detection
- **Exclusive Usage Controls**: Toggle for exclusive vs multi-project usage
- **CSV Import**: Bulk import of gear inventory with automatic UUID generation
- **Calendar Views**: Visual team and project scheduling
- **Advanced Search**: Improved search functionality across all modules

### Migration Notes
- Database schema updated with new tables for kit templates and project assignments
- All existing data preserved during migration
- New exclusive usage fields added to users and items tables

---

**MVD Assist Equipment Management System** - Streamlining film production equipment management since 2024.