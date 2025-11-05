import React, { useMemo, useState } from 'react'
import { PERSONAS } from './personas'

// Vite will bundle static photos from /photo using import.meta.glob
const PHOTO_GLOB = import.meta && import.meta.glob ? import.meta.glob('../photo/*.{png,jpg,jpeg,webp,avif}', { eager: true }) : {}

// Optional: external S3/HTTP base for photos. If set, files are taken from there
// Expected naming in bucket now: elif1.png (primary), elif2.png, elif3.png
const ASSETS_BASE = (import.meta && import.meta.env && import.meta.env.VITE_ASSETS_BASE) ? String(import.meta.env.VITE_ASSETS_BASE).replace(/\/$/, '') : ''

function buildLocalCandidates(code) {
  const normalized = String(code).toLowerCase()
  const entries = Object.entries(PHOTO_GLOB)
  const findByBase = (baseName) => {
    const entry = entries.find(([path]) => {
      const file = path.split('/').pop() || ''
      const base = file.replace(/\.(png|jpg|jpeg|webp|avif)$/i, '')
      return base.toLowerCase() === baseName.toLowerCase()
    })
    if (!entry) return null
    const mod = entry[1]
    return (mod && mod.default) ? mod.default : mod
  }
  // Prefer the primary (1) image first, then fallbacks (2, 3)
  return [
    findByBase(`${normalized}1`),
    findByBase(`${normalized}2`),
    findByBase(`${normalized}3`),
  ].filter(Boolean)
}

function buildExternalCandidates(code) {
  const normalized = String(code).toLowerCase()
  if (!ASSETS_BASE) return []
  // Prefer the primary (1) image first, then fallbacks (2, 3)
  return [
    `${ASSETS_BASE}/${normalized}1.png`,
    `${ASSETS_BASE}/${normalized}2.png`,
    `${ASSETS_BASE}/${normalized}3.png`,
  ]
}

function SmartImage({ code, alt, className = '' }) {
  const sources = useMemo(() => {
    return [...buildExternalCandidates(code), ...buildLocalCandidates(code)]
  }, [code])

  const [idx, setIdx] = React.useState(0)
  const src = sources[idx] || ''

  React.useEffect(() => {
    setIdx(0)
  }, [code])

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

function getTg() {
  if (typeof window === 'undefined') return null
  return window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null
}

function PersonaCard({ persona, onClick }) {
  const lang = navigator.language?.startsWith('ru') ? 'ru' : 'tr'
  const name = lang === 'ru' ? persona.name_ru : persona.name_tr
  const tagline = lang === 'ru' ? persona.tagline_ru : persona.tagline_tr

  return (
    <div className="persona-card" onClick={onClick}>
      <div className="persona-card-image">
        <SmartImage code={persona.code} alt={name} className="card-img" />
        <div className="card-gradient"></div>
        <div className="card-info">
          <div className="card-name">{name}, {persona.age}</div>
          <div className="card-status">● В реальном времени</div>
        </div>
      </div>
    </div>
  )
}

function PersonaDetail({ persona, onClose, onSelect }) {
  const lang = navigator.language?.startsWith('ru') ? 'ru' : 'tr'
  const name = lang === 'ru' ? persona.name_ru : persona.name_tr
  const tagline = lang === 'ru' ? persona.tagline_ru : persona.tagline_tr
  const tags = lang === 'ru' ? persona.tags_ru : persona.tags_tr
  const bio = lang === 'ru' ? persona.bio_ru : persona.bio_tr

  React.useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  const handleSelect = () => {
    const t = getTg()
    if (t) {
      try { t.HapticFeedback.impactOccurred('medium') } catch (_) {}
    }
    onSelect()
  }

  const handleClose = () => {
    const t = getTg()
    if (t) {
      try { t.HapticFeedback.impactOccurred('light') } catch (_) {}
    }
    onClose()
  }

  return (
    <div className="detail-overlay" onClick={handleClose}>
      <div className="detail-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="detail-image">
          <SmartImage code={persona.code} alt={name} className="detail-img" />
          <div className="detail-gradient"></div>
        </div>

        <div className="detail-info">
          <div className="detail-header">
            <div className="detail-name-age">
              <h1 className="detail-name">{name}, {persona.age}</h1>
              <div className="detail-status">
                <span className="status-dot">●</span>
                <span>{lang === 'ru' ? 'В реальном времени' : 'Gerçek zamanlı'}</span>
              </div>
            </div>
            <div className="detail-tagline">{tagline}</div>
          </div>

          <div className="detail-bio">
            <p>{bio}</p>
          </div>

          <div className="detail-tags">
            {tags.map((tag, idx) => (
              <span key={idx} className="tag">{tag}</span>
            ))}
          </div>

          <button className="select-btn" onClick={handleSelect}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>{lang === 'ru' ? 'Начать общение' : 'Sohbete Başla'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [selectedPersona, setSelectedPersona] = useState(null)
  const lang = navigator.language?.startsWith('ru') ? 'ru' : 'tr'

  React.useEffect(() => {
    const t = getTg()
    if (t) {
      t.ready()
      try { t.expand() } catch (_) {}
      try { t.MainButton.hide() } catch (_) {}
      // Set theme colors
      try {
        t.setHeaderColor('#000000')
        t.setBackgroundColor('#000000')
      } catch (_) {}
    }
  }, [])

  const handleSelect = (code) => {
    const payload = JSON.stringify({ persona: code })
    const t = getTg()
    if (t) {
      t.sendData(payload)
      try { t.HapticFeedback.notificationOccurred('success') } catch (_) {}
      setTimeout(() => {
        try { t.close() } catch (_) {}
      }, 300)
    } else {
      alert('Telegram WebApp ortamı yok / Нет окружения Telegram WebApp')
    }
  }

  const handleCardClick = (persona) => {
    const t = getTg()
    if (t) {
      try { t.HapticFeedback.impactOccurred('light') } catch (_) {}
    }
    setSelectedPersona(persona)
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">
          {lang === 'ru' ? 'Исследуй' : 'Keşfet'}
        </h1>
        <p className="subtitle">
          {lang === 'ru' 
            ? 'Выбери девушку и начни увлекательное общение' 
            : 'Bir kız seç ve heyecanlı sohbete başla'}
        </p>
      </header>

      <div className="grid">
        {PERSONAS.map(p => (
          <PersonaCard 
            key={p.code} 
            persona={p} 
            onClick={() => handleCardClick(p)}
          />
        ))}
      </div>

      {selectedPersona && (
        <PersonaDetail
          persona={selectedPersona}
          onClose={() => setSelectedPersona(null)}
          onSelect={() => handleSelect(selectedPersona.code)}
        />
      )}
    </div>
  )
}
