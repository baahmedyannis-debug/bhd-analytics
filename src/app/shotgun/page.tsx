'use client'

import { Bar, Line } from 'react-chartjs-2'
import KpiCard from '@/components/KpiCard'
import ChartContainer from '@/components/ChartContainer'
import RecommendationCard from '@/components/RecommendationCard'
import ApiBanner from '@/components/ApiBanner'

const ticketsData = {
  labels: ['Maison Folle', 'L\'Impasse', 'Donut & Beats', 'Ritual II'],
  datasets: [{
    label: 'Tickets vendus',
    data: [120, 95, 60, 45],
    backgroundColor: ['#00d4aa', '#00d4aa', '#00d4aa', 'rgba(0, 212, 170, 0.4)'],
    borderRadius: 4,
  }],
}

const ratingData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr'],
  datasets: [{
    label: 'Note moyenne',
    data: [4.2, 4.4, 4.6, 4.7],
    borderColor: '#00d4aa',
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
    fill: true,
    tension: 0.4,
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

const events = [
  { date: '12', month: 'AVR', title: 'BHD @ Maison Folle', location: 'Lille', time: '23h', sold: 120, total: 150 },
  { date: '25', month: 'AVR', title: "L'Impasse — Le Touquet", location: 'Le Touquet', time: '22h', sold: 95, total: 120 },
  { date: '10', month: 'MAI', title: 'Donut & Beats Vol.2', location: 'Lille', time: '14h', sold: 60, total: 80 },
  { date: '24', month: 'MAI', title: 'Ritual Oriental II', location: 'Paris', time: '23h', sold: 45, total: 200 },
]

const pastEvents = [
  { title: 'Donut & Beats Vol.1', date: '15 Mars', tickets: '80/80', status: 'Sold Out', rating: 4.8 },
  { title: 'BHD @ Warehouse', date: '1 Mars', tickets: '200/200', status: 'Sold Out', rating: 4.6 },
  { title: 'Sunset Session', date: '14 Fév', tickets: '55/60', status: 'Quasi complet', rating: 4.4 },
]

export default function ShotgunPage() {
  return (
    <div className="space-y-8">
      <ApiBanner platform="Shotgun" />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Events Publiés" value="6" change="actifs" color="#00d4aa" />
        <KpiCard label="Tickets Vendus" value="847" change="+156 ce mois" />
        <KpiCard label="Abonnés" value="312" change="+18 (+6.1%)" />
        <KpiCard label="Revenus estimés" value="8.4K€" change="+2.1K ce mois" />
      </div>

      {/* Upcoming Events */}
      <div>
        <h3 className="section-title">Événements à venir</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event, i) => {
            const percent = Math.round((event.sold / event.total) * 100)
            const barColor = percent > 70 ? '#00d4aa' : percent > 40 ? '#f59e0b' : '#ef4444'
            return (
              <div key={i} className="card">
                <div className="flex gap-4">
                  <div className="text-center flex-shrink-0">
                    <p className="text-2xl font-bold" style={{ color: '#00d4aa' }}>{event.date}</p>
                    <p className="text-xs text-gray-500 uppercase">{event.month}</p>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-xs text-gray-500">{event.location} · {event.time}</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">{event.sold}/{event.total} tickets</span>
                        <span style={{ color: barColor }}>{percent}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${percent}%`, background: barColor }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Tickets vendus par événement">
          <Bar data={ticketsData} options={chartOptions} />
        </ChartContainer>
        <ChartContainer title="Note moyenne par événement">
          <Line data={ratingData} options={chartOptions} />
        </ChartContainer>
      </div>

      {/* Past Events */}
      <div className="card">
        <h3 className="section-title">Événements passés</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase border-b border-white/5">
                <th className="pb-3 font-medium">Événement</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Tickets</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 font-medium text-right">Note</th>
              </tr>
            </thead>
            <tbody>
              {pastEvents.map((event, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-[#16161f] transition-colors">
                  <td className="py-3 font-medium">{event.title}</td>
                  <td className="py-3 text-gray-400">{event.date}</td>
                  <td className="py-3 text-gray-400">{event.tickets}</td>
                  <td className="py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-400">{event.status}</span>
                  </td>
                  <td className="py-3 text-right text-yellow-400">{'★'.repeat(Math.round(event.rating))} {event.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="section-title">Recommandations IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RecommendationCard title="Tarifs premiers arrivés" description="Proposez des tarifs réduits pour les premiers acheteurs" priority="important" impact="high" impactPercent={80} />
          <RecommendationCard title="Promouvoir 3 semaines avant" description="Commencez la promo plus tôt pour maximiser les ventes" priority="important" impact="medium" impactPercent={70} />
          <RecommendationCard title="Récap vidéo systématique" description="Filmez chaque événement pour le contenu post-événement" priority="growth" impact="medium" impactPercent={62} />
        </div>
      </div>
    </div>
  )
}
