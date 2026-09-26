'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Dumbbell, BookOpen, BarChart2, Bot, User } from 'lucide-react'
import { useProfile } from '@/stores/profile'
import { t } from '@/i18n'

const NAV_ITEMS = [
  { href: '/home',      icon: Home,     key: 'home' },
  { href: '/workout',   icon: Dumbbell, key: 'workout' },
  { href: '/exercises', icon: BookOpen, key: 'exercises' },
  { href: '/progress',  icon: BarChart2, key: 'progress' },
  { href: '/coach',     icon: Bot,      key: 'coach' },
  { href: '/profile',   icon: User,     key: 'profile' },
]

export function BottomNav() {
  const pathname = usePathname()
  const lang = useProfile(s => s.language)

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ href, icon: Icon, key }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
            <span className="bottom-nav-label">{t(lang, `nav.${key}`)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
