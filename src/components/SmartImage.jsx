import React, { useMemo, useState, useEffect } from 'react'
import { buildExternalCandidates, buildLocalCandidates } from '../utils/api'

export default function SmartImage({ code, alt, className = '' }) {
  const sources = useMemo(() => [...buildExternalCandidates(code), ...buildLocalCandidates(code)], [code])
  const [idx, setIdx] = useState(0)
  const src = sources[idx] || ''

  useEffect(() => { setIdx(0) }, [code])

  if (!sources.length) {
    return <div className={`photo-fallback ${className}`}>Foto yakında / Фото скоро</div>
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setIdx((i) => (i + 1 < sources.length ? i + 1 : i))}
    />
  )
}
