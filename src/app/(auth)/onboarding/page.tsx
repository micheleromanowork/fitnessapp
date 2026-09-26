'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Loader2, Check } from 'lucide-react'
import { useProfile } from '@/stores/profile'
import { t } from '@/i18n'

type Goal = 'muscle_gain' | 'fat_loss' | 'recomposition' | 'strength' | 'general_fitness' | 'endurance'
type Level = 'beginner' | 'intermediate' | 'advanced'

const GOALS: Goal[] = ['muscle_gain', 'fat_loss', 'recomposition', 'strength', 'general_fitness', 'endurance']
const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced']
const FREQUENCIES = [2, 3, 4, 5, 6]
const DURATIONS = [30, 45, 60, 75, 90]
const EQUIPMENT_OPTIONS = [
  { id: 'bodyweight', icon: '🤸' },
  { id: 'dumbbell', icon: '🏋️' },
  { id: 'barbell', icon: '🔩' },
  { id: 'cable', icon: '🔄' },
  { id: 'machine', icon: '⚙️' },
  { id: 'kettlebell', icon: '🫗' },
  { id: 'pullup_bar', icon: '🪜' },
  { id: 'dip_station', icon: '🤾' },
  { id: 'bench', icon: '🪑' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const lang = useProfile(s => s.language)
  const setProfile = useProfile(s => s.set)

  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState<Goal>('muscle_gain')
  const [level, setLevel] = useState<Level>('intermediate')
  const [frequency, setFrequency] = useState(4)
  const [duration, setDuration] = useState(60)
  const [equipment, setEquipment] = useState<string[]>(['barbell', 'dumbbell', 'cable', 'machine', 'bench'])
  const [saving, setSaving] = useState(false)

  const STEPS = [
    t(lang, 'onboarding.goal'),
    t(lang, 'onboarding.level'),
    t(lang, 'onboarding.frequency'),
    t(lang, 'onboarding.equipment'),
    t(lang, 'onboarding.ready'),
  ]

  const toggleEquipment = useCallback((id: string) => {
    setEquipment(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    )
  }, [])

  async function handleFinish() {
    setSaving(true)
    try {
      setProfile({ onboardingDone: true })
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, level, weeklyFrequency: frequency, sessionDurationMin: duration, equipment }),
      })
    } catch {
      // Profile save non-blocking; will sync on next load
    }
    router.replace('/home')
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <p className="text-t3 text-sm text-center">
          {t(lang, 'onboarding.step', { n: step + 1, total: STEPS.length })}
        </p>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      {/* Step title */}
      <h2 className="text-2xl font-bold text-t1">{STEPS[step]}</h2>

      {/* Step content */}
      <div className="space-y-3 min-h-[280px]">
        {step === 0 && (
          <div className="grid grid-cols-2 gap-3">
            {GOALS.map(g => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={`p-4 rounded-2xl border text-sm font-medium text-left transition-all ${
                  goal === g
                    ? 'bg-primary/15 border-primary/60 text-t1'
                    : 'bg-[#1a1a24] border-white/[0.08] text-t2'
                }`}
              >
                {goal === g && <Check size={14} className="mb-1 text-primary" />}
                {t(lang, `goals.${g}`)}
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            {LEVELS.map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  level === l
                    ? 'bg-primary/15 border-primary/60 text-t1'
                    : 'bg-[#1a1a24] border-white/[0.08] text-t2'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t(lang, `levels.${l}`)}</span>
                  {level === l && <Check size={16} className="text-primary" />}
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-t2 text-sm">{t(lang, 'onboarding.frequency')}</label>
              <div className="flex gap-2">
                {FREQUENCIES.map(f => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                      frequency === f
                        ? 'bg-primary text-white'
                        : 'bg-[#1a1a24] text-t2'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-t2 text-sm">{t(lang, 'onboarding.duration')}</label>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      duration === d
                        ? 'bg-primary text-white'
                        : 'bg-[#1a1a24] text-t2'
                    }`}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-3 gap-2">
            {EQUIPMENT_OPTIONS.map(eq => (
              <button
                key={eq.id}
                onClick={() => toggleEquipment(eq.id)}
                className={`p-3 rounded-xl border text-center text-xs transition-all ${
                  equipment.includes(eq.id)
                    ? 'bg-primary/15 border-primary/60 text-t1'
                    : 'bg-[#1a1a24] border-white/[0.08] text-t2'
                }`}
              >
                <span className="text-2xl block mb-1">{eq.icon}</span>
                {eq.id.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-4 pt-4">
            <div className="text-6xl">🎯</div>
            <p className="text-t2">{t(lang, 'onboarding.readyDesc')}</p>
            <div className="card p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-t3">{t(lang, 'onboarding.goal')}</span><span className="text-t1 font-medium">{t(lang, `goals.${goal}`)}</span></div>
              <div className="flex justify-between"><span className="text-t3">{t(lang, 'onboarding.level')}</span><span className="text-t1 font-medium">{t(lang, `levels.${level}`)}</span></div>
              <div className="flex justify-between"><span className="text-t3">{t(lang, 'onboarding.frequency')}</span><span className="text-t1 font-medium">{frequency}x / week</span></div>
              <div className="flex justify-between"><span className="text-t3">{t(lang, 'onboarding.duration')}</span><span className="text-t1 font-medium">{duration} min</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="btn-secondary flex-none w-12 min-h-[52px] px-0"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <button
          onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : handleFinish()}
          disabled={saving}
          className="btn-primary flex-1"
        >
          {saving ? (
            <Loader2 size={20} className="animate-spin" />
          ) : step === STEPS.length - 1 ? (
            t(lang, 'onboarding.ready')
          ) : (
            <>
              {t(lang, 'common.next')}
              <ChevronRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
