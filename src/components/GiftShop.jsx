import React, { useState, useEffect, useMemo } from 'react'
import { Gem, Gift, Heart, PackageOpen, PartyPopper, ShoppingBag, Sparkles } from 'lucide-react'
import { apiFetch, haptic, insideTelegram, openInvoice, showAlert } from '../utils/api'
import { t } from '../i18n'
import MyGifts from './MyGifts'
import { ChipRow, EmptyState, ErrorState, PersonaAvatar, Segmented, Skeleton, StarsIcon } from './ui'

const CATEGORY_ICONS = { romantic: Heart, luxury: Gem, fun: PartyPopper, special: Sparkles }

function categoryIcon(category) {
  const Icon = CATEGORY_ICONS[category.code]
  if (Icon) return <Icon size={16} />
  return category.emoji ? <span aria-hidden="true">{category.emoji}</span> : null
}

function GiftTile({ gift, lang, busy, disabled, onGive, index }) {
  return (
    <article className={`gift-tile gift-${gift.category || 'other'}`} style={{ '--i': index }}>
      <div className="gift-art" aria-hidden="true">
        {gift.image_url ? <img src={gift.image_url} alt="" loading="lazy" decoding="async" /> : <span className="gift-emoji">{gift.emoji}</span>}
      </div>
      <h3 className="gift-name">{gift.name}</h3>
      {gift.description && <p className="gift-desc">{gift.description}</p>}
      <div className="gift-foot">
        {gift.price
          ? <span className="price price-stars"><StarsIcon />{gift.price}</span>
          : <span className="price price-free">{t(lang, 'shop.free')}</span>}
      </div>
      <button
        type="button"
        className={`btn btn-md btn-block ${gift.price ? 'btn-secondary' : 'btn-primary'}`}
        onClick={() => onGive(gift)}
        disabled={disabled}
        aria-busy={busy}
      >
        {busy ? <span className="btn-spinner" aria-hidden="true" /> : <Gift size={18} />}
        <span>{t(lang, 'shop.give')}</span>
      </button>
    </article>
  )
}

export default function GiftShop({ persona, personas, lang }) {
  const [gifts, setGifts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [sort, setSort] = useState('popular')
  const [view, setView] = useState('catalog')
  const [recipient, setRecipient] = useState(persona?.code || null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [purchasing, setPurchasing] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadError(null)
    apiFetch(`/api/gifts?language=${lang}`, { signal: controller.signal })
      .then(({ ok, status, data }) => {
        if (ok) {
          setGifts(data.gifts || [])
          setCategories(data.categories || [])
        } else {
          setLoadError(status === 0 ? t(lang, 'common.offline') : t(lang, 'shop.loadFailed'))
        }
        setLoading(false)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [lang, reloadKey])

  const recipientPersona = personas.find((p) => p.code === recipient) || null
  const personaCode = recipientPersona?.code || 'all'
  const personaName = recipientPersona ? recipientPersona.name : t(lang, 'shop.toGirls')

  const handlePurchase = async (gift) => {
    if (!insideTelegram()) { showAlert(t(lang, 'common.notTelegram')); return }
    haptic('medium')
    setPurchasing(gift.code)
    try {
      const vars = { emoji: gift.emoji, gift: gift.name, name: personaName }
      if (!gift.price) {
        const { ok, status } = await apiFetch('/api/gifts/purchase', {
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

  const visibleGifts = useMemo(() => {
    const filtered = selectedCategory ? gifts.filter((g) => g.category === selectedCategory) : gifts
    const key = sort === 'new' ? 'id' : 'popularity'
    return [...filtered].sort((a, b) => (b[key] || 0) - (a[key] || 0))
  }, [gifts, selectedCategory, sort])

  const recipients = [
    { value: null, label: t(lang, 'shop.toAll'), icon: <Sparkles size={16} /> },
    ...personas.map((p) => ({ value: p.code, label: p.name, avatar: <PersonaAvatar code={p.code} name={p.name} size={24} /> })),
  ]

  return (
    <div className="shop">
      <header className="page-header">
        <h1 className="page-title">{t(lang, 'shop.title')}</h1>
        <p className="page-subtitle">
          {recipientPersona ? t(lang, 'shop.for', { name: recipientPersona.name }) : t(lang, 'shop.subtitle')}
        </p>
      </header>

      <Segmented
        label={t(lang, 'shop.title')}
        value={view}
        onChange={setView}
        options={[
          { value: 'catalog', label: t(lang, 'shop.catalog'), icon: <ShoppingBag size={17} /> },
          { value: 'mine', label: t(lang, 'shop.myGifts'), icon: <Heart size={17} /> },
        ]}
      />

      {view === 'mine' ? (
        <MyGifts lang={lang} personas={personas} onOpenShop={() => setView('catalog')} />
      ) : (
        <>
          <section className="shop-filters">
            <h2 className="section-title">{t(lang, 'shop.to')}</h2>
            <ChipRow label={t(lang, 'shop.to')} items={recipients} value={recipient} onChange={setRecipient} />
            {categories.length > 0 && (
              <>
                <h2 className="section-title">{t(lang, 'shop.categories')}</h2>
                <ChipRow
                  label={t(lang, 'shop.categories')}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  items={[
                    { value: null, label: t(lang, 'shop.all') },
                    ...categories.map((cat) => ({ value: cat.code, label: cat.name, icon: categoryIcon(cat) })),
                  ]}
                />
              </>
            )}
          </section>

          {!loading && !loadError && gifts.length > 0 && (
            <div className="shop-toolbar">
              <Segmented
                size="sm"
                label={t(lang, 'shop.sort')}
                value={sort}
                onChange={setSort}
                options={[
                  { value: 'popular', label: t(lang, 'shop.popular') },
                  { value: 'new', label: t(lang, 'shop.new') },
                ]}
              />
            </div>
          )}

          {loading ? (
            <div className="gift-grid" aria-busy="true" aria-label={t(lang, 'common.loading')}>
              {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="gift-tile-skeleton" />)}
            </div>
          ) : loadError ? (
            <ErrorState lang={lang} text={loadError} onRetry={() => setReloadKey((k) => k + 1)} />
          ) : visibleGifts.length > 0 ? (
            <div className="gift-grid">
              {visibleGifts.map((gift, i) => (
                <GiftTile
                  key={gift.code}
                  gift={gift}
                  lang={lang}
                  index={i}
                  busy={purchasing === gift.code}
                  disabled={!!purchasing}
                  onGive={handlePurchase}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<PackageOpen size={28} />}
              title={gifts.length === 0 ? t(lang, 'shop.empty') : t(lang, 'shop.emptyCategory')}
              action={gifts.length > 0 && (
                <button type="button" className="btn btn-secondary btn-md" onClick={() => setSelectedCategory(null)}>
                  {t(lang, 'shop.all')}
                </button>
              )}
            />
          )}
        </>
      )}
    </div>
  )
}
