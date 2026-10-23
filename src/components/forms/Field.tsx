import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/format'

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="label" htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="ml-1 text-brandred" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1 text-xs font-normal text-navy-400">(facultatif)</span>
        )}
      </label>
      {children}
      {hint && !error ? <p className="hint">{hint}</p> : null}
      {error ? (
        <p className="error-text" id={`${htmlFor}-error`} role="alert">
          <svg viewBox="0 0 20 20" className="mt-px h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden="true">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 3.5a1 1 0 011 1V11a1 1 0 11-2 0V6.5a1 1 0 011-1zm0 8.5a1.2 1.2 0 110 2.4A1.2 1.2 0 0110 14z" />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }

export function TextInput({ invalid, className, ...props }: InputProps) {
  return <input {...props} aria-invalid={invalid || undefined} className={cn('input', invalid && 'input-error', className)} />
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }

export function TextArea({ invalid, className, ...props }: TextareaProps) {
  return <textarea {...props} aria-invalid={invalid || undefined} className={cn('input min-h-[120px]', invalid && 'input-error', className)} />
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }

export function Select({ invalid, className, children, ...props }: SelectProps) {
  return (
    <select {...props} aria-invalid={invalid || undefined} className={cn('input appearance-none pr-10', invalid && 'input-error', className)}>
      {children}
    </select>
  )
}

/** Champ piège invisible pour les robots. Ne jamais le remplir. */
export function Honeypot({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
      <label htmlFor="company_website">Site web de l’entreprise</label>
      <input
        id="company_website"
        name="company_website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

export function Consent({
  id,
  checked,
  onChange,
  error,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-navy-300 text-navy-900 focus:ring-2 focus:ring-navy-900/20"
        />
        <label htmlFor={id} className="text-[13px] leading-relaxed text-navy-600">
          J’accepte que BRILLE GROUP SARL utilise les informations saisies pour traiter ma demande et me
          recontacter. Aucune donnée n’est cédée à un tiers.{' '}
          <a href="/politique-confidentialite" className="link-underline">
            Politique de confidentialité
          </a>
        </label>
      </div>
      {error ? (
        <p className="error-text ml-8" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
