import React from 'react'
import { createRoot } from 'react-dom/client'
import { LucideProvider } from 'lucide-react'
// Self-hosted fonts with Cyrillic + Latin Extended (Turkish) subsets; unicode-range loads only what a page uses
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/cormorant-garamond/500-italic.css'
import '@fontsource-variable/onest/wght.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './styles.css'

const rootElement = document.getElementById('root')

createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LucideProvider strokeWidth={1.75}>
        <App />
      </LucideProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
