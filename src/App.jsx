import React, { useMemo } from 'react'
import { PERSONAS } from './personas'

// Vite will bundle static photos from /photo using import.meta.glob
const PHOTO_GLOB = import.meta && import.meta.glob ? import.meta.glob('../photo/*.{png,jpg,jpeg,webp,avif}', { eager: true }) : {}

// Optional: external S3/HTTP base for photos. If set, files are taken from there
// Expected naming in bucket: elif.png, zeynep.png, melis.png, derya.png, irem.png, ayse.png, eylul.png, leyla.png
const ASSETS_BASE = (import.meta && import.meta.env && import.meta.env.VITE_ASSETS_BASE) ? String(import.meta.env.VITE_ASSETS_BASE).replace(/\/$/, '') : ''

function getPhotoSrcByCode(code) {
  const normalized = String(code).toLowerCase()

  // If external base URL is provided, construct URL directly
  if (ASSETS_BASE) {
    return `${ASSETS_BASE}/${normalized}.png`
  }

  // Else use bundled static assets
  const entry = Object.entries(PHOTO_GLOB).find(([path]) => {
    const file = path.split('/').pop() || ''
    const base = file.replace(/\.(png|jpg|jpeg|webp|avif)$/i, '')
    return base.toLowerCase() === normalized
  })
  if (!entry) return null
  const mod = entry[1]
  return (mod && mod.default) ? mod.default : mod
}

function getTg() {
  if (typeof window === 'undefined') return null
  return window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null
}

export default function App() {
  React.useEffect(() => {
    const t = getTg()
    if (t) {
      t.ready()
      try { t.expand() } catch (_) {}
      try { t.MainButton.hide() } catch (_) {}
    }
  }, [])

  const handleSelect = (code) => {
    const payload = JSON.stringify({ persona: code })
    const t = getTg()
    if (t) {
      t.sendData(payload)
      try { t.HapticFeedback.impactOccurred('light') } catch (_) {}
    } else {
      alert('Telegram WebApp ortamı yok / Нет окружения Telegram WebApp')
    }
  }

  const handleClose = () => {
    const t = getTg()
    if (t) t.close()
    else alert('Telegram WebApp kapatılamıyor / Невозможно закрыть WebApp')
  }

  return (
    <div className="app">
      <header className="header">
        <h2 className="title">Kızını seç ve sohbet et / Выбери девушку и общайся</h2>
        <p className="subtitle">
          Tüm yanıtlar önce Türkçe, sonra aynı mesajda Rusça kopyalanır. <br/>
          Все ответы сначала на турецком, затем дублируются на русском.
        </p>
      </header>

      <div className="grid">
        {PERSONAS.map(p => {
          const src = getPhotoSrcByCode(p.code)
          return (
            <div key={p.code} className="card">
              <div className="badge">{p.code}</div>
              <div className="card-title">{p.name_tr} / {p.name_ru}</div>
              <div className="card-tagline">{p.tagline_tr} — {p.tagline_ru}</div>
              <div className="photo">
                {src ? (
                  <img src={src} alt={`${p.name_tr} / ${p.name_ru}`} loading="lazy"/>
                ) : (
                  <div className="photo-fallback">Foto yakında / Фото скоро</div>
                )}
              </div>
              <div className="actions">
                <button onClick={() => handleSelect(p.code)} className="btn btn-primary">Seç / Выбрать</button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="footer">
        <button onClick={handleClose} className="btn btn-ghost">Sohbete dön / Вернуться в чат</button>
      </div>
    </div>
  )
}
