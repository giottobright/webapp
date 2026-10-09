import React from 'react'
import SmartImage from './SmartImage'
import { t } from '../i18n'

export default function PersonaCard({ persona, lang, onClick }) {
  return (
    <div className="persona-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="persona-card-image">
        <SmartImage code={persona.code} alt={persona.name} className="card-img" />
        <div className="card-gradient"></div>
        <div className="card-info">
          <div className="card-name">{persona.name}, {persona.age}</div>
          <div className="card-tagline-mini">{persona.tagline}</div>
          <div className="card-status">
            <span className="online-dot"></span>
            {t(lang, 'card.online')}
          </div>
        </div>
      </div>
    </div>
  )
}
