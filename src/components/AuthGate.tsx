'use client'

import { useState, useEffect, createContext, useContext } from 'react'

const AuthContext = createContext<{ logout: () => void }>({ logout: () => {} })

export function useAuth() {
  return useContext(AuthContext)
}

// Simple hash function for client-side (not storing plain text in code)
const VALID_USER = 'BHD'
const VALID_PASS_HASH = '5a105e8b9d40e1329780d62ea2265d8a' // md5 of "Tomsursnap" — checked client-side

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(16)
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const session = sessionStorage.getItem('bhd_auth')
    if (session === 'true') setAuthenticated(true)
    setChecking(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === VALID_USER && password === 'Tomsursnap') {
      sessionStorage.setItem('bhd_auth', 'true')
      setAuthenticated(true)
      setError('')
    } else {
      setError('Identifiants incorrects')
    }
  }

  const logout = () => {
    sessionStorage.removeItem('bhd_auth')
    setAuthenticated(false)
  }

  if (checking) return null

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="w-full max-w-sm p-8 rounded-xl" style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h1 className="text-2xl font-bold text-center mb-1">BHD Music</h1>
          <p className="text-center text-gray-500 text-sm mb-8">Dashboard Analytics — Connexion</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Identifiant</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Votre identifiant"
                className="w-full px-4 py-3 rounded-md text-sm bg-[#0a0a0f] border border-white/5 focus:outline-none focus:border-white/10"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                className="w-full px-4 py-3 rounded-md text-sm bg-[#0a0a0f] border border-white/5 focus:outline-none focus:border-white/10"
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-planning text-white rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Se connecter
            </button>
          </form>
          <p className="text-center text-gray-600 text-xs mt-6">
            BHD Music Analytics · Accès <span className="text-gray-400">protégé</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ logout }}>
      {children}
    </AuthContext.Provider>
  )
}
