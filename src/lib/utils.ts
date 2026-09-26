import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function estimate1RM(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg
  if (reps <= 0) return 0
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10
}

export function setVolume(weightKg: number, reps: number): number {
  return Math.round(weightKg * reps * 10) / 10
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (s > 0 && m > 0) return `${m}m ${s}s`
  if (m > 0) return `${m}m`
  return `${s}s`
}

export function formatWeight(kg: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (unit === 'imperial') return `${Math.round(kg * 2.20462 * 10) / 10} lbs`
  return `${kg} kg`
}

export function calculateStreak(dates: Date[]): number {
  if (!dates.length) return 0
  const sorted = [...dates].map(d => {
    const n = new Date(d); n.setHours(0, 0, 0, 0); return n.getTime()
  }).sort((a, b) => b - a)
  const unique = [...new Set(sorted)]
  const today = new Date(); today.setHours(0, 0, 0, 0)
  let streak = 0, current = today.getTime()
  for (const ts of unique) {
    const diff = Math.round((current - ts) / 86400000)
    if (diff === 0 || diff === 1) { streak++; current = ts } else break
  }
  return streak
}

export function volumeChangePct(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

export function formatRelativeDate(date: Date | number, lang: 'it' | 'en' = 'it'): string {
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return lang === 'it' ? 'Oggi' : 'Today'
  if (diffDays === 1) return lang === 'it' ? 'Ieri' : 'Yesterday'
  if (diffDays < 7) return lang === 'it' ? `${diffDays} giorni fa` : `${diffDays} days ago`
  return d.toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', { day: 'numeric', month: 'short' })
}
