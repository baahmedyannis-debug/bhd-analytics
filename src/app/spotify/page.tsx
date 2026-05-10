'use client'

import { Line, Bar, Doughnut } from 'react-chartjs-2'
import KpiCard from '@/components/KpiCard'
import ChartContainer from '@/components/ChartContainer'
import RecommendationCard from '@/components/RecommendationCard'
import ApiBanner from '@/components/ApiBanner'

const streamsData = {
  labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
  datasets: [{
    label: 'Streams',
    data: [320, 410, 380, 520, 480, 610, 550, 470, 590, 680, 620, 540, 650, 730, 690, 580, 640, 720, 780, 710, 650, 740, 820, 760, 700, 780, 850, 800, 740, 810],
    borderColor: '#1DB954',
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    fill: true,
    tension: 0.4,
  }],
}

const listenersData = {
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  datasets: [{
    label: 'Auditeurs uniques',
    data: [45, 62, 58, 75, 89, 110, 95],
    backgroundColor: '#1DB954',
    borderRadius: 4,
  }],
}

const sourcesData = {
  labels: ['Playlists éditoriales', 'Discover Weekly', 'Recherche', 'Bibliothèque', 'Partages'],
  datasets: [{
    data: [35, 25, 20, 12, 8],
    backgroundColor: ['#1DB954', '#1ed760', '#169c46', '#f59e0b', '#a78bfa'],
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

const topTracks = [
  { title: 'Ritual Oriental (Original Mix)', streams: '12 400', saves: 340, playlists: 28 },
  { title: 'Sunset Groove', streams: '8 900', saves: 245, playlists: 19 },
  { title: 'Deep House Journey Vol.1', streams: '6 200', saves: 178, playlists: 14 },
  { title: 'Afro Oriental Vibes', streams: '5 100', saves: 142, playlists: 11 },
  { title: 'Late Night Session', streams: '4 300', saves: 118, playlists: 9 },
  { title: 'Melodic Techno Warm-Up', streams: '3 600', saves: 95, playlists: 7 },
  { title: 'Donut & Beats Theme', streams: '2 800', saves: 76, playlists: 5 },
  { title: 'Le Touquet Sunset', streams: '2 100', saves: 58, playlists: 4 },
]

const topCities = [
  { city: 'Paris', listeners: '2 840', percent: 28 },
  { city: 'Lille', listeners: '1 920', percent: 19 },
  { city: 'Lyon', listeners: '1 050', percent: 10 },
  { city: 'Bruxelles', listeners: '890', percent: 9 },
  { city: 'Marseille', listeners: '720', percent: 7 },
]

export default function SpotifyPage() {
  return (
    <div className="space-y-8">
      <ApiBanner platform="Spotify" />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Auditeurs mensuels" value="10.2K" change="+1.4K (+16%)" color="#1DB954" />
        <KpiCard label="Streams totaux" value="89.6K" change="+12% mensuel" />
        <KpiCard label="Titres" value="18" change="publiés" />
        <KpiCard label="Saves" value="4.8K" change="+620 ce mois" />
        <KpiCard label="Playlists" value="47" change="+8 nouvelles" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Streams (30 jours)">
          <Line data={streamsData} options={chartOptions} />
        </ChartContainer>
        <ChartContainer title="Auditeurs uniques (quotidien)">
          <Bar data={listenersData} options={chartOptions} />
        </ChartContainer>
      </div>

      {/* Top Tracks */}
      <div className="card overflow-hidden">
        <h3 className="section-title">Top Titres</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase border-b border-white/5">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">Titre</th>
                <th className="pb-3 font-medium text-right">Streams</th>
                <th className="pb-3 font-medium text-right">Saves</th>
                <th className="pb-3 font-medium text-right">Playlists</th>
              </tr>
            </thead>
            <tbody>
              {topTracks.map((track, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-[#16161f] transition-colors">
                  <td className="py-3 text-gray-500">{i + 1}</td>
                  <td className="py-3 font-medium">{track.title}</td>
                  <td className="py-3 text-right text-green-400">{track.streams}</td>
                  <td className="py-3 text-right text-blue-400">{track.saves}</td>
                  <td className="py-3 text-right text-purple-400">{track.playlists}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sources */}
        <ChartContainer title="Sources d'écoute">
          <Doughnut data={sourcesData} options={doughnutOptions} />
        </ChartContainer>

        {/* Top Cities */}
        <div className="card">
          <h3 className="section-title">Top Villes</h3>
          <div className="space-y-4">
            {topCities.map((city, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm font-medium w-24">{city.city}</span>
                <div className="flex-1">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${city.percent}%`, background: '#1DB954' }} />
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-16 text-right">{city.listeners}</span>
                <span className="text-xs text-green-400 w-10 text-right">{city.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="section-title">Recommandations IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RecommendationCard title="Pitcher aux playlists éditoriales" description="Soumettez vos sorties 2 semaines avant via Spotify for Artists" priority="urgent" impact="high" impactPercent={92} />
          <RecommendationCard title="Sortir un single toutes les 4-6 semaines" description="La régularité maintient l'algorithme actif sur votre profil" priority="urgent" impact="high" impactPercent={88} />
          <RecommendationCard title="Canvas vidéo sur chaque titre" description="Les Canvas augmentent les saves de +20% en moyenne" priority="important" impact="medium" impactPercent={72} />
          <RecommendationCard title="Optimiser la bio artiste" description="Ajoutez des mots-clés genre (oriental house, afro house) dans la bio" priority="important" impact="medium" impactPercent={65} />
          <RecommendationCard title="Pre-save campaigns" description="Lancez des campagnes pre-save pour booster le jour de sortie" priority="growth" impact="medium" impactPercent={60} />
          <RecommendationCard title="Créer des playlists BHD" description="Curatez vos propres playlists pour fidéliser votre audience" priority="growth" impact="low" impactPercent={48} />
        </div>
      </div>
    </div>
  )
}
