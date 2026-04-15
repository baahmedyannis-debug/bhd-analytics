interface KpiCardProps {
  label: string
  value: string
  change?: string
  positive?: boolean
  color?: string
}

export default function KpiCard({ label, value, change, positive = true, color }: KpiCardProps) {
  return (
    <div className="card">
      <p className="kpi-label">{label}</p>
      <p className="kpi-value" style={color ? { color } : undefined}>{value}</p>
      {change && (
        <p className={`kpi-change ${positive ? 'positive' : 'negative'}`}>
          {positive ? '▲' : '▼'} {change}
        </p>
      )}
    </div>
  )
}
