import React from 'react'
import { Crown, Gift, Heart, UserPlus, UserRound } from 'lucide-react'
import { t } from '../i18n'

const TABS = [
  { id: 'girls', Icon: Heart, label: 'nav.girls', fill: true },
  { id: 'shop', Icon: Gift, label: 'nav.shop' },
  { id: 'referrals', Icon: UserPlus, label: 'nav.friends' },
  { id: 'profile', Icon: UserRound, label: 'nav.profile' },
  { id: 'premium', Icon: Crown, label: 'nav.premium', fill: true },
]

export default function BottomNavigation({ activeTab, onTabChange, lang }) {
  return (
    <nav className="bottom-nav" aria-label={t(lang, 'nav.label')}>
      {TABS.map(({ id, Icon, label, fill }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            type="button"
            className={`nav-item ${active ? 'active' : ''} ${id === 'premium' ? 'nav-item-premium' : ''}`}
            onClick={() => onTabChange(id)}
            aria-current={active ? 'page' : undefined}
          >
            <span className="nav-icon">
              <Icon size={22} strokeWidth={active ? 2 : 1.75} fill={active && fill ? 'currentColor' : 'none'} />
            </span>
            <span className="nav-label">{t(lang, label)}</span>
          </button>
        )
      })}
    </nav>
  )
}
