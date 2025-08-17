const API_BASE = '/api' // proxied to express

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': body instanceof FormData ? undefined : 'application/json',
      ...headers
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin'
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${method} ${path} failed: ${res.status} ${text}`)
  }
  const contentType = res.headers.get('content-type') || ''
  return contentType.includes('application/json') ? res.json() : res.text()
}

export const TyroAPI = {
  createPaymentIntent: (payload) => request('/payments/intents', { method: 'POST', body: payload }),
  confirmPayment: (id, payload) => request(`/payments/${id}/confirm`, { method: 'POST', body: payload }),
  capturePayment: (id, amount) => request(`/payments/${id}/capture`, { method: 'POST', body: { amount } }),
  refundPayment: (id, amount) => request(`/payments/${id}/refunds`, { method: 'POST', body: { amount } }),
  getPayment: (id) => request(`/payments/${id}`),
}
