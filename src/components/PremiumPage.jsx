import React, { useState, useEffect } from 'react'
import { API_BASE, getTg, getLang } from '../utils/api'

export default function PremiumPage() {
  const lang = getLang()
  const tg = getTg()
  const [userPlan, setUserPlan] = useState('free')
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(null)

  useEffect(() => { loadPlan() }, [])

  const loadPlan = async () => {
    try {
      const userId = tg?.initDataUnsafe?.user?.id || 'test_user'
      const response = await fetch(`${API_BASE}/api/subscription/${userId}`)
      const data = await response.json()
      if (data.ok) setUserPlan(data.plan || 'free')
    } catch (error) { console.error('Failed to load plan:', error) }
    finally { setLoading(false) }
  }

  const handleUpgrade = (planId) => {
    try { tg?.HapticFeedback?.impactOccurred('medium') } catch (_) {}
    setUpgrading(planId)

    if (tg) {
      const payload = JSON.stringify({ action: 'upgrade', plan: planId })
      tg.sendData(payload)
      try { tg.HapticFeedback.notificationOccurred('success') } catch (_) {}
      setTimeout(() => {
        setUpgrading(null)
        try { tg.close() } catch (_) {}
      }, 500)
    } else {
      const msg = lang === 'ru'
        ? 'Оплата доступна только через Telegram бота. Используй /premium в чате.'
        : 'Ödeme sadece Telegram botu üzerinden yapılabilir. Sohbette /premium kullanın.'
      alert(msg)
      setUpgrading(null)
    }
  }

  const plans = [
    {
      id: 'free',
      name: lang === 'ru' ? 'Бесплатный' : 'Ücretsiz',
      price: lang === 'ru' ? 'Бесплатно' : 'Ücretsiz',
      icon: '🆓',
      gradient: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
      features: lang === 'ru'
        ? ['3 селфи в день', '1 видео в день', '5 голосовых в день', 'Базовые функции']
        : ['Günde 3 selfie', 'Günde 1 video', 'Günde 5 sesli mesaj', 'Temel özellikler'],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '⭐ 500 Stars',
      priceNote: lang === 'ru' ? '/месяц' : '/ay',
      icon: '⭐',
      popular: true,
      gradient: 'linear-gradient(135deg, rgba(255,0,110,0.1), rgba(131,56,236,0.08))',
      features: lang === 'ru'
        ? ['20 селфи в день', '5 видео в день', '30 голосовых в день', 'Приоритетные ответы', 'Без рекламы']
        : ['Günde 20 selfie', 'Günde 5 video', 'Günde 30 sesli mesaj', 'Öncelikli yanıtlar', 'Reklamsız'],
    },
    {
      id: 'vip',
      name: 'VIP',
      price: '⭐ 1000 Stars',
      priceNote: lang === 'ru' ? '/месяц' : '/ay',
      icon: '💎',
      gradient: 'linear-gradient(135deg, rgba(131,56,236,0.12), rgba(58,134,255,0.08))',
      features: lang === 'ru'
        ? ['∞ селфи в день', '15 видео в день', '∞ голосовых', 'VIP поддержка', 'Эксклюзивные функции', 'Ранний доступ']
        : ['Sınırsız selfie', 'Günde 15 video', 'Sınırsız sesli', 'VIP destek', 'Özel özellikler', 'Erken erişim'],
    },
  ]

  return (
    <div className="premium-screen page-enter">
      <div className="premium-hero">
        <div className="premium-hero-glow"></div>
        <h1 className="premium-hero-title">
          {lang === 'ru' ? '⭐ Подписки' : '⭐ Abonelikler'}
        </h1>
        <p className="premium-hero-sub">
          {lang === 'ru' ? 'Разблокируй все возможности' : 'Tüm özelliklerin kilidini aç'}
        </p>
        {!loading && (
          <div className="premium-current-badge">
            {lang === 'ru' ? 'Твой план: ' : 'Planın: '}
            <strong>{userPlan === 'free' ? (lang === 'ru' ? 'Бесплатный' : 'Ücretsiz') : userPlan.toUpperCase()}</strong>
          </div>
        )}
      </div>

      <div className="premium-plans">
        {plans.map(plan => {
          const isCurrent = userPlan === plan.id
          return (
            <div
              key={plan.id}
              className={`premium-plan-card ${plan.popular ? 'popular' : ''} ${isCurrent ? 'current' : ''}`}
              style={{ background: plan.gradient }}
            >
              {plan.popular && !isCurrent && (
                <div className="premium-popular-badge">
                  {lang === 'ru' ? '🔥 Популярный' : '🔥 Popüler'}
                </div>
              )}
              {isCurrent && (
                <div className="premium-current-label">
                  {lang === 'ru' ? '✅ Активен' : '✅ Aktif'}
                </div>
              )}

              <div className="premium-plan-header">
                <span className="premium-plan-icon">{plan.icon}</span>
                <div>
                  <h2 className="premium-plan-name">{plan.name}</h2>
                  <div className="premium-plan-price">
                    {plan.price}
                    {plan.priceNote && <span className="premium-price-note">{plan.priceNote}</span>}
                  </div>
                </div>
              </div>

              <ul className="premium-features">
                {plan.features.map((f, i) => (
                  <li key={i}>
                    <span className="premium-check">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {!isCurrent && plan.id !== 'free' && (
                <button
                  className={`premium-upgrade-btn ${upgrading === plan.id ? 'loading' : ''}`}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={!!upgrading}
                >
                  {upgrading === plan.id
                    ? <span className="btn-spinner"></span>
                    : (lang === 'ru' ? 'Выбрать план' : 'Planı Seç')}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="premium-footer-note">
        <p>
          {lang === 'ru'
            ? '💡 Оплата через Telegram Stars. Также можно оформить подписку командой /premium в чате.'
            : '💡 Telegram Stars ile ödeme. Ayrıca sohbette /premium komutu ile abone olabilirsiniz.'}
        </p>
      </div>
    </div>
  )
}
