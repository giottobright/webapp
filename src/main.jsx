import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// Remove loading screen once React is ready
const rootElement = document.getElementById('root')
if (rootElement && rootElement.innerHTML.includes('loading-screen')) {
  rootElement.innerHTML = ''
}

// Render app with error handling
try {
  const root = createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} catch (error) {
  console.error('Failed to render app:', error)
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: #ffffff; text-align: center;">
        <h1>Ошибка загрузки</h1>
        <p>Пожалуйста, обновите страницу</p>
      </div>
    `
  }
}
