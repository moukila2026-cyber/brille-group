-- ===========================================================================
-- BRILLE GROUP SARL — Migration 003 : contenus officiels confirmés par l'entreprise
-- Contient exclusivement les données réelles communiquées par BRILLE GROUP SARL :
--   - Coordonnées : Bureau (27 24 57 11 86), WhatsApp officiel (07 49 63 47 26),
--     Sercom (05 00 49 24 24), e-mail contactbrillegroup@gmail.com
--   - Zone d'intervention : basée à Daloa (Tazibouo), intervention partout en Côte d'Ivoire
--   - Services complets : Aménagement foncier, Construction de bâtiments & BTP,
--     Topographie, Immobilier & vente de terrains, Conseils & formation,
--     Nettoyage industriel professionnel (12 prestations) + Hygiène 3D/4D
--     (dératisation, désinsectisation, désinfection, désodorisation)
--   - Réalisation confirmée : Construction d'une cité 2x3 pièces, 1x2 pièces et 6 studios
--     (sans image d'illustration présentée comme photo de chantier)
-- ===========================================================================

INSERT INTO site_settings (key, value) VALUES
  ('phone_primary',     '"+225 27 24 57 11 86"'),
  ('phone_secondary',   '"+225 07 49 63 47 26"'),
  ('phone_third',       '"+225 05 00 49 24 24"'),
  ('whatsapp_number',   '"+225 07 49 63 47 26"'),
  ('whatsapp_enabled',  'true'),
  ('website_url',       '"https://brille-group.vercel.app"'),
  ('intervention_area', '"Implantée à Daloa (quartier Tazibouo, Haut-Sassandra) — intervention à Daloa et partout en Côte d''Ivoire."'),
  ('hero_title',        '"Construire, aménager, assainir et valoriser vos projets partout en Côte d''Ivoire."'),
  ('hero_subtitle',     '"Implantée à Daloa (Tazibouo), BRILLE GROUP SARL réunit aménagement foncier, construction de bâtiments et BTP, topographie, immobilier et vente de terrains, conseils, formation, nettoyage industriel professionnel et hygiène 3D (dératisation, désinsectisation, désinfection)."'),
  ('about_intro',       '"BRILLE GROUP SARL est une entreprise ivoirienne multiservices implantée à Daloa (Tazibouo) qui intervient partout en Côte d''Ivoire : aménagement foncier, construction de bâtiments et BTP, topographie, immobilier et vente de terrains, conseils, formation, ainsi que nettoyage industriel professionnel, dératisation, désinsectisation et désinfection."'),
  ('seo_default_title', '"BRILLE GROUP SARL — Aménagement foncier, BTP, topographie, immobilier & nettoyage 3D à Daloa"'),
  ('seo_default_description', '"Entreprise multiservices à Daloa (Tazibouo) intervenant partout en Côte d''Ivoire : aménagement foncier, construction de bâtiments et BTP, topographie, vente de terrains, conseils, formation, nettoyage industriel professionnel, dératisation, désinsectisation et désinfection."')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Mise à jour complète des 6 domaines principaux avec les prestations confirmées
-- ---------------------------------------------------------------------------
UPDATE services
SET
  title = 'Aménagement foncier & rural',
  short_description = 'Préparation, structuration, ouverture d''accès et valorisation de terrains urbains et ruraux.',
  description = 'Entreprise d''aménagement foncier implantée à Daloa et intervenant partout en Côte d''Ivoire, BRILLE GROUP SARL accompagne les propriétaires fonciers, collectivités et porteurs de projets dans la préparation, l''organisation parcellaire, l''ouverture d''accès et la mise en valeur de leurs terrains. Chaque intervention débute par une analyse du besoin, un repérage sur site et un devis écrit détaillé.',
  bullets = '["Étude du besoin et visite du site","Organisation et structuration des parcelles","Ouverture des voies d''accès et viabilisation","Mise en valeur d''espaces urbains et ruraux"]'::jsonb,
  updated_at = now()
WHERE slug = 'amenagement-foncier';

UPDATE services
SET
  title = 'Construction de bâtiments — BTP',
  short_description = 'Construction de cités résidentielles, villas, studios, locaux professionnels et suivi de chantier.',
  description = 'BRILLE GROUP SARL réalise vos projets de construction de bâtiments et de BTP à Daloa et partout en Côte d''Ivoire : maisons individuelles, cités résidentielles (logements de 2 et 3 pièces, studios), locaux professionnels, gros œuvre, rénovation et réhabilitation. Référence réalisée : construction d''une cité comprenant 2 logements de 3 pièces, 1 logement de 2 pièces et 6 studios.',
  bullets = '["Construction de bâtiments et cités résidentielles (2 pièces, 3 pièces, studios)","Travaux de bâtiment, gros œuvre et second œuvre","Rénovation, extension et réhabilitation","Devis détaillé, coordination et suivi complet de chantier"]'::jsonb,
  updated_at = now()
WHERE slug = 'btp-construction';

UPDATE services
SET
  title = 'Topographie',
  short_description = 'Relevés topographiques, plans de terrain, implantation d''ouvrages et coordination avec les professionnels habilités.',
  description = 'La topographie fournit les données géométriques indispensables à la conception, à la sécurisation et à l''implantation de vos projets fonciers et immobiliers. BRILLE GROUP SARL organise vos relevés, plans et implantations à Daloa et partout en Côte d''Ivoire, en coordination avec des professionnels habilités pour les opérations foncières réglementées.',
  bullets = '["Relevés topographiques et plans de terrain","Implantation de bâtiments et de lotissements","Documents graphiques pour dossiers techniques","Prestations réglementées réalisées par des professionnels habilités"]'::jsonb,
  updated_at = now()
WHERE slug = 'topographie';

UPDATE services
SET
  title = 'Immobilier & vente de terrains',
  short_description = 'Vente de terrains, biens immobiliers, visites sur rendez-vous et accompagnement transparent.',
  description = 'BRILLE GROUP SARL propose la vente de terrains et de biens immobiliers à Daloa et en Côte d''Ivoire, avec une information transparente sur la localisation, la superficie, le prix et la disponibilité. La vérification préalable des documents fonciers auprès des autorités compétentes est systématiquement rappelée avant toute transaction.',
  bullets = '["Vente de terrains urbains et ruraux","Biens immobiliers et logements","Visites sur rendez-vous et accompagnement à l''acquisition","Vérification préalable indispensable des documents fonciers"]'::jsonb,
  updated_at = now()
WHERE slug = 'immobilier-terrains';

UPDATE services
SET
  title = 'Conseils & formation',
  short_description = 'Conseil opérationnel aux porteurs de projets et formations professionnelles adaptées.',
  description = 'BRILLE GROUP SARL accompagne les particuliers, entrepreneurs et organisations dans l''étude et la structuration de leurs projets, et propose des sessions de formation professionnelle adaptées aux besoins exprimés.',
  bullets = '["Conseil et accompagnement des porteurs de projets","Formations professionnelles sur demande","Appui organisationnel aux équipes et entreprises","Interventions à Daloa et partout en Côte d''Ivoire"]'::jsonb,
  updated_at = now()
WHERE slug = 'conseils-formation';

UPDATE services
SET
  title = 'Nettoyage professionnel & Hygiène 3D',
  short_description = 'Nettoyage industriel (fauteuils, matelas, marbre, vitres, fin de chantier, auto) et lutte anti-nuisibles : dératisation, désinsectisation, désinfection.',
  description = 'Spécialisée dans le nettoyage industriel professionnel ainsi que dans la dératisation, la désinsectisation, la désinfection et la désodorisation à domicile et dans les établissements professionnels (bureaux, magasins, restaurants, supermarchés, grandes surfaces, entrepôts), BRILLE GROUP SARL intervient à Daloa et partout en Côte d''Ivoire à coût compétitif.',
  bullets = '["Nettoyage & désinfection de fauteuils, matelas, moquettes et tapis","Fin de chantier, avant aménagement, après rénovation, façades, plafonds & baies vitrées","Nettoyage & ponçage du marbre, intérieur de voiture","Dératisation, désinsectisation, désinfection & désodorisation (rats, souris, cafards, punaises de lit, moustiques, bactéries, virus…)"]'::jsonb,
  updated_at = now()
WHERE slug = 'nettoyage-professionnel';

-- ---------------------------------------------------------------------------
-- Réalisation confirmée par BRILLE GROUP SARL
-- cover_image reste NULL : aucune illustration générée n'est présentée comme photo de chantier.
-- ---------------------------------------------------------------------------
INSERT INTO projects (title, category, description, location, period, cover_image, images, sort_order, is_published)
SELECT
  'Construction d''une cité résidentielle : 2×3 pièces, 1×2 pièces et 6 studios',
  'construction',
  'Réalisation d''un ensemble résidentiel complet comprenant 2 logements de 3 pièces, 1 logement de 2 pièces et 6 studios (9 logements au total). Contacts directs pour références et visites : Bureau +225 27 24 57 11 86 · Sercom +225 05 00 49 24 24 · WhatsApp +225 07 49 63 47 26.',
  'Côte d''Ivoire',
  '',
  NULL,
  '[]'::jsonb,
  1,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM projects WHERE title ILIKE 'Construction d%une cité%'
);
