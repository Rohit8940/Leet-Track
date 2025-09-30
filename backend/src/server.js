// server.js (ESM)
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { clerkMiddleware } from '@clerk/express';
import connectToDatabase from './config/database.js';
import questionsRouter from './routes/questions.js';

dotenv.config();

const app = express();

// === CORS: Allow ALL origins (no cookies) ===
const corsOptions = {
  origin: true, // reflect request's Origin (effectively allows all)
  credentials: false, // must be false to truly allow all origins safely
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // cache preflight for 24h
};

// Apply CORS before any other middleware/routes
app.use(cors(corsOptions));
// Ensure preflight requests are answered quickly
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(clerkMiddleware()); // keep if you’re using Clerk

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
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

// Start
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
