import React, { useState, useEffect, useCallback } from 'react'
import { BadgeCheck, Camera, Check, Crown, Gem, Info, MessageCircle, Mic, Sparkles, Video } from 'lucide-react'
import { apiFetch, haptic, insideTelegram, openInvoice, showAlert } from '../utils/api'
import { formatDate, t } from '../i18n'
import { ErrorState, Skeleton, StarsIcon } from './ui'

const PLAN_ICONS = { free: Sparkles, premium: Crown, vip: Gem }
const PACK_ICONS = { messages: MessageCircle, selfies: Camera, voices: Mic, videos: Video }

export default function PremiumPage({ lang }) {
  const [plans, setPlans] = useState([])
  const [packs, setPacks] = useState([])
  const [current, setCurrent] = useState({ plan: 'free', expires: null, recurring: false, known: false })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [upgrading, setUpgrading] = useState(null)

  const loadCurrent = useCallback(async () => {
    if (!insideTelegram()) return
    const { ok, data } = await apiFetch('/api/profile/me')
    if (ok && data?.profile) {
      setCurrent({
        plan: data.profile.plan || 'free',
        expires: data.profile.subscription_expires_at,
        recurring: Boolean(data.profile.subscription_recurring),
        known: true,
      })
    }
  }, [])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setLoadError(null)
    Promise.all([
      apiFetch(`/api/plans?language=${lang}`).then(({ ok, status, data }) => {
        if (!alive) return
        if (ok) {
          setPlans(data.plans || [])
          setPacks(data.packs || [])
        }
        else setLoadError(status === 0 ? t(lang, 'common.offline') : t(lang, 'premium.loadFailed'))
      }),
      loadCurrent(),
    ]).catch(() => {}).finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [lang, loadCurrent, reloadKey])

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

  const handlePack = async (pack) => {
    if (!insideTelegram()) { showAlert(t(lang, 'common.notTelegram')); return }
    haptic('medium')
    setUpgrading(pack.code)
    try {
      const { ok, data } = await apiFetch('/api/packs/invoice', { method: 'POST', body: { pack: pack.code } })
      if (!ok || !data?.invoice_url) {
        haptic('error')
        showAlert(data?.error === 'age_not_confirmed' ? t(lang, 'common.openInTelegram') : t(lang, 'premium.failed'))
        return
      }
      const result = await openInvoice(data.invoice_url)
      if (result === 'paid') {
        haptic('success')
        showAlert(t(lang, 'premium.packPaid', { pack: pack.name }))
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
  const showCurrent = current.known && current.plan !== 'free'

  return (
    <div className="premium">
      <header className="page-header page-header-center">
        <div className="hero-mark hero-mark-gold" aria-hidden="true"><Crown size={28} /></div>
        <h1 className="page-title">{t(lang, 'premium.title')}</h1>
        <p className="page-subtitle">{t(lang, 'premium.subtitle')}</p>
      </header>

      {showCurrent && (
        <div className="current-plan">
          <BadgeCheck size={20} className="current-plan-icon" />
          <div>
            <div className="current-plan-name">{t(lang, 'premium.current')}: <strong>{currentName}</strong></div>
            {current.expires && (
              <div className="current-plan-date">
                {t(lang, current.recurring ? 'premium.renews' : 'premium.until', { date: formatDate(current.expires, lang) })}
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="plan-list" aria-busy="true" aria-label={t(lang, 'common.loading')}>
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="plan-skeleton" />)}
        </div>
      ) : loadError ? (
        <ErrorState lang={lang} text={loadError} onRetry={() => setReloadKey((k) => k + 1)} />
      ) : (
        <div className="plan-list">
          {plans.map((plan) => {
            const isCurrent = current.known && current.plan === plan.code
            const popular = plan.code === 'premium'
            const Icon = PLAN_ICONS[plan.code] || Sparkles
            const canBuy = plan.stars > 0 && (!isCurrent || !current.recurring)
            return (
              <article
                key={plan.code}
                className={`plan plan-${plan.code} ${popular ? 'is-popular' : ''} ${isCurrent ? 'is-current' : ''}`}
                aria-labelledby={`plan-${plan.code}`}
              >
                {isCurrent
                  ? <span className="plan-badge plan-badge-current">{t(lang, 'premium.active')}</span>
                  : popular && <span className="plan-badge">{t(lang, 'premium.popular')}</span>}

                <div className="plan-head">
                  <span className="plan-icon" aria-hidden="true"><Icon size={22} /></span>
                  <div>
                    <h2 className="plan-name" id={`plan-${plan.code}`}>{plan.name}</h2>
                    {plan.stars > 0 && (
                      <div className="plan-price">
                        <StarsIcon size={18} />
                        <span className="plan-price-value">{plan.stars}</span>
                        <span className="plan-price-unit">Stars</span>
                        <span className="plan-price-period">{t(lang, 'premium.perMonth')}</span>
                      </div>
                    )}
                    {plan.stars > 0 && (
                      <div className="plan-per-day">{t(lang, 'premium.perDayHint', { stars: Math.round(plan.stars / 30) })}</div>
                    )}
                  </div>
                </div>

                <ul className="plan-features">
                  {plan.features.map((feature) => (
                    <li key={feature}><Check size={16} className="plan-check" />{feature}</li>
                  ))}
                </ul>

                {canBuy && (
                  <button
                    type="button"
                    className={`btn btn-lg btn-block ${plan.code === 'vip' ? 'btn-gold' : 'btn-primary'}`}
                    onClick={() => handleUpgrade(plan.code)}
                    disabled={!!upgrading}
                    aria-busy={upgrading === plan.code}
                  >
                    {upgrading === plan.code && <span className="btn-spinner" aria-hidden="true" />}
                    <span>{t(lang, isCurrent ? 'premium.extend' : 'premium.choose')}</span>
                  </button>
                )}
              </article>
            )
          })}
        </div>
      )}

      {!loading && !loadError && packs.length > 0 && (
        <section className="packs" aria-labelledby="packs-title">
          <h2 className="section-title" id="packs-title">{t(lang, 'premium.packsTitle')}</h2>
          <p className="packs-note">{t(lang, 'premium.packsNote')}</p>
          <div className="pack-list">
            {packs.map((pack) => {
              const Icon = PACK_ICONS[pack.kind] || Sparkles
              return (
                <button
                  key={pack.code}
                  type="button"
                  className="pack"
                  onClick={() => handlePack(pack)}
                  disabled={!!upgrading}
                  aria-busy={upgrading === pack.code}
                >
                  <span className="pack-icon" aria-hidden="true"><Icon size={18} /></span>
                  <span className="pack-name">{pack.name}</span>
                  <span className="pack-price"><StarsIcon size={14} />{pack.stars}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      <p className="note"><Info size={16} className="note-icon" />{t(lang, 'premium.note')}</p>
    </div>
  )
}
