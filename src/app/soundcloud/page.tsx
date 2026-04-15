'use client'

import { Line, Bar } from 'react-chartjs-2'
import KpiCard from '@/components/KpiCard'
import ChartContainer from '@/components/ChartContainer'
import RecommendationCard from '@/components/RecommendationCard'
import ApiBanner from '@/components/ApiBanner'

const playsData = {
  labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
  datasets: [{
    label: 'Plays',
    data: [1200, 1400, 1100, 1600, 1800, 2100, 1700, 1500, 1900, 2200, 2000, 1800, 2100, 2400, 2200, 1900, 2000, 2300, 2500, 2200, 2400, 2700, 2500, 2300, 2600, 2800, 2600, 2400, 2700, 2900],
    borderColor: '#ff5500',
    backgroundColor: 'rgba(255, 85, 0, 0.1)',
    fill: true,
    tension: 0.4,
  }],
}

const followersData = {
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  datasets: [{
    label: 'Nouveaux abonnés',
    data: [5, 8, 6, 10, 7, 12, 9],
    backgroundColor: '#ff5500',
    borderRadius: 4,
  }],
}

const peakHoursData = {
  labels: ['6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h', '0h', '2h'],
  datasets: [{
    label: 'Écoutes',
    data: [120, 340, 520, 680, 450, 380, 720, 980, 1100, 850, 420],
    backgroundColor: 'rgba(255, 85, 0, 0.6)',
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

const tracks = [
  { title: 'Oriental House Mix Vol.1', plays: '12 400', likes: 234, reposts: 89 },
  { title: 'Sunset Groove — Live @ Maison Folle', plays: '8 200', likes: 178, reposts: 65 },
  { title: 'Deep Oriental Session #3', plays: '6 800', likes: 145, reposts: 52 },
  { title: 'BHD — Ritual (Original Mix)', plays: '5 400', likes: 120, reposts: 41 },
  { title: 'Donut & Beats Vol.1 — Full Set', plays: '4 900', likes: 98, reposts: 38 },
  { title: 'Afro House Journey', plays: '3 800', likes: 87, reposts: 29 },
  { title: 'Melodic Techno Warm-Up', plays: '3 200', likes: 72, reposts: 24 },
  { title: 'Late Night Vibes — Studio Session', plays: '2 500', likes: 56, reposts: 18 },
]

export default function SoundcloudPage() {
  return (
    <div className="space-y-8">
      <ApiBanner platform="SoundCloud" />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Abonnés" value="834" change="+42 (+5.3%)" color="#ff5500" />
        <KpiCard label="Plays Totaux" value="45.2K" change="+8% mensuel" />
        <KpiCard label="Morceaux" value="12" change="publiés" />
        <KpiCard label="Reposts" value="1.8K" change="+220 récent" />
        <KpiCard label="J'aime" value="3.2K" change="+340 récent" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Plays (30 jours)">
          <Line data={playsData} options={chartOptions} />
        </ChartContainer>
        <ChartContainer title="Abonnés gagnés (quotidien)">
          <Bar data={followersData} options={chartOptions} />
        </ChartContainer>
      </div>

      {/* Tracks Table */}
      <div className="card overflow-hidden">
        <h3 className="section-title">Meilleurs Morceaux</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase border-b border-white/5">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">Titre</th>
                <th className="pb-3 font-medium text-right">Plays</th>
                <th className="pb-3 font-medium text-right">Likes</th>
                <th className="pb-3 font-medium text-right">Reposts</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((track, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-[#16161f] transition-colors">
                  <td className="py-3 text-gray-500">{i + 1}</td>
                  <td className="py-3 font-medium">{track.title}</td>
                  <td className="py-3 text-right text-blue-400">{track.plays}</td>
                  <td className="py-3 text-right text-pink-400">{track.likes}</td>
                  <td className="py-3 text-right text-green-400">{track.reposts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Peak Hours */}
      <ChartContainer title="Heures de pointe d'écoute">
        <Bar data={peakHoursData} options={chartOptions} />
      </ChartContainer>

      {/* Recommendations */}
      <div>
        <h3 className="section-title">Recommandations IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RecommendationCard title="Publier le vendredi soir" description="Vos écoutes pic entre 20h-23h le weekend" priority="important" impact="high" impactPercent={82} />
          <RecommendationCard title="Tags orientaux ciblés" description="Ajoutez #orientalhouse #afrohouse pour plus de découverte" priority="important" impact="medium" impactPercent={68} />
          <RecommendationCard title="Mix mensuel régulier" description="Créez un rendez-vous avec votre audience chaque mois" priority="growth" impact="medium" impactPercent={60} />
        </div>
      </div>
    </div>
  )
}
