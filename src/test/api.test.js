import { describe, expect, it, vi } from 'vitest'
import { apiFetch, getLang, getStartParams, insideTelegram, openInvoice } from '../utils/api'
import { installTelegram, mockFetch } from './setup'

describe('apiFetch', () => {
  it('sends the signed initData header and no user id', async () => {
    installTelegram({ initData: 'signed-init-data' })
    const fetch = mockFetch({ '/api/profile/me': { ok: true, profile: {} } })
    const res = await apiFetch('/api/profile/me')
    expect(res.ok).toBe(true)
    const [url, init] = fetch.mock.calls[0]
    expect(url).toMatch(/\/api\/profile\/me$/)
    expect(init.headers['X-Telegram-Init-Data']).toBe('signed-init-data')
    expect(JSON.stringify(init)).not.toContain('test_user')
  })

  it('serializes JSON bodies', async () => {
    installTelegram()
    const fetch = mockFetch({ '/api/gifts/purchase': { ok: true } })
    await apiFetch('/api/gifts/purchase', { method: 'POST', body: { gift_code: 'roses_bouquet' } })
    const init = fetch.mock.calls[0][1]
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(init.body)).toEqual({ gift_code: 'roses_bouquet' })
  })

  it('reports HTTP errors without throwing', async () => {
    mockFetch({ '/api/gifts/purchase': { __status: 402, body: { ok: false, error: 'payment_required' } } })
    const res = await apiFetch('/api/gifts/purchase', { method: 'POST', body: {} })
    expect(res).toMatchObject({ ok: false, status: 402, data: { error: 'payment_required' } })
  })

  it('reports network errors as status 0', async () => {
    globalThis.fetch = vi.fn(async () => { throw new TypeError('offline') })
    expect((await apiFetch('/api/plans')).status).toBe(0)
  })

  it('treats ok:false bodies as failures', async () => {
    mockFetch({ '/api/plans': { ok: false } })
    expect((await apiFetch('/api/plans')).ok).toBe(false)
  })
})

describe('Telegram helpers', () => {
  it('detects Telegram by initData', () => {
    expect(insideTelegram()).toBe(false)
    installTelegram()
    expect(insideTelegram()).toBe(true)
    installTelegram({ initData: '' })
    expect(insideTelegram()).toBe(false)
  })

  it('takes the language from the Telegram user', () => {
    installTelegram({ languageCode: 'en' })
    expect(getLang()).toBe('en')
    installTelegram({ languageCode: 'tr' })
    expect(getLang()).toBe('tr')
    installTelegram({ languageCode: 'de' })
    expect(['ru', 'tr', 'en']).toContain(getLang())
  })

  it('reads the start parameter', () => {
    installTelegram({ startParam: 'shop_elif' })
    expect(getStartParams()).toEqual({ tab: 'shop', persona: 'elif' })
  })

  it('reads ?tab=&persona= from the URL', () => {
    window.history.pushState({}, '', '/?tab=shop&persona=zeynep')
    expect(getStartParams()).toEqual({ tab: 'shop', persona: 'zeynep' })
    window.history.pushState({}, '', '/')
  })

  it('wraps openInvoice in a promise', async () => {
    const tg = installTelegram()
    tg.openInvoice.mockImplementation((url, cb) => cb('paid'))
    await expect(openInvoice('https://t.me/$x')).resolves.toBe('paid')
    expect(tg.openInvoice).toHaveBeenCalledWith('https://t.me/$x', expect.any(Function))
  })

  it('openInvoice outside Telegram', async () => {
    await expect(openInvoice('x')).resolves.toBe('unsupported')
  })
})
