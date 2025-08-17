import fetch from 'node-fetch'
import { getAccessToken } from './utils/auth.js'
import { logger } from './utils/logger.js'

const BASE = process.env.TYRO_BASE_URL

async function tyroFetch(path, opts = {}) {
  const token = await getAccessToken()
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    logger.error({ path, status: res.status, errText }, 'Tyro API error')
    throw new Error(`Tyro ${path} failed: ${res.status} ${errText}`)
  }
  const contentType = res.headers.get('content-type') || ''
  return contentType.includes('application/json') ? res.json() : res.text()
}

export const Tyro = {
  // Example endpoints — adjust to actual Tyro API spec
  createPaymentIntent: (payload, idempotencyKey) =>
    tyroFetch(`/v1/payments/intents`, {
      method: 'POST',
      body: payload,
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    }),
  confirmPayment: (paymentId, payload, idempotencyKey) =>
    tyroFetch(`/v1/payments/${paymentId}/confirm`, {
      method: 'POST',
      body: payload,
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    }),
  capturePayment: (paymentId, amount, idempotencyKey) =>
    tyroFetch(`/v1/payments/${paymentId}/capture`, {
      method: 'POST',
      body: { amount },
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    }),
  refundPayment: (paymentId, amount, idempotencyKey) =>
    tyroFetch(`/v1/payments/${paymentId}/refunds`, {
      method: 'POST',
      body: { amount },
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    }),
  getPayment: (paymentId) => tyroFetch(`/v1/payments/${paymentId}`),
}
