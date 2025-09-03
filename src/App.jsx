import React, { useMemo } from 'react'
import { PERSONAS } from './personas'

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
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>
        Kızını seç ve sohbet et / Выбери девушку и общайся
      </h2>
      <p style={{ opacity: 0.8 }}>
        Tüm yanıtlar önce Türkçe, sonra aynı mesajda Rusça kopyalanır. <br/>
        Все ответы сначала на турецком, затем дублируются на русском.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {PERSONAS.map(p => (
          <div key={p.code} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12, background: 'white' }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{p.name_tr} / {p.name_ru}</div>
            <div style={{ marginTop: 6, color: '#555' }}>{p.tagline_tr} — {p.tagline_ru}</div>
            <div style={{ height: 120, marginTop: 8, background: '#f4f4f4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              Foto sonra eklenecek / Фото добавим позже
            </div>
            <button onClick={() => handleSelect(p.code)} style={{ marginTop: 10, width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none', background: '#2ea6ff', color: 'white', fontWeight: 600 }}>
              Seç / Выбрать
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <button onClick={handleClose} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', background: 'white' }}>
          Sohbete dön / Вернуться в чат
        </button>
      </div>
    </div>
  )
}
