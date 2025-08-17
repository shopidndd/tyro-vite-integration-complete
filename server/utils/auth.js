import fetch from 'node-fetch'
import { logger } from './logger.js'

let cache = { token: null, exp: 0 }

export async function getAccessToken() {
  const now = Date.now() / 1000
  if (cache.token && now < cache.exp - 60) return cache.token

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.TYRO_CLIENT_ID,
    client_secret: process.env.TYRO_CLIENT_SECRET,
    scope: 'payments:write payments:read' // adjust scopes per Tyro
  })

  const res = await fetch(process.env.TYRO_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  })

  if (!res.ok) {
    const t = await res.text().catch(() => '')
    logger.error({ status: res.status, t }, 'Auth token fetch failed')
    throw new Error(`Auth failed: ${res.status}`)
  }

  const json = await res.json()
  cache = { token: json.access_token, exp: (Date.now() / 1000) + (json.expires_in || 1800) }
  return cache.token
}
