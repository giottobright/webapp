import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { PERSONAS } from './personas'
import { apiFetch, getLang, getStartParams, getTg, haptic, insideTelegram, showAlert } from './utils/api'
import { localizePersona, t } from './i18n'
import BottomNavigation from './components/BottomNavigation'
import PersonaCard from './components/PersonaCard'
import PersonaDetail from './components/PersonaDetail'
import GiftShop from './components/GiftShop'
import PremiumPage from './components/PremiumPage'
import ReferralsPage from './components/ReferralsPage'
import ProfilePage from './components/ProfilePage'

const TABS = ['girls', 'shop', 'referrals', 'profile', 'premium']

export default function App() {
  const lang = getLang()
  const start = useMemo(() => getStartParams(), [])
  const [activeTab, setActiveTab] = useState(TABS.includes(start.tab) ? start.tab : 'girls')
  const [personaCatalog, setPersonaCatalog] = useState(PERSONAS)
  const [selectedPersona, setSelectedPersona] = useState(null)
  const [shopPersonaCode, setShopPersonaCode] = useState(start.tab === 'shop' ? start.persona : null)
  const [pageKey, setPageKey] = useState(0)

  const personas = useMemo(() => personaCatalog.map((p) => localizePersona(p, lang)), [personaCatalog, lang])

  useEffect(() => {
    const tg = getTg()
    if (tg) {
      try { tg.ready() } catch (_) {}
      try { tg.expand() } catch (_) {}
      try { tg.setHeaderColor('#07060F'); tg.setBackgroundColor('#07060F') } catch (_) {}
      try { tg.disableVerticalSwipes() } catch (_) {}
    }
    const controller = new AbortController()
    apiFetch('/api/personas', { signal: controller.signal })
      .then(({ ok, data }) => {
        if (ok && Array.isArray(data?.personas) && data.personas.length) setPersonaCatalog(data.personas)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])

  const handleSelect = useCallback(async (code) => {
    const tg = getTg()
    if (insideTelegram()) {
      const { ok, data } = await apiFetch('/api/persona/select', { method: 'POST', body: { persona: code } })
      if (ok) {
        haptic('success')
        setTimeout(() => { try { tg?.close() } catch (_) {} }, 300)
        return
      }
      haptic('error')
      showAlert(data?.error === 'age_not_confirmed' ? t(lang, 'common.openInTelegram') : t(lang, 'common.error'))
      return
    }
    // Opened from a reply-keyboard button: no initData, but sendData works
    if (tg?.sendData) {
      tg.sendData(JSON.stringify({ persona: code }))
      return
    }
    showAlert(t(lang, 'common.notTelegram'))
  }, [lang])

  const handleCardClick = useCallback((persona) => {
    haptic('light')
    setSelectedPersona(persona)
  }, [])

  const handleOpenShop = useCallback((persona) => {
    setSelectedPersona(null)
    setShopPersonaCode(persona?.code || null)
    setActiveTab('shop')
    setPageKey((k) => k + 1)
  }, [])

  const handleTabChange = useCallback((tab) => {
    haptic('light')
    setActiveTab(tab)
    setPageKey((k) => k + 1)
    if (tab === 'shop') setShopPersonaCode(null)
  }, [])

  const shopPersona = personas.find((p) => p.code === shopPersonaCode) || null

  return (
    <div className="app">
      <div className="app-content">
        {activeTab === 'girls' && (
          <div key={`girls-${pageKey}`} className="page-enter">
            <header className="header">
              <div className="header-brand">
                <h1 className="title">{t(lang, 'girls.title')}</h1>
                <div className="header-badge">
                  <span className="header-badge-dot"></span>
                  {t(lang, 'girls.online', { count: personas.length })}
                </div>
              </div>
              <p className="subtitle">{t(lang, 'girls.subtitle')}</p>
            </header>
            <div className="grid">
              {personas.map((p) => (
                <PersonaCard key={p.code} persona={p} lang={lang} onClick={() => handleCardClick(p)} />
              ))}
            </div>
            {selectedPersona && (
              <PersonaDetail
                persona={selectedPersona}
                lang={lang}
                onClose={() => setSelectedPersona(null)}
                onSelect={() => handleSelect(selectedPersona.code)}
                onOpenShop={handleOpenShop}
              />
            )}
          </div>
        )}
        {activeTab === 'shop' && (
          <div key={`shop-${pageKey}`} className="page-enter">
            <GiftShop persona={shopPersona} personas={personas} lang={lang} />
          </div>
        )}
        {activeTab === 'premium' && (
          <div key={`premium-${pageKey}`} className="page-enter">
            <PremiumPage lang={lang} />
          </div>
        )}
        {activeTab === 'referrals' && (
          <div key={`referrals-${pageKey}`} className="page-enter">
            <ReferralsPage lang={lang} />
          </div>
        )}
        {activeTab === 'profile' && (
          <div key={`profile-${pageKey}`} className="page-enter">
            <ProfilePage lang={lang} />
          </div>
        )}
      </div>
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} lang={lang} />
    </div>
  )
}
