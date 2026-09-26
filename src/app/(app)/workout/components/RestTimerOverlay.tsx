'use client'
import { Pause, Play, X } from 'lucide-react'
import { useWorkout } from '@/stores/workout'
import { useProfile } from '@/stores/profile'
import { t } from '@/i18n'

export function RestTimerOverlay() {
  const lang = useProfile(s => s.language)
  const { timerSec, timerRunning, timerVisible, lastRestSec, pauseTimer, skipTimer } = useWorkout()

  if (!timerVisible) return null

  const pct = lastRestSec > 0 ? timerSec / lastRestSec : 0
  const circumference = 2 * Math.PI * 54
  const mins = Math.floor(timerSec / 60)
  const secs = timerSec % 60

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overlay" onClick={skipTimer}>
      <div
        className="w-full max-w-sm bg-[#111118] border border-white/10 rounded-t-3xl p-6 pb-10 space-y-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-t2 text-sm font-medium">{t(lang, 'workout.restTimer')}</p>
          <button onClick={skipTimer} className="text-t3 hover:text-t1 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <svg width="128" height="128" className="-rotate-90">
              <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="64" cy="64" r="54" fill="none"
                stroke="var(--primary)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - pct)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="timer-font text-4xl font-bold text-t1">
                {mins > 0
                  ? `${mins}:${String(secs).padStart(2, '0')}`
                  : String(secs)
                }
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={pauseTimer}
              className="btn-secondary w-12 h-12 rounded-full p-0 flex items-center justify-center"
            >
              {timerRunning ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={skipTimer} className="btn-ghost text-sm px-5">
              {t(lang, 'common.done')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
