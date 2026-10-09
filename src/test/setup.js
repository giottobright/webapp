import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  delete window.Telegram
  vi.restoreAllMocks()
})

/** Install a fake Telegram.WebApp; returns it for assertions. */
export function installTelegram({ initData = 'auth_date=1&user=%7B%22id%22%3A42%7D&hash=abc', languageCode = 'ru', startParam } = {}) {
  const webApp = {
    initData,
    initDataUnsafe: { user: { id: 42, language_code: languageCode }, start_param: startParam },
    ready: vi.fn(),
    expand: vi.fn(),
    close: vi.fn(),
    setHeaderColor: vi.fn(),
    setBackgroundColor: vi.fn(),
    disableVerticalSwipes: vi.fn(),
    showAlert: vi.fn(),
    sendData: vi.fn(),
    openInvoice: vi.fn(),
    HapticFeedback: { impactOccurred: vi.fn(), notificationOccurred: vi.fn() },
  }
  window.Telegram = { WebApp: webApp }
  return webApp
}

/** Mock fetch with a route table: { '/api/plans': {ok:true,...} } or functions (url, init) => body. */
export function mockFetch(routes) {
  const fn = vi.fn(async (url, init = {}) => {
    const path = new URL(url, 'http://x').pathname
    const handler = routes[path]
    if (handler === undefined) return { ok: false, status: 404, json: async () => ({ ok: false }) }
    const result = typeof handler === 'function' ? handler(url, init) : handler
    const { status = 200, body = result } = result && result.__status ? { status: result.__status, body: result.body } : {}
    return { ok: status < 400, status, json: async () => body }
  })
  globalThis.fetch = fn
  return fn
}
