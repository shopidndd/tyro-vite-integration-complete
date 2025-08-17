export function createCheckoutStore() {
  let state = { amount: 2500, currency: 'AUD', status: 'idle', paymentId: null, lastError: null }
  const listeners = new Set()
  const get = () => state
  const set = (patch) => {
    state = { ...state, ...patch }
    listeners.forEach((l) => l(state))
  }
  const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn))
  return { get, set, subscribe }
}
