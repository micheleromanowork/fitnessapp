'use client'

import { useEffect } from 'react'
import { useProfile } from '@/stores/profile'

export function ThemeProvider() {
  const theme = useProfile(s => s.theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light')
      root.classList.remove('dark')
    } else if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark')
      root.classList.add('dark')
    } else {
      // system
      root.removeAttribute('data-theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) root.classList.add('dark')
      else root.classList.remove('dark')
    }
  }, [theme])

  return null
}
