import React, { useState, useEffect } from 'react'
import SmartImage from './SmartImage'
import { apiFetch, haptic, insideTelegram } from '../utils/api'
import { t } from '../i18n'

export default function PersonaDetail({ persona, lang, onClose, onSelect, onOpenShop }) {
  const [purchases, setPurchases] = useState([])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    if (insideTelegram()) {
      apiFetch(`/api/gifts/purchases/me?persona=${encodeURIComponent(persona.code)}&limit=10`)
        .then(({ ok, data }) => { if (ok) setPurchases(data.purchases || []) })
        .catch(() => {})
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [persona.code])

  return (
    <div className="detail-overlay" onClick={() => { haptic('light'); onClose() }}>
      <div className="detail-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" aria-label="close" onClick={() => { haptic('light'); onClose() }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="detail-image">
          <SmartImage code={persona.code} alt={persona.name} className="detail-img" />
          <div className="detail-gradient"></div>
        </div>
        <div className="detail-info">
          <div className="detail-header">
            <div className="detail-name-age">
              <h1 className="detail-name">{persona.name}, {persona.age}</h1>
              <div className="detail-status"><span className="status-dot">●</span><span>{t(lang, 'detail.live')}</span></div>
            </div>
            <div className="detail-tagline">{persona.tagline}</div>
          </div>
          <div className="detail-bio"><p>{persona.bio}</p></div>
          <div className="detail-tags">{persona.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}</div>

          {purchases.length > 0 && (
            <div className="detail-gifts">
              <h3 className="gifts-title">{t(lang, 'detail.gifts')}</h3>
              <div className="gifts-list">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="gift-item">
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
              <span>{t(lang, 'detail.start')}</span>
            </button>
            <button className="select-btn secondary" onClick={() => { haptic('light'); onOpenShop(persona) }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <span>{t(lang, 'detail.shop')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
