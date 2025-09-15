import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import roleRoutes from './routes/roles';
import itemRoutes from './routes/items';
import projectRoutes from './routes/projects';
import projectTeamRoutes from './routes/projectTeam';
import bookingRoutes from './routes/bookings';
import packageRoutes from './routes/packages';
import clientRoutes from './routes/clients';
import clientContactRoutes from './routes/clientContacts';
import contactRoutes from './routes/contacts';
import referenceRoutes from './routes/reference';
import kitTemplateRoutes from './routes/kitTemplates';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:5173', // Vite dev server
    'http://localhost:5174', // Vite dev server (alternative port)
    'http://localhost:5175', // Vite dev server (alternative port)
    'http://localhost:3000'  // React dev server
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', projectTeamRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/client-contacts', clientContactRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api', referenceRoutes);
app.use('/api/kit-templates', kitTemplateRoutes);

// Health check endpoint (must be before catch-all routes)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});


// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

export default app;
