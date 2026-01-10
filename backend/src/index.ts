import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';

import { config, validateConfig } from './config';
import { initializeDatabase, closeDatabase } from './db';
import { swaggerSpec } from './swagger';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRouter from './routes/auth';
import exercisesRouter from './routes/exercises';
import workoutsRouter from './routes/workouts';
import dietRouter from './routes/diet';
import foodsRouter from './routes/foods';
import recipesRouter from './routes/recipes';
import usersRouter from './routes/users';
import coachRouter from './routes/coach';
import clientRouter from './routes/client';
import checkinsRouter from './routes/checkins';
import messagesRouter from './routes/messages';
import notificationsRouter from './routes/notifications';
import favoritesRouter from './routes/favorites';
import storageRouter from './routes/storage';
import adminRouter from './routes/admin';

const app = express();

// Validate configuration
validateConfig();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: [
    config.frontendUrl,
    'http://localhost:5173', // Local development
    'http://localhost:8080',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CustomCoachPro API Documentation',
}));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/diet', dietRouter);
app.use('/api/foods', foodsRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/users', usersRouter);
app.use('/api/coach', coachRouter);
app.use('/api/client', clientRouter);
app.use('/api/checkins', checkinsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/storage', storageRouter);
app.use('/api/admin', adminRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Start listening
    const server = app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📚 API docs available at http://localhost:${config.port}/api-docs`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\nShutting down gracefully...');
      server.close(async () => {
        await closeDatabase();
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
