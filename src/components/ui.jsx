import React, { useEffect, useRef } from 'react'
import { RotateCw, Star } from 'lucide-react'
import { buildLocalCandidates, haptic } from '../utils/api'
import { t } from '../i18n'

/** Telegram Stars price mark. */
export function StarsIcon({ size = 14 }) {
  return <Star size={size} className="stars-icon" fill="currentColor" strokeWidth={0} />
}

/** Exclusive choice between a few views or sort orders (buttons with aria-pressed). */
export function Segmented({ options, value, onChange, label, size = 'md' }) {
  return (
    <div className={`segmented segmented-${size}`} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="segmented-item"
          aria-pressed={value === option.value}
          onClick={() => {
            if (value === option.value) return
            haptic('selection')
            onChange(option.value)
          }}
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  )
}

/** Horizontally scrolling single-choice chip row. */
export function ChipRow({ items, value, onChange, label }) {
  const row = useRef(null)

  // Bring a preselected chip (e.g. the persona opened from her profile) into view, without scrolling the page
  useEffect(() => {
    const el = row.current
    const chip = el?.querySelector('[aria-pressed="true"]')
    if (!el || !chip) return
    const target = chip.offsetLeft - (el.clientWidth - chip.offsetWidth) / 2
    if (target > 0) el.scrollLeft = target
  }, [])

  return (
    <div className="chip-row" role="group" aria-label={label} ref={row}>
      {items.map((item) => (
        <button
          key={item.value ?? 'all'}
          type="button"
          className="chip"
          aria-pressed={value === item.value}
          onClick={() => {
            if (value === item.value) return
            haptic('selection')
            onChange(item.value)
          }}
        >
          {item.avatar}
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}

/** Round photo of a persona (first bundled photo), initial as a fallback. */
export function PersonaAvatar({ code, name = '', size = 28 }) {
  const src = buildLocalCandidates(code)[0]
  return (
    <span className="persona-avatar" style={{ width: size, height: size }} aria-hidden="true">
      {src ? <img src={src} alt="" loading="lazy" decoding="async" /> : <span>{String(name).slice(0, 1)}</span>}
    </span>
  )
}

export function EmptyState({ icon, title, text, action }) {
  return (
    <div className="state">
      {icon && <div className="state-icon" aria-hidden="true">{icon}</div>}
      <h2 className="state-title">{title}</h2>
      {text && <p className="state-text">{text}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ lang, text, onRetry }) {
  return (
    <div className="state" role="alert">
      <h2 className="state-title">{text}</h2>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-md" onClick={onRetry}>
          <RotateCw size={18} />
          <span>{t(lang, 'common.retry')}</span>
        </button>
      )}
    </div>
  )
}

export function Skeleton({ className = '', style }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />
}
