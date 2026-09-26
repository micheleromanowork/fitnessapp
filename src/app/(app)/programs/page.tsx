'use client'
import { useProfile } from '@/stores/profile'
import { t } from '@/i18n'
import { Plus } from 'lucide-react'

export default function ProgramsPage() {
  const lang = useProfile(s => s.language)
  return (
    <div className="min-h-screen px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-t1">{t(lang, 'programs.title')}</h1>
        <button className="btn-secondary text-sm px-3"><Plus size={16} /></button>
      </div>
      <div className="text-center py-20 text-t3">
        <p className="text-4xl mb-3">📋</p>
        <p>{t(lang, 'programs.empty')}</p>
        <p className="text-xs mt-2 text-t3/60">Programs builder — Milestone 5</p>
      </div>
    </div>
  )
}
