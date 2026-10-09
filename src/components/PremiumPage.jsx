import React, { useState, useEffect, useCallback } from 'react'
import { apiFetch, haptic, insideTelegram, openInvoice, showAlert } from '../utils/api'
import { formatDate, t } from '../i18n'

const GRADIENTS = {
  free: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
  premium: 'linear-gradient(135deg, rgba(255,0,110,0.1), rgba(131,56,236,0.08))',
  vip: 'linear-gradient(135deg, rgba(131,56,236,0.12), rgba(58,134,255,0.08))',
}
const ICONS = { free: '🆓', premium: '⭐', vip: '💎' }

export default function PremiumPage({ lang }) {
  const [plans, setPlans] = useState([])
  const [current, setCurrent] = useState({ plan: 'free', expires: null, recurring: false })
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(null)

  const loadCurrent = useCallback(async () => {
    if (!insideTelegram()) return
    const { ok, data } = await apiFetch('/api/profile/me')
    if (ok && data?.profile) {
      setCurrent({
        plan: data.profile.plan || 'free',
        expires: data.profile.subscription_expires_at,
        recurring: Boolean(data.profile.subscription_recurring),
      })
    }
  }, [])

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/plans?language=${lang}`).then(({ ok, data }) => { if (ok) setPlans(data.plans || []) }),
      loadCurrent(),
    ]).catch(() => {}).finally(() => setLoading(false))
  }, [lang, loadCurrent])

  const handleUpgrade = async (planCode) => {
    if (!insideTelegram()) { showAlert(t(lang, 'common.notTelegram')); return }
    haptic('medium')
    setUpgrading(planCode)
    try {
      const { ok, data } = await apiFetch('/api/subscription/invoice', { method: 'POST', body: { plan: planCode } })
      if (!ok || !data?.invoice_url) {
        haptic('error')
        showAlert(data?.error === 'age_not_confirmed' ? t(lang, 'common.openInTelegram') : t(lang, 'premium.failed'))
        return
      }
      const result = await openInvoice(data.invoice_url)
      if (result === 'paid') {
        haptic('success')
        const plan = plans.find((p) => p.code === planCode)
        showAlert(t(lang, 'premium.paid', { plan: plan?.name || planCode }))
        // The bot activates the plan when Telegram confirms the payment
        setTimeout(loadCurrent, 2500)
      } else if (result === 'cancelled') {
        showAlert(t(lang, 'premium.cancelled'))
      } else if (result !== 'pending') {
        showAlert(t(lang, 'premium.failed'))
      }
    } finally {
      setUpgrading(null)
    }
  }

  const currentName = plans.find((p) => p.code === current.plan)?.name || t(lang, `plan.${current.plan}`)

  return (
    <div className="premium-screen page-enter">
      <div className="premium-hero">
        <div className="premium-hero-glow"></div>
        <h1 className="premium-hero-title">{t(lang, 'premium.title')}</h1>
        <p className="premium-hero-sub">{t(lang, 'premium.subtitle')}</p>
        {!loading && (
          <div className="premium-current-badge">
            {t(lang, 'premium.current')}<strong>{currentName}</strong>
            {current.expires && current.plan !== 'free' && (
              <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: 4 }}>
                {t(lang, current.recurring ? 'premium.renews' : 'premium.until', { date: formatDate(current.expires, lang) })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="premium-plans">
        {loading && <div className="shop-loading"><div className="spinner"></div></div>}
        {plans.map((plan) => {
          const isCurrent = current.plan === plan.code
          const popular = plan.code === 'premium'
          return (
            <div
              key={plan.code}
              className={`premium-plan-card ${popular ? 'popular' : ''} ${isCurrent ? 'current' : ''}`}
              style={{ background: GRADIENTS[plan.code] || GRADIENTS.free }}
            >
              {popular && !isCurrent && <div className="premium-popular-badge">{t(lang, 'premium.popular')}</div>}
              {isCurrent && <div className="premium-current-label">{t(lang, 'premium.active')}</div>}

              <div className="premium-plan-header">
                <span className="premium-plan-icon">{ICONS[plan.code] || '⭐'}</span>
                <div>
                  <h2 className="premium-plan-name">{plan.name}</h2>
                  <div className="premium-plan-price">
                    {plan.stars ? `⭐ ${plan.stars} Stars` : t(lang, 'shop.free')}
                    {plan.stars > 0 && <span className="premium-price-note">{t(lang, 'premium.perMonth')}</span>}
                  </div>
                </div>
              </div>

              <ul className="premium-features">
                {plan.features.map((feature) => (
                  <li key={feature}><span className="premium-check">✓</span>{feature}</li>
                ))}
              </ul>

              {plan.stars > 0 && (!isCurrent || !current.recurring) && (
                <button
                  className={`premium-upgrade-btn ${upgrading === plan.code ? 'loading' : ''}`}
                  onClick={() => handleUpgrade(plan.code)}
                  disabled={!!upgrading}
                >
                  {upgrading === plan.code
                    ? <span className="btn-spinner"></span>
                    : t(lang, isCurrent ? 'premium.extend' : 'premium.choose')}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="premium-footer-note"><p>{t(lang, 'premium.note')}</p></div>
    </div>
  )
}
