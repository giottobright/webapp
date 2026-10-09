import React, { useState, useEffect, useMemo } from 'react'
import { Gift } from 'lucide-react'
import { apiFetch, insideTelegram } from '../utils/api'
import { formatDate, purchaseName, t } from '../i18n'
import { ChipRow, EmptyState, ErrorState, PersonaAvatar, Skeleton } from './ui'

export default function MyGifts({ lang, personas = [], onOpenShop }) {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPersona, setSelectedPersona] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!insideTelegram()) { setLoading(false); return undefined }
    const controller = new AbortController()
    setLoading(true)
    setLoadError(null)
    apiFetch('/api/gifts/purchases/me?limit=100', { signal: controller.signal })
      .then(({ ok, status, data }) => {
        if (ok) setPurchases(data.purchases || [])
        else setLoadError(status === 0 ? t(lang, 'common.offline') : t(lang, 'common.error'))
        setLoading(false)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [lang, reloadKey])

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
    return (
      <div className="purchase-list" aria-busy="true" aria-label={t(lang, 'common.loading')}>
        {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="purchase-skeleton" />)}
      </div>
    )
  }

  if (loadError) {
    return <ErrorState lang={lang} text={loadError} onRetry={() => setReloadKey((k) => k + 1)} />
  }

  if (purchases.length === 0) {
    return (
      <EmptyState
        icon={<Gift size={28} />}
        title={t(lang, 'mygifts.empty')}
        text={insideTelegram() ? t(lang, 'mygifts.emptyHint') : t(lang, 'common.openInTelegram')}
        action={(
          <button type="button" className="btn btn-primary btn-md" onClick={onOpenShop}>
            <Gift size={18} /><span>{t(lang, 'mygifts.openShop')}</span>
          </button>
        )}
      />
    )
  }

  return (
    <div className="my-gifts">
      <p className="muted-line">{t(lang, 'mygifts.total', { count: purchases.length })}</p>
      {personaCodes.length > 1 && (
        <ChipRow
          label={t(lang, 'shop.to')}
          value={displayPersona}
          onChange={setSelectedPersona}
          items={personaCodes.map((code) => ({
            value: code,
            label: personaName(code),
            avatar: code !== 'all' ? <PersonaAvatar code={code} name={personaName(code)} size={24} /> : null,
          }))}
        />
      )}
      <ul className="purchase-list">
        {displayPurchases.map((purchase) => (
          <li key={purchase.id} className="purchase">
            <div className="purchase-art" aria-hidden="true">{purchase.emoji}</div>
            <div className="purchase-body">
              <div className="purchase-name">{purchaseName(purchase, lang)}</div>
              <div className="purchase-meta">
                <span>{t(lang, 'mygifts.for')} {personaName(purchase.persona)}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={String(purchase.created_at || '').replace(' ', 'T')}>{formatDate(purchase.created_at, lang)}</time>
              </div>
              {purchase.persona_reaction && (
                <figure className="reaction">
                  <figcaption className="reaction-author">
                    {purchase.persona && purchase.persona !== 'all' && (
                      <PersonaAvatar code={purchase.persona} name={personaName(purchase.persona)} size={20} />
                    )}
                    {t(lang, 'mygifts.replied', { name: personaName(purchase.persona) })}
                  </figcaption>
                  <blockquote className="reaction-text">{purchase.persona_reaction}</blockquote>
                </figure>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
