import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import authRoutes from './routes/auth.js';
import linkRoutes from './routes/links.js';
import { redirect } from './controllers/redirectController.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/links', linkRoutes);

  // Public redirect — must come after API routes so it doesn't shadow them.
  app.get('/:code', redirect);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
