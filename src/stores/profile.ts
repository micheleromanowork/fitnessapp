'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ProfileState {
  language: 'it' | 'en'
  units: 'metric' | 'imperial'
  theme: 'dark' | 'light' | 'system'
  defaultRestSec: number
  autoStartTimer: boolean
  onboardingDone: boolean
}

interface ProfileStore extends ProfileState {
  set: (patch: Partial<ProfileState>) => void
}

export const useProfile = create<ProfileStore>()(
  persist(
    (set) => ({
      language: 'it',
      units: 'metric',
      theme: 'dark',
      defaultRestSec: 90,
      autoStartTimer: true,
      onboardingDone: false,
      set: (patch) => set(s => ({ ...s, ...patch })),
    }),
    { name: 'fitos-profile' }
  )
)
