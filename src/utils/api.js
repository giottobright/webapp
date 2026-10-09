/**
 * Shared API utilities: base URL, Telegram WebApp accessors, authenticated fetch, payments, photos.
 *
 * Every request to the backend carries the signed `initData` in `X-Telegram-Init-Data`;
 * the backend derives the user from it (there is no user id in URLs or bodies).
 * Local development outside Telegram: set VITE_DEV_USER_ID (dev builds only) and run the
 * backend with ENV=dev DEV_BYPASS_INIT_DATA=1.
 */

// Vite bundles local photos eagerly (WebP only — originals stay in the backend repo).
// The call must be literal: Vite rewrites it at build time, `import.meta.glob` does not exist at runtime.
export const PHOTO_GLOB = import.meta.glob('../../photo/*.{webp,avif,jpg,jpeg}', { eager: true })

export const ASSETS_BASE =
  import.meta?.env?.VITE_ASSETS_BASE
    ? String(import.meta.env.VITE_ASSETS_BASE).replace(/\/$/, '')
    : ''

export function getApiBase() {
  const configured = (import.meta.env.VITE_API_BASE || '').trim()
  if (configured) return configured.replace(/\/$/, '')
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:8000'
    if (/^(webapp|mini-app|app)\./.test(hostname)) {
      return `https://api.${hostname.replace(/^(webapp|mini-app|app)\./, '')}`
    }
    return window.location.origin
  }
  return 'http://localhost:8000'
}

export const API_BASE = getApiBase()

export function getTg() {
  if (typeof window === 'undefined') return null
  return window.Telegram?.WebApp ?? null
}

/** Signed initData string from Telegram ('' outside Telegram). */
export function getInitData() {
  return getTg()?.initData || ''
}

/** Telegram user id for display/logic only — never sent as an identity to the backend. */
export function getUserId() {
  const id = getTg()?.initDataUnsafe?.user?.id
  return id ? String(id) : null
}

const DEV_USER_ID = import.meta.env.DEV ? import.meta.env.VITE_DEV_USER_ID : undefined

/** True when the backend can authenticate us (Telegram initData, or the dev-only bypass). */
export function insideTelegram() {
  return Boolean(getInitData()) || Boolean(DEV_USER_ID)
}

const SUPPORTED_LANGS = ['ru', 'tr', 'en']

/** UI language: Telegram user language → browser language → Turkish. */
export function getLang() {
  const candidates = [
    getTg()?.initDataUnsafe?.user?.language_code,
    typeof navigator !== 'undefined' ? navigator.language : '',
  ]
  for (const raw of candidates) {
    const code = String(raw || '').slice(0, 2).toLowerCase()
    if (SUPPORTED_LANGS.includes(code)) return code
  }
  return 'tr'
}

function authHeaders() {
  const headers = {}
  const initData = getInitData()
  if (initData) {
    headers['X-Telegram-Init-Data'] = initData
  } else if (DEV_USER_ID) {
    headers['X-Dev-User-Id'] = String(DEV_USER_ID)
  }
  return headers
}

/**
 * fetch() wrapper for the backend API.
 * Resolves to { ok, status, data } and never throws for HTTP errors.
 */
export async function apiFetch(path, { method = 'GET', body, signal } = {}) {
  const headers = { ...authHeaders() }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
    let data = null
    try {
      data = await response.json()
    } catch (_) {
      data = null
    }
    return { ok: response.ok && data?.ok !== false, status: response.status, data }
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    return { ok: false, status: 0, data: null, error }
  }
}

/** Open a Telegram Stars invoice link; resolves to 'paid' | 'cancelled' | 'failed' | 'pending' | 'unsupported'. */
export function openInvoice(url) {
  const tg = getTg()
  if (!tg?.openInvoice) return Promise.resolve('unsupported')
  return new Promise((resolve) => {
    try {
      tg.openInvoice(url, (status) => resolve(status || 'failed'))
    } catch (_) {
      resolve('failed')
    }
  })
}

/** Where the Mini App should open: ?tab=shop&persona=elif or start_param "shop_elif". */
export function getStartParams() {
  const result = { tab: null, persona: null }
  if (typeof window !== 'undefined') {
    const query = new URLSearchParams(window.location.search)
    result.tab = query.get('tab')
    result.persona = query.get('persona')
  }
  const startParam = getTg()?.initDataUnsafe?.start_param
  if (!result.tab && startParam) {
    const [tab, persona] = String(startParam).split('_')
    result.tab = tab || null
    result.persona = persona || null
  }
  return result
}

export function haptic(kind = 'light') {
  try {
    const feedback = getTg()?.HapticFeedback
    if (!feedback) return
    if (kind === 'success' || kind === 'error' || kind === 'warning') feedback.notificationOccurred(kind)
    else feedback.impactOccurred(kind)
  } catch (_) {}
}

export function showAlert(message) {
  const tg = getTg()
  if (tg?.showAlert) {
    try {
      tg.showAlert(message)
      return
    } catch (_) {}
  }
  if (typeof window !== 'undefined') window.alert(message)
}

export function buildLocalCandidates(code) {
  const normalized = String(code).toLowerCase()
  const entries = Object.entries(PHOTO_GLOB)
  const findByBase = (baseName) => {
    const entry = entries.find(([path]) => {
      const file = path.split('/').pop() || ''
      const base = file.replace(/\.(webp|avif|jpg|jpeg)$/i, '')
      return base.toLowerCase() === baseName.toLowerCase()
    })
    if (!entry) return null
    const mod = entry[1]
    return mod?.default ? mod.default : mod
  }
  return [findByBase(`${normalized}1`), findByBase(`${normalized}2`), findByBase(`${normalized}3`)].filter(Boolean)
}

export function buildExternalCandidates(code) {
  const normalized = String(code).toLowerCase()
  if (!ASSETS_BASE) return []
  return [`${ASSETS_BASE}/${normalized}1.png`, `${ASSETS_BASE}/${normalized}2.png`]
}
