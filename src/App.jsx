import React, { useMemo, useState, useEffect } from 'react'
import { PERSONAS } from './personas'

// Vite will bundle static photos from /photo using import.meta.glob
const PHOTO_GLOB = import.meta && import.meta.glob ? import.meta.glob('../photo/*.{png,jpg,jpeg,webp,avif}', { eager: true }) : {}

// Optional: external S3/HTTP base for photos
const ASSETS_BASE = (import.meta && import.meta.env && import.meta.env.VITE_ASSETS_BASE) ? String(import.meta.env.VITE_ASSETS_BASE).replace(/\/$/, '') : ''

// API base URL - smart detection
function getApiBase() {
  if (import.meta.env.VITE_API_BASE) {
    const base = import.meta.env.VITE_API_BASE.trim()
    if (base) {
      return base.replace(/\/$/, '')
    }
  }
  
  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    const hostname = window.location.hostname
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000'
    }
    
    if (hostname.includes('webapp') || hostname.includes('mini-app') || hostname.includes('app')) {
      const baseDomain = hostname.replace(/^(webapp|mini-app|app)\.?/, '')
      if (baseDomain) {
        return `https://api.${baseDomain}`
      }
    }
    
    return origin
  }
  
  return 'http://localhost:8000'
}

const API_BASE = getApiBase()

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
  return [
    findByBase(`${normalized}1`),
    findByBase(`${normalized}2`),
    findByBase(`${normalized}3`),
  ].filter(Boolean)
}

function buildExternalCandidates(code) {
  const normalized = String(code).toLowerCase()
  if (!ASSETS_BASE) return []
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

// ============================================
// BOTTOM NAVIGATION
// ============================================
function BottomNavigation({ activeTab, onTabChange }) {
  const lang = navigator.language?.startsWith('ru') ? 'ru' : 'tr'
  
  const tabs = [
    { id: 'girls', icon: '👥', label: lang === 'ru' ? 'Девушки' : 'Kızlar' },
    { id: 'shop', icon: '🎁', label: lang === 'ru' ? 'Магазин' : 'Dükkan' },
    { id: 'mygifts', icon: '💝', label: lang === 'ru' ? 'Мои подарки' : 'Hediyelerim' },
  ]

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

// ============================================
// PERSONA CARD
// ============================================
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

// ============================================
// PERSONA DETAIL
// ============================================
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

// ============================================
// GIFT SHOP (Full Screen)
// ============================================
function GiftShop({ persona, onPurchaseSuccess }) {
  const lang = navigator.language?.startsWith('ru') ? 'ru' : 'tr'
  const [gifts, setGifts] = React.useState([])
  const [categories, setCategories] = React.useState([])
  const [selectedCategory, setSelectedCategory] = React.useState(null)
  const [shopSection, setShopSection] = React.useState('all') // 'all', 'popular', 'new'
  const [loading, setLoading] = React.useState(true)
  const [purchasing, setPurchasing] = React.useState(null)

  React.useEffect(() => {
    loadGifts()
  }, [])

  const loadGifts = async () => {
    try {
      console.log('Loading gifts from:', `${API_BASE}/api/gifts?language=${lang}`)
      
      const response = await fetch(`${API_BASE}/api/gifts?language=${lang}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
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
          console.warn('⚠️ No gifts found in database.')
        }
      } else {
        console.error('API returned error:', data.error)
        setGifts([])
        setCategories([])
      }
    } catch (error) {
      console.error('Failed to load gifts:', error)
      setGifts([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }
  
  const isAllPersonas = !persona || persona?.code === 'all'

  const handlePurchase = async (gift) => {
    const t = getTg()
    if (t) {
      try { t.HapticFeedback.impactOccurred('medium') } catch (_) {}
    }

    setPurchasing(gift.code)

    try {
      const userId = t?.initDataUnsafe?.user?.id || 'test_user'
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
        
        if (onPurchaseSuccess) {
          onPurchaseSuccess()
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

  const filteredGifts = React.useMemo(() => {
    let filtered = gifts
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(g => g.category === selectedCategory)
    }
    
    // Filter by section
    if (shopSection === 'popular') {
      filtered = [...filtered].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    } else if (shopSection === 'new') {
      filtered = [...filtered].sort((a, b) => (b.id || 0) - (a.id || 0))
    }
    
    return filtered
  }, [gifts, selectedCategory, shopSection])

  const personaName = isAllPersonas 
    ? (lang === 'ru' ? 'Все девушки' : 'Tüm kızlar')
    : (lang === 'ru' ? persona.name_ru : persona.name_tr)

  return (
    <div className="shop-screen">
      <div className="shop-header-main">
        <div className="shop-header-content">
          <h1 className="shop-main-title">
            {lang === 'ru' ? '🎁 Магазин подарков' : '🎁 Hediye Dükkanı'}
          </h1>
          {!isAllPersonas && (
            <p className="shop-main-subtitle">
              {lang === 'ru' ? `для ${personaName}` : `${personaName} için`}
            </p>
          )}
        </div>
      </div>

      {/* Shop Sections */}
      <div className="shop-sections">
        <button
          className={`shop-section-btn ${shopSection === 'all' ? 'active' : ''}`}
          onClick={() => setShopSection('all')}
        >
          {lang === 'ru' ? 'Все' : 'Tümü'}
        </button>
        <button
          className={`shop-section-btn ${shopSection === 'popular' ? 'active' : ''}`}
          onClick={() => setShopSection('popular')}
        >
          {lang === 'ru' ? '⭐ Популярное' : '⭐ Popüler'}
        </button>
        <button
          className={`shop-section-btn ${shopSection === 'new' ? 'active' : ''}`}
          onClick={() => setShopSection('new')}
        >
          {lang === 'ru' ? '✨ Новое' : '✨ Yeni'}
        </button>
      </div>

      {/* Categories */}
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

      {/* Gifts Grid */}
      <div className="shop-grid-main">
        {loading ? (
          <div className="shop-loading">
            <div className="spinner"></div>
            <p>{lang === 'ru' ? 'Загрузка...' : 'Yükleniyor...'}</p>
          </div>
        ) : filteredGifts.length > 0 ? (
          filteredGifts.map(gift => (
            <div key={gift.code} className="gift-card-new">
              <div className="gift-icon-large">{gift.emoji}</div>
              <div className="gift-info-new">
                <h3 className="gift-name-new">{gift.name}</h3>
                <p className="gift-description-new">{gift.description}</p>
                <div className="gift-price-new">
                  {gift.price === 0 ? (
                    <span className="price-free-new">
                      {lang === 'ru' ? 'Бесплатно' : 'Ücretsiz'}
                    </span>
                  ) : (
                    <span className="price-stars-new">⭐ {gift.price}</span>
                  )}
                </div>
              </div>
              <button
                className={`gift-buy-btn-new ${purchasing === gift.code ? 'purchasing' : ''}`}
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
              </>
            ) : (
              <p>{lang === 'ru' ? 'Нет подарков в этой категории' : 'Bu kategoride hediye yok'}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// MY GIFTS (Purchase History)
// ============================================
function MyGifts({ onOpenShop }) {
  const lang = navigator.language?.startsWith('ru') ? 'ru' : 'tr'
  const [purchases, setPurchases] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [selectedPersona, setSelectedPersona] = React.useState(null)

  React.useEffect(() => {
    loadAllPurchases()
  }, [])

  const loadAllPurchases = async () => {
    try {
      const t = getTg()
      const userId = t?.initDataUnsafe?.user?.id || 'test_user'
      
      const response = await fetch(`${API_BASE}/api/gifts/purchases/${userId}?limit=100`)
      const data = await response.json()
      
      if (data.ok) {
        setPurchases(data.purchases || [])
      }
    } catch (error) {
      console.error('Failed to load purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  // Group purchases by persona
  const purchasesByPersona = React.useMemo(() => {
    const grouped = {}
    purchases.forEach(purchase => {
      const persona = purchase.persona || 'all'
      if (!grouped[persona]) {
        grouped[persona] = []
      }
      grouped[persona].push(purchase)
    })
    return grouped
  }, [purchases])

  const allPersonas = Object.keys(purchasesByPersona)
  const displayPersona = selectedPersona || (allPersonas.length > 0 ? allPersonas[0] : null)
  const displayPurchases = displayPersona ? purchasesByPersona[displayPersona] || [] : []

  const getPersonaName = (code) => {
    if (code === 'all') return lang === 'ru' ? 'Все девушки' : 'Tüm kızlar'
    const persona = PERSONAS.find(p => p.code === code)
    return persona ? (lang === 'ru' ? persona.name_ru : persona.name_tr) : code
  }

  return (
    <div className="mygifts-screen">
      <div className="mygifts-header">
        <h1 className="mygifts-title">
          {lang === 'ru' ? '💝 Мои подарки' : '💝 Hediyelerim'}
        </h1>
        <p className="mygifts-subtitle">
          {lang === 'ru' 
            ? `Всего подарено: ${purchases.length}` 
            : `Toplam hediye: ${purchases.length}`}
        </p>
      </div>

      {loading ? (
        <div className="mygifts-loading">
          <div className="spinner"></div>
          <p>{lang === 'ru' ? 'Загрузка...' : 'Yükleniyor...'}</p>
        </div>
      ) : purchases.length === 0 ? (
        <div className="mygifts-empty">
          <div className="empty-icon">🎁</div>
          <h2>{lang === 'ru' ? 'Пока нет подарков' : 'Henüz hediye yok'}</h2>
          <p>{lang === 'ru' 
            ? 'Купите подарок в магазине, чтобы он появился здесь' 
            : 'Mağazadan hediye alın, burada görünsün'}</p>
          <button className="empty-shop-btn" onClick={onOpenShop}>
            {lang === 'ru' ? '🎁 Открыть магазин' : '🎁 Mağazayı Aç'}
          </button>
        </div>
      ) : (
        <>
          {/* Persona Filter */}
          {allPersonas.length > 1 && (
            <div className="persona-filter">
              {allPersonas.map(personaCode => (
                <button
                  key={personaCode}
                  className={`persona-filter-btn ${displayPersona === personaCode ? 'active' : ''}`}
                  onClick={() => setSelectedPersona(personaCode)}
                >
                  {getPersonaName(personaCode)}
                </button>
              ))}
            </div>
          )}

          {/* Purchases List */}
          <div className="purchases-list">
            {displayPurchases.map((purchase, idx) => {
              const giftName = lang === 'ru' ? purchase.name_ru : purchase.name_tr
              const date = new Date(purchase.created_at)
              const dateStr = date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'tr-TR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })
              
              return (
                <div key={idx} className="purchase-item">
                  <div className="purchase-icon">{purchase.emoji}</div>
                  <div className="purchase-info">
                    <div className="purchase-name">{giftName}</div>
                    <div className="purchase-meta">
                      <span className="purchase-persona">
                        {lang === 'ru' ? 'для' : 'için'} {getPersonaName(purchase.persona)}
                      </span>
                      <span className="purchase-date">{dateStr}</span>
                    </div>
                    {purchase.persona_reaction && (
                      <div className="purchase-reaction">
                        <span className="reaction-icon">💬</span>
                        <span className="reaction-text">{purchase.persona_reaction}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const [activeTab, setActiveTab] = useState('girls')
  const [selectedPersona, setSelectedPersona] = useState(null)
  const [shopPersona, setShopPersona] = useState(null)
  const lang = navigator.language?.startsWith('ru') ? 'ru' : 'tr'

  React.useEffect(() => {
    const initTelegram = () => {
      const t = getTg()
      if (t) {
        t.ready()
        try { t.expand() } catch (_) {}
        try { t.MainButton.hide() } catch (_) {}
        try {
          t.setHeaderColor('#000000')
          t.setBackgroundColor('#000000')
        } catch (_) {}
        try {
          t.disableVerticalSwipes()
        } catch (_) {}
      }
    }
    
    initTelegram()
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
  }

  const handleCloseDetail = () => {
    setSelectedPersona(null)
  }

  const handleOpenShop = (persona) => {
    setShopPersona(persona || { code: 'all', name_ru: 'Все девушки', name_tr: 'Tüm kızlar' })
    setActiveTab('shop')
  }

  const handleTabChange = (tab) => {
    const t = getTg()
    if (t) {
      try { t.HapticFeedback.impactOccurred('light') } catch (_) {}
    }
    setActiveTab(tab)
    if (tab === 'shop') {
      setShopPersona({ code: 'all', name_ru: 'Все девушки', name_tr: 'Tüm kızlar' })
    }
  }

  const handlePurchaseSuccess = () => {
    // Refresh purchases when gift is bought
    // This will be handled by MyGifts component
  }

  return (
    <div className="app">
      {/* Main Content */}
      <div className="app-content">
        {activeTab === 'girls' && (
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
                onClose={handleCloseDetail}
                onSelect={() => handleSelect(selectedPersona.code)}
                onOpenShop={handleOpenShop}
              />
            )}
          </>
        )}

        {activeTab === 'shop' && (
          <GiftShop 
            persona={shopPersona}
            onPurchaseSuccess={handlePurchaseSuccess}
          />
        )}

        {activeTab === 'mygifts' && (
          <MyGifts onOpenShop={() => handleOpenShop(null)} />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}
