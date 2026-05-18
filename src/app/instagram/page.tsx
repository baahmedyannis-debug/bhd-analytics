'use client'

import { useEffect, useState } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import KpiCard from '@/components/KpiCard'
import ChartContainer from '@/components/ChartContainer'
import RecommendationCard from '@/components/RecommendationCard'
import ApiBanner from '@/components/ApiBanner'

// ── Types ─────────────────────────────────────────────
interface InstagramPost {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | string
  media_url?: string
  thumbnail_url?: string
  timestamp: string
  like_count?: number
  comments_count?: number
  permalink?: string
}

interface InstagramProfile {
  id: string
  username: string
  name: string
  biography: string
  profilePicture: string | null
  followers: number
  follows: number
  mediaCount: number
}

interface InstagramData {
  connected: boolean
  error?: string
  profile?: InstagramProfile
  posts?: InstagramPost[]
  insights?: unknown[] | null
}

// ── Helpers ──────────────────────────────────────────
function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString('fr-FR').replace(/,/g, ' ')
}

function formatFull(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ')
}

function truncate(s: string, max = 80): string {
  if (!s) return ''
  return s.length > max ? s.slice(0, max).trim() + '…' : s
}

// ── Mock data (fallback) ─────────────────────────────
const mockPosts = [
  { id: '1', likes: 234, comments: 18, emoji: '📸' },
  { id: '2', likes: 189, comments: 12, emoji: '🎧' },
  { id: '3', likes: 312, comments: 24, emoji: '🎛️' },
  { id: '4', likes: 156, comments: 8, emoji: '🌃' },
  { id: '5', likes: 278, comments: 21, emoji: '🔥' },
  { id: '6', likes: 201, comments: 15, emoji: '🎵' },
]

const reachData = {
  labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
  datasets: [{
    label: 'Portée',
    data: [820, 950, 1100, 980, 1250, 1400, 1100, 900, 1050, 1300, 1500, 1350, 1200, 1450, 1600, 1400, 1100, 950, 1050, 1200, 1350, 1500, 1700, 1550, 1400, 1600, 1800, 1650, 1500, 1700],
    borderColor: '#f0c060',
    backgroundColor: 'rgba(240, 192, 96, 0.1)',
    fill: true,
    tension: 0.4,
  }],
}

const followersData = {
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  datasets: [{
    label: 'Nouveaux abonnés',
    data: [12, 19, 8, 15, 22, 30, 10],
    backgroundColor: '#10b981',
    borderRadius: 4,
  }],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } },
  },
}

// ── Component ────────────────────────────────────────
export default function InstagramPage() {
  const [data, setData] = useState<InstagramData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/instagram')
      .then((r) => r.json())
      .then((d: InstagramData) => {
        if (cancelled) return
        setData(d)
        if (!d.connected && d.error) setError(d.error)
        setLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e?.message || 'Erreur réseau')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const connected = !!data?.connected
  const profile = data?.profile
  const posts = data?.posts || []

  return (
    <div className="space-y-8">
      <ApiBanner platform="Instagram" connected={connected} loading={loading} error={error} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {connected && profile ? (
          <>
            <KpiCard label="Abonnés" value={formatNumber(profile.followers)} change={`@${profile.username}`} color="#f0c060" />
            <KpiCard label="Publications" value={`${profile.mediaCount}`} change="au total" color="#f0c060" />
            <KpiCard label="Abonnements" value={formatNumber(profile.follows)} change={`${formatFull(profile.follows)} suivis`} />
            <KpiCard label="API" value="Live" change="Meta Graph v21" color="#10b981" />
          </>
        ) : (
          <>
            <KpiCard label="Abonnés" value="2 482" change="+116 (+4.9%)" color="#f0c060" />
            <KpiCard label="Publications" value="39" change="ce mois" color="#f0c060" />
            <KpiCard label="Portée Mars" value="27 137" change="+18% vs Fév" />
            <KpiCard label="Engagement" value="9.6%" change="Fort" />
          </>
        )}
      </div>

      {/* Charts (mock — Instagram Insights nécessite des métriques temporelles agrégées) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Portée (30 jours)">
          <Line data={reachData} options={chartOptions} />
        </ChartContainer>
        <ChartContainer title="Abonnés gagnés (quotidien)">
          <Bar data={followersData} options={chartOptions} />
        </ChartContainer>
      </div>

      {/* Posts Grid */}
      <div>
        <h3 className="section-title">
          Dernières Publications {connected && `(${posts.length})`}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {connected && posts.length > 0 ? (
            posts.map((post) => {
              const isVideo = post.media_type === 'VIDEO'
              const imgUrl = isVideo ? post.thumbnail_url : post.media_url
              const content = (
                <div className="card group relative overflow-hidden cursor-pointer">
                  <div className="h-48 bg-gray-800 rounded overflow-hidden flex items-center justify-center text-4xl">
                    {imgUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgUrl} alt={truncate(post.caption || '', 60)} className="w-full h-full object-cover" />
                    ) : (
                      isVideo ? '🎬' : '📸'
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3 text-sm">
                    <div className="flex gap-4">
                      <span>❤️ {formatFull(post.like_count || 0)}</span>
                      <span>💬 {formatFull(post.comments_count || 0)}</span>
                    </div>
                    {post.caption && (
                      <p className="text-xs text-gray-300 text-center line-clamp-3">
                        {truncate(post.caption, 100)}
                      </p>
                    )}
                    <span className="text-[10px] text-gray-500">
                      {new Date(post.timestamp).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              )
              return post.permalink ? (
                <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer">
                  {content}
                </a>
              ) : (
                <div key={post.id}>{content}</div>
              )
            })
          ) : (
            mockPosts.map((post) => (
              <div key={post.id} className="card group relative overflow-hidden cursor-pointer">
                <div className="h-48 bg-gray-800 rounded flex items-center justify-center text-4xl">
                  {post.emoji}
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-sm">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Churn Analytics (mock) */}
      <div>
        <h3 className="section-title">Analyse du Churn</h3>
        <div className="grid grid-cols-3 gap-4">
          <KpiCard label="Abonnés perdus" value="24" change="-1.2%" positive={false} />
          <KpiCard label="Croissance nette" value="+92" change="+3.7%" />
          <KpiCard label="Taux de churn" value="0.9%" change="Stable" />
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="section-title">Recommandations IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RecommendationCard title="Poster entre 18h-20h" description="Les heures de pointe montrent +45% d'engagement" priority="urgent" impact="high" impactPercent={90} />
          <RecommendationCard title="Utiliser plus de Reels" description="Les Reels génèrent 3x plus de portée que les posts classiques" priority="urgent" impact="high" impactPercent={85} />
          <RecommendationCard title="Répondre aux commentaires" description="L'engagement dans les 30 min booste l'algorithme" priority="important" impact="medium" impactPercent={70} />
          <RecommendationCard title="Collaborer avec des DJs locaux" description="Les collabs doublent la portée moyenne" priority="important" impact="medium" impactPercent={65} />
          <RecommendationCard title="Créer des Stories quotidiennes" description="Les Stories maintiennent la visibilité dans le fil d'actualité" priority="growth" impact="medium" impactPercent={60} />
          <RecommendationCard title="Hashtags de niche" description="Cibler #orientalhouse #djset pour une meilleure portée" priority="growth" impact="low" impactPercent={45} />
        </div>
      </div>
    </div>
  )
}
