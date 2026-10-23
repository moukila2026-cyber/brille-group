import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Icon } from '../components/Icon'
import { useSite } from '../lib/site-context'

export default function NotFound() {
  const { coreServices } = useSite()
  return (
    <>
      <Seo title="Page introuvable" description="La page demandée n’existe pas ou a été déplacée." path="/404" noindex />
      <section className="bg-navy-950 py-20 text-white sm:py-28">
        <div className="container-page max-w-3xl text-center">
          <p className="font-display text-6xl font-bold text-gold-400 sm:text-7xl">404</p>
          <h1 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">Cette page n’existe pas</h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-navy-200">
            Le lien est peut-être obsolète, ou l’adresse comporte une erreur. Voici quelques pages pour retrouver votre
            chemin.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn-gold">
              Retour à l’accueil
            </Link>
            <Link to="/devis" className="btn-ghost-light">
              Demander un devis
            </Link>
            <Link to="/contact" className="btn-ghost-light">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-page">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-navy-400">Pages utiles</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {coreServices.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.slug}`}
                className="flex items-center justify-between rounded-xl border border-navy-100 bg-white p-4 text-sm font-medium text-navy-800 transition hover:shadow-card"
              >
                {service.title}
                <Icon name="arrow" className="h-4 w-4 text-navy-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
