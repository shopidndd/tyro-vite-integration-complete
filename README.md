# Tyro API Integration (Vite + Express)

Production-ready scaffold for a Tyro card payments flow with a Vite frontend and an Express backend proxy (for secrets + webhooks).

> ⚠️ **PCI note**: The demo UI captures raw PAN for plumbing only. In production, use Tyro-hosted fields/tokenization or device-based capture to minimize PCI scope.

## Quick start

```bash
cp .env.example .env   # fill in your Tyro creds
npm i
npm run dev           # WEB: http://localhost:5173  API: http://localhost:5174
```

## Structure

```
src/                  # Frontend (Vite)
server/               # Backend (Express proxy + webhooks)
```

## Endpoints

- `POST /api/payments/intents` → create payment intent
- `POST /api/payments/:id/confirm` → confirm (e.g., 3DS)
- `POST /api/payments/:id/capture` → capture funds
- `POST /api/payments/:id/refunds` → refund
- `GET  /api/payments/:id` → retrieve payment
- `POST /api/webhooks/tyro` → webhook receiver

## Notes

- Add `Idempotency-Key` for create/capture/refund to guard retries.
- Implement 3DS challenge per Tyro docs if required.
- Persist webhook events and reconcile asynchronously.
- Replace placeholder Tyro paths/fields with your actual API spec.
