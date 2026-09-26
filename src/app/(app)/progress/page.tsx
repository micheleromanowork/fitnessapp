'use client'
import { useProfile } from '@/stores/profile'
import { t } from '@/i18n'

export default function ProgressPage() {
  const lang = useProfile(s => s.language)
  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-bold text-t1 mb-6">{t(lang, 'progress.title')}</h1>
      <div className="text-center py-20 text-t3">
        <p className="text-4xl mb-3">📈</p>
        <p>{t(lang, 'common.noData')}</p>
        <p className="text-xs mt-2 text-t3/60">Analytics & charts — Milestone 6</p>
      </div>
    </div>
  )
}
