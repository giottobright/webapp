import React, { useState, useEffect } from 'react'
import SmartImage from './SmartImage'
import { API_BASE, getTg, getLang } from '../utils/api'

export default function PersonaDetail({ persona, onClose, onSelect, onOpenShop }) {
  const lang = getLang()
  const name = lang === 'ru' ? persona.name_ru : persona.name_tr
  const tagline = lang === 'ru' ? persona.tagline_ru : persona.tagline_tr
  const tags = lang === 'ru' ? persona.tags_ru : persona.tags_tr
  const bio = lang === 'ru' ? persona.bio_ru : persona.bio_tr

  const [purchases, setPurchases] = useState([])
  const [loadingPurchases, setLoadingPurchases] = useState(true)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    loadPurchases()
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  const loadPurchases = async () => {
    try {
      const t = getTg()
      const userId = t?.initDataUnsafe?.user?.id || 'test_user'
      const response = await fetch(`${API_BASE}/api/gifts/purchases/${userId}?persona=${persona.code}&limit=10`)
      const data = await response.json()
      if (data.ok) setPurchases(data.purchases || [])
    } catch (error) {
      console.error('Failed to load purchases:', error)
    } finally {
      setLoadingPurchases(false)
    }
  }

  const haptic = (type) => { try { getTg()?.HapticFeedback?.impactOccurred(type) } catch (_) {} }

  return (
    <div className="detail-overlay" onClick={() => { haptic('light'); onClose() }}>
      <div className="detail-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={() => { haptic('light'); onClose() }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="detail-image">
          <SmartImage code={persona.code} alt={name} className="detail-img" />
          <div className="detail-gradient"></div>
        </div>
        <div className="detail-info">
          <div className="detail-header">
            <div className="detail-name-age">
              <h1 className="detail-name">{name}, {persona.age}</h1>
              <div className="detail-status"><span className="status-dot">●</span><span>{lang === 'ru' ? 'В реальном времени' : 'Gerçek zamanlı'}</span></div>
            </div>
            <div className="detail-tagline">{tagline}</div>
          </div>
          <div className="detail-bio"><p>{bio}</p></div>
          <div className="detail-tags">{tags.map((tag, idx) => <span key={idx} className="tag">{tag}</span>)}</div>

          {!loadingPurchases && purchases.length > 0 && (
            <div className="detail-gifts">
              <h3 className="gifts-title">{lang === 'ru' ? '🎁 Твои подарки' : '🎁 Hediyelerin'}</h3>
              <div className="gifts-list">
                {purchases.map((purchase, idx) => (
                  <div key={idx} className="gift-item">
                    <span className="gift-emoji">{purchase.emoji}</span>
                    <span className="gift-label">{lang === 'ru' ? purchase.name_ru : purchase.name_tr}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="detail-actions">
            <button className="select-btn primary" onClick={() => { haptic('medium'); onSelect() }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span>{lang === 'ru' ? 'Начать общение' : 'Sohbete Başla'}</span>
            </button>
            <button className="select-btn secondary" onClick={() => { haptic('light'); onOpenShop(persona) }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <span>{lang === 'ru' ? '🎁 Магазин подарков' : '🎁 Hediye Dükkanı'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
