interface RecommendationCardProps {
  title: string
  description: string
  priority: 'urgent' | 'important' | 'growth'
  impact: 'high' | 'medium' | 'low'
  impactPercent: number
}

const priorityLabels = { urgent: 'Urgent', important: 'Important', growth: 'Croissance' }

export default function RecommendationCard({ title, description, priority, impact, impactPercent }: RecommendationCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">{title}</h4>
        <span className={`badge badge-${priority}`}>{priorityLabels[priority]}</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">{description}</p>
      <div className="impact-bar">
        <div className={`impact-fill impact-${impact}`} style={{ width: `${impactPercent}%` }} />
      </div>
    </div>
  )
}
