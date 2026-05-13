'use client'

import { Line, Bar } from 'react-chartjs-2'
import KpiCard from '@/components/KpiCard'
import ChartContainer from '@/components/ChartContainer'
import RecommendationCard from '@/components/RecommendationCard'
import ApiBanner from '@/components/ApiBanner'

const reachData = {
  labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
  datasets: [{
    label: 'Portée',
    data: [820, 950, 1100, 980, 1250, 1400, 1100, 900, 1050, 1300, 1500, 1350, 1200, 1450, 1600, 1400, 1100, 950, 1050, 1200, 1350, 1500, 1700, 1550, 1400, 1600, 1800, 1650, 1500, 1700],
    borderColor: '#60a5fa',
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
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

const posts = [
  { id: 1, likes: 234, comments: 18 },
  { id: 2, likes: 189, comments: 12 },
  { id: 3, likes: 312, comments: 24 },
  { id: 4, likes: 156, comments: 8 },
  { id: 5, likes: 278, comments: 21 },
  { id: 6, likes: 201, comments: 15 },
]

export default function InstagramPage() {
  return (
    <div className="space-y-8">
      <ApiBanner platform="Instagram" />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Abonnés" value="2 482" change="+116 (+4.9%)" color="#f0c060" />
        <KpiCard label="Publications" value="39" change="ce mois" color="#f0c060" />
        <KpiCard label="Portée Mars" value="27 137" change="+18% vs Fév" />
        <KpiCard label="Engagement" value="9.6%" change="Fort" />
      </div>

      {/* Charts */}
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
        <h3 className="section-title">Dernières Publications</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="card group relative overflow-hidden cursor-pointer">
              <div className="h-48 bg-gray-800 rounded flex items-center justify-center text-4xl">📸</div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-sm">
                <span>❤️ {post.likes}</span>
                <span>💬 {post.comments}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Churn Analytics */}
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
