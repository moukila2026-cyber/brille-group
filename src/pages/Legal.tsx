import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { PageHero, Section } from '../components/ui'
import { useSite } from '../lib/site-context'

function LegalBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-navy-900">{title}</h2>
      <div className="prose-brille mt-2 space-y-3">{children}</div>
    </section>
  )
}

export function MentionsLegales() {
  const { settings } = useSite()
  const company = String(settings.company_name ?? 'BRILLE GROUP SARL')
  const email = String(settings.email_primary ?? '')
  const phone = String(settings.phone_primary ?? '')
  const rccm = String(settings.legal_rcm ?? '')
  const address = [settings.address_line, settings.city, settings.country]
    .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
    .join(', ')

  return (
    <>
      <Seo
        title="Mentions légales"
        description="Mentions légales du site de BRILLE GROUP SARL : éditeur, immatriculation, hébergement, propriété intellectuelle et responsabilité."
        path="/mentions-legales"
      />
      <PageHero eyebrow="Informations légales" title="Mentions légales" description="Informations relatives à l’éditeur du site et aux conditions d’utilisation." />

      <Section>
        <div className="max-w-3xl">
          <LegalBlock title="Éditeur du site">
            <p>
              <strong>{company}</strong>
              {address ? <> — {address}</> : null}
            </p>
            {phone ? <p>Téléphone : {phone}</p> : null}
            {email ? (
              <p>
                E-mail :{' '}
                <a href={`mailto:${email}`} className="link-underline">
                  {email}
                </a>
              </p>
            ) : null}
            {rccm ? <p>Immatriculation : {rccm}</p> : <p>Immatriculation : information à compléter par l’entreprise.</p>}
          </LegalBlock>

          <LegalBlock title="Directeur de la publication">
            <p>
              Le directeur de la publication est le représentant légal de {company}. Cette information nominative sera
              complétée dès confirmation par l’entreprise.
            </p>
          </LegalBlock>

          <LegalBlock title="Hébergement">
            <p>
              Le site est hébergé sur une infrastructure cloud de type Vercel Inc., avec une base de données PostgreSQL
              hébergée par Neon Inc. Les coordonnées exactes de l’hébergeur sont communiquées sur demande.
            </p>
          </LegalBlock>

          <LegalBlock title="Propriété intellectuelle">
            <p>
              L’ensemble des contenus (textes, structure, éléments graphiques) est protégé. Toute reproduction totale ou
              partielle sans autorisation écrite est interdite. Les photographies d’illustration utilisées sur le site
              ne représentent pas nécessairement des chantiers réalisés par l’entreprise ; elles sont identifiées comme
              telles et sont destinées à être remplacées par des photos authentiques.
            </p>
          </LegalBlock>

          <LegalBlock title="Responsabilité et exactitude des informations">
            <p>
              {String(
                settings.legal_text ??
                  'Les informations publiées sur ce site sont fournies à titre indicatif et peuvent évoluer. Toute prestation fait l’objet d’un devis et d’un contrat écrits.',
              )}
            </p>
            <p>
              Les informations relatives aux terrains et biens immobiliers ne constituent ni une garantie de propriété,
              ni une offre de vente. Elles doivent être vérifiées auprès des autorités compétentes et faire l’objet
              d’un contrôle avant toute transaction.
            </p>
          </LegalBlock>

          <LegalBlock title="Liens externes">
            <p>
              Le site peut renvoyer vers des pages externes (notamment Facebook). {company} n’exerce aucun contrôle sur
              ces contenus et décline toute responsabilité à leur égard.
            </p>
          </LegalBlock>

          <p className="mt-10 text-xs text-navy-500">
            Voir également notre{' '}
            <Link to="/politique-confidentialite" className="link-underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </Section>
    </>
  )
}

export function Confidentialite() {
  const { settings } = useSite()
  const email = String(settings.email_primary ?? '')

  return (
    <>
      <Seo
        title="Politique de confidentialité"
        description="Politique de confidentialité de BRILLE GROUP SARL : données collectées via les formulaires, finalités, durée de conservation, sécurité et droits des personnes."
        path="/politique-confidentialite"
      />
      <PageHero
        eyebrow="Vos données"
        title="Politique de confidentialité"
        description="Cette page décrit quelles données sont collectées lorsque vous utilisez ce site, pourquoi et comment elles sont protégées."
      />

      <Section>
        <div className="max-w-3xl">
          <LegalBlock title="1. Données collectées">
            <p>
              Seules les données que vous saisissez volontairement dans nos formulaires sont collectées : nom,
              téléphone, adresse e-mail le cas échéant, localisation du projet, description du besoin, budget ou délai
              lorsque vous les renseignez.
            </p>
            <p>
              Le site ne dépose aucun cookie publicitaire ni traceur d’analyse d’audience. Un cookie technique de
              session est utilisé uniquement pour l’authentification des administrateurs, après connexion volontaire.
            </p>
          </LegalBlock>

          <LegalBlock title="2. Finalités du traitement">
            <p>
              Vos données servent exclusivement à : répondre à votre demande, préparer un devis, vous recontacter au
              sujet de votre projet, et assurer le suivi interne de la relation commerciale.
            </p>
            <p>Aucune donnée n’est vendue, louée ou cédée à des tiers à des fins commerciales.</p>
          </LegalBlock>

          <LegalBlock title="3. Base légale et consentement">
            <p>
              Le traitement repose sur votre consentement, recueilli explicitement au moment de l’envoi du formulaire,
              et sur l’intérêt légitime de l’entreprise à traiter les demandes qu’elle reçoit.
            </p>
          </LegalBlock>

          <LegalBlock title="4. Durée de conservation">
            <p>
              Les demandes de devis, messages et inscriptions sont conservés le temps nécessaire au traitement de la
              demande, puis archivés ou supprimés. Une demande sans suite est conservée au maximum 24 mois, sauf
              obligation légale contraire.
            </p>
          </LegalBlock>

          <LegalBlock title="5. Sécurité">
            <p>
              Les données sont stockées dans une base PostgreSQL accessible uniquement par le serveur de l’application.
              Les échanges sont chiffrés (HTTPS). L’accès à l’espace d’administration est protégé par une authentification
              individuelle, un mot de passe fort et une session sécurisée. Aucune donnée de formulaire n’est visible
              publiquement.
            </p>
          </LegalBlock>

          <LegalBlock title="6. Vos droits">
            <p>
              Vous pouvez demander l’accès, la rectification ou la suppression de vos données, ainsi que le retrait de
              votre consentement, en écrivant à{' '}
              {email ? (
                <a href={`mailto:${email}`} className="link-underline">
                  {email}
                </a>
              ) : (
                'l’adresse e-mail de l’entreprise'
              )}
              . Nous répondons dans les meilleurs délais.
            </p>
          </LegalBlock>

          <LegalBlock title="7. Contact">
            <p>
              Pour toute question relative à cette politique, contactez {String(settings.company_name ?? 'BRILLE GROUP SARL')}.
              Les coordonnées complètes figurent sur la page{' '}
              <Link to="/contact" className="link-underline">
                Contact
              </Link>
              .
            </p>
          </LegalBlock>

          <p className="mt-10 text-xs text-navy-500">
            Voir également les{' '}
            <Link to="/mentions-legales" className="link-underline">
              mentions légales
            </Link>
            .
          </p>
        </div>
      </Section>
    </>
  )
}
