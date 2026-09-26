'use client'
import it from './it.json'
import en from './en.json'

type Locale = 'it' | 'en'
const dicts = { it, en } as const

function get(obj: Record<string, unknown>, path: string): string {
  return path.split('.').reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], obj) as string ?? path
}

export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  let s = get(dicts[locale] as unknown as Record<string, unknown>, key)
  if (vars) Object.entries(vars).forEach(([k, v]) => { s = s.replace(`{${k}}`, String(v)) })
  return s
}

export type { Locale }
