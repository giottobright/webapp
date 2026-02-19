import React, { useState, useEffect, useCallback } from 'react'
import { PERSONAS } from './personas'
import { getTg, getLang } from './utils/api'
import BottomNavigation from './components/BottomNavigation'
import PersonaCard from './components/PersonaCard'
import PersonaDetail from './components/PersonaDetail'
import GiftShop from './components/GiftShop'
import MyGifts from './components/MyGifts'
import PremiumPage from './components/PremiumPage'
import ReferralsPage from './components/ReferralsPage'
import ProfilePage from './components/ProfilePage'

export default function App() {
  const [activeTab, setActiveTab] = useState('girls')
  const [selectedPersona, setSelectedPersona] = useState(null)
  const [shopPersona, setShopPersona] = useState(null)
  const [pageKey, setPageKey] = useState(0)
  const lang = getLang()

  useEffect(() => {
    const initTelegram = () => {
      const t = getTg()
      if (t) {
        t.ready()
        try { t.expand() } catch (_) {}
        try { t.MainButton.hide() } catch (_) {}
        try { t.setHeaderColor('#000000'); t.setBackgroundColor('#000000') } catch (_) {}
        try { t.disableVerticalSwipes() } catch (_) {}
      }
    }
    initTelegram()
    const timeout = setTimeout(initTelegram, 100)
    return () => clearTimeout(timeout)
  }, [])

  const handleSelect = useCallback((code) => {
    const payload = JSON.stringify({ persona: code })
    const t = getTg()
    if (t) {
      t.sendData(payload)
      try { t.HapticFeedback.notificationOccurred('success') } catch (_) {}
      setTimeout(() => { try { t.close() } catch (_) {} }, 300)
    } else {
      alert('Telegram WebApp ortamı yok / Нет окружения Telegram WebApp')
    }
  }, [])

  const handleCardClick = useCallback((persona) => {
    try { getTg()?.HapticFeedback?.impactOccurred('light') } catch (_) {}
    setSelectedPersona(persona)
  }, [])

  const handleOpenShop = useCallback((persona) => {
    setShopPersona(persona || { code: 'all', name_ru: 'Все девушки', name_tr: 'Tüm kızlar' })
    setActiveTab('shop')
    setPageKey(k => k + 1)
  }, [])

  const handleTabChange = useCallback((tab) => {
    try { getTg()?.HapticFeedback?.impactOccurred('light') } catch (_) {}
    setActiveTab(tab)
    setPageKey(k => k + 1)
    if (tab === 'shop') setShopPersona({ code: 'all', name_ru: 'Все девушки', name_tr: 'Tüm kızlar' })
  }, [])

  return (
    <div className="app">
      <div className="app-content">
        {activeTab === 'girls' && (
          <div key={`girls-${pageKey}`} className="page-enter">
            <header className="header">
              <div className="header-brand">
                <h1 className="title">
                  {lang === 'ru' ? 'Исследуй' : 'Keşfet'}
                </h1>
                <div className="header-badge">
                  <span className="header-badge-dot"></span>
                  {PERSONAS.length} {lang === 'ru' ? 'онлайн' : 'çevrimiçi'}
                </div>
              </div>
              <p className="subtitle">
                {lang === 'ru'
                  ? 'Выбери девушку и начни увлекательное общение'
                  : 'Bir kız seç ve heyecanlı sohbete başla'}
              </p>
            </header>
            <div className="grid">
              {PERSONAS.map(p => (
                <PersonaCard key={p.code} persona={p} onClick={() => handleCardClick(p)} />
              ))}
            </div>
            {selectedPersona && (
              <PersonaDetail
                persona={selectedPersona}
                onClose={() => setSelectedPersona(null)}
                onSelect={() => handleSelect(selectedPersona.code)}
                onOpenShop={handleOpenShop}
              />
            )}
          </div>
        )}
        {activeTab === 'shop' && (
          <div key={`shop-${pageKey}`} className="page-enter">
            <GiftShop persona={shopPersona} onPurchaseSuccess={() => {}} />
          </div>
        )}
        {activeTab === 'mygifts' && (
          <div key={`mygifts-${pageKey}`} className="page-enter">
            <MyGifts onOpenShop={() => handleOpenShop(null)} />
          </div>
        )}
        {activeTab === 'premium' && (
          <div key={`premium-${pageKey}`} className="page-enter">
            <PremiumPage />
          </div>
        )}
        {activeTab === 'referrals' && (
          <div key={`referrals-${pageKey}`} className="page-enter">
            <ReferralsPage />
          </div>
        )}
        {activeTab === 'profile' && (
          <div key={`profile-${pageKey}`} className="page-enter">
            <ProfilePage />
          </div>
        )}
      </div>
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}
