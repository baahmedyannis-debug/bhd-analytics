'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend)

interface ChartContainerProps {
  title: string
  children: React.ReactNode
}

export default function ChartContainer({ title, children }: ChartContainerProps) {
  return (
    <div className="card">
      <h3 className="section-title">{title}</h3>
      <div className="h-64">
        {children}
      </div>
    </div>
  )
}

export { ChartJS }
