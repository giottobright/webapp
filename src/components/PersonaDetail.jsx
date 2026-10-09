import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Gift, MessageCircleHeart, X } from 'lucide-react'
import Sheet from './Sheet'
import SmartImage from './SmartImage'
import { apiFetch, buildExternalCandidates, buildLocalCandidates, haptic, insideTelegram } from '../utils/api'
import { purchaseName, t } from '../i18n'

function Gallery({ persona, lang }) {
  const photos = useMemo(() => {
    const local = buildLocalCandidates(persona.code)
    return local.length ? local : buildExternalCandidates(persona.code).slice(0, 1)
  }, [persona.code])
  const [active, setActive] = useState(0)
  const track = useRef(null)

  const onScroll = () => {
    const el = track.current
    if (!el || !el.clientWidth) return
    const next = Math.round(el.scrollLeft / el.clientWidth)
    if (next !== active) setActive(next)
  }

  const goTo = (index) => {
    const el = track.current
    if (!el) return
    haptic('selection')
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' })
  }

  if (photos.length <= 1) {
    return (
      <div className="gallery">
        <SmartImage code={persona.code} alt={persona.name} className="gallery-img" eager />
        <span className="gallery-scrim" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="gallery">
      <div className="gallery-track" ref={track} onScroll={onScroll}>
        {photos.map((src, i) => (
          <div className="gallery-slide" key={src}>
            <SmartImage
              src={src}
              alt={`${persona.name} · ${t(lang, 'detail.photo', { n: i + 1, total: photos.length })}`}
              className="gallery-img"
              eager={i === 0}
            />
          </div>
        ))}
      </div>
      <span className="gallery-scrim" aria-hidden="true" />
      <div className="gallery-dots">
        {photos.map((src, i) => (
          <button
            key={src}
            type="button"
            className="gallery-dot"
            aria-label={t(lang, 'detail.photo', { n: i + 1, total: photos.length })}
            aria-current={i === active ? 'true' : undefined}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  )
}

export default function PersonaDetail({ persona, lang, onClose, onSelect, onOpenShop }) {
  const [purchases, setPurchases] = useState([])
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!insideTelegram()) return undefined
    const controller = new AbortController()
    apiFetch(`/api/gifts/purchases/me?persona=${encodeURIComponent(persona.code)}&limit=10`, { signal: controller.signal })
      .then(({ ok, data }) => { if (ok) setPurchases(data.purchases || []) })
      .catch(() => {})
    return () => controller.abort()
  }, [persona.code])

  const start = async () => {
    if (starting) return
    haptic('medium')
    setStarting(true)
    try {
      await onSelect()
    } finally {
      setStarting(false)
    }
  }

  const titleId = `persona-${persona.code}-title`

  return (
    <Sheet onClose={onClose} labelledBy={titleId} className="persona-sheet">
      {(requestClose) => (
        <>
          <button type="button" className="icon-btn sheet-close" aria-label={t(lang, 'common.close')} onClick={requestClose}>
            <X size={20} />
          </button>
          <div className="sheet-scroll">
            <Gallery persona={persona} lang={lang} />
            <div className="sheet-body">
              <header className="detail-header">
                <h2 className="detail-name" id={titleId}>
                  {persona.name}<span className="detail-age">{persona.age}</span>
                </h2>
                <p className="detail-tagline">{persona.tagline}</p>
                <span className="status-pill"><span className="online-dot" aria-hidden="true" />{t(lang, 'card.online')}</span>
              </header>

              <section className="detail-section" aria-label={t(lang, 'detail.about')}>
                <h3 className="section-title">{t(lang, 'detail.about')}</h3>
                <p className="detail-bio">{persona.bio}</p>
              </section>

              {persona.tags.length > 0 && (
                <section className="detail-section">
                  <h3 className="section-title">{t(lang, 'detail.interests')}</h3>
                  <ul className="tag-list">
                    {persona.tags.map((tag) => <li key={tag} className="tag">{tag}</li>)}
                  </ul>
                </section>
              )}

              {purchases.length > 0 && (
                <section className="detail-section">
                  <h3 className="section-title">{t(lang, 'detail.gifts')}</h3>
                  <ul className="tag-list">
                    {purchases.map((purchase) => (
                      <li key={purchase.id} className="tag tag-gift">
                        <span className="tag-emoji" aria-hidden="true">{purchase.emoji}</span>
                        {purchaseName(purchase, lang)}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>

          <div className="sheet-actions">
            <button type="button" className="btn btn-primary btn-lg btn-block" onClick={start} disabled={starting} aria-busy={starting}>
              {starting ? <span className="btn-spinner" aria-hidden="true" /> : <MessageCircleHeart size={20} />}
              <span>{t(lang, 'detail.start')}</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-lg btn-square"
              aria-label={t(lang, 'detail.shop')}
              title={t(lang, 'detail.shop')}
              onClick={() => { haptic('light'); onOpenShop(persona) }}
            >
              <Gift size={20} />
            </button>
          </div>
        </>
      )}
    </Sheet>
  )
}
