'use client'

import { useEffect, useState } from 'react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import KpiCard from '@/components/KpiCard'
import ChartContainer from '@/components/ChartContainer'
import RecommendationCard from '@/components/RecommendationCard'
import ApiBanner from '@/components/ApiBanner'

// ── Types ─────────────────────────────────────────────
interface YoutubeVideo {
  title: string
  thumbnail: string | null
  publishedAt: string
  views: number
  likes: number
  comments: number
  duration: string
}

interface YoutubeData {
  connected: boolean
  error?: string
  channel?: {
    name: string
    description: string
    thumbnail: string
    subscribers: number
    totalViews: number
    videoCount: number
  }
  videos?: YoutubeVideo[]
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

// ISO 8601 duration → "4:15" ou "1:23:45"
function formatDuration(iso: string): string {
  if (!iso) return ''
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return ''
  const h = parseInt(m[1] || '0', 10)
  const min = parseInt(m[2] || '0', 10)
  const s = parseInt(m[3] || '0', 10)
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (h > 0) return `${h}:${pad(min)}:${pad(s)}`
  return `${min}:${pad(s)}`
}

// ── Mock data (fallback) ─────────────────────────────
const mockVideos = [
  { title: 'BHD — Ritual Oriental Live (Full Set)', views: '8 400', duration: '45 min', likes: 234 },
  { title: 'Sunset Session @ Le Touquet', views: '5 200', duration: '32 min', likes: 156 },
  { title: 'Studio Vlog — Making of Ritual EP', views: '3 100', duration: '12 min', likes: 98 },
  { title: 'Donut & Beats Vol.1 — Recap', views: '2 800', duration: '8 min', likes: 87 },
  { title: 'Astuces DJ — Transitions orientales', views: '2 400', duration: '15 min', likes: 76 },
  { title: 'Récap vidéo Maison Folle 2025', views: '1 200', duration: '4 min', likes: 54 },
]

const viewsData = {
  labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
  datasets: [{
    label: 'Vues',
    data: [600, 750, 820, 680, 900, 1100, 950, 800, 1050, 1200, 1100, 950, 1150, 1300, 1200, 1050, 1100, 1250, 1400, 1300, 1150, 1350, 1500, 1400, 1250, 1450, 1600, 1500, 1350, 1550],
    borderColor: '#ff0000',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    fill: true,
    tension: 0.4,
  }],
}

const subsData = {
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  datasets: [{
    label: 'Nouveaux abonnés',
    data: [3, 5, 4, 6, 5, 8, 7],
    backgroundColor: '#ff0000',
    borderRadius: 4,
  }],
}

const watchTimeData = {
  labels: ['Live Sets', 'Mix Sessions', 'Tutoriels', 'Vlogs'],
  datasets: [{
    data: [45, 30, 15, 10],
    backgroundColor: ['#ff0000', '#f59e0b', '#10b981', '#60a5fa'],
    borderWidth: 0,
  }],
}

const trafficData = {
  labels: ['Recherche', 'Suggestions', 'Externe', 'Direct'],
  datasets: [{
    data: [35, 40, 15, 10],
    backgroundColor: ['#ff0000', '#a78bfa', '#25f4ee', '#f59e0b'],
    borderWidth: 0,
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

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: true, position: 'bottom' as const, labels: { color: '#999', padding: 12 } } },
}

// ── Component ────────────────────────────────────────
export default function YoutubePage() {
  const [data, setData] = useState<YoutubeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/youtube')
      .then((r) => r.json())
      .then((d: YoutubeData) => {
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
  const channel = data?.channel
  const videos = data?.videos || []

  return (
    <div className="space-y-8">
      <ApiBanner platform="YouTube" connected={connected} loading={loading} error={error} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {connected && channel ? (
          <>
            <KpiCard label="Abonnés" value={formatNumber(channel.subscribers)} change={`${formatFull(channel.subscribers)} au total`} color="#ff0000" />
            <KpiCard label="Vues Totales" value={formatNumber(channel.totalViews)} change={`${formatFull(channel.totalViews)} cumulées`} />
            <KpiCard label="Vidéos" value={`${channel.videoCount}`} change="publiées" />
            <KpiCard label="Chaîne" value={channel.name} change="active" />
            <KpiCard label="API" value="Live" change="YouTube Data v3" color="#10b981" />
          </>
        ) : (
          <>
            <KpiCard label="Abonnés" value="456" change="+28 (+6.5%)" color="#ff0000" />
            <KpiCard label="Vues Totales" value="23.1K" change="+15% mensuel" />
            <KpiCard label="Vidéos" value="8" change="publiées" />
            <KpiCard label="Temps de visionnage" value="1 240h" change="en croissance" />
            <KpiCard label="CTR Moyen" value="4.8%" change="Bonnes miniatures" />
          </>
        )}
      </div>

      {/* Charts (mock — YouTube Data API ne fournit pas les courbes journalières, requiert YouTube Analytics API + OAuth) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Vues (30 jours)">
          <Line data={viewsData} options={chartOptions} />
        </ChartContainer>
        <ChartContainer title="Abonnés gagnés (quotidien)">
          <Bar data={subsData} options={chartOptions} />
        </ChartContainer>
      </div>

      {/* Videos List */}
      <div className="card">
        <h3 className="section-title">Dernières Vidéos {connected && `(${videos.length})`}</h3>
        <div className="space-y-3">
          {connected && videos.length > 0 ? (
            videos.map((video, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded hover:bg-[#16161f] transition-colors">
                <div className="w-40 h-24 bg-gray-800 rounded flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                  {video.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    '🎬'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{video.title}</p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    <span>👁️ {formatFull(video.views)}</span>
                    <span>⏱️ {formatDuration(video.duration)}</span>
                    <span>👍 {formatFull(video.likes)}</span>
                    <span>💬 {formatFull(video.comments)}</span>
                    <span className="text-gray-600">{new Date(video.publishedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            mockVideos.map((video, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded hover:bg-[#16161f] transition-colors">
                <div className="w-40 h-24 bg-gray-800 rounded flex items-center justify-center text-2xl flex-shrink-0">
                  🎬
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{video.title}</p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    <span>👁️ {video.views}</span>
                    <span>⏱️ {video.duration}</span>
                    <span>👍 {video.likes}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Audience Insights (mock) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Temps de visionnage par type">
          <Doughnut data={watchTimeData} options={doughnutOptions} />
        </ChartContainer>
        <ChartContainer title="Sources de trafic">
          <Doughnut data={trafficData} options={doughnutOptions} />
        </ChartContainer>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="section-title">Recommandations IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RecommendationCard title="Miniatures personnalisées" description="Les miniatures personnalisées augmentent le taux de clic de +35%" priority="urgent" impact="high" impactPercent={88} />
          <RecommendationCard title="Publication hebdomadaire" description="La régularité booste les suggestions YouTube" priority="important" impact="medium" impactPercent={72} />
          <RecommendationCard title="Shorts depuis les lives" description="Découpez vos meilleurs moments en Shorts" priority="growth" impact="medium" impactPercent={65} />
        </div>
      </div>
    </div>
  )
}
