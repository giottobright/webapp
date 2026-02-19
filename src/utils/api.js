/**
 * Shared API utilities: base URL detection, Telegram WebApp accessor, photo helpers.
 */

// Vite bundles local photos eagerly
export const PHOTO_GLOB =
  import.meta && import.meta.glob
    ? import.meta.glob('../../photo/*.{png,jpg,jpeg,webp,avif}', { eager: true })
    : {}

export const ASSETS_BASE =
  import.meta?.env?.VITE_ASSETS_BASE
    ? String(import.meta.env.VITE_ASSETS_BASE).replace(/\/$/, '')
    : ''

export function getApiBase() {
  if (import.meta.env.VITE_API_BASE) {
    const base = import.meta.env.VITE_API_BASE.trim()
    if (base) return base.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:8000'
    if (hostname.includes('webapp') || hostname.includes('mini-app') || hostname.includes('app')) {
      const baseDomain = hostname.replace(/^(webapp|mini-app|app)\.?/, '')
      if (baseDomain) return `https://api.${baseDomain}`
    }
    return window.location.origin
  }
  return 'http://localhost:8000'
}

export const API_BASE = getApiBase()

if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', API_BASE)
}

export function getTg() {
  if (typeof window === 'undefined') return null
  return window.Telegram?.WebApp ?? null
}

export function getLang() {
  return navigator.language?.startsWith('ru') ? 'ru' : 'tr'
}

export function buildLocalCandidates(code) {
  const normalized = String(code).toLowerCase()
  const entries = Object.entries(PHOTO_GLOB)
  const findByBase = (baseName) => {
    const entry = entries.find(([path]) => {
      const file = path.split('/').pop() || ''
      const base = file.replace(/\.(png|jpg|jpeg|webp|avif)$/i, '')
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
  return [`${ASSETS_BASE}/${normalized}1.png`, `${ASSETS_BASE}/${normalized}2.png`, `${ASSETS_BASE}/${normalized}3.png`]
}
