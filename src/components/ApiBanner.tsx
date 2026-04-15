interface ApiBannerProps {
  platform: string
}

export default function ApiBanner({ platform }: ApiBannerProps) {
  return (
    <div className="api-banner">
      Données fictives — Connecter l&apos;API {platform} pour les données en temps réel
    </div>
  )
}
