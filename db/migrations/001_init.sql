-- ===========================================================================
-- BRILLE GROUP SARL — Migration 001 : schéma initial
-- Base : PostgreSQL 15+ (Neon)
-- Exécution : npm run db:migrate   (idempotent, suivi dans schema_migrations)
-- ===========================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Utilitaire : mise à jour automatique de updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 1. Administrateurs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email          text NOT NULL,
  full_name      text NOT NULL DEFAULT '',
  password_hash  text NOT NULL,
  role           text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  is_active      boolean NOT NULL DEFAULT true,
  token_version  integer NOT NULL DEFAULT 1,
  last_login_at  timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_key ON admin_users (lower(email));
DROP TRIGGER IF EXISTS admin_users_updated_at ON admin_users;
CREATE TRIGGER admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Paramètres du site (clé/valeur JSON)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_key_format CHECK (key ~ '^[a-z0-9_]{2,64}$')
);
DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Services / domaines d'activité
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text NOT NULL UNIQUE,
  title             text NOT NULL,
  category          text NOT NULL DEFAULT 'metier',
  short_description text NOT NULL DEFAULT '',
  description       text NOT NULL DEFAULT '',
  bullets           jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url         text,
  icon              text NOT NULL DEFAULT 'building',
  sort_order        integer NOT NULL DEFAULT 0,
  is_core           boolean NOT NULL DEFAULT false,
  is_published      boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT services_slug_format CHECK (slug ~ '^[a-z0-9-]{2,80}$'),
  CONSTRAINT services_bullets_array CHECK (jsonb_typeof(bullets) = 'array')
);
CREATE INDEX IF NOT EXISTS services_published_idx ON services (is_published, sort_order);
DROP TRIGGER IF EXISTS services_updated_at ON services;
CREATE TRIGGER services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Annonces immobilières / terrains
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS properties (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference   text NOT NULL UNIQUE,
  title       text NOT NULL,
  property_type text NOT NULL DEFAULT 'terrain',
  location    text NOT NULL DEFAULT '',
  area_sqm    numeric(12,2),
  price_fcfa  bigint,
  description text NOT NULL DEFAULT '',
  images      jsonb NOT NULL DEFAULT '[]'::jsonb,
  status      text NOT NULL DEFAULT 'disponible'
                CHECK (status IN ('disponible', 'reserve', 'vendu')),
  extra_info  text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT properties_area_positive CHECK (area_sqm IS NULL OR area_sqm > 0),
  CONSTRAINT properties_price_positive CHECK (price_fcfa IS NULL OR price_fcfa >= 0),
  CONSTRAINT properties_images_array CHECK (jsonb_typeof(images) = 'array')
);
CREATE INDEX IF NOT EXISTS properties_public_idx ON properties (is_published, status, created_at DESC);
CREATE INDEX IF NOT EXISTS properties_type_idx ON properties (property_type);
CREATE INDEX IF NOT EXISTS properties_price_idx ON properties (price_fcfa);
DROP TRIGGER IF EXISTS properties_updated_at ON properties;
CREATE TRIGGER properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. Réalisations / projets
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  category    text NOT NULL DEFAULT 'construction',
  description text NOT NULL DEFAULT '',
  location    text NOT NULL DEFAULT '',
  period      text NOT NULL DEFAULT '',
  cover_image text,
  images      jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order  integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT projects_images_array CHECK (jsonb_typeof(images) = 'array')
);
CREATE INDEX IF NOT EXISTS projects_published_idx ON projects (is_published, sort_order);
DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. Catalogue de formations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS training_courses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  objective   text NOT NULL DEFAULT '',
  audience    text NOT NULL DEFAULT '',
  duration    text NOT NULL DEFAULT '',
  modalities  text NOT NULL DEFAULT '',
  price_text  text NOT NULL DEFAULT '',
  sort_order  integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS courses_published_idx ON training_courses (is_published, sort_order);
DROP TRIGGER IF EXISTS courses_updated_at ON training_courses;
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON training_courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. Demandes de devis
-- ---------------------------------------------------------------------------
-- Séquence atomique pour les références lisibles : DEV-2026-0001
CREATE SEQUENCE IF NOT EXISTS quote_reference_seq START WITH 1;
CREATE TABLE IF NOT EXISTS quote_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       text NOT NULL UNIQUE,
  full_name       text NOT NULL,
  phone           text NOT NULL,
  email           text,
  service_type    text NOT NULL,
  location        text NOT NULL DEFAULT '',
  budget          text NOT NULL DEFAULT '',
  timeline        text NOT NULL DEFAULT '',
  description     text NOT NULL,
  source_page     text NOT NULL DEFAULT '',
  status          text NOT NULL DEFAULT 'nouvelle'
                    CHECK (status IN ('nouvelle', 'a_contacter', 'en_discussion',
                                      'devis_envoye', 'acceptee', 'terminee', 'sans_suite')),
  internal_notes  text NOT NULL DEFAULT '',
  assigned_to     uuid REFERENCES admin_users (id) ON DELETE SET NULL,
  ip_hash         text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quotes_status_idx ON quote_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS quotes_created_idx ON quote_requests (created_at DESC);
DROP TRIGGER IF EXISTS quotes_updated_at ON quote_requests;
CREATE TRIGGER quotes_updated_at BEFORE UPDATE ON quote_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 8. Messages de contact
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  phone       text NOT NULL DEFAULT '',
  email       text,
  subject     text NOT NULL DEFAULT '',
  message     text NOT NULL,
  status      text NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'lu', 'traite')),
  ip_hash     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_status_idx ON contact_messages (status, created_at DESC);
DROP TRIGGER IF EXISTS contact_updated_at ON contact_messages;
CREATE TRIGGER contact_updated_at BEFORE UPDATE ON contact_messages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 9. Inscriptions / demandes d'information formation
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS training_registrations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  uuid REFERENCES training_courses (id) ON DELETE SET NULL,
  course_title text NOT NULL DEFAULT '',
  full_name  text NOT NULL,
  phone      text NOT NULL,
  email      text,
  message    text NOT NULL DEFAULT '',
  status     text NOT NULL DEFAULT 'nouvelle'
               CHECK (status IN ('nouvelle', 'a_contacter', 'inscrit', 'sans_suite')),
  ip_hash    text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS registrations_status_idx ON training_registrations (status, created_at DESC);
DROP TRIGGER IF EXISTS registrations_updated_at ON training_registrations;
CREATE TRIGGER registrations_updated_at BEFORE UPDATE ON training_registrations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 10. Limitation de débit (anti-spam) — la mémoire serveur n'est pas fiable
--     en environnement serverless, on compte donc en base.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rate_limits (
  key          text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  hits         integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS rate_limits_window_idx ON rate_limits (window_start);

-- ---------------------------------------------------------------------------
-- 11. Suivi des migrations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename   text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 12. Sécurité : RLS activée partout (refus par défaut).
--     Aucune politique n'est créée pour les rôles publics : un client
--     anonyme (clé exposée, accès direct PostgREST, etc.) ne peut rien lire.
--     L'API serveur se connecte avec le rôle propriétaire du projet Neon,
--     qui contourne la RLS : toutes les autorisations sont donc appliquées
--     dans le code de l'API (voir server/auth.ts et server/routes/*).
--     Si un jour la base est exposée à un client tiers, il faudra créer un
--     rôle dédié + des politiques explicites.
-- ---------------------------------------------------------------------------
ALTER TABLE admin_users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE services               ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties             ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects               ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_courses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests         ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits            ENABLE ROW LEVEL SECURITY;
