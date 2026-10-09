import React, { useState, useEffect, useMemo } from 'react'
import { apiFetch, insideTelegram } from '../utils/api'
import { formatDate, t } from '../i18n'

export default function MyGifts({ lang, personas = [], onOpenShop }) {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPersona, setSelectedPersona] = useState(null)

  useEffect(() => {
    if (!insideTelegram()) { setLoading(false); return }
    apiFetch('/api/gifts/purchases/me?limit=100')
      .then(({ ok, data }) => { if (ok) setPurchases(data.purchases || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const purchasesByPersona = useMemo(() => {
    const grouped = {}
    purchases.forEach((p) => { const k = p.persona || 'all'; (grouped[k] = grouped[k] || []).push(p) })
    return grouped
  }, [purchases])

  const personaCodes = Object.keys(purchasesByPersona)
  const displayPersona = selectedPersona || personaCodes[0] || null
  const displayPurchases = displayPersona ? purchasesByPersona[displayPersona] || [] : []

  const personaName = (code) => {
    if (code === 'all') return t(lang, 'shop.allGirls')
    return personas.find((p) => p.code === code)?.name || code
  }

  if (loading) {
    return <div className="mygifts-loading"><div className="spinner"></div><p>{t(lang, 'common.loading')}</p></div>
  }

  if (purchases.length === 0) {
    return (
      <div className="mygifts-empty">
        <div className="empty-icon">🎁</div>
        <h2>{t(lang, 'mygifts.empty')}</h2>
        <p>{insideTelegram() ? t(lang, 'mygifts.emptyHint') : t(lang, 'common.openInTelegram')}</p>
        <button className="empty-shop-btn" onClick={onOpenShop}>{t(lang, 'mygifts.openShop')}</button>
      </div>
    )
  }

  return (
    <div className="mygifts-screen">
      <div className="mygifts-header">
        <p className="mygifts-subtitle">{t(lang, 'mygifts.total', { count: purchases.length })}</p>
      </div>
      {personaCodes.length > 1 && (
        <div className="persona-filter">
          {personaCodes.map((code) => (
            <button key={code} className={`persona-filter-btn ${displayPersona === code ? 'active' : ''}`} onClick={() => setSelectedPersona(code)}>
              {personaName(code)}
            </button>
          ))}
        </div>
      )}
      <div className="purchases-list">
        {displayPurchases.map((purchase) => (
          <div key={purchase.id} className="purchase-item">
            <div className="purchase-icon">{purchase.emoji}</div>
            <div className="purchase-info">
              <div className="purchase-name">{lang === 'ru' ? purchase.name_ru : purchase.name_tr}</div>
              <div className="purchase-meta">
                <span className="purchase-persona">{t(lang, 'mygifts.for')} {personaName(purchase.persona)}</span>
                <span className="purchase-date">{formatDate(purchase.created_at, lang)}</span>
              </div>
              {purchase.persona_reaction && (
                <div className="purchase-reaction"><span className="reaction-icon">💬</span><span className="reaction-text">{purchase.persona_reaction}</span></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
