import React, { useState, useEffect, useMemo } from 'react'
import { PERSONAS } from '../personas'
import { API_BASE, getTg, getLang } from '../utils/api'

export default function MyGifts({ onOpenShop }) {
  const lang = getLang()
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPersona, setSelectedPersona] = useState(null)

  useEffect(() => { loadAllPurchases() }, [])

  const loadAllPurchases = async () => {
    try {
      const t = getTg()
      const userId = t?.initDataUnsafe?.user?.id || 'test_user'
      const response = await fetch(`${API_BASE}/api/gifts/purchases/${userId}?limit=100`)
      const data = await response.json()
      if (data.ok) setPurchases(data.purchases || [])
    } catch (error) { console.error('Failed to load purchases:', error) }
    finally { setLoading(false) }
  }

  const purchasesByPersona = useMemo(() => {
    const grouped = {}
    purchases.forEach(p => { const k = p.persona || 'all'; if (!grouped[k]) grouped[k] = []; grouped[k].push(p) })
    return grouped
  }, [purchases])

  const allPersonas = Object.keys(purchasesByPersona)
  const displayPersona = selectedPersona || (allPersonas.length > 0 ? allPersonas[0] : null)
  const displayPurchases = displayPersona ? purchasesByPersona[displayPersona] || [] : []

  const getPersonaName = (code) => {
    if (code === 'all') return lang === 'ru' ? 'Все девушки' : 'Tüm kızlar'
    const persona = PERSONAS.find(p => p.code === code)
    return persona ? (lang === 'ru' ? persona.name_ru : persona.name_tr) : code
  }

  return (
    <div className="mygifts-screen">
      <div className="mygifts-header">
        <h1 className="mygifts-title">{lang === 'ru' ? '💝 Мои подарки' : '💝 Hediyelerim'}</h1>
        <p className="mygifts-subtitle">{lang === 'ru' ? `Всего подарено: ${purchases.length}` : `Toplam hediye: ${purchases.length}`}</p>
      </div>
      {loading ? (
        <div className="mygifts-loading"><div className="spinner"></div><p>{lang === 'ru' ? 'Загрузка...' : 'Yükleniyor...'}</p></div>
      ) : purchases.length === 0 ? (
        <div className="mygifts-empty">
          <div className="empty-icon">🎁</div>
          <h2>{lang === 'ru' ? 'Пока нет подарков' : 'Henüz hediye yok'}</h2>
          <p>{lang === 'ru' ? 'Купите подарок в магазине, чтобы он появился здесь' : 'Mağazadan hediye alın, burada görünsün'}</p>
          <button className="empty-shop-btn" onClick={onOpenShop}>{lang === 'ru' ? '🎁 Открыть магазин' : '🎁 Mağazayı Aç'}</button>
        </div>
      ) : (
        <>
          {allPersonas.length > 1 && (
            <div className="persona-filter">
              {allPersonas.map(code => (
                <button key={code} className={`persona-filter-btn ${displayPersona === code ? 'active' : ''}`} onClick={() => setSelectedPersona(code)}>{getPersonaName(code)}</button>
              ))}
            </div>
          )}
          <div className="purchases-list">
            {displayPurchases.map((purchase, idx) => {
              const giftName = lang === 'ru' ? purchase.name_ru : purchase.name_tr
              const dateStr = new Date(purchase.created_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
              return (
                <div key={idx} className="purchase-item">
                  <div className="purchase-icon">{purchase.emoji}</div>
                  <div className="purchase-info">
                    <div className="purchase-name">{giftName}</div>
                    <div className="purchase-meta"><span className="purchase-persona">{lang === 'ru' ? 'для' : 'için'} {getPersonaName(purchase.persona)}</span><span className="purchase-date">{dateStr}</span></div>
                    {purchase.persona_reaction && <div className="purchase-reaction"><span className="reaction-icon">💬</span><span className="reaction-text">{purchase.persona_reaction}</span></div>}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
