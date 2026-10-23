import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Spinner } from './components/ui'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import ServiceGeneric from './pages/ServiceGeneric'
import Foncier from './pages/services/Foncier'
import Btp from './pages/services/Btp'
import Topographie from './pages/services/Topographie'
import Nettoyage from './pages/services/Nettoyage'
import { ImmobilierList, PropertyDetail } from './pages/Immobilier'
import Formation from './pages/Formation'
import Realisations from './pages/Realisations'
import Contact from './pages/Contact'
import Devis from './pages/Devis'
import { Confidentialite, MentionsLegales } from './pages/Legal'
import NotFound from './pages/NotFound'

// L'espace d'administration est chargé séparément : les visiteurs ne
// téléchargent pas le code du back-office.
const AdminApp = lazy(() => import('./admin/AdminApp'))

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-navy-300">
      <Spinner className="h-6 w-6" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Espace d'administration (mise en page dédiée, hors site public) */}
        <Route path="/admin/*" element={<AdminApp />} />

        {/* Site public */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceGeneric />} />
          <Route path="/amenagement-foncier" element={<Foncier />} />
          <Route path="/btp-construction" element={<Btp />} />
          <Route path="/topographie" element={<Topographie />} />
          <Route path="/nettoyage-professionnel" element={<Nettoyage />} />
          <Route path="/immobilier" element={<ImmobilierList />} />
          <Route path="/immobilier/:id" element={<PropertyDetail />} />
          <Route path="/formation" element={<Formation />} />
          <Route path="/realisations" element={<Realisations />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/devis" element={<Devis />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/politique-confidentialite" element={<Confidentialite />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
