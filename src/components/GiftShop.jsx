import React, { useState, useEffect, useMemo } from 'react'
import { API_BASE, getTg, getLang } from '../utils/api'

export default function GiftShop({ persona, onPurchaseSuccess }) {
  const lang = getLang()
  const [gifts, setGifts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [shopSection, setShopSection] = useState('all')
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null)

  useEffect(() => { loadGifts() }, [])

  const loadGifts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/gifts?language=${lang}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (data.ok) { setGifts(data.gifts || []); setCategories(data.categories || []) }
    } catch (error) { console.error('Failed to load gifts:', error) }
    finally { setLoading(false) }
  }

  const isAllPersonas = !persona || persona?.code === 'all'

  const handlePurchase = async (gift) => {
    const t = getTg()
    try { t?.HapticFeedback?.impactOccurred('medium') } catch (_) {}
    setPurchasing(gift.code)
    try {
      const userId = t?.initDataUnsafe?.user?.id || 'test_user'
      const personaCode = isAllPersonas ? 'all' : persona.code
      const response = await fetch(`${API_BASE}/api/gifts/purchase`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, gift_code: gift.code, persona: personaCode, context_type: 'shop' })
      })
      const data = await response.json()
      if (data.ok) {
        try { t?.HapticFeedback?.notificationOccurred('success') } catch (_) {}
        const personaName = isAllPersonas ? (lang === 'ru' ? 'девушкам' : 'kızlara') : (lang === 'ru' ? persona.name_ru : persona.name_tr)
        const msg = lang === 'ru' ? `✅ ${gift.emoji} ${gift.name} подарено ${personaName}!` : `✅ ${gift.emoji} ${gift.name}, ${personaName}'e hediye edildi!`
        if (t?.showAlert) { t.showAlert(msg) } else { alert(msg) }
        onPurchaseSuccess?.()
      } else { throw new Error(data.error || 'Purchase failed') }
    } catch (error) {
      try { t?.HapticFeedback?.notificationOccurred('error') } catch (_) {}
      const msg = lang === 'ru' ? 'Ошибка покупки' : 'Satın alma hatası'
      if (getTg()?.showAlert) { getTg().showAlert(msg) } else { alert(msg) }
    } finally { setPurchasing(null) }
  }

  const filteredGifts = useMemo(() => {
    let filtered = gifts
    if (selectedCategory) filtered = filtered.filter(g => g.category === selectedCategory)
    if (shopSection === 'popular') filtered = [...filtered].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    else if (shopSection === 'new') filtered = [...filtered].sort((a, b) => (b.id || 0) - (a.id || 0))
    return filtered
  }, [gifts, selectedCategory, shopSection])

  const personaName = isAllPersonas ? (lang === 'ru' ? 'Все девушки' : 'Tüm kızlar') : (lang === 'ru' ? persona.name_ru : persona.name_tr)

  return (
    <div className="shop-screen">
      <div className="shop-header-main">
        <div className="shop-header-content">
          <h1 className="shop-main-title">{lang === 'ru' ? '🎁 Магазин подарков' : '🎁 Hediye Dükkanı'}</h1>
          {!isAllPersonas && <p className="shop-main-subtitle">{lang === 'ru' ? `для ${personaName}` : `${personaName} için`}</p>}
        </div>
      </div>
      <div className="shop-sections">
        {['all', 'popular', 'new'].map(s => (
          <button key={s} className={`shop-section-btn ${shopSection === s ? 'active' : ''}`} onClick={() => setShopSection(s)}>
            {s === 'all' ? (lang === 'ru' ? 'Все' : 'Tümü') : s === 'popular' ? (lang === 'ru' ? '⭐ Популярное' : '⭐ Popüler') : (lang === 'ru' ? '✨ Новое' : '✨ Yeni')}
          </button>
        ))}
      </div>
      {categories.length > 0 && (
        <div className="categories-scroll">
          <button className={`category-chip ${!selectedCategory ? 'active' : ''}`} onClick={() => setSelectedCategory(null)}>{lang === 'ru' ? 'Все' : 'Tümü'}</button>
          {categories.map(cat => <button key={cat.code} className={`category-chip ${selectedCategory === cat.code ? 'active' : ''}`} onClick={() => setSelectedCategory(cat.code)}>{cat.emoji} {cat.name}</button>)}
        </div>
      )}
      <div className="shop-grid-main">
        {loading ? (
          <div className="shop-loading"><div className="spinner"></div><p>{lang === 'ru' ? 'Загрузка...' : 'Yükleniyor...'}</p></div>
        ) : filteredGifts.length > 0 ? (
          filteredGifts.map(gift => (
            <div key={gift.code} className="gift-card-new">
              <div className="gift-icon-large">{gift.emoji}</div>
              <div className="gift-info-new">
                <h3 className="gift-name-new">{gift.name}</h3>
                <p className="gift-description-new">{gift.description}</p>
                <div className="gift-price-new">
                  {gift.price === 0 ? <span className="price-free-new">{lang === 'ru' ? 'Бесплатно' : 'Ücretsiz'}</span> : <span className="price-stars-new">⭐ {gift.price}</span>}
                </div>
              </div>
              <button className={`gift-buy-btn-new ${purchasing === gift.code ? 'purchasing' : ''}`} onClick={() => handlePurchase(gift)} disabled={purchasing === gift.code}>
                {purchasing === gift.code ? <span className="btn-spinner"></span> : <span>{lang === 'ru' ? '🎁 Подарить' : '🎁 Hediye Et'}</span>}
              </button>
            </div>
          ))
        ) : (
          <div className="shop-empty">
            {gifts.length === 0 ? <><p style={{ fontSize: '18px', marginBottom: '8px' }}>📦</p><p style={{ fontWeight: 600 }}>{lang === 'ru' ? 'Магазин пуст' : 'Mağaza boş'}</p></> : <p>{lang === 'ru' ? 'Нет подарков в этой категории' : 'Bu kategoride hediye yok'}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
