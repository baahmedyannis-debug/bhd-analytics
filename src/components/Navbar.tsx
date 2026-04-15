'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/instagram', label: 'Instagram', emoji: '📸', color: 'instagram' },
  { href: '/tiktok', label: 'TikTok', emoji: '🎵', color: 'tiktok' },
  { href: '/soundcloud', label: 'SoundCloud', emoji: '🎧', color: 'soundcloud' },
  { href: '/youtube', label: 'YouTube', emoji: '▶️', color: 'youtube' },
  { href: '/shotgun', label: 'Shotgun', emoji: '🎯', color: 'shotgun' },
  { href: '/planning', label: 'Planification', emoji: '📋', color: 'planning' },
]

const colorMap: Record<string, { text: string; bg: string }> = {
  instagram: { text: 'text-instagram', bg: 'bg-instagram/10' },
  tiktok: { text: 'text-tiktok', bg: 'bg-tiktok/10' },
  soundcloud: { text: 'text-soundcloud', bg: 'bg-soundcloud/10' },
  youtube: { text: 'text-youtube', bg: 'bg-youtube/10' },
  shotgun: { text: 'text-shotgun', bg: 'bg-shotgun/10' },
  planning: { text: 'text-planning', bg: 'bg-planning/10' },
}

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 flex justify-center items-center overflow-x-auto overflow-y-hidden"
      style={{ background: '#08080d', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <ul className="flex list-none">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (pathname === '/' && tab.href === '/instagram')
          const colors = colorMap[tab.color]
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`block px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-300 border-b-[3px] ${
                  isActive
                    ? `${colors.text} ${colors.bg} border-current`
                    : 'text-gray-500 border-transparent hover:text-white'
                }`}
              >
                {tab.emoji} {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
