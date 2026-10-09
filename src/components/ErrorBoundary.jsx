import React from 'react'
import { getLang } from '../utils/api'

const TEXT = {
  ru: ['Что-то пошло не так', 'Обнови приложение'],
  tr: ['Bir şeyler ters gitti', 'Uygulamayı yeniden aç'],
  en: ['Something went wrong', 'Please reopen the app'],
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error('Mini App crashed:', error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    const [title, hint] = TEXT[getLang()] || TEXT.en
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#F2EEFF' }}>
        <h2>{title}</h2>
        <p style={{ opacity: 0.7 }}>{hint}</p>
        <button className="profile-btn profile-btn-edit" onClick={() => window.location.reload()}>↻</button>
      </div>
    )
  }
}
