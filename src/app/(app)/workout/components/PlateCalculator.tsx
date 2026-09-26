'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import type { Locale } from '@/i18n'

const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25]
const PLATES_LBS = [45, 35, 25, 10, 5, 2.5]

interface Props {
  onClose: () => void
  lang: Locale
  units: 'metric' | 'imperial'
}

function calcPlates(target: number, bar: number, plates: number[]): { plate: number; count: number }[] {
  let remaining = Math.max(0, (target - bar)) / 2
  const result: { plate: number; count: number }[] = []
  for (const p of plates) {
    const n = Math.floor(remaining / p)
    if (n > 0) { result.push({ plate: p, count: n }); remaining -= n * p }
  }
  return result
}

export function PlateCalculator({ onClose, lang, units }: Props) {
  const isMetric = units !== 'imperial'
  const barDefault = isMetric ? 20 : 45
  const [target, setTarget] = useState(100)
  const [bar, setBar] = useState(barDefault)
  const plates = isMetric ? PLATES_KG : PLATES_LBS
  const result = calcPlates(target, bar, plates)
  const unit = isMetric ? 'kg' : 'lbs'

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="flex-1 overlay" />
      <div
        className="bg-[#111118] border-t border-white/10 rounded-t-3xl p-5 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-t1 font-bold">{lang === 'it' ? 'Calcolatore dischi' : 'Plate calculator'}</h3>
          <button onClick={onClose} className="text-t3"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="text-t3 text-xs mb-1 block">{lang === 'it' ? 'Peso totale' : 'Target weight'} ({unit})</label>
            <input
              type="number"
              className="num-input w-full text-base"
              value={target}
              onChange={e => setTarget(parseFloat(e.target.value) || 0)}
              inputMode="decimal"
              min="0"
              step="2.5"
            />
          </div>
          <div>
            <label className="text-t3 text-xs mb-1 block">{lang === 'it' ? 'Bilanciere' : 'Bar weight'} ({unit})</label>
            <input
              type="number"
              className="num-input w-full text-base"
              value={bar}
              onChange={e => setBar(parseFloat(e.target.value) || 0)}
              inputMode="decimal"
              min="0"
              step="0.5"
            />
          </div>
        </div>

        {result.length === 0 ? (
          <p className="text-t3 text-sm text-center py-4">
            {lang === 'it' ? 'Solo bilanciere' : 'Bar only'}
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-t3 text-xs font-medium uppercase tracking-wider mb-3">
              {lang === 'it' ? 'Per lato:' : 'Per side:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {result.map(({ plate, count }) =>
                Array.from({ length: count }).map((_, i) => (
                  <div
                    key={`${plate}-${i}`}
                    className="h-12 px-3 rounded-xl flex items-center justify-center font-bold text-sm border-2"
                    style={{
                      borderColor: plate >= 25 ? '#ef4444' : plate >= 20 ? '#f97316' : plate >= 15 ? '#eab308' : plate >= 10 ? '#22c55e' : plate >= 5 ? '#3b82f6' : '#8b5cf6',
                      color: plate >= 25 ? '#ef4444' : plate >= 20 ? '#f97316' : plate >= 15 ? '#eab308' : plate >= 10 ? '#22c55e' : plate >= 5 ? '#3b82f6' : '#8b5cf6',
                      background: 'rgba(255,255,255,0.04)',
                    }}
                  >
                    {plate}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
