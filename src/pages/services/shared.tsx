import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Alert, PageHero, Section, SectionHeading } from '../../components/ui'
import { QuoteForm } from '../../components/forms/QuoteForm'
import { useSite } from '../../lib/site-context'
import { telHref, whatsappHref } from '../../lib/format'

export function ServiceAside({ title = 'Un projet à étudier ?' }: { title?: string }) {
  const { settings } = useSite()
  const phone = String(settings.phone_primary ?? '')
  const wa = whatsappHref(
    typeof settings.whatsapp_number === 'string' ? settings.whatsapp_number : '',
    'Bonjour BRILLE GROUP, je souhaite des informations.',
  )
  return (
    <div className="card sticky top-24 p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-navy-600">
        Décrivez-nous votre besoin : nous vous indiquons ce qui est réalisable, dans quels délais et sous quelles
        conditions.
      </p>
      <div className="mt-5 space-y-2">
        <Link to="/devis" className="btn-primary w-full">
          Demander un devis
        </Link>
        {phone ? (
          <a href={telHref(phone)} className="btn-outline w-full">
            <Icon name="phone" className="h-4 w-4" />
            {phone}
          </a>
        ) : null}
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-outline w-full">
            WhatsApp
          </a>
        ) : null}
      </div>
      <div className="mt-6 border-t border-navy-100 pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-400">Bon à savoir</p>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-navy-600">
          <li className="flex gap-2">
            <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
            Les demandes sont confidentielles.
          </li>
          <li className="flex gap-2">
            <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
            Aucun engagement avant signature d’un devis.
          </li>
          <li className="flex gap-2">
            <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
            Les documents fonciers doivent être vérifiés avant toute transaction.
          </li>
        </ul>
      </div>
    </div>
  )
}

export function ProcessSteps({ steps }: { steps: Array<{ title: string; text: string }> }) {
  return (
    <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.title} className="relative rounded-2xl border border-navy-100 bg-white p-5">
          <span className="absolute -top-3 left-5 rounded-full bg-navy-900 px-2.5 py-1 text-[10px] font-bold tracking-wider text-gold-300">
            ÉTAPE {index + 1}
          </span>
          <h3 className="mt-2 text-sm font-semibold text-navy-900">{step.title}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-navy-600">{step.text}</p>
        </li>
      ))}
    </ol>
  )
}

export function FoncierWarning() {
  const { settings } = useSite()
  return (
    <Alert tone="warning" title="Avertissement important" className="mt-8">
      {String(
        settings.foncier_warning ??
          'Les informations relatives aux terrains, titres, limites, droits fonciers et documents administratifs affichées sur ce site sont indicatives. Elles doivent être vérifiées auprès des services compétents et faire l’objet d’un contrôle juridique avant toute transaction. La publication d’une annonce ne constitue ni une garantie de propriété, ni un acte de vente.',
      )}
    </Alert>
  )
}

export function QuoteSection({
  service,
  sourcePage,
  title,
  description,
  children,
}: {
  service: string
  sourcePage: string
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <Section tone="muted" id="devis">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow="Demande de devis" title={title} description={description} />
          {children}
        </div>
        <div className="lg:col-span-7">
          <QuoteForm defaultService={service} sourcePage={sourcePage} variant="compact" title="Décrivez votre projet" />
        </div>
      </div>
    </Section>
  )
}

export function ServiceHero({
  eyebrow,
  title,
  description,
  image,
}: {
  eyebrow: string
  title: string
  description: string
  image: string
}) {
  return (
    <PageHero eyebrow={eyebrow} title={title} description={description} image={image}>
      <Link to="/devis" className="btn-gold">
        Demander un devis
      </Link>
      <Link to="/contact" className="btn-ghost-light">
        Nous contacter
      </Link>
    </PageHero>
  )
}

export function ServiceFeatureGrid({
  items,
}: {
  items: Array<{ title: string; text: string; icon?: string }>
}) {
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.title} className="card p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-gold-300">
            <Icon name={item.icon ?? 'building'} className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{item.text}</p>
        </div>
      ))}
    </div>
  )
}
