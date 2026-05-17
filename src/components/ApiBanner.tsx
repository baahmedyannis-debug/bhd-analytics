interface ApiBannerProps {
  platform: string
  connected?: boolean
  loading?: boolean
  error?: string | null
}

export default function ApiBanner({ platform, connected, loading, error }: ApiBannerProps) {
  if (loading) {
    return (
      <div className="api-banner" style={{ background: 'rgba(96, 165, 250, 0.1)', borderColor: 'rgba(96, 165, 250, 0.3)', color: '#60a5fa' }}>
        Connexion à l&apos;API {platform}…
      </div>
    )
  }

  if (connected) {
    return (
      <div className="api-banner" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981' }}>
        API {platform} connectée — données en temps réel
      </div>
    )
  }

  if (error) {
    return (
      <div className="api-banner" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b' }}>
        API {platform} : {error} — fallback données fictives
      </div>
    )
  }

  return (
    <div className="api-banner">
      Données fictives — Connecter l&apos;API {platform} pour les données en temps réel
    </div>
  )
}
