import React, { useState, useEffect } from 'react'
import { API_BASE, getTg, getLang } from '../utils/api'

export default function ReferralsPage() {
  const lang = getLang()
  const tg = getTg()
  const userId = tg?.initDataUnsafe?.user?.id
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    fetch(`${API_BASE}/api/referral/${userId}`)
      .then(r => r.json())
      .then(data => { if (data.ok) setStats(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  const referralLink = stats?.link || ''
  const totalRefs = stats?.total_referrals ?? 0
  const bonusSelfies = totalRefs * 3

  const handleCopy = () => {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      try { tg?.HapticFeedback?.notificationOccurred('success') } catch (_) {}
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      try { tg?.showAlert(referralLink) } catch (_) {}
    })
  }

  const handleShare = () => {
    if (!referralLink) return
    try { tg?.HapticFeedback?.impactOccurred('medium') } catch (_) {}
    const text = lang === 'ru'
      ? `Попробуй HayalKız — AI девушки для общения!`
      : `HayalKız'i dene — AI kızlarla sohbet!`
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`
    window.open(shareUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="referrals-page page-enter">
        <div className="ref-hero">
          <div className="ref-hero-icon">🔗</div>
          <h1 className="ref-hero-title">{lang === 'ru' ? 'Пригласи друзей' : 'Arkadaşlarını Davet Et'}</h1>
        </div>
        <div className="ref-loading"><div className="spinner"></div></div>
      </div>
    )
  }

  return (
    <div className="referrals-page page-enter">
      <div className="ref-hero">
        <div className="ref-hero-glow"></div>
        <div className="ref-hero-icon">🎁</div>
        <h1 className="ref-hero-title">
          {lang === 'ru' ? 'Пригласи друзей' : 'Arkadaşlarını Davet Et'}
        </h1>
        <p className="ref-hero-subtitle">
          {lang === 'ru'
            ? '+3 селфи за каждого приглашённого!'
            : 'Her davet için +3 selfie bonus!'}
        </p>
      </div>

      <div className="ref-stats">
        <div className="ref-stat-card">
          <div className="ref-stat-number">{totalRefs}</div>
          <div className="ref-stat-label">{lang === 'ru' ? 'Приглашено' : 'Davet'}</div>
        </div>
        <div className="ref-stat-divider"></div>
        <div className="ref-stat-card">
          <div className="ref-stat-number ref-stat-bonus">+{bonusSelfies}</div>
          <div className="ref-stat-label">{lang === 'ru' ? 'Бонус 📸' : 'Bonus 📸'}</div>
        </div>
      </div>

      {referralLink && (
        <div className="ref-link-section">
          <div className="ref-link-label">{lang === 'ru' ? 'Твоя ссылка' : 'Senin linkin'}</div>
          <div className="ref-link-box" onClick={handleCopy}>
            <span className="ref-link-text">{referralLink}</span>
            <span className="ref-link-copy-icon">{copied ? '✅' : '📋'}</span>
          </div>

          <div className="ref-actions">
            <button className="ref-btn ref-btn-copy" onClick={handleCopy}>
              {copied
                ? (lang === 'ru' ? '✅ Скопировано!' : '✅ Kopyalandı!')
                : (lang === 'ru' ? '📋 Копировать' : '📋 Kopyala')}
            </button>
            <button className="ref-btn ref-btn-share" onClick={handleShare}>
              {lang === 'ru' ? '📤 Поделиться' : '📤 Paylaş'}
            </button>
          </div>
        </div>
      )}

      <div className="ref-steps">
        <h3 className="ref-steps-title">{lang === 'ru' ? 'Как это работает?' : 'Nasıl çalışır?'}</h3>
        <div className="ref-step">
          <div className="ref-step-num">1</div>
          <div className="ref-step-text">{lang === 'ru' ? 'Скопируй свою ссылку' : 'Linkini kopyala'}</div>
        </div>
        <div className="ref-step">
          <div className="ref-step-num">2</div>
          <div className="ref-step-text">{lang === 'ru' ? 'Отправь другу в Telegram' : 'Arkadaşına Telegram\'dan gönder'}</div>
        </div>
        <div className="ref-step">
          <div className="ref-step-num">3</div>
          <div className="ref-step-text">{lang === 'ru' ? 'Друг запускает бота' : 'Arkadaşın botu başlatır'}</div>
        </div>
        <div className="ref-step">
          <div className="ref-step-num">4</div>
          <div className="ref-step-text">{lang === 'ru' ? 'Ты получаешь +3 селфи! 🎉' : 'Sen +3 selfie kazanırsın! 🎉'}</div>
        </div>
      </div>
    </div>
  )
}
