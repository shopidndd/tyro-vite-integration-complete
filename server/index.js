import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import paymentsRouter from './routes/payments.js'
import webhooksRouter from './routes/webhooks.js'
import { logger } from './utils/logger.js'

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const origins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
app.use(cors({ origin: origins.length ? origins : true }))
app.use(helmet())
app.use(morgan('dev'))
app.use(cookieParser())

// Raw body for webhook signature verification on that route only.
app.use('/api/webhooks/tyro', express.raw({ type: '*/*' }))
// JSON elsewhere
app.use(express.json())

app.use('/api/payments', paymentsRouter)
app.use('/api/webhooks', webhooksRouter)

// Serve Vite build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../dist')))
  app.get('*', (_, res) => res.sendFile(path.resolve(__dirname, '../dist/index.html')))
}

const PORT = process.env.PORT || 5174
app.listen(PORT, () => logger.info({ PORT }, `API listening on ${PORT}`))
