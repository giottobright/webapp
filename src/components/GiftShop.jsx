import React, { useState, useEffect, useMemo } from 'react'
import { apiFetch, haptic, insideTelegram, openInvoice, showAlert } from '../utils/api'
import { t } from '../i18n'
import MyGifts from './MyGifts'

export default function GiftShop({ persona, personas, lang }) {
  const [gifts, setGifts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [shopSection, setShopSection] = useState('all')
  const [view, setView] = useState('catalog')
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    apiFetch(`/api/gifts?language=${lang}`, { signal: controller.signal })
      .then(({ ok, data }) => {
        if (ok) { setGifts(data.gifts || []); setCategories(data.categories || []) }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [lang])

  const personaCode = persona?.code || 'all'
  const personaName = persona ? persona.name : t(lang, 'shop.toGirls')

  const handlePurchase = async (gift) => {
    if (!insideTelegram()) { showAlert(t(lang, 'common.notTelegram')); return }
    haptic('medium')
    setPurchasing(gift.code)
    try {
      const vars = { emoji: gift.emoji, gift: gift.name, name: personaName }
      if (!gift.price) {
        const { ok, status, data } = await apiFetch('/api/gifts/purchase', {
          method: 'POST', body: { gift_code: gift.code, persona: personaCode, context_type: 'shop' },
        })
        if (ok) { haptic('success'); showAlert(t(lang, 'shop.gifted', vars)); return }
        haptic('error')
        showAlert(status === 429 ? t(lang, 'shop.freeLimit') : t(lang, 'common.error'))
        return
      }
      const { ok, data } = await apiFetch('/api/gifts/invoice', {
        method: 'POST', body: { gift_code: gift.code, persona: personaCode },
      })
      if (!ok || !data?.invoice_url) { haptic('error'); showAlert(t(lang, 'common.error')); return }
      const result = await openInvoice(data.invoice_url)
      if (result === 'paid') { haptic('success'); showAlert(t(lang, 'shop.paidGifted', vars)) }
      else if (result === 'cancelled') showAlert(t(lang, 'shop.paymentCancelled'))
      else if (result !== 'pending') showAlert(t(lang, 'common.error'))
    } finally {
      setPurchasing(null)
    }
  }

  const filteredGifts = useMemo(() => {
    let filtered = gifts
    if (selectedCategory) filtered = filtered.filter((g) => g.category === selectedCategory)
    if (shopSection === 'popular') filtered = [...filtered].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    else if (shopSection === 'new') filtered = [...filtered].sort((a, b) => (b.id || 0) - (a.id || 0))
    return filtered
  }, [gifts, selectedCategory, shopSection])

  return (
    <div className="shop-screen">
      <div className="shop-header-main">
        <div className="shop-header-content">
          <h1 className="shop-main-title">{t(lang, 'shop.title')}</h1>
          {persona && <p className="shop-main-subtitle">{t(lang, 'shop.for', { name: persona.name })}</p>}
        </div>
      </div>
      <div className="shop-sections">
        <button className={`shop-section-btn ${view === 'catalog' ? 'active' : ''}`} onClick={() => setView('catalog')}>{t(lang, 'shop.catalog')}</button>
        <button className={`shop-section-btn ${view === 'mine' ? 'active' : ''}`} onClick={() => setView('mine')}>{t(lang, 'shop.myGifts')}</button>
      </div>

      {view === 'mine' ? (
        <MyGifts lang={lang} personas={personas} onOpenShop={() => setView('catalog')} />
      ) : (
        <>
          <div className="shop-sections">
            {['all', 'popular', 'new'].map((s) => (
              <button key={s} className={`shop-section-btn ${shopSection === s ? 'active' : ''}`} onClick={() => setShopSection(s)}>
                {t(lang, `shop.${s}`)}
              </button>
            ))}
          </div>
          {categories.length > 0 && (
            <div className="categories-scroll">
              <button className={`category-chip ${!selectedCategory ? 'active' : ''}`} onClick={() => setSelectedCategory(null)}>{t(lang, 'shop.all')}</button>
              {categories.map((cat) => (
                <button key={cat.code} className={`category-chip ${selectedCategory === cat.code ? 'active' : ''}`} onClick={() => setSelectedCategory(cat.code)}>
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
          )}
          <div className="shop-grid-main">
            {loading ? (
              <div className="shop-loading"><div className="spinner"></div><p>{t(lang, 'common.loading')}</p></div>
            ) : filteredGifts.length > 0 ? (
              filteredGifts.map((gift) => (
                <div key={gift.code} className="gift-card-new">
                  <div className="gift-icon-large">{gift.emoji}</div>
                  <div className="gift-info-new">
                    <h3 className="gift-name-new">{gift.name}</h3>
                    <p className="gift-description-new">{gift.description}</p>
                    <div className="gift-price-new">
                      {gift.price ? <span className="price-stars-new">⭐ {gift.price}</span> : <span className="price-free-new">{t(lang, 'shop.free')}</span>}
                    </div>
                  </div>
                  <button
                    className={`gift-buy-btn-new ${purchasing === gift.code ? 'purchasing' : ''}`}
                    onClick={() => handlePurchase(gift)}
                    disabled={!!purchasing}
                  >
                    {purchasing === gift.code ? <span className="btn-spinner"></span> : <span>{t(lang, 'shop.give')}</span>}
                  </button>
                </div>
              ))
            ) : (
              <div className="shop-empty">
                {gifts.length === 0
                  ? <><p style={{ fontSize: '18px', marginBottom: '8px' }}>📦</p><p style={{ fontWeight: 600 }}>{t(lang, 'shop.empty')}</p></>
                  : <p>{t(lang, 'shop.emptyCategory')}</p>}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
