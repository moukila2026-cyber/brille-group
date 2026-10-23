import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { cn } from '../lib/format'
import { Icon } from '../components/Icon'

const NAV = [
  { to: '/admin', label: 'Vue d’ensemble', icon: 'map', end: true },
  { to: '/admin/demandes', label: 'Demandes de devis', icon: 'spark' },
  { to: '/admin/messages', label: 'Messages', icon: 'check' },
  { to: '/admin/inscriptions', label: 'Inscriptions', icon: 'graduation' },
  { to: '/admin/services', label: 'Services', icon: 'building' },
  { to: '/admin/biens', label: 'Biens immobiliers', icon: 'home' },
  { to: '/admin/realisations', label: 'Réalisations', icon: 'shield' },
  { to: '/admin/formations', label: 'Formations', icon: 'graduation' },
  { to: '/admin/parametres', label: 'Paramètres du site', icon: 'compass' },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: 'pin' },
]

export default function AdminLayout() {
  const { admin, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Barre supérieure */}
      <header className="sticky top-0 z-30 border-b border-navy-100 bg-white">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label="Afficher le menu"
              aria-expanded={open}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-navy-200 text-navy-700 lg:hidden"
            >
              <Icon name="arrow" className="h-5 w-5" />
            </button>
            <Link to="/admin" className="flex items-center gap-2.5">
              <span className="inline-flex rounded-lg bg-white px-2 py-1">
                <img
                  src="/images/logo-brille-group.svg"
                  alt="BRILLE GROUP SARL"
                  className="h-8 w-auto"
                  width={460}
                  height={240}
                />
              </span>
              <span className="hidden sm:block">
                <span className="block text-sm font-bold leading-tight text-navy-900">BRILLE GROUP</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Administration
                </span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/" className="hidden rounded-lg px-3 py-2 text-xs font-medium text-navy-500 hover:bg-navy-50 sm:block">
              Voir le site
            </Link>
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-navy-900">{admin?.fullName}</p>
              <p className="text-[10px] uppercase tracking-wider text-navy-400">{admin?.role}</p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg border border-navy-200 px-3 py-2 text-xs font-semibold text-navy-700 transition hover:bg-navy-50"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Navigation latérale */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 top-16 z-20 w-64 overflow-y-auto border-r border-navy-100 bg-white px-3 py-4 transition-transform lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <nav aria-label="Navigation administration" className="space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                    isActive ? 'bg-navy-900 text-white' : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900',
                  )
                }
              >
                <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 rounded-xl bg-navy-50 p-3 text-[11px] leading-relaxed text-navy-500">
            Session sécurisée. Les données affichées sont réelles : aucune donnée de démonstration n’est injectée.
          </div>
        </aside>

        {open ? (
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-16 z-10 bg-navy-950/20 lg:hidden"
          />
        ) : null}

        <main key={location.pathname} className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
