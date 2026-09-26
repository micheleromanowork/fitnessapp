'use client'
import { useProfile } from '@/stores/profile'
import { t } from '@/i18n'

export default function CoachPage() {
  const lang = useProfile(s => s.language)
  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-bold text-t1 mb-6">{t(lang, 'nav.coach')}</h1>
      <div className="text-center py-20 text-t3">
        <p className="text-4xl mb-3">🤖</p>
        <p>{lang === 'it' ? 'Il tuo AI Coach arriva presto' : 'Your AI Coach is coming soon'}</p>
        <p className="text-xs mt-2 text-t3/60">AI Coach — Milestone 7</p>
      </div>
    </div>
  )
}
