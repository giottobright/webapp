import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { PERSONAS } from './personas'
import { apiFetch, getLang, getStartParams, getTg, haptic, insideTelegram, showAlert, tgSupports } from './utils/api'
import { localizePersona, t } from './i18n'
import BottomNavigation from './components/BottomNavigation'
import PersonaCard from './components/PersonaCard'
import PersonaDetail from './components/PersonaDetail'
import GiftShop from './components/GiftShop'
import PremiumPage from './components/PremiumPage'
import ReferralsPage from './components/ReferralsPage'
import ProfilePage from './components/ProfilePage'

const TABS = ['girls', 'shop', 'referrals', 'profile', 'premium']
const CHROME_COLOR = '#09070F'

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
    document.documentElement.lang = lang
    const tg = getTg()
    if (tg) {
      try { tg.ready() } catch (_) {}
      try { tg.expand() } catch (_) {}
      if (tgSupports('6.1')) {
        try { tg.setHeaderColor(CHROME_COLOR); tg.setBackgroundColor(CHROME_COLOR) } catch (_) {}
      }
      if (tgSupports('7.10')) { try { tg.setBottomBarColor(CHROME_COLOR) } catch (_) {} }
      if (tgSupports('7.7')) { try { tg.disableVerticalSwipes() } catch (_) {} }
    }
    const controller = new AbortController()
    apiFetch('/api/personas', { signal: controller.signal })
      .then(({ ok, data }) => {
        if (ok && Array.isArray(data?.personas) && data.personas.length) setPersonaCatalog(data.personas)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [lang])

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

  const goTo = useCallback((tab) => {
    setActiveTab(tab)
    setPageKey((k) => k + 1)
    try { window.scrollTo({ top: 0 }) } catch (_) {}
  }, [])

  const handleOpenShop = useCallback((persona) => {
    setSelectedPersona(null)
    setShopPersonaCode(persona?.code || null)
    goTo('shop')
  }, [goTo])

  const handleTabChange = useCallback((tab) => {
    haptic('selection')
    if (tab === 'shop') setShopPersonaCode(null)
    goTo(tab)
  }, [goTo])

  const shopPersona = personas.find((p) => p.code === shopPersonaCode) || null

  return (
    <div className="app">
      <main className="app-content">
        {activeTab === 'girls' && (
          <div key={`girls-${pageKey}`} className="page page-enter">
            <header className="page-header">
              <div className="brand-row">
                <span className="brand">Hayal<em>Kız</em></span>
                <span className="online-badge">
                  <span className="online-dot" aria-hidden="true" />
                  {t(lang, 'girls.online', { count: personas.length })}
                </span>
              </div>
              <h1 className="page-title">{t(lang, 'girls.title')}</h1>
              <p className="page-subtitle">{t(lang, 'girls.subtitle')}</p>
            </header>
            <div className="persona-grid">
              {personas.map((p, i) => (
                <PersonaCard key={p.code} persona={p} lang={lang} index={i} onClick={() => handleCardClick(p)} />
              ))}
            </div>
          </div>
        )}
        {activeTab === 'shop' && (
          <div key={`shop-${pageKey}`} className="page page-enter">
            <GiftShop persona={shopPersona} personas={personas} lang={lang} />
          </div>
        )}
        {activeTab === 'premium' && (
          <div key={`premium-${pageKey}`} className="page page-enter">
            <PremiumPage lang={lang} />
          </div>
        )}
        {activeTab === 'referrals' && (
          <div key={`referrals-${pageKey}`} className="page page-enter">
            <ReferralsPage lang={lang} />
          </div>
        )}
        {activeTab === 'profile' && (
          <div key={`profile-${pageKey}`} className="page page-enter">
            <ProfilePage lang={lang} personas={personas} onUpgrade={() => handleTabChange('premium')} />
          </div>
        )}
      </main>
      {selectedPersona && (
        <PersonaDetail
          persona={selectedPersona}
          lang={lang}
          onClose={() => setSelectedPersona(null)}
          onSelect={() => handleSelect(selectedPersona.code)}
          onOpenShop={handleOpenShop}
        />
      )}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} lang={lang} />
    </div>
  )
}
