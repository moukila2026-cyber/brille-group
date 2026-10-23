import { Link } from 'react-router-dom'
import { useApiQuery } from '../lib/hooks'
import { useAuth } from './AuthContext'
import { AdminHeading, ErrorBlock, LoadingBlock, Panel, StatCard, Table } from './ui'
import { Badge } from '../components/ui'
import { QUOTE_STATUS_LABELS, SERVICE_TYPE_LABELS, type StatsDTO } from '../lib/types'
import { formatDate } from '../lib/format'

export default function Dashboard() {
  const { data, loading, error, reload } = useApiQuery<StatsDTO>('/api/admin/stats')
  const { admin } = useAuth()

  if (loading) return <LoadingBlock />
  if (error) return <ErrorBlock message={error} onRetry={reload} />
  if (!data) return null

  return (
    <>
      <AdminHeading
        title={`Bonjour ${admin?.fullName?.split(' ')[0] ?? ''}`}
        description="Vue d’ensemble de l’activité du site. Les chiffres proviennent directement de la base de données."
        action={
          <>
            <Link to="/admin/demandes" className="btn-primary !py-2.5 text-[13px]">
              Voir les demandes
            </Link>
            <Link to="/admin/biens" className="btn-outline !py-2.5 text-[13px]">
              Gérer les biens
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Demandes de devis" value={data.quotes.total} hint="Total enregistré" />
        <StatCard
          label="Nouvelles demandes"
          value={data.quotes.nouvelle}
          hint="À traiter en priorité"
          tone={data.quotes.nouvelle > 0 ? 'attention' : 'default'}
        />
        <StatCard label="En cours de traitement" value={data.quotes.enCours} hint="Contact, discussion, devis envoyé" />
        <StatCard label="Traitées" value={data.quotes.traitees} hint="Acceptées ou terminées" tone="success" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Messages de contact" value={data.messages.total} hint={`${data.messages.nouveau} non lus`} />
        <StatCard label="Inscriptions formation" value={data.registrations.total} hint={`${data.registrations.nouvelle} nouvelles`} />
        <StatCard label="Biens publiés" value={data.properties.publiees} hint={`${data.properties.disponibles} disponibles`} />
        <StatCard label="Réalisations publiées" value={data.projects.publies} hint={`${data.services.publies} services en ligne`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-navy-900">Dernières demandes de devis</h2>
            <Link to="/admin/demandes" className="text-xs font-semibold text-gold-700 hover:underline">
              Tout voir
            </Link>
          </div>
          {data.recentQuotes.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-navy-400">
              Aucune demande pour le moment. Les demandes envoyées depuis le site apparaîtront ici.
            </p>
          ) : (
            <Table head={['Référence', 'Contact', 'Service', 'Date', 'Statut']}>
              {data.recentQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-navy-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-navy-700">{quote.reference}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy-900">{quote.fullName}</p>
                    <p className="text-xs text-navy-500">{quote.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-navy-600">{SERVICE_TYPE_LABELS[quote.serviceType] ?? quote.serviceType}</td>
                  <td className="px-4 py-3 text-xs text-navy-500">{formatDate(quote.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={quote.status === 'nouvelle' ? 'gold' : quote.status === 'terminee' || quote.status === 'acceptee' ? 'green' : 'muted'}>
                      {QUOTE_STATUS_LABELS[quote.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>

        <Panel className="p-5">
          <h2 className="text-sm font-semibold text-navy-900">Actions rapides</h2>
          <div className="mt-4 space-y-2">
            {[
              { to: '/admin/biens', label: 'Publier un terrain ou un bien' },
              { to: '/admin/realisations', label: 'Ajouter une réalisation' },
              { to: '/admin/formations', label: 'Ajouter une formation' },
              { to: '/admin/services', label: 'Modifier un service' },
              { to: '/admin/parametres', label: 'Compléter les coordonnées' },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center justify-between rounded-xl border border-navy-100 px-4 py-3 text-sm font-medium text-navy-700 transition hover:border-navy-200 hover:bg-navy-50"
              >
                {action.label}
                <span aria-hidden="true" className="text-navy-300">→</span>
              </Link>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-gold-50 p-4 text-[11px] leading-relaxed text-navy-700">
            Les informations manquantes (WhatsApp, adresse exacte, horaires, photos authentiques) se complètent dans
            « Paramètres du site » et dans chaque rubrique de contenu.
          </div>
        </Panel>
      </div>
    </>
  )
}
