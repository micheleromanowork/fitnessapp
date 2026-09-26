'use client'
import { useEffect, useState } from 'react'
import { useProfile } from '@/stores/profile'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInit() {
  const lang = useProfile(s => s.language)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }

    // Capture install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      // Only show if not already installed and not dismissed before
      const dismissed = localStorage.getItem('fitos-install-dismissed')
      if (!dismissed) setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'dismissed') {
      localStorage.setItem('fitos-install-dismissed', '1')
    }
    setShowBanner(false)
    setInstallPrompt(null)
  }

  function handleDismiss() {
    localStorage.setItem('fitos-install-dismissed', '1')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-[calc(72px+env(safe-area-inset-bottom,0px))] left-4 right-4 z-40 card p-4 flex items-center gap-3 shadow-xl">
      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
        <span className="text-xl">💪</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-t1 text-sm font-semibold">FitOS</p>
        <p className="text-t3 text-xs">
          {lang === 'it' ? 'Installa per accesso rapido' : 'Install for quick access'}
        </p>
      </div>
      <button onClick={handleDismiss} className="text-t3 text-xs px-2">✕</button>
      <button onClick={handleInstall} className="btn-primary h-8 px-3 text-xs flex-shrink-0">
        {lang === 'it' ? 'Installa' : 'Install'}
      </button>
    </div>
  )
}
