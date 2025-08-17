import { TyroAPI } from '../api/client.js'
import { createCheckoutStore } from '../store/useCheckoutStore.js'

const store = createCheckoutStore()

export default function CheckoutForm() {
  const root = document.createElement('div')
  root.innerHTML = `
    <style>
      .card { max-width: 480px; margin: 3rem auto; padding: 1.25rem; border: 1px solid #e5e7eb; border-radius: 12px; font-family: system-ui, -apple-system; }
      .row { display: grid; gap: 0.5rem; margin-bottom: 0.75rem; }
      .btn { padding: 0.75rem 1rem; border: 0; border-radius: 8px; background: #111827; color: white; cursor: pointer; }
      .btn[disabled] { opacity: 0.6; cursor: not-allowed; }
      .muted { color: #6b7280; font-size: 0.9rem; }
      input, select { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 8px; width: 100%; }
      .status { margin-top: 0.75rem; }
      .ok { color: #059669; } .err { color: #dc2626; }
    </style>
    <div class="card">
      <h2>Checkout (Tyro)</h2>
      <div class="row">
        <label>Amount (AUD cents)
          <input id="amount" type="number" min="50" step="50" value="2500" />
        </label>
      </div>
      <div class="row">
        <label>Card PAN
          <input id="pan" placeholder="4111 1111 1111 1111" />
        </label>
        <label>Expiry (MM/YY)
          <input id="exp" placeholder="01/30" />
        </label>
        <label>CVV
          <input id="cvv" placeholder="123" />
        </label>
      </div>
      <button class="btn" id="payBtn">Pay</button>
      <div class="status muted" id="status"></div>
      <p class="muted">Demo only. Do not use real cards. In production, tokenize with Tyro or use device/hosted fields.</p>
    </div>
  `

  const els = {
    amount: root.querySelector('#amount'),
    pan: root.querySelector('#pan'),
    exp: root.querySelector('#exp'),
    cvv: root.querySelector('#cvv'),
    payBtn: root.querySelector('#payBtn'),
    status: root.querySelector('#status')
  }

  const setStatus = (text, cls = 'muted') => {
    els.status.className = `status ${cls}`
    els.status.textContent = text
  }

  const paying = (v) => {
    els.payBtn.disabled = v
    els.payBtn.textContent = v ? 'Processing…' : 'Pay'
  }

  els.payBtn.addEventListener('click', async () => {
    paying(true)
    setStatus('Creating payment intent…')
    try {
      const amount = parseInt(els.amount.value, 10) || 0
      const [mm, yy] = (els.exp.value || '').split('/')
      const payload = {
        amount, currency: 'AUD',
        card: { pan: els.pan.value.replace(/\s+/g, ''), expMonth: mm, expYear: `20${yy}`, cvv: els.cvv.value }
      }
      const intent = await TyroAPI.createPaymentIntent(payload)
      store.set({ paymentId: intent.id, status: intent.status })
      setStatus(`Intent ${intent.id} created: ${intent.status}`)

      setStatus('Confirming payment…')
      const confirmed = await TyroAPI.confirmPayment(intent.id, { threeDS: { offsession: true } })
      store.set({ status: confirmed.status })
      setStatus(`Confirmed: ${confirmed.status}`, 'ok')

      if (confirmed.status === 'AUTHORIZED') {
        const captured = await TyroAPI.capturePayment(intent.id, amount)
        store.set({ status: captured.status })
        setStatus(`Captured: ${captured.status}`, 'ok')
      }
    } catch (err) {
      console.error(err)
      store.set({ lastError: err?.message, status: 'failed' })
      setStatus(err?.message || 'Payment failed', 'err')
    } finally {
      paying(false)
    }
  })

  return root
}
