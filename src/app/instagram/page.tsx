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

interface TopEngagedPost {
  id: string
  caption: string
  permalink?: string
  thumbnail?: string
  media_type: string
  timestamp: string
  likes: number
  comments: number
  engagement: number
  engagementRate: number
}

interface TopHashtag {
  tag: string
  uses: number
  avgEngagement: number
  totalEngagement: number
}

interface DemoEntry {
  key: string
  value: number
}

interface ChurnData {
  gained: number
  lost: number
  net: number
  churnRate: number
  dailyGains: { date: string; gained: number }[]
}

interface InstagramData {
  connected: boolean
  error?: string
  profile?: InstagramProfile
  posts?: InstagramPost[]
  analytics?: {
    topEngaged?: TopEngagedPost[]
    topHashtags?: TopHashtag[]
  }
  demographics?: {
    countries?: DemoEntry[]
    cities?: DemoEntry[]
    ageGender?: DemoEntry[]
  }
  churn30d?: ChurnData
  insights?: unknown[] | null
}

// Code pays ISO-2 → drapeau emoji + nom court
const COUNTRY_NAMES: Record<string, string> = {
  FR: 'France', BE: 'Belgique', CH: 'Suisse', CA: 'Canada', US: 'États-Unis',
  GB: 'Royaume-Uni', DE: 'Allemagne', ES: 'Espagne', IT: 'Italie', PT: 'Portugal',
  NL: 'Pays-Bas', MA: 'Maroc', DZ: 'Algérie', TN: 'Tunisie', SN: 'Sénégal',
  CI: 'Côte d\'Ivoire', BR: 'Brésil', MX: 'Mexique', AR: 'Argentine',
  RU: 'Russie', UA: 'Ukraine', PL: 'Pologne', TR: 'Turquie', JP: 'Japon',
  CN: 'Chine', KR: 'Corée du Sud', AU: 'Australie', IN: 'Inde', ID: 'Indonésie',
  BD: 'Bangladesh', PK: 'Pakistan', EG: 'Égypte', SA: 'Arabie Saoudite',
  AE: 'Émirats AU', LB: 'Liban', JO: 'Jordanie', NG: 'Nigeria', ZA: 'Afrique du Sud',
}

function countryLabel(code: string): string {
  return COUNTRY_NAMES[code] || code
}

function flagEmoji(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return ''
  return String.fromCodePoint(...code.split('').map((c) => 127397 + c.charCodeAt(0)))
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
  const topEngaged = data?.analytics?.topEngaged || []
  const topHashtags = data?.analytics?.topHashtags || []
  const countries = data?.demographics?.countries || []
  const cities = data?.demographics?.cities || []
  const ageGender = data?.demographics?.ageGender || []

  // Pyramide âge/genre — agrégation par tranche d'âge
  const ageBuckets = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']
  const ageGenderMap: Record<string, { F: number; M: number; U: number }> = {}
  for (const e of ageGender) {
    const [age, gender] = e.key.split(' / ')
    if (!ageGenderMap[age]) ageGenderMap[age] = { F: 0, M: 0, U: 0 }
    if (gender === 'F') ageGenderMap[age].F += e.value
    else if (gender === 'M') ageGenderMap[age].M += e.value
    else ageGenderMap[age].U += e.value
  }
  const ageGenderChart = {
    labels: ageBuckets.filter((a) => ageGenderMap[a]),
    datasets: [
      {
        label: 'Femmes',
        data: ageBuckets.filter((a) => ageGenderMap[a]).map((a) => ageGenderMap[a].F),
        backgroundColor: '#ec4899',
        borderRadius: 4,
      },
      {
        label: 'Hommes',
        data: ageBuckets.filter((a) => ageGenderMap[a]).map((a) => ageGenderMap[a].M),
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      },
    ],
  }

  const ageGenderOptions = {
    ...chartOptions,
    plugins: { legend: { display: true, labels: { color: '#aaa' } } },
  }

  // Max value pour les barres horizontales (pays/villes)
  const maxCountry = Math.max(1, ...countries.map((c) => c.value))
  const maxCity = Math.max(1, ...cities.map((c) => c.value))

  // ── Churn 30j chart (gains quotidiens) ──────────────
  const churn = data?.churn30d
  const realDailyGains = churn?.dailyGains || []
  const realDailyChart = realDailyGains.length > 0
    ? {
        labels: realDailyGains.map((d) => {
          const dt = new Date(d.date)
          return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        }),
        datasets: [{
          label: 'Abonnés gagnés',
          data: realDailyGains.map((d) => d.gained),
          backgroundColor: '#10b981',
          borderRadius: 4,
        }],
      }
    : null

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
        <ChartContainer title={realDailyChart ? `Abonnés gagnés (30 derniers jours)` : `Abonnés gagnés (quotidien)`}>
          <Bar data={realDailyChart || followersData} options={chartOptions} />
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

      {/* ─── Top Posts par engagement ─── */}
      {connected && topEngaged.length > 0 && (
        <div>
          <h3 className="section-title">Top Posts par Engagement</h3>
          <div className="card">
            <div className="space-y-3">
              {topEngaged.map((p, idx) => {
                const isVideo = p.media_type === 'VIDEO'
                const content = (
                  <div className="flex items-center gap-4 p-3 rounded hover:bg-white/5 transition-colors">
                    <div className="text-2xl font-bold text-[#f0c060] w-8 text-center">
                      {idx + 1}
                    </div>
                    <div className="w-16 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl">
                      {p.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        isVideo ? '🎬' : '📸'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 line-clamp-2">
                        {truncate(p.caption || '(sans légende)', 90)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(p.timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-sm">
                      <div className="flex gap-3 text-gray-300">
                        <span title="J'aime">❤️ {formatNumber(p.likes)}</span>
                        <span title="Commentaires">💬 {formatNumber(p.comments)}</span>
                      </div>
                      <div className="text-xs font-semibold text-[#10b981]">
                        {p.engagementRate}% engagement
                      </div>
                    </div>
                  </div>
                )
                return p.permalink ? (
                  <a key={p.id} href={p.permalink} target="_blank" rel="noopener noreferrer" className="block">
                    {content}
                  </a>
                ) : (
                  <div key={p.id}>{content}</div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Démographie des followers ─── */}
      {connected && (countries.length > 0 || cities.length > 0 || ageGender.length > 0) && (
        <div>
          <h3 className="section-title">Audience — Démographie</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pays */}
            {countries.length > 0 && (
              <ChartContainer title={`Top ${countries.length} Pays`}>
                <div className="space-y-2 py-2">
                  {countries.map((c) => {
                    const pct = (c.value / maxCountry) * 100
                    return (
                      <div key={c.key} className="flex items-center gap-3 text-sm">
                        <div className="w-28 truncate text-gray-300">
                          <span className="mr-2">{flagEmoji(c.key)}</span>
                          {countryLabel(c.key)}
                        </div>
                        <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
                          <div
                            className="h-full bg-[#f0c060] rounded transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="w-12 text-right text-gray-400 font-mono text-xs">
                          {formatFull(c.value)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ChartContainer>
            )}

            {/* Villes */}
            {cities.length > 0 && (
              <ChartContainer title={`Top ${cities.length} Villes`}>
                <div className="space-y-2 py-2">
                  {cities.map((c) => {
                    const pct = (c.value / maxCity) * 100
                    // Extraire juste le nom de ville (avant la virgule s'il y en a)
                    const cityName = c.key.split(',')[0].trim()
                    return (
                      <div key={c.key} className="flex items-center gap-3 text-sm">
                        <div className="w-32 truncate text-gray-300" title={c.key}>
                          {cityName}
                        </div>
                        <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
                          <div
                            className="h-full bg-[#10b981] rounded transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="w-12 text-right text-gray-400 font-mono text-xs">
                          {formatFull(c.value)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ChartContainer>
            )}

            {/* Pyramide âge/genre */}
            {ageGenderChart.labels.length > 0 && (
              <div className="lg:col-span-2">
                <ChartContainer title="Répartition Âge × Genre">
                  <Bar data={ageGenderChart} options={ageGenderOptions} />
                </ChartContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Top Hashtags ─── */}
      {connected && topHashtags.length > 0 && (
        <div>
          <h3 className="section-title">Hashtags les Plus Performants</h3>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-white/10">
                    <th className="py-2 px-3 font-medium">#</th>
                    <th className="py-2 px-3 font-medium">Hashtag</th>
                    <th className="py-2 px-3 font-medium text-right">Utilisations</th>
                    <th className="py-2 px-3 font-medium text-right">Engagement moyen</th>
                    <th className="py-2 px-3 font-medium text-right">Engagement total</th>
                  </tr>
                </thead>
                <tbody>
                  {topHashtags.map((t, idx) => (
                    <tr key={t.tag} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-2 px-3 text-gray-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono text-[#f0c060]">{t.tag}</td>
                      <td className="py-2 px-3 text-right text-gray-300">{t.uses}</td>
                      <td className="py-2 px-3 text-right text-[#10b981] font-semibold">{formatFull(t.avgEngagement)}</td>
                      <td className="py-2 px-3 text-right text-gray-400">{formatFull(t.totalEngagement)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3 px-3">
              Calcul sur tes 50 derniers posts · seuls les hashtags utilisés ≥ 2 fois sont affichés
            </p>
          </div>
        </div>
      )}

      {/* ─── Churn Analytics (30 derniers jours, données réelles) ─── */}
      <div>
        <h3 className="section-title">Analyse du Churn — 30 derniers jours</h3>
        {connected && churn ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard
                label="Abonnés gagnés"
                value={`+${formatFull(churn.gained)}`}
                change="30 derniers jours"
                color="#10b981"
              />
              <KpiCard
                label="Abonnés perdus"
                value={`−${formatFull(churn.lost)}`}
                change="30 derniers jours"
                positive={false}
              />
              <KpiCard
                label="Croissance nette"
                value={`${churn.net >= 0 ? '+' : ''}${formatFull(churn.net)}`}
                change={churn.net >= 0 ? 'En croissance' : 'En recul'}
                color={churn.net >= 0 ? '#10b981' : '#ef4444'}
                positive={churn.net >= 0}
              />
              <KpiCard
                label="Taux de churn"
                value={`${churn.churnRate}%`}
                change={churn.churnRate < 2 ? 'Sain' : churn.churnRate < 5 ? 'Surveiller' : 'À traiter'}
                positive={churn.churnRate < 2}
              />
            </div>
            <p className="text-xs text-gray-500 mt-3 px-1">
              Source : Meta Graph API ({`follows_and_unfollows`}). L&apos;identité des comptes ayant unfollow n&apos;est pas exposée par l&apos;API (privacy).
            </p>
          </>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <KpiCard label="Abonnés perdus" value="—" change="API non connectée" positive={false} />
            <KpiCard label="Croissance nette" value="—" change="API non connectée" />
            <KpiCard label="Taux de churn" value="—" change="API non connectée" />
          </div>
        )}
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
