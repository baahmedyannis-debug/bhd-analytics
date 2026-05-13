'use client'

import { Line, Bar, Doughnut } from 'react-chartjs-2'
import KpiCard from '@/components/KpiCard'
import ChartContainer from '@/components/ChartContainer'
import RecommendationCard from '@/components/RecommendationCard'
import ApiBanner from '@/components/ApiBanner'

const viewsData = {
  labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
  datasets: [{
    label: 'Vues',
    data: [2100, 3200, 2800, 4500, 3800, 5200, 4100, 3600, 4800, 5500, 4200, 3900, 5100, 6200, 5800, 4700, 5300, 6100, 5600, 4900, 5400, 6800, 7200, 6500, 5900, 6300, 7500, 7100, 6800, 7400],
    borderColor: '#fe2c55',
    backgroundColor: 'rgba(254, 44, 85, 0.1)',
    fill: true,
    tension: 0.4,
  }],
}

const followersData = {
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  datasets: [{
    label: 'Nouveaux abonnés',
    data: [8, 15, 12, 20, 18, 25, 14],
    backgroundColor: '#fe2c55',
    borderRadius: 4,
  }],
}

const sourcesData = {
  labels: ['Pour Toi (FYP)', 'Abonnés', 'Partages', 'Recherche'],
  datasets: [{
    data: [55, 20, 15, 10],
    backgroundColor: ['#fe2c55', '#25f4ee', '#a78bfa', '#f59e0b'],
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

const metricRings = [
  { label: 'Durée moy.', value: '24s', target: '60s', percent: 40, color: '#fe2c55' },
  { label: 'Taux complétion', value: '47%', target: '100%', percent: 47, color: '#10b981' },
  { label: 'Taux FYP', value: '71%', target: '100%', percent: 71, color: '#25f4ee' },
  { label: 'Partages', value: '110', target: '200', percent: 55, color: '#a78bfa' },
]

const videos = [
  { title: 'Set Oriental Mix #12', views: '18.4K', likes: '1.2K', duration: '0:45' },
  { title: 'Coulisses Maison Folle', views: '12.1K', likes: '890', duration: '0:30' },
  { title: 'Test drop nouveau morceau', views: '9.8K', likes: '720', duration: '0:15' },
  { title: 'Visite setup DJ 2026', views: '8.5K', likes: '650', duration: '1:00' },
  { title: 'Défi transition', views: '7.2K', likes: '540', duration: '0:20' },
  { title: 'Vinyle vs Numérique', views: '6.1K', likes: '430', duration: '0:35' },
]

export default function TiktokPage() {
  return (
    <div className="space-y-8">
      <ApiBanner platform="TikTok" />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Abonnés" value="1 247" change="+89 (+7.7%)" color="#fe2c55" />
        <KpiCard label="J'aime" value="18.4K" change="+12% vs mois" />
        <KpiCard label="Vidéos" value="24" change="ce mois" />
        <KpiCard label="Vues" value="94.2K" change="+24% trending" />
        <KpiCard label="Engagement" value="11.3%" change="Excellent" />
      </div>

      {/* Metric Rings */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricRings.map((ring) => (
          <div key={ring.label} className="card flex flex-col items-center">
            <div className="relative w-24 h-24 mb-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={ring.color} strokeWidth="8"
                  strokeDasharray={`${ring.percent * 2.64} ${264 - ring.percent * 2.64}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">{ring.value}</div>
            </div>
            <p className="kpi-label text-center">{ring.label}</p>
            <p className="text-xs text-gray-500">Objectif: {ring.target}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Vues (30 jours)">
          <Line data={viewsData} options={chartOptions} />
        </ChartContainer>
        <ChartContainer title="Abonnés gagnés (quotidien)">
          <Bar data={followersData} options={chartOptions} />
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Sources de trafic">
          <Doughnut data={sourcesData} options={doughnutOptions} />
        </ChartContainer>

        {/* Videos */}
        <div className="card">
          <h3 className="section-title">Dernières Vidéos</h3>
          <div className="space-y-3">
            {videos.map((video, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-[#16161f] transition-colors">
                <div className="w-24 h-14 bg-gray-800 rounded flex items-center justify-center text-lg flex-shrink-0 relative">
                  🎬
                  <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1 rounded">{video.duration}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{video.title}</p>
                  <p className="text-xs text-gray-500">👁️ {video.views} · ❤️ {video.likes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="section-title">Recommandations IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RecommendationCard title="Poster à 19h-21h" description="Pic d'activité de votre audience sur TikTok" priority="urgent" impact="high" impactPercent={92} />
          <RecommendationCard title="Vidéos < 30 secondes" description="Le taux de complétion chute après 30s" priority="urgent" impact="high" impactPercent={88} />
          <RecommendationCard title="Utiliser les sons tendance" description="Les sons populaires boostent le placement Pour Toi" priority="important" impact="medium" impactPercent={75} />
          <RecommendationCard title="Accroche dans les 3 premières secondes" description="Captez l'attention immédiatement pour garder les spectateurs" priority="important" impact="medium" impactPercent={70} />
          <RecommendationCard title="Série hebdomadaire" description="Créez un rendez-vous avec votre audience" priority="growth" impact="medium" impactPercent={60} />
          <RecommendationCard title="Duos avec d'autres créateurs" description="Les duos doublent l'exposition" priority="growth" impact="low" impactPercent={50} />
        </div>
      </div>
    </div>
  )
}
