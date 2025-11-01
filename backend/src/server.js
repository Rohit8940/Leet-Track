import dotenv from "dotenv";
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { clerkMiddleware } from '@clerk/express'   // <-- add this import
import connectToDatabase from './config/database.js'
import questionsRouter from './routes/questions.js'

const app = express()
dotenv.config();
const allowedOrigins = process.env.CLIENT_ORIGIN

app.use(
  cors({
    origin: (_origin, callback) => callback(null, true), // allow any origin
    credentials: true,
  }),
)

app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))
app.use(clerkMiddleware())                           // <-- use Clerk's middleware here

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/questions', questionsRouter)



app.use((err, req, res, next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({
    error: 'server_error',
    message: process.env.NODE_ENV === 'production' ? 'Unexpected server error.' : err.message,
  })
})

const port = process.env.PORT || 5000

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Leet-Track API running on port ${port}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start server:', error)
    process.exit(1)
  })
