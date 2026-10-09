import React from 'react'
import { getLang } from '../utils/api'
import { t } from '../i18n'

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
    const lang = getLang()
    return (
      <main className="app">
        <div className="state state-screen" role="alert">
          <h1 className="state-title">{t(lang, 'common.crashed')}</h1>
          <p className="state-text">{t(lang, 'common.crashedHint')}</p>
          <button type="button" className="btn btn-primary btn-md" onClick={() => window.location.reload()}>
            {t(lang, 'common.reload')}
          </button>
        </div>
      </main>
    )
  }
}
