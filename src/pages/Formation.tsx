import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Icon } from '../components/Icon'
import { Alert, Badge, EmptyState, PageHero, Section, SectionHeading, Spinner } from '../components/ui'
import { RegistrationForm } from '../components/forms/RegistrationForm'
import { useApiQuery } from '../lib/hooks'
import { useSite } from '../lib/site-context'
import type { CourseDTO } from '../lib/types'

export default function Formation() {
  const { data, loading } = useApiQuery<{ courses: CourseDTO[] }>('/api/public/courses')
  const { capabilities, settings } = useSite()
  const courses = data?.courses ?? []

  return (
    <>
      <Seo
        title="Conseils et formation en Côte d’Ivoire"
        description="Conseil aux porteurs de projets et formations professionnelles proposées par BRILLE GROUP SARL à Daloa et en Côte d’Ivoire. Catalogue, objectifs, public concerné et demande d’information."
        path="/formation"
      />
      <PageHero
        eyebrow="Conseils & formation"
        title="Transmettre les compétences, éclairer les décisions"
        description="BRILLE GROUP SARL propose du conseil aux porteurs de projets et des formations professionnelles. Les programmes détaillés sont publiés dans le catalogue lorsqu’ils sont confirmés par l’entreprise."
        image="/images/conseils-formation.jpg"
      >
        <Link to="/contact" className="btn-gold">
          Demander le catalogue
        </Link>
      </PageHero>

      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow="Notre approche"
              title="Un conseil concret, une formation utile"
              description="L’objectif est simple : apporter des réponses utilisables immédiatement, adaptées au contexte réel du porteur de projet ou de l’équipe formée."
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {[
                {
                  title: 'Conseil aux porteurs de projets',
                  text: 'Analyse du besoin, cadrage du projet, identification des étapes et des interlocuteurs compétents.',
                  icon: 'compass',
                },
                {
                  title: 'Formations professionnelles',
                  text: 'Sessions thématiques construites à partir des besoins exprimés par les participants.',
                  icon: 'graduation',
                },
                {
                  title: 'Accompagnement des équipes',
                  text: 'Appui aux organisations qui souhaitent structurer leurs pratiques ou leurs procédures.',
                  icon: 'shield',
                },
                {
                  title: 'Sessions sur demande',
                  text: 'Une formation peut être organisée pour un groupe constitué, dans une localité convenue.',
                  icon: 'clock',
                },
              ].map((item) => (
                <div key={item.title} className="card p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-gold-300">
                    <Icon name={item.icon} className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{item.text}</p>
                </div>
              ))}
            </div>

            <Alert tone="info" className="mt-8" title="Transparence sur les formations">
              Aucun diplôme, agrément ou certification n’est présenté comme délivré par BRILLE GROUP SARL sans
              confirmation explicite de l’entreprise. Les modalités exactes de chaque session (durée, lieu, coût,
              attestation éventuelle) sont communiquées avant inscription dans le devis ou la convention de formation.
            </Alert>
          </div>

          <aside className="lg:col-span-5">
            <div className="card sticky top-24 p-6">
              <h2 className="text-lg font-semibold">Comment s’inscrire ?</h2>
              <ol className="mt-4 space-y-3 text-sm text-navy-700">
                {[
                  'Vous envoyez une demande via le formulaire ci-dessous.',
                  'Nous vous contactons pour préciser le besoin et les disponibilités.',
                  'Vous recevez les modalités (dates, lieu, coût) par écrit.',
                  'L’inscription est confirmée après votre accord.',
                ].map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-[11px] font-bold text-gold-300">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              {settings.intervention_area ? (
                <p className="mt-4 border-t border-navy-100 pt-4 text-xs leading-relaxed text-navy-500">
                  Zone d’intervention : {String(settings.intervention_area)}
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          eyebrow="Catalogue"
          title="Formations proposées"
          description="Le catalogue est géré par l’entreprise et mis à jour depuis son espace d’administration."
        />
        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-10 text-navy-400">
              <Spinner />
            </div>
          ) : !capabilities.hasCourses || courses.length === 0 ? (
            <EmptyState
              title="Catalogue en cours de publication"
              description="Les formations sont en cours de formalisation : programmes, durées et modalités seront publiés ici une fois validés par l’entreprise. Vous pouvez dès maintenant nous faire part de votre besoin de formation."
              action={{ label: 'Demander une formation', to: '#inscription' }}
              icon={<Icon name="graduation" className="h-7 w-7" />}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <article key={course.id} className="card flex h-full flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-800">
                      <Icon name="graduation" className="h-5 w-5" />
                    </div>
                    {course.duration ? <Badge tone="gold">{course.duration}</Badge> : null}
                  </div>
                  <h3 className="mt-4 text-base font-semibold leading-snug">{course.title}</h3>
                  {course.objective ? (
                    <p className="mt-2 text-sm leading-relaxed text-navy-600">{course.objective}</p>
                  ) : null}
                  <dl className="mt-4 space-y-2 text-xs text-navy-600">
                    {course.audience ? (
                      <div>
                        <dt className="font-semibold text-navy-800">Public concerné</dt>
                        <dd>{course.audience}</dd>
                      </div>
                    ) : null}
                    {course.modalities ? (
                      <div>
                        <dt className="font-semibold text-navy-800">Modalités</dt>
                        <dd>{course.modalities}</dd>
                      </div>
                    ) : null}
                    {course.priceText ? (
                      <div>
                        <dt className="font-semibold text-navy-800">Tarif</dt>
                        <dd>{course.priceText}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <a href="#inscription" className="btn-outline mt-5 w-full !py-2.5 text-[13px]">
                    Demander des informations
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section id="inscription">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Inscription"
              title="Faire une demande"
              description="Remplissez ce formulaire : nous vous recontactons avec les informations pratiques et les prochaines sessions."
            />
          </div>
          <div className="lg:col-span-7">
            <RegistrationForm courses={courses} />
          </div>
        </div>
      </Section>
    </>
  )
}
