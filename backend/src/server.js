// src/server.js  (ESM, Express 5)
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { clerkMiddleware } from '@clerk/express';
import connectToDatabase from './config/database.js';
import questionsRouter from './routes/questions.js';

dotenv.config();

const app = express();

/**
 * CORS: allow ALL origins (good for testing).
 * Note: credentials must be FALSE to truly allow all.
 */
const corsOptions = {
  origin: true, // reflect request Origin (effectively any origin)
  credentials: false, // set to true ONLY if you need cookies; then don't allow all
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // cache preflight for 24h
};

// Must be before routes/auth
app.use(cors(corsOptions));

// Express 5: DO NOT use '*' here — use '(.*)' (or a concrete path like '/api/*')
app.options('(.*)', cors(corsOptions));

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(clerkMiddleware());

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/questions', questionsRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: 'server_error',
    message:
      process.env.NODE_ENV === 'production'
        ? 'Unexpected server error.'
        : err.message,
  });
});

const port = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Leet-Track API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
