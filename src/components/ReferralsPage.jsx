import React, { useState, useEffect, useRef } from 'react'
import { Check, Copy, Send, UserPlus } from 'lucide-react'
import { apiFetch, getTg, haptic, insideTelegram, showAlert } from '../utils/api'
import { t } from '../i18n'
import { ErrorState, Skeleton } from './ui'

function legacyCopy(text) {
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  let ok = false
  try { ok = document.execCommand('copy') } catch (_) { ok = false }
  area.remove()
  return ok
}

export default function ReferralsPage({ lang }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const copiedTimer = useRef(null)

  useEffect(() => {
    if (!insideTelegram()) { setLoading(false); return undefined }
    const controller = new AbortController()
    setLoading(true)
    setLoadError(null)
    apiFetch('/api/referral/me', { signal: controller.signal })
      .then(({ ok, status, data }) => {
        if (ok) setStats(data)
        else setLoadError(status === 0 ? t(lang, 'common.offline') : t(lang, 'common.error'))
        setLoading(false)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [lang, reloadKey])

  useEffect(() => () => clearTimeout(copiedTimer.current), [])

  const referralLink = stats?.link || ''
  const bonus = stats?.bonus_per_referral ?? 3
  const totalRefs = stats?.total_referrals ?? 0

  const handleCopy = () => {
    if (!referralLink) return
    const done = () => {
      setCopied(true)
      haptic('success')
      clearTimeout(copiedTimer.current)
      copiedTimer.current = setTimeout(() => setCopied(false), 2000)
    }
    // Some Telegram webviews reject the async Clipboard API: fall back to execCommand, then show the link
    const fallback = () => (legacyCopy(referralLink) ? done() : showAlert(referralLink))
    if (!navigator.clipboard?.writeText) { fallback(); return }
    navigator.clipboard.writeText(referralLink).then(done).catch(fallback)
  }

  const handleShare = () => {
    if (!referralLink) return
    haptic('medium')
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(t(lang, 'ref.shareText'))}`
    const tg = getTg()
    if (tg?.openTelegramLink) tg.openTelegramLink(shareUrl)
    else window.open(shareUrl, '_blank', 'noopener')
  }

  return (
    <div className="referrals">
      <header className="page-header page-header-center">
        <div className="hero-mark" aria-hidden="true"><UserPlus size={28} /></div>
        <h1 className="page-title">{t(lang, 'ref.title')}</h1>
        <p className="page-subtitle">{t(lang, 'ref.subtitle', { bonus })}</p>
      </header>

      {loading ? (
        <>
          <Skeleton className="ref-stats-skeleton" />
          <Skeleton className="ref-link-skeleton" />
        </>
      ) : loadError ? (
        <ErrorState lang={lang} text={loadError} onRetry={() => setReloadKey((k) => k + 1)} />
      ) : (
        <>
          <section className="card ref-stats" aria-label={t(lang, 'ref.invited')}>
            <div className="ref-stat">
              <span className="ref-stat-value">{totalRefs}</span>
              <span className="ref-stat-label">{t(lang, 'ref.invited')}</span>
            </div>
            <div className="ref-stat">
              <span className="ref-stat-value ref-stat-accent">+{totalRefs * bonus}</span>
              <span className="ref-stat-label">{t(lang, 'ref.bonus')}</span>
            </div>
            {stats?.bonus_selfies_left > 0 && (
              <p className="ref-left">{t(lang, 'ref.left', { count: stats.bonus_selfies_left })}</p>
            )}
          </section>

          {referralLink ? (
            <section className="ref-link-section">
              <h2 className="section-title">{t(lang, 'ref.yourLink')}</h2>
              <div className="link-field">
                <span className="link-field-text">{referralLink}</span>
                <button
                  type="button"
                  className={`icon-btn link-field-copy ${copied ? 'is-done' : ''}`}
                  onClick={handleCopy}
                  aria-label={copied ? t(lang, 'ref.copied') : t(lang, 'ref.copy')}
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              <p className="sr-only" aria-live="polite">{copied ? t(lang, 'ref.copied') : ''}</p>
              <button type="button" className="btn btn-primary btn-lg btn-block" onClick={handleShare}>
                <Send size={19} />
                <span>{t(lang, 'ref.share')}</span>
              </button>
            </section>
          ) : (
            <p className="muted-line center">{t(lang, 'common.openInTelegram')}</p>
          )}
        </>
      )}

      <section className="card ref-steps">
        <h2 className="section-title">{t(lang, 'ref.how')}</h2>
        <ol className="steps">
          {[1, 2, 3, 4].map((n) => (
            <li key={n} className="step">
              <span className="step-num" aria-hidden="true">{n}</span>
              <span className="step-text">{t(lang, `ref.step${n}`, { bonus })}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
