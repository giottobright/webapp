import React from 'react'
import { t } from '../i18n'

export default function BottomNavigation({ activeTab, onTabChange, lang }) {
  const tabs = [
    { id: 'girls', icon: '👥', label: t(lang, 'nav.girls') },
    { id: 'shop', icon: '🎁', label: t(lang, 'nav.shop') },
    { id: 'referrals', icon: '🔗', label: t(lang, 'nav.friends') },
    { id: 'profile', icon: '👤', label: t(lang, 'nav.profile') },
    { id: 'premium', icon: '⭐', label: t(lang, 'nav.premium') },
  ]

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
