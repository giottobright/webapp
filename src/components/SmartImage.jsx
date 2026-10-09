import React, { useMemo, useState, useEffect } from 'react'
import { buildExternalCandidates, buildLocalCandidates, getLang } from '../utils/api'
import { t } from '../i18n'

export default function SmartImage({ code, alt, className = '' }) {
  // Bundled WebP first (fast, cached with the app), external originals as a fallback
  const sources = useMemo(() => [...buildLocalCandidates(code), ...buildExternalCandidates(code)], [code])
  const [idx, setIdx] = useState(0)
  const src = sources[idx] || ''

  useEffect(() => { setIdx(0) }, [code])

  if (!sources.length) {
    return <div className={`photo-fallback ${className}`}>{t(getLang(), 'photo.soon')}</div>
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setIdx((i) => (i + 1 < sources.length ? i + 1 : i))}
    />
  )
}
