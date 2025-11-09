import React, { useMemo, useState, useEffect } from 'react'
import { PERSONAS } from './personas'

// Vite will bundle static photos from /photo using import.meta.glob
const PHOTO_GLOB = import.meta && import.meta.glob ? import.meta.glob('../photo/*.{png,jpg,jpeg,webp,avif}', { eager: true }) : {}

// Optional: external S3/HTTP base for photos. If set, files are taken from there
// Expected naming in bucket now: elif1.png (primary), elif2.png, elif3.png
const ASSETS_BASE = (import.meta && import.meta.env && import.meta.env.VITE_ASSETS_BASE) ? String(import.meta.env.VITE_ASSETS_BASE).replace(/\/$/, '') : ''

// API base URL - smart detection
function getApiBase() {
  // 1. Try from environment variable first (explicit configuration)
  if (import.meta.env.VITE_API_BASE) {
    const base = import.meta.env.VITE_API_BASE.trim()
    if (base) {
      return base.replace(/\/$/, '')
    }
  }
  
  // 2. Try to detect from current location
  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    const hostname = window.location.hostname
    
    // Development: use localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000'
    }
    
    // Production: try different strategies
    // Strategy 1: Same origin (if backend is proxied through same domain)
    // Strategy 2: Try to construct backend URL from webapp URL
    
    // If webapp is on subdomain like webapp.hayalkiz.com, try api.hayalkiz.com
    if (hostname.includes('webapp') || hostname.includes('mini-app') || hostname.includes('app')) {
      const baseDomain = hostname.replace(/^(webapp|mini-app|app)\.?/, '')
      if (baseDomain) {
        // Try api subdomain
        const apiUrl = `https://api.${baseDomain}`
        console.log('🔗 Trying API subdomain:', apiUrl)
        return apiUrl
      }
    }
    
    // Strategy 3: Use same origin (backend handles /api routes)
    // This works if nginx/proxy routes /api/* to backend
    return origin
  }
  
  // Final fallback
  return 'http://localhost:8000'
}

const API_BASE = getApiBase()

// Log API base for debugging
if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', API_BASE)
  console.log('📍 Current origin:', window.location.origin)
}

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

function PersonaDetail({ persona, onClose, onSelect, onOpenShop }) {
  const lang = navigator.language?.startsWith('ru') ? 'ru' : 'tr'
  const name = lang === 'ru' ? persona.name_ru : persona.name_tr
  const tagline = lang === 'ru' ? persona.tagline_ru : persona.tagline_tr
  const tags = lang === 'ru' ? persona.tags_ru : persona.tags_tr
  const bio = lang === 'ru' ? persona.bio_ru : persona.bio_tr
  
  const [purchases, setPurchases] = React.useState([])
  const [loadingPurchases, setLoadingPurchases] = React.useState(true)

  React.useEffect(() => {
    document.body.style.overflow = 'hidden'
    loadPurchases()
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  const loadPurchases = async () => {
    try {
      const t = getTg()
      const userId = t?.initDataUnsafe?.user?.id || 'test_user'
      
      const response = await fetch(`${API_BASE}/api/gifts/purchases/${userId}?persona=${persona.code}&limit=10`)
      const data = await response.json()
      
      if (data.ok) {
        setPurchases(data.purchases || [])
      }
    } catch (error) {
      console.error('Failed to load purchases:', error)
    } finally {
      setLoadingPurchases(false)
    }
  }

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

  const handleShopClick = () => {
    const t = getTg()
    if (t) {
      try { t.HapticFeedback.impactOccurred('light') } catch (_) {}
    }
    onOpenShop(persona)
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

          {!loadingPurchases && purchases.length > 0 && (
            <div className="detail-gifts">
              <h3 className="gifts-title">
                {lang === 'ru' ? '🎁 Твои подарки' : '🎁 Hediyelerin'}
              </h3>
              <div className="gifts-list">
                {purchases.map((purchase, idx) => {
                  const giftName = lang === 'ru' ? purchase.name_ru : purchase.name_tr
                  return (
                    <div key={idx} className="gift-item">
                      <span className="gift-emoji">{purchase.emoji}</span>
                      <span className="gift-label">{giftName}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="detail-actions">
            <button className="select-btn primary" onClick={handleSelect}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>{lang === 'ru' ? 'Начать общение' : 'Sohbete Başla'}</span>
            </button>
            
            <button className="select-btn secondary" onClick={handleShopClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>{lang === 'ru' ? '🎁 Магазин подарков' : '🎁 Hediye Dükkanı'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function GiftShop({ persona, onClose, onBack }) {
  const lang = navigator.language?.startsWith('ru') ? 'ru' : 'tr'
  const [gifts, setGifts] = React.useState([])
  const [categories, setCategories] = React.useState([])
  const [selectedCategory, setSelectedCategory] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [purchasing, setPurchasing] = React.useState(null)

  React.useEffect(() => {
    document.body.style.overflow = 'hidden'
    loadGifts()
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  const loadGifts = async () => {
    try {
      console.log('Loading gifts from:', `${API_BASE}/api/gifts?language=${lang}`)
      
      const response = await fetch(`${API_BASE}/api/gifts?language=${lang}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Response status:', response.status, response.ok)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Gifts data received:', data)
      
      if (data.ok) {
        const giftsList = data.gifts || []
        const categoriesList = data.categories || []
        console.log(`Loaded ${giftsList.length} gifts and ${categoriesList.length} categories`)
        setGifts(giftsList)
        setCategories(categoriesList)
        
        if (giftsList.length === 0) {
          console.warn('⚠️ No gifts found in database. Make sure migration 006_gift_shop_system.sql is applied.')
        }
      } else {
        console.error('API returned error:', data.error)
        // Still set empty arrays to show empty state
        setGifts([])
        setCategories([])
      }
    } catch (error) {
      console.error('Failed to load gifts:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        apiBase: API_BASE,
        url: `${API_BASE}/api/gifts?language=${lang}`
      })
      
      // Set empty arrays on error so UI shows empty state
      setGifts([])
      setCategories([])
      
      // Show user-friendly error in console for debugging
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.error('🌐 Network error - возможно проблема с CORS или неправильный API URL')
        console.error('💡 Проверьте:')
        console.error('   1. Правильно ли настроен VITE_API_BASE в .env')
        console.error('   2. Доступен ли backend по адресу:', API_BASE)
        console.error('   3. Настроен ли CORS на backend для этого домена')
      }
    } finally {
      setLoading(false)
    }
  }
  
  // If persona is 'all', don't filter by persona in purchase
  const isAllPersonas = persona?.code === 'all'

  const handlePurchase = async (gift) => {
    const t = getTg()
    if (t) {
      try { t.HapticFeedback.impactOccurred('medium') } catch (_) {}
    }

    setPurchasing(gift.code)

    try {
      // Get user ID from Telegram
      const userId = t?.initDataUnsafe?.user?.id || 'test_user'
      
      // If no specific persona, use first persona or 'all'
      const personaCode = isAllPersonas ? 'all' : persona.code
      
      const response = await fetch(`${API_BASE}/api/gifts/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          gift_code: gift.code,
          persona: personaCode,
          context_type: 'shop'
        })
      })

      const data = await response.json()

      if (data.ok) {
        // Success notification
        if (t) {
          try { t.HapticFeedback.notificationOccurred('success') } catch (_) {}
        }
        
        const personaName = isAllPersonas 
          ? (lang === 'ru' ? 'девушкам' : 'kızlara')
          : (lang === 'ru' ? persona.name_ru : persona.name_tr)
        
        const successMsg = lang === 'ru' 
          ? `✅ ${gift.emoji} ${gift.name} подарено ${personaName}!`
          : `✅ ${gift.emoji} ${gift.name}, ${personaName}'e hediye edildi!`
        
        if (t && t.showAlert) {
          t.showAlert(successMsg)
        } else {
          alert(successMsg)
        }
      } else {
        throw new Error(data.error || 'Purchase failed')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      if (t) {
        try { t.HapticFeedback.notificationOccurred('error') } catch (_) {}
      }
      const errorMsg = lang === 'ru' ? 'Ошибка покупки' : 'Satın alma hatası'
      if (t && t.showAlert) {
        t.showAlert(errorMsg)
      } else {
        alert(errorMsg)
      }
    } finally {
      setPurchasing(null)
    }
  }

  const handleClose = () => {
    const t = getTg()
    if (t) {
      try { t.HapticFeedback.impactOccurred('light') } catch (_) {}
    }
    onClose()
  }

  const handleBackClick = () => {
    const t = getTg()
    if (t) {
      try { t.HapticFeedback.impactOccurred('light') } catch (_) {}
    }
    onBack()
  }

  const filteredGifts = selectedCategory
    ? gifts.filter(g => g.category === selectedCategory)
    : gifts

  const personaName = isAllPersonas 
    ? (lang === 'ru' ? 'Все девушки' : 'Tüm kızlar')
    : (lang === 'ru' ? persona.name_ru : persona.name_tr)

  return (
    <div className="shop-overlay" onClick={handleClose}>
      <div className="shop-content" onClick={(e) => e.stopPropagation()}>
        <div className="shop-header">
          {!isAllPersonas && (
            <button className="back-btn" onClick={handleBackClick}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
          )}
          {isAllPersonas && <div style={{ width: '40px' }}></div>}
          <div className="shop-title-section">
            <h2 className="shop-title">
              {lang === 'ru' ? '🎁 Магазин подарков' : '🎁 Hediye Dükkanı'}
            </h2>
            {!isAllPersonas && (
              <p className="shop-subtitle">
                {lang === 'ru' ? `для ${personaName}` : `${personaName} için`}
              </p>
            )}
          </div>
          <button className="close-btn" onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {categories.length > 0 && (
          <div className="categories-scroll">
            <button
              className={`category-chip ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              {lang === 'ru' ? 'Все' : 'Tümü'}
            </button>
            {categories.map(cat => (
              <button
                key={cat.code}
                className={`category-chip ${selectedCategory === cat.code ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.code)}
              >
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        )}

        <div className="shop-grid">
          {loading ? (
            <div className="shop-loading">
              <div className="spinner"></div>
              <p>{lang === 'ru' ? 'Загрузка...' : 'Yükleniyor...'}</p>
            </div>
          ) : filteredGifts.length > 0 ? (
            filteredGifts.map(gift => (
              <div key={gift.code} className="gift-card">
                <div className="gift-icon">{gift.emoji}</div>
                <div className="gift-info">
                  <h3 className="gift-name">{gift.name}</h3>
                  <p className="gift-description">{gift.description}</p>
                  <div className="gift-price">
                    {gift.price === 0 ? (
                      <span className="price-free">
                        {lang === 'ru' ? 'Бесплатно' : 'Ücretsiz'}
                      </span>
                    ) : (
                      <span className="price-stars">⭐ {gift.price}</span>
                    )}
                  </div>
                </div>
                <button
                  className={`gift-buy-btn ${purchasing === gift.code ? 'purchasing' : ''}`}
                  onClick={() => handlePurchase(gift)}
                  disabled={purchasing === gift.code}
                >
                  {purchasing === gift.code ? (
                    <span className="btn-spinner"></span>
                  ) : (
                    <span>{lang === 'ru' ? '🎁 Подарить' : '🎁 Hediye Et'}</span>
                  )}
                </button>
              </div>
            ))
          ) : (
            <div className="shop-empty">
              {gifts.length === 0 ? (
                <>
                  <p style={{ fontSize: '18px', marginBottom: '8px' }}>📦</p>
                  <p style={{ fontWeight: 600, marginBottom: '4px' }}>
                    {lang === 'ru' ? 'Магазин пуст' : 'Mağaza boş'}
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {lang === 'ru' 
                      ? 'Подарки загружаются или их нет в базе данных' 
                      : 'Hediyeler yükleniyor veya veritabanında yok'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px' }}>
                    API: {API_BASE}/api/gifts
                  </p>
                </>
              ) : (
                <p>{lang === 'ru' ? 'Нет подарков в этой категории' : 'Bu kategoride hediye yok'}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState('list') // 'list', 'detail', 'shop'
  const [selectedPersona, setSelectedPersona] = useState(null)
  const [shopPersona, setShopPersona] = useState(null)
  const lang = navigator.language?.startsWith('ru') ? 'ru' : 'tr'

  React.useEffect(() => {
    // Wait a bit for Telegram WebApp to be fully initialized
    const initTelegram = () => {
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
        
        // Disable vertical swipes to prevent closing
        try {
          t.disableVerticalSwipes()
        } catch (_) {}
      }
    }
    
    // Try immediately
    initTelegram()
    
    // Also try after a short delay in case script loaded late
    const timeout = setTimeout(initTelegram, 100)
    
    return () => clearTimeout(timeout)
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
    setView('detail')
  }

  const handleCloseDetail = () => {
    setSelectedPersona(null)
    setView('list')
  }

  const handleOpenShop = (persona) => {
    setShopPersona(persona)
    setView('shop')
  }

  const handleCloseShop = () => {
    setShopPersona(null)
    setView('list')
    setSelectedPersona(null)
  }

  const handleBackToDetail = () => {
    if (selectedPersona) {
      setView('detail')
    } else {
      setView('list')
    }
  }
  
  const handleOpenShopFromDetail = (persona) => {
    setShopPersona(persona)
    setView('shop')
  }

  const handleOpenShopFromMain = () => {
    const t = getTg()
    if (t) {
      try { t.HapticFeedback.impactOccurred('light') } catch (_) {}
    }
    // Open shop without specific persona (show all gifts)
    setShopPersona({ code: 'all', name_ru: 'Все девушки', name_tr: 'Tüm kızlar' })
    setView('shop')
  }

  return (
    <div className="app">
      {view === 'list' && (
        <>
          <header className="header">
            <h1 className="title">
              {lang === 'ru' ? 'Исследуй' : 'Keşfet'}
            </h1>
            <p className="subtitle">
              {lang === 'ru' 
                ? 'Выбери девушку и начни увлекательное общение' 
                : 'Bir kız seç ve heyecanlı sohbete başla'}
            </p>
            
            <button className="shop-button-main" onClick={handleOpenShopFromMain}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>{lang === 'ru' ? '🎁 Магазин подарков' : '🎁 Hediye Dükkanı'}</span>
            </button>
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
        </>
      )}

      {view === 'detail' && selectedPersona && (
        <PersonaDetail
          persona={selectedPersona}
          onClose={handleCloseDetail}
          onSelect={() => handleSelect(selectedPersona.code)}
          onOpenShop={handleOpenShopFromDetail}
        />
      )}

      {view === 'shop' && shopPersona && (
        <GiftShop
          persona={shopPersona}
          onClose={handleCloseShop}
          onBack={handleBackToDetail}
        />
      )}
    </div>
  )
}

