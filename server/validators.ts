/**
 * Schémas de validation (Zod) — appliqués côté serveur sur 100 % des entrées.
 * Le client refait une validation légère pour l'UX, mais la vérité est ici.
 */
import { z } from "zod";

const trimmed = (max: number) => z.string().trim().max(max);

const phone = trimmed(32)
  .min(6, "Numéro de téléphone trop court.")
  .regex(/^[+0-9 ().\-/]{6,32}$/, "Numéro de téléphone invalide.");

/** Email facultatif : chaîne vide acceptée et convertie en null. */
const optionalEmail = z
  .union([
    z.string().trim().email("Adresse e-mail invalide.").max(160),
    z.literal(""),
    z.null(),
    z.undefined(),
  ])
  .transform((v) => (v ? String(v).toLowerCase() : null));

/** Chaîne vide / null / absente → null (URL d'image facultative). */
const emptyToNull = (max: number) =>
  z
    .union([z.string().trim().max(max), z.literal(""), z.null(), z.undefined()])
    .transform((v) => (v ? String(v) : null))
    .optional()
    .default(null);

/** Nombre facultatif : '' ou null → null, sinon nombre contrôlé. */
const optionalPositiveNumber = (message: string, allowZero = false) =>
  z
    .union([z.coerce.number(), z.literal(""), z.null(), z.undefined()])
    .transform((v) =>
      v === "" || v === null || v === undefined ? null : Number(v),
    )
    .refine(
      (v) => v === null || (Number.isFinite(v) && (allowZero ? v >= 0 : v > 0)),
      message,
    );

export const SERVICE_TYPES = [
  "amenagement_foncier",
  "construction_btp",
  "topographie",
  "immobilier_terrain",
  "conseils",
  "formation",
  "nettoyage",
  "autre",
] as const;

export const QUOTE_STATUSES = [
  "nouvelle",
  "a_contacter",
  "en_discussion",
  "devis_envoye",
  "acceptee",
  "terminee",
  "sans_suite",
] as const;

/** Champ anti-robot : la valeur est contrôlée par antiSpamChecks (400 explicite). */
const honeypot = z.string().max(200).optional().default("");

/** Horodatage de chargement du formulaire (ms epoch). */
const formOpenedAt = z.coerce.number().int().nonnegative().optional();

export const quoteSchema = z.object({
  full_name: trimmed(120).min(2, "Merci d’indiquer votre nom complet."),
  phone,
  email: optionalEmail,
  service_type: z.enum(SERVICE_TYPES, {
    errorMap: () => ({ message: "Sélectionnez un type de service." }),
  }),
  location: trimmed(160).default(""),
  budget: trimmed(80).default(""),
  timeline: trimmed(80).default(""),
  description: trimmed(4000).min(
    10,
    "Décrivez votre besoin en quelques mots (10 caractères minimum).",
  ),
  source_page: trimmed(120).default(""),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Votre consentement est nécessaire." }),
  }),
  company_website: honeypot,
  form_opened_at: formOpenedAt,
});

export const contactSchema = z.object({
  name: trimmed(120).min(2, "Merci d’indiquer votre nom."),
  phone: z.union([phone, z.literal("")]).default(""),
  email: optionalEmail,
  subject: trimmed(160).default(""),
  message: trimmed(4000).min(
    10,
    "Votre message est trop court (10 caractères minimum).",
  ),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Votre consentement est nécessaire." }),
  }),
  company_website: honeypot,
  form_opened_at: formOpenedAt,
});

export const registrationSchema = z.object({
  course_id: z.string().uuid().nullable().optional(),
  course_title: trimmed(160).default(""),
  full_name: trimmed(120).min(2, "Merci d’indiquer votre nom complet."),
  phone,
  email: optionalEmail,
  message: trimmed(2000).default(""),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Votre consentement est nécessaire." }),
  }),
  company_website: honeypot,
  form_opened_at: formOpenedAt,
});

export const loginSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide.").max(160),
  password: z.string().min(8, "Mot de passe trop court.").max(200),
});

export const serviceSchema = z
  .object({
    slug: z
      .union([z.string().trim(), z.undefined(), z.null()])
      .transform((v) => (v ? String(v) : undefined))
      .refine(
        (v) => v === undefined || /^[a-z0-9-]{2,80}$/.test(v),
        "Identifiant URL invalide (a-z, 0-9 et tirets).",
      )
      .optional(),
    title: trimmed(160).min(2, "Titre requis."),
    category: z.enum(["metier", "complementaire"]).default("metier"),
    shortDescription: trimmed(300).default(""),
    description: trimmed(6000).default(""),
    bullets: z.array(trimmed(200)).max(20).default([]),
    imageUrl: emptyToNull(500),
    icon: trimmed(40).default("building"),
    sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
    isCore: z.boolean().default(false),
    isPublished: z.boolean().default(true),
  })
  .strict();

export const propertySchema = z
  .object({
    reference: z
      .union([z.string().trim(), z.undefined(), z.null()])
      .transform((v) => (v ? String(v) : undefined))
      .refine(
        (v) => v === undefined || /^[A-Za-z0-9-]{2,40}$/.test(v),
        "Référence invalide (lettres, chiffres, tirets).",
      )
      .optional(),
    title: trimmed(160).min(2, "Titre requis."),
    propertyType: z
      .enum(["terrain", "maison", "appartement", "local_commercial", "autre"])
      .default("terrain"),
    location: trimmed(160).default(""),
    areaSqm: optionalPositiveNumber("La superficie doit être positive."),
    priceFcfa: optionalPositiveNumber(
      "Le prix doit être positif ou nul.",
      true,
    ),
    description: trimmed(8000).default(""),
    images: z.array(z.string().trim().max(500)).max(12).default([]),
    status: z.enum(["disponible", "reserve", "vendu"]).default("disponible"),
    extraInfo: trimmed(2000).default(""),
    isPublished: z.boolean().default(true),
  })
  .strict();

export const projectSchema = z
  .object({
    title: trimmed(160).min(2, "Titre requis."),
    category: z
      .enum([
        "construction",
        "amenagement_foncier",
        "topographie",
        "immobilier",
        "nettoyage",
        "autre",
      ])
      .default("construction"),
    description: trimmed(8000).default(""),
    location: trimmed(160).default(""),
    period: trimmed(60).default(""),
    coverImage: emptyToNull(500),
    images: z.array(z.string().trim().max(500)).max(20).default([]),
    sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
    isPublished: z.boolean().default(true),
  })
  .strict();

export const courseSchema = z
  .object({
    title: trimmed(160).min(2, "Titre requis."),
    objective: trimmed(3000).default(""),
    audience: trimmed(600).default(""),
    duration: trimmed(120).default(""),
    modalities: trimmed(600).default(""),
    priceText: trimmed(120).default(""),
    sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
    isPublished: z.boolean().default(true),
  })
  .strict();

export const quoteUpdateSchema = z.object({
  status: z.enum(QUOTE_STATUSES).optional(),
  internal_notes: trimmed(4000).optional(),
  assigned_to: z.union([z.string().uuid(), z.literal(""), z.null()]).optional(),
});

export const messageUpdateSchema = z.object({
  status: z.enum(["nouveau", "lu", "traite"]).optional(),
});

export const registrationUpdateSchema = z.object({
  status: z
    .enum(["nouvelle", "a_contacter", "inscrit", "sans_suite"])
    .optional(),
});

export const settingsSchema = z.record(z.string(), z.unknown());

export const adminInviteSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide.").max(160),
  full_name: trimmed(120).min(2, "Nom requis."),
  password: z
    .string()
    .min(12, "Le mot de passe doit contenir au moins 12 caractères.")
    .max(200)
    .regex(/[A-Z]/, "Ajoutez au moins une majuscule.")
    .regex(/[a-z]/, "Ajoutez au moins une minuscule.")
    .regex(/[0-9]/, "Ajoutez au moins un chiffre."),
  role: z.enum(["admin", "superadmin"]).default("admin"),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
