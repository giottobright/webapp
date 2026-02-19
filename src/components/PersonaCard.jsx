import React from 'react'
import SmartImage from './SmartImage'
import { getLang } from '../utils/api'

export default function PersonaCard({ persona, onClick }) {
  const lang = getLang()
  const name = lang === 'ru' ? persona.name_ru : persona.name_tr
  const tagline = lang === 'ru' ? persona.tagline_ru : persona.tagline_tr

  return (
    <div className="persona-card" onClick={onClick}>
      <div className="persona-card-image">
        <SmartImage code={persona.code} alt={name} className="card-img" />
        <div className="card-gradient"></div>
        <div className="card-info">
          <div className="card-name">{name}, {persona.age}</div>
          <div className="card-tagline-mini">{tagline}</div>
          <div className="card-status">
            <span className="online-dot"></span>
            {lang === 'ru' ? 'Онлайн' : 'Çevrimiçi'}
          </div>
        </div>
      </div>
    </div>
  )
}
