import React from 'react'
import { getLang } from '../utils/api'

export default function BottomNavigation({ activeTab, onTabChange }) {
  const lang = getLang()
  const tabs = [
    { id: 'girls', icon: '👥', label: lang === 'ru' ? 'Девушки' : 'Kızlar' },
    { id: 'shop', icon: '🎁', label: lang === 'ru' ? 'Магазин' : 'Mağaza' },
    { id: 'referrals', icon: '🔗', label: lang === 'ru' ? 'Друзья' : 'Davet' },
    { id: 'profile', icon: '👤', label: lang === 'ru' ? 'Профиль' : 'Profil' },
    { id: 'premium', icon: '⭐', label: 'VIP' },
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
