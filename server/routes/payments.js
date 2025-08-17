import { Router } from 'express'
import { Tyro } from '../tyroClient.js'
import { validate, schemas } from '../utils/validate.js'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// Create intent (auth + amount + card details/token reference)
router.post('/intents', validate(schemas.createIntent), async (req, res, next) => {
  try {
    const idempotencyKey = uuidv4()
    const payload = {
      amount: req.body.amount,
      currency: req.body.currency,
      merchantId: process.env.TYRO_MERCHANT_ID,
      // In production, tokenize the card or use hosted fields/device; this is a placeholder
      paymentMethod: {
        type: 'card',
        card: {
          pan: req.body.card.pan,
          expMonth: req.body.card.expMonth,
          expYear: req.body.card.expYear,
          cvv: req.body.card.cvv
        }
      },
      captureMethod: 'MANUAL' // or 'AUTOMATIC' depending on your flow
    }
    const intent = await Tyro.createPaymentIntent(payload, idempotencyKey)
    res.json(intent)
  } catch (e) {
    next(e)
  }
})

// Confirm intent (e.g., 3DS/off-session flags)
router.post('/:id/confirm', async (req, res, next) => {
  try {
    const paymentId = req.params.id
    const confirmed = await Tyro.confirmPayment(paymentId, req.body || {}, uuidv4())
    res.json(confirmed)
  } catch (e) {
    next(e)
  }
})

// Capture funds
router.post('/:id/capture', validate(schemas.capture), async (req, res, next) => {
  try {
    const captured = await Tyro.capturePayment(req.params.id, req.body.amount, uuidv4())
    res.json(captured)
  } catch (e) {
    next(e)
  }
})

// Refund
router.post('/:id/refunds', validate(schemas.refund), async (req, res, next) => {
  try {
    const refund = await Tyro.refundPayment(req.params.id, req.body.amount, uuidv4())
    res.json(refund)
  } catch (e) {
    next(e)
  }
})

// Retrieve
router.get('/:id', async (req, res, next) => {
  try {
    const p = await Tyro.getPayment(req.params.id)
    res.json(p)
  } catch (e) {
    next(e)
  }
})

export default router
