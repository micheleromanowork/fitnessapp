import type { Metadata, Viewport } from 'next'
import { SessionProvider } from 'next-auth/react'
import { PwaInit } from '@/components/PwaInit'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'FitOS', template: '%s · FitOS' },
  description: 'AI-powered fitness tracker. Workout tracking, programs, analytics e personal trainer AI.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'FitOS' },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="dark">
      <body>
        <SessionProvider>
          {children}
          <PwaInit />
        </SessionProvider>
      </body>
    </html>
  )
}
