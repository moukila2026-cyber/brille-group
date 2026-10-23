import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { SiteProvider } from './lib/site-context'
import './index.css'

// Le masquage des sections animées n'est appliqué que si JavaScript et
// IntersectionObserver sont disponibles : sans cela, la page reste lisible.
if (typeof IntersectionObserver !== 'undefined') {
  document.documentElement.classList.add('js-reveal')
  window.setTimeout(() => {
    document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight) {
        element.classList.add('is-visible')
      }
    })
  }, 3000)
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <SiteProvider>
        <App />
      </SiteProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
