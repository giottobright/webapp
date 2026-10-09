import React, { useCallback, useMemo, useState } from 'react'
import { buildExternalCandidates, buildLocalCandidates, getLang } from '../utils/api'
import { t } from '../i18n'

/** Persona photo: bundled WebP first, external originals as a fallback; fades in once decoded. */
export default function SmartImage({ code, alt, className = '', src: fixedSrc, eager = false }) {
  const sources = useMemo(
    () => (fixedSrc ? [fixedSrc] : [...buildLocalCandidates(code), ...buildExternalCandidates(code)]),
    [code, fixedSrc],
  )
  const [idx, setIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const src = sources[idx] || ''

  // Reset when the photo changes (during render, so a cached image's ref check below is not undone)
  const key = `${code}|${fixedSrc || ''}`
  const [stateKey, setStateKey] = useState(key)
  if (stateKey !== key) {
    setStateKey(key)
    setIdx(0)
    setLoaded(false)
    setFailed(false)
  }

  // A cached image can finish decoding before React attaches onLoad
  const imgRef = useCallback((img) => {
    if (img?.complete && img.naturalWidth > 0) setLoaded(true)
  }, [])

  if (!sources.length || failed) {
    return <div className={`photo-fallback ${className}`}>{t(getLang(), 'photo.soon')}</div>
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={`smart-img ${loaded ? 'is-loaded' : ''} ${className}`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable="false"
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (idx + 1 < sources.length) setIdx(idx + 1)
        else setFailed(true)
      }}
    />
  )
}
