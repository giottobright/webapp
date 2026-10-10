import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import PremiumPage from '../components/PremiumPage'
import GiftShop from '../components/GiftShop'
import ProfilePage, { validAge } from '../components/ProfilePage'
import App from '../App'
import { installTelegram, mockFetch } from './setup'

const PLANS = {
  ok: true,
  plans: [
    { code: 'free', name: 'Free', stars: 0, features: ['1 selfie a week'], limits: {}, periods: {} },
    { code: 'premium', name: 'Premium', stars: 750, features: ['3 selfies a day'], limits: {}, periods: {} },
    { code: 'vip', name: 'VIP', stars: 1500, features: ['5 selfies a day'], limits: {}, periods: {} },
  ],
  packs: [
    { code: 'selfies_10', kind: 'selfies', amount: 10, stars: 120, name: '+10 selfies' },
    { code: 'messages_100', kind: 'messages', amount: 100, stars: 50, name: '+100 messages' },
  ],
}

const PROFILE = {
  ok: true,
  profile: {
    plan: 'free', name: 'Ali', age: 30, persona: 'elif', subscription_expires_at: null,
    stats: { total_messages: 5 }, referral_bonus_selfies: 0,
    today: { selfies: { used: 1, limit: 2, period: 'day' }, videos: { used: 0, limit: 0, period: 'week' }, voices: { used: 0, limit: 3, period: 'day' } },
  },
}

describe('PremiumPage', () => {
  it('renders plans from the API and pays through openInvoice', async () => {
    const tg = installTelegram({ languageCode: 'en' })
    tg.openInvoice.mockImplementation((url, cb) => cb('paid'))
    const fetch = mockFetch({
      '/api/plans': PLANS,
      '/api/profile/me': PROFILE,
      '/api/subscription/invoice': { ok: true, invoice_url: 'https://t.me/$sub' },
    })
    render(<PremiumPage lang="en" />)
    expect(await screen.findByText('750')).toBeInTheDocument()
    expect(screen.getAllByText('Stars').length).toBeGreaterThan(0)
    expect(screen.getByText('5 selfies a day')).toBeInTheDocument()
    expect(screen.getByText('≈ 25 ⭐ a day')).toBeInTheDocument()
    expect(screen.queryByText(/∞/)).not.toBeInTheDocument()

    fireEvent.click(screen.getAllByText('Choose plan')[1]) // VIP
    await waitFor(() => expect(tg.openInvoice).toHaveBeenCalledWith('https://t.me/$sub', expect.any(Function)))
    const invoiceCall = fetch.mock.calls.find(([url]) => String(url).includes('/api/subscription/invoice'))
    expect(JSON.parse(invoiceCall[1].body)).toEqual({ plan: 'vip' })
    await waitFor(() => expect(tg.showAlert).toHaveBeenCalledWith(expect.stringContaining('VIP')))
  })

  it('does not use sendData for payments', async () => {
    const tg = installTelegram({ languageCode: 'en' })
    mockFetch({ '/api/plans': PLANS, '/api/profile/me': PROFILE, '/api/subscription/invoice': { ok: true, invoice_url: 'u' } })
    tg.openInvoice.mockImplementation((url, cb) => cb('cancelled'))
    render(<PremiumPage lang="en" />)
    fireEvent.click((await screen.findAllByText('Choose plan'))[0])
    await waitFor(() => expect(tg.showAlert).toHaveBeenCalledWith('Payment cancelled'))
    expect(tg.sendData).not.toHaveBeenCalled()
  })

  it('sells one-time packs through openInvoice', async () => {
    const tg = installTelegram({ languageCode: 'en' })
    tg.openInvoice.mockImplementation((url, cb) => cb('paid'))
    const fetch = mockFetch({
      '/api/plans': PLANS,
      '/api/profile/me': PROFILE,
      '/api/packs/invoice': { ok: true, invoice_url: 'https://t.me/$pack' },
    })
    render(<PremiumPage lang="en" />)
    fireEvent.click(await screen.findByRole('button', { name: /\+10 selfies/ }))
    await waitFor(() => expect(tg.openInvoice).toHaveBeenCalledWith('https://t.me/$pack', expect.any(Function)))
    const call = fetch.mock.calls.find(([url]) => String(url).includes('/api/packs/invoice'))
    expect(JSON.parse(call[1].body)).toEqual({ pack: 'selfies_10' })
    await waitFor(() => expect(tg.showAlert).toHaveBeenCalledWith('+10 selfies added!'))
  })
})

describe('GiftShop', () => {
  const GIFTS = {
    ok: true,
    categories: [],
    gifts: [
      { id: 1, code: 'roses_bouquet', name: 'Roses', description: '', emoji: '🌹', price: 0, category: 'romantic' },
      { id: 2, code: 'jewelry', name: 'Jewelry', description: '', emoji: '💎', price: 150, category: 'luxury' },
    ],
  }

  it('free gift is purchased directly, paid gift opens an invoice', async () => {
    const tg = installTelegram({ languageCode: 'en' })
    tg.openInvoice.mockImplementation((url, cb) => cb('paid'))
    const fetch = mockFetch({
      '/api/gifts': GIFTS,
      '/api/gifts/purchase': { ok: true, purchase: {} },
      '/api/gifts/invoice': { ok: true, invoice_url: 'https://t.me/$gift', price: 150 },
    })
    const persona = { code: 'elif', name: 'Elif' }
    render(<GiftShop persona={persona} personas={[persona]} lang="en" />)
    expect(await screen.findByText('150')).toBeInTheDocument()
    const buttons = screen.getAllByRole('button', { name: 'Give' })

    fireEvent.click(buttons[0])
    await waitFor(() => expect(tg.showAlert).toHaveBeenCalledWith(expect.stringContaining('Roses')))
    const purchase = fetch.mock.calls.find(([url]) => String(url).endsWith('/api/gifts/purchase'))
    expect(JSON.parse(purchase[1].body)).toMatchObject({ gift_code: 'roses_bouquet', persona: 'elif' })
    expect(JSON.parse(purchase[1].body).user_id).toBeUndefined()

    fireEvent.click(buttons[1])
    await waitFor(() => expect(tg.openInvoice).toHaveBeenCalledWith('https://t.me/$gift', expect.any(Function)))
  })

  it('shows the daily free-gift limit', async () => {
    const tg = installTelegram({ languageCode: 'en' })
    mockFetch({ '/api/gifts': GIFTS, '/api/gifts/purchase': { __status: 429, body: { ok: false, error: 'free_gift_limit' } } })
    render(<GiftShop persona={null} personas={[]} lang="en" />)
    fireEvent.click((await screen.findAllByRole('button', { name: 'Give' }))[0])
    await waitFor(() => expect(tg.showAlert).toHaveBeenCalledWith(expect.stringContaining("today's free gift")))
  })
})

describe('ProfilePage', () => {
  it('validates the adult age range', () => {
    expect(validAge(17)).toBe(false)
    expect(validAge('18')).toBe(true)
    expect(validAge(121)).toBe(false)
    expect(validAge('abc')).toBe(false)
  })

  it('rejects an underage value before calling the API', async () => {
    installTelegram({ languageCode: 'en' })
    const fetch = mockFetch({ '/api/profile/me': PROFILE })
    render(<ProfilePage lang="en" />)
    fireEvent.click(await screen.findByRole('button', { name: 'Edit profile' }))
    fireEvent.change(screen.getByLabelText('Age (18+)'), { target: { value: '16' } })
    fireEvent.click(screen.getByText('Save'))
    expect(await screen.findByRole('alert')).toHaveTextContent('between 18 and 120')
    expect(fetch.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(0)
  })

  it('shows weekly video usage', async () => {
    installTelegram({ languageCode: 'en' })
    mockFetch({ '/api/profile/me': PROFILE })
    render(<ProfilePage lang="en" />)
    expect(await screen.findByText('· this week')).toBeInTheDocument()
  })

  it('asks to open in Telegram without initData', async () => {
    mockFetch({})
    render(<ProfilePage lang="en" />)
    expect(await screen.findByText('Open the app from the Telegram bot')).toBeInTheDocument()
  })
})

describe('App persona selection', () => {
  it('selects a persona through the API and closes the Mini App', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const tg = installTelegram({ languageCode: 'en' })
    const fetch = mockFetch({ '/api/personas': { ok: false }, '/api/persona/select': { ok: true, persona: 'elif' } })
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /Elif/ })[0])
    fireEvent.click(await screen.findByText('Start chatting'))
    await waitFor(() => expect(fetch.mock.calls.some(([url]) => String(url).endsWith('/api/persona/select'))).toBe(true))
    vi.advanceTimersByTime(400)
    await waitFor(() => expect(tg.close).toHaveBeenCalled())
    expect(tg.sendData).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('falls back to sendData when opened from a reply keyboard (no initData)', async () => {
    const tg = installTelegram({ initData: '', languageCode: 'en' })
    mockFetch({ '/api/personas': { ok: false } })
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /Zeynep/ })[0])
    fireEvent.click(await screen.findByText('Start chatting'))
    await waitFor(() => expect(tg.sendData).toHaveBeenCalledWith(JSON.stringify({ persona: 'zeynep' })))
  })
})

describe('Design refresh behaviour', () => {
  it('persona sheet closes on Escape and binds the Telegram BackButton', async () => {
    const tg = installTelegram({ languageCode: 'en' })
    tg.BackButton = { show: vi.fn(), hide: vi.fn(), onClick: vi.fn(), offClick: vi.fn() }
    mockFetch({ '/api/personas': { ok: false } })
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /Elif/ })[0])
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAccessibleName(/Elif/)
    expect(tg.BackButton.show).toHaveBeenCalled()
    fireEvent.keyDown(dialog, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(tg.BackButton.hide).toHaveBeenCalled()
    expect(document.body.style.overflow).toBe('')
  })

  it('gift shop shows a retry state when the catalog fails to load', async () => {
    installTelegram({ languageCode: 'en' })
    let calls = 0
    mockFetch({
      '/api/gifts': () => {
        calls += 1
        return calls === 1
          ? { __status: 500, body: { ok: false } }
          : { ok: true, categories: [], gifts: [{ id: 1, code: 'roses_bouquet', name: 'Roses', emoji: '🌹', price: 0 }] }
      },
    })
    render(<GiftShop persona={null} personas={[]} lang="en" />)
    expect(await screen.findByText('Could not load the gifts')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Roses')).toBeInTheDocument()
  })

  it('sends the gift to the recipient picked in the shop', async () => {
    const tg = installTelegram({ languageCode: 'en' })
    tg.showAlert = vi.fn()
    const fetch = mockFetch({
      '/api/gifts': { ok: true, categories: [], gifts: [{ id: 1, code: 'roses_bouquet', name: 'Roses', emoji: '🌹', price: 0 }] },
      '/api/gifts/purchase': { ok: true, purchase: {} },
    })
    const personas = [{ code: 'elif', name: 'Elif' }, { code: 'zeynep', name: 'Zeynep' }]
    render(<GiftShop persona={null} personas={personas} lang="en" />)
    fireEvent.click(await screen.findByRole('button', { name: 'Zeynep' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Give' }))
    await waitFor(() => expect(tg.showAlert).toHaveBeenCalledWith(expect.stringContaining('Zeynep')))
    const purchase = fetch.mock.calls.find(([url]) => String(url).endsWith('/api/gifts/purchase'))
    expect(JSON.parse(purchase[1].body)).toMatchObject({ persona: 'zeynep' })
  })

  it('offers an upgrade from the profile limits', async () => {
    installTelegram({ languageCode: 'en' })
    mockFetch({ '/api/profile/me': PROFILE })
    const onUpgrade = vi.fn()
    render(<ProfilePage lang="en" onUpgrade={onUpgrade} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Raise my limits' }))
    expect(onUpgrade).toHaveBeenCalled()
    expect(screen.getByText('not in your plan')).toBeInTheDocument()
  })
})
