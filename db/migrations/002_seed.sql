-- ===========================================================================
-- BRILLE GROUP SARL — Migration 002 : contenus de départ
-- IMPORTANT : ce fichier ne contient QUE des informations fournies par
-- l'entreprise (flyer officiel + brief). Aucun chiffre, aucune référence de
-- chantier, aucun témoignage, aucune certification n'est inventé.
-- Les champs non confirmés restent vides et sont modifiables dans
-- l'administration > Paramètres.
-- Les INSERT utilisent ON CONFLICT DO NOTHING : une valeur modifiée par
-- l'administrateur n'est jamais écrasée par une nouvelle migration.
-- ===========================================================================

INSERT INTO site_settings (key, value) VALUES
  ('company_name',        '"BRILLE GROUP SARL"'),
  ('company_short_name',  '"BRILLE GROUP"'),
  ('tagline',             '"Let''s shine together"'),
  ('legal_form',          '"SARL"'),
  ('phone_primary',       '"+225 27 24 57 11 86"'),
  ('phone_secondary',     '"+225 07 49 63 47 26"'),
  ('phone_third',         '"+225 05 00 49 24 24"'),
  ('whatsapp_number',     '""'),
  ('email_primary',       '"contactbrillegroup@gmail.com"'),
  ('address_line',        '"Tazibouo, région de Daloa"'),
  ('city',                '"Daloa"'),
  ('region',              '"Haut-Sassandra"'),
  ('country',             '"Côte d''Ivoire"'),
  ('intervention_area',   '"Région de Daloa et localités environnantes (zone à confirmer avec l''entreprise)"'),
  ('opening_hours',       '""'),
  ('facebook_url',        '"https://web.facebook.com/Brille-Group-Sarl-151826211353649/"'),
  ('linkedin_url',        '""'),
  ('instagram_url',       '""'),
  ('tiktok_url',          '""'),
  ('website_url',         '"https://www.brillegroup.com"'),
  ('legal_rcm',           '"RCCM n° CI-ABJ-03-2023-B13-07234 du 03/07/2023 — Tribunal du Commerce d''Abidjan"'),
  ('legal_cc',            '""'),
  ('legal_text',          '"Les informations publiées sur ce site sont fournies à titre indicatif et peuvent évoluer. Toute prestation fait l''objet d''un devis et d''un contrat écrits."'),
  ('about_intro',         '"BRILLE GROUP SARL est une entreprise ivoirienne multiservices. Elle intervient dans l''aménagement foncier, le BTP et la construction, la topographie, l''immobilier et la vente de terrains, le conseil, la formation et le nettoyage professionnel."'),
  ('about_mission',       '"Offrir à ses clients un interlocuteur unique, capable de coordonner plusieurs métiers autour d''un même projet, avec méthode, transparence et redevabilité."'),
  ('about_vision',        '"Devenir une référence régionale du conseil et des services intégrés, en associant qualité d''exécution et fiabilité de la relation client."'),
  ('values_json',         '[{"title":"Excellence","text":"Viser un travail soigné et conforme à ce qui a été convenu."},{"title":"Intégrité","text":"Communiquer clairement sur les prix, les délais et les limites de chaque prestation."},{"title":"Redevabilité","text":"Répondre de ses engagements et rendre compte de l''avancement des travaux."}]'),
  ('seo_default_title',   '"BRILLE GROUP SARL — BTP, aménagement foncier, topographie et immobilier à Daloa"'),
  ('seo_default_description', '"Entreprise ivoirienne multiservices à Tazibouo (région de Daloa) : aménagement foncier, construction et BTP, topographie, immobilier et vente de terrains, conseils, formation et nettoyage professionnel."'),
  ('hero_title',          '"Des solutions intégrées pour construire, aménager et valoriser vos projets."'),
  ('hero_subtitle',       '"BRILLE GROUP SARL vous accompagne dans vos projets de construction, d''aménagement foncier, de topographie, d''immobilier, de formation et de nettoyage professionnel."'),
  ('foncier_warning',     '"Les informations relatives aux terrains, titres, limites, droits fonciers et documents administratifs affichées sur ce site sont indicatives. Elles doivent être vérifiées auprès des services compétents et faire l''objet d''un contrôle juridique avant toute transaction. La publication d''une annonce ne constitue ni une garantie de propriété, ni un acte de vente."'),
  ('whatsapp_enabled',    'false'),
  ('maintenance_mode',    'false')
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Domaines d'activité (6 cœurs de métier + activités complémentaires citées
-- sur le flyer officiel de l'entreprise)
-- ---------------------------------------------------------------------------
INSERT INTO services (slug, title, category, short_description, description, bullets, image_url, icon, sort_order, is_core, is_published) VALUES
  ('amenagement-foncier', 'Aménagement foncier & rural', 'metier',
   'Préparation, structuration et valorisation de terrains et d''espaces ruraux.',
   'BRILLE GROUP SARL accompagne les propriétaires fonciers, les collectivités et les porteurs de projets dans la préparation et la valorisation de leurs terrains : organisation des parcelles, aménagement des accès, viabilisation et aménagement d''espaces ruraux. Chaque intervention débute par un échange sur le besoin réel, une visite du site lorsque cela est possible, puis une proposition écrite.',
   '["Étude du besoin et visite du site","Organisation et préparation des parcelles","Aménagement des accès et des espaces","Accompagnement administratif (à préciser selon le dossier)"]'::jsonb,
   '/images/amenagement-foncier.jpg', 'map', 1, true, true),

  ('btp-construction', 'BTP & construction', 'metier',
   'Construction de bâtiments, travaux de bâtiment et suivi de chantier.',
   'De la construction neuve aux travaux de bâtiment, BRILLE GROUP SARL intervient sur des projets de construction pour particuliers, entreprises et promoteurs. La prestation est cadrée par un devis détaillé : nature des travaux, matériaux, délais et modalités de paiement. Les prestations réellement réalisées par l''entreprise sont à confirmer avec elle avant publication.',
   '["Construction de bâtiments","Travaux de bâtiment et gros œuvre","Travaux complémentaires (selon confirmation)","Suivi et coordination de chantier"]'::jsonb,
   '/images/btp-construction.jpg', 'building', 2, true, true),

  ('topographie', 'Topographie', 'metier',
   'Relevés, plans et données de terrain pour préparer et sécuriser vos projets.',
   'La topographie fournit les données de terrain nécessaires à la conception et à l''exécution d''un projet. Les opérations proposées par BRILLE GROUP SARL sont à confirmer avec l''entreprise, certaines prestations foncières étant réservées à des professionnels habilités. Contactez-nous pour préciser votre besoin et vérifier la faisabilité.',
   '["Relevés et plans de terrain (à confirmer)","Implantation de projets","Documents graphiques pour vos dossiers","Coordination avec les professionnels habilités"]'::jsonb,
   '/images/topographie.jpg', 'compass', 3, true, true),

  ('immobilier-terrains', 'Immobilier & vente de terrains', 'metier',
   'Biens et terrains proposés par l''entreprise, avec information transparente.',
   'BRILLE GROUP SARL propose des terrains et des biens immobiliers. Chaque annonce publiée sur ce site précise, lorsqu''elle est disponible, la localisation, la superficie, le prix et le statut de disponibilité. Les informations et documents fonciers doivent être contrôlés avant toute transaction ; la publication d''une annonce ne constitue pas une garantie de propriété.',
   '["Terrains à vendre","Biens immobiliers","Informations et visites sur rendez-vous","Accompagnement dans la démarche d''achat"]'::jsonb,
   '/images/immobilier.jpg', 'home', 4, true, true),

  ('conseils-formation', 'Conseils & formation', 'metier',
   'Conseil aux porteurs de projets et formations professionnelles.',
   'Au-delà des travaux, BRILLE GROUP SARL propose du conseil et de la formation. Les programmes, durées et modalités sont présentés dans le catalogue de formations lorsqu''ils sont confirmés. Aucun diplôme, accréditation ou certification n''est délivré sans validation explicite de l''entreprise.',
   '["Conseil aux porteurs de projets","Formations professionnelles","Accompagnement des équipes","Sessions sur demande"]'::jsonb,
   '/images/conseils-formation.jpg', 'graduation', 5, true, true),

  ('nettoyage-professionnel', 'Nettoyage professionnel', 'metier',
   'Entretien et nettoyage de locaux professionnels, de maisons et après travaux.',
   'BRILLE GROUP SARL propose des prestations de nettoyage et d''entretien. Les services ci-dessous sont activables : ils ne sont affichés comme disponibles qu''après confirmation de l''entreprise. Les prestations de désinfection ou de traitement antiparasitaire ne sont pas proposées sur ce site faute de qualification vérifiée.',
   '["Nettoyage de bureaux et locaux professionnels","Nettoyage de maisons","Nettoyage après travaux","Entretien courant et prestations ponctuelles"]'::jsonb,
   '/images/nettoyage.jpg', 'sparkles', 6, true, true),

  ('agriculture', 'Agriculture', 'complementaire',
   'Activités agricoles et valorisation de terres à usage agricole.',
   'Activité citée par l''entreprise. Le détail des prestations (production, conseil agricole, valorisation de parcelles) sera précisé par BRILLE GROUP SARL.',
   '[]'::jsonb, '/images/agriculture.jpg', 'leaf', 7, false, true),

  ('ntic', 'NTIC', 'complementaire',
   'Services liés aux technologies de l''information et de la communication.',
   'Activité citée par l''entreprise. Le périmètre exact des prestations numériques sera précisé par BRILLE GROUP SARL.',
   '[]'::jsonb, '/images/ntic.jpg', 'monitor', 8, false, true),

  ('monetique', 'Monétique', 'complementaire',
   'Solutions et services de monétique.',
   'Activité citée par l''entreprise. Le détail des solutions proposées sera précisé par BRILLE GROUP SARL.',
   '[]'::jsonb, '/images/monetique.jpg', 'card', 9, false, true),

  ('transport', 'Transport', 'complementaire',
   'Prestations de transport et de logistique.',
   'Activité citée par l''entreprise. Les modalités (véhicules, zones desservies, conditions) seront précisées par BRILLE GROUP SARL.',
   '[]'::jsonb, '/images/transport.jpg', 'truck', 10, false, true),

  ('mode-beaute', 'Mode & beauté', 'complementaire',
   'Activités liées à la mode et aux prestations de beauté.',
   'Activité citée par l''entreprise. Le détail des prestations sera précisé par BRILLE GROUP SARL.',
   '[]'::jsonb, '/images/mode-beaute.jpg', 'scissors', 11, false, true)
ON CONFLICT (slug) DO NOTHING;

-- Aucune réalisation, aucun bien immobilier et aucune formation ne sont
-- insérés ici : ces contenus doivent provenir de l'entreprise. Les pages
-- publiques affichent un état vide élégant tant qu'aucune donnée n'existe.
