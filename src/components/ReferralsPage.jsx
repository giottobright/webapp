import React, { useState, useEffect } from 'react'
import { apiFetch, haptic, insideTelegram, showAlert } from '../utils/api'
import { t } from '../i18n'

export default function ReferralsPage({ lang }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!insideTelegram()) { setLoading(false); return }
    apiFetch('/api/referral/me')
      .then(({ ok, data }) => { if (ok) setStats(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const referralLink = stats?.link || ''
  const bonus = stats?.bonus_per_referral ?? 3
  const totalRefs = stats?.total_referrals ?? 0

  const handleCopy = () => {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      haptic('success')
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => showAlert(referralLink))
  }

  const handleShare = () => {
    if (!referralLink) return
    haptic('medium')
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(t(lang, 'ref.shareText'))}`
    const tg = window.Telegram?.WebApp
    if (tg?.openTelegramLink) tg.openTelegramLink(shareUrl)
    else window.open(shareUrl, '_blank')
  }

  return (
    <div className="referrals-page page-enter">
      <div className="ref-hero">
        <div className="ref-hero-glow"></div>
        <div className="ref-hero-icon">🎁</div>
        <h1 className="ref-hero-title">{t(lang, 'ref.title')}</h1>
        <p className="ref-hero-subtitle">{t(lang, 'ref.subtitle', { bonus })}</p>
      </div>

      {loading ? (
        <div className="ref-loading"><div className="spinner"></div></div>
      ) : (
        <>
          <div className="ref-stats">
            <div className="ref-stat-card">
              <div className="ref-stat-number">{totalRefs}</div>
              <div className="ref-stat-label">{t(lang, 'ref.invited')}</div>
            </div>
            <div className="ref-stat-divider"></div>
            <div className="ref-stat-card">
              <div className="ref-stat-number ref-stat-bonus">+{totalRefs * bonus}</div>
              <div className="ref-stat-label">{t(lang, 'ref.bonus')}</div>
            </div>
          </div>
          {stats?.bonus_selfies_left > 0 && (
            <p className="ref-hero-subtitle" style={{ textAlign: 'center' }}>{t(lang, 'ref.left', { count: stats.bonus_selfies_left })}</p>
          )}

          {referralLink ? (
            <div className="ref-link-section">
              <div className="ref-link-label">{t(lang, 'ref.yourLink')}</div>
              <div className="ref-link-box" onClick={handleCopy}>
                <span className="ref-link-text">{referralLink}</span>
                <span className="ref-link-copy-icon">{copied ? '✅' : '📋'}</span>
              </div>
              <div className="ref-actions">
                <button className="ref-btn ref-btn-copy" onClick={handleCopy}>{copied ? t(lang, 'ref.copied') : t(lang, 'ref.copy')}</button>
                <button className="ref-btn ref-btn-share" onClick={handleShare}>{t(lang, 'ref.share')}</button>
              </div>
            </div>
          ) : (
            <p className="ref-hero-subtitle" style={{ textAlign: 'center' }}>{t(lang, 'common.openInTelegram')}</p>
          )}
        </>
      )}

      <div className="ref-steps">
        <h3 className="ref-steps-title">{t(lang, 'ref.how')}</h3>
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="ref-step">
            <div className="ref-step-num">{n}</div>
            <div className="ref-step-text">{t(lang, `ref.step${n}`, { bonus })}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
