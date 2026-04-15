import type { Metadata } from 'next'
import './globals.css'
import AuthGate from '@/components/AuthGate'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'BHD Analytics',
  description: 'Dashboard Analytics Multi-Plateforme pour BHD Music',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthGate>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8">
            {children}
          </main>
        </AuthGate>
      </body>
    </html>
  )
}
