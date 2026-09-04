import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import actorRoutes from './routes/actorRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import graphRoutes from './routes/graphRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import appealRoutes from './routes/appealRoutes.js';
import fairnessRoutes from './routes/fairnessRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import systemRoutes from './routes/systemRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and Logging Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts and assets for production SPA
}));
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter for API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 1000,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// Mount REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/actors', actorRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/appeals', appealRoutes);
app.use('/api/fairness', fairnessRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api', systemRoutes);

// Serve Frontend Static SPA if client/dist exists
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Root API status endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'TRUST GRAPH API',
      status: 'online',
      documentation: '/docs',
      health: '/api/health'
    });
  });
}

// Centralized Error Handler
app.use(errorHandler);

export default app;
