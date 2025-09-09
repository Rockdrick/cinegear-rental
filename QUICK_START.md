# MVD Assist - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js (v20.9.0 or higher)
- PostgreSQL (v12 or higher)
- Git

### 1. Clone and Setup
```bash
# Navigate to your project directory
cd MVDAssistEquipos

# Install all dependencies
npm run setup
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb mvdassist_equipos

# Set up database schema and seed data
npm run setup-db
```

### 3. Environment Configuration
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your database credentials

# Frontend environment  
cd ../frontend
cp .env.example .env
# Edit .env if needed (defaults should work)
```

### 4. Start Development Servers
```bash
# From project root - starts both backend and frontend
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Default Login**: admin@mvdassist.com / password123

## 🎯 What You Get

### ✅ Complete Backend API
- **Authentication**: JWT-based login/register
- **Equipment Management**: Full CRUD for items, categories, conditions
- **Project Management**: Client and project tracking
- **Booking System**: Equipment rental scheduling
- **Gear Packages**: Pre-configured equipment kits
- **User Management**: Role-based access control
- **Audit Trail**: Complete history tracking

### ✅ Modern Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Fleet Brand Colors** throughout
- **Responsive Design** with dark/light themes
- **Dashboard** with real-time stats
- **Navigation** between all major sections

### ✅ Database Schema
- **15+ Tables** with proper relationships
- **Lookup Tables** for categories, conditions, roles
- **Audit System** with complete history tracking
- **Sample Data** to get started immediately

## 🗂️ Project Structure
```
MVDAssistEquipos/
├── backend/          # Node.js + Express + PostgreSQL
├── frontend/         # React + Vite + TypeScript
├── docs/            # Documentation
└── README.md        # Full documentation
```

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start both servers
- `npm run build` - Build both projects
- `npm run setup` - Install all dependencies
- `npm run setup-db` - Set up database

### Backend Only
- `npm run dev:backend` - Start backend server
- `npm run build:backend` - Build backend
- `npm run setup-db` - Database setup

### Frontend Only
- `npm run dev:frontend` - Start frontend server
- `npm run build:frontend` - Build frontend

## 🎨 Key Features Implemented

### Equipment Management
- Track individual items with serial numbers
- Categorize by type (Camera, Lens, Lighting, etc.)
- Monitor condition and location
- Complete audit trail

### Project Management
- Client information and contact details
- Project timelines and budgets
- Team member assignments
- Location tracking

### Booking System
- Schedule equipment rentals
- Conflict detection and availability
- Check-in/check-out tracking
- Return condition monitoring

### Gear Packages
- Pre-configured equipment kits
- "DIT Gear Kit", "Camera Package", etc.
- One-click booking of entire packages
- Customizable package contents

### User Management
- Role-based permissions
- Admin, Gear Manager, Team Member, Freelancer
- User profiles and availability
- Authentication and authorization

## 🚧 Next Steps

1. **Customize Branding**: Update colors, logos, and styling
2. **Add Real Data**: Replace sample data with your equipment
3. **Implement Features**: Complete the placeholder controllers
4. **Add Integrations**: Calendar systems, barcode scanning
5. **Mobile App**: React Native version
6. **Advanced Features**: Reporting, analytics, maintenance scheduling

## 🆘 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `createdb mvdassist_equipos`

### Port Conflicts
- Backend runs on port 3001
- Frontend runs on port 5173
- Change ports in respective `.env` files if needed

### Dependencies Issues
- Run `npm run setup` to reinstall all dependencies
- Check Node.js version compatibility

## 📞 Support

For technical support or questions about the system architecture, refer to the main README.md or contact the development team.

---

**Ready to manage your equipment like a pro!** 🎬🎥
