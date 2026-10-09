import React from 'react'
import SmartImage from './SmartImage'
import { t } from '../i18n'

export default function PersonaCard({ persona, lang, onClick, index = 0 }) {
  return (
    <button
      type="button"
      className="persona-card"
      onClick={onClick}
      aria-label={t(lang, 'card.open', { name: persona.name, age: persona.age })}
      style={{ '--i': index }}
    >
      <SmartImage code={persona.code} alt="" className="card-img" eager={index < 4} />
      <span className="card-scrim" aria-hidden="true" />
      <span className="card-info">
        <span className="card-name">
          {persona.name}<span className="card-age">{persona.age}</span>
        </span>
        <span className="card-tagline">{persona.tagline}</span>
        <span className="card-status">
          <span className="online-dot" aria-hidden="true" />
          {t(lang, 'card.online')}
        </span>
      </span>
    </button>
  )
}
