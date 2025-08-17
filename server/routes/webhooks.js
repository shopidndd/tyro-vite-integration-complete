import { Router } from 'express'
import crypto from 'crypto'
import { logger } from '../utils/logger.js'

const router = Router()

// Tyro should POST events here (set this URL in their dashboard)
router.post('/tyro', (req, res) => {
  try {
    const signature = req.header('Tyro-Signature') || ''
    const secret = process.env.TYRO_WEBHOOK_SECRET
    const raw = req.body // Buffer from express.raw middleware

    // Replace with Tyro’s documented signature scheme if different:
    const hmac = crypto.createHmac('sha256', secret).update(raw).digest('hex')
    const valid = signature && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac))

    if (!valid) return res.status(400).send('Invalid signature')

    const event = JSON.parse(raw.toString('utf8'))

    // Handle event types from Tyro (examples):
    // 'payment.authorized' | 'payment.captured' | 'payment.refunded' | 'payment.failed'
    logger.info({ eventType: event.type, id: event.id }, 'Webhook received')

    // TODO: persist to DB, update order status, trigger emails, etc.
    res.sendStatus(200)
  } catch (e) {
    logger.error(e, 'Webhook error')
    res.sendStatus(500)
  }
})

export default router
