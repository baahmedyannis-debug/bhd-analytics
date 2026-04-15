'use client'

import { useState } from 'react'
import KpiCard from '@/components/KpiCard'

interface Task {
  id: number
  title: string
  category: string
  status: 'todo' | 'progress' | 'done'
}

const initialTasks: Task[] = [
  { id: 1, title: 'Préparer le set pour samedi', category: 'Musique', status: 'todo' },
  { id: 2, title: 'Envoyer le mix à Shotgun', category: 'Plateforme', status: 'todo' },
  { id: 3, title: 'Répondre aux DM Instagram', category: 'Instagram', status: 'todo' },
  { id: 4, title: 'Monter la vidéo TikTok', category: 'TikTok', status: 'progress' },
  { id: 5, title: 'Contacter le booker du Warehouse', category: 'Événements', status: 'progress' },
  { id: 6, title: 'Télécharger vidéo set en direct', category: 'YouTube', status: 'done' },
  { id: 7, title: 'Publier le mix du mois', category: 'SoundCloud', status: 'done' },
]

const upcomingEvents = [
  { title: 'BHD @ Maison Folle', date: '12 AVR', time: '23h' },
  { title: "L'Impasse — Le Touquet", date: '25 AVR', time: '22h' },
  { title: 'Donut & Beats Vol.2', date: '10 MAI', time: '14h' },
  { title: 'Ritual Oriental II', date: '24 MAI', time: '23h' },
]

const weeklyContent = [
  { day: 'LUN', platform: 'TikTok', task: 'Utiliser un trending sound', time: '9:00' },
  { day: 'MAR', platform: 'Instagram', task: 'Vidéo behind-the-scenes', time: '18:00' },
  { day: 'MER', platform: 'SoundCloud', task: 'Sortie nouveau morceau', time: '20:00' },
  { day: 'JEU', platform: 'YouTube', task: 'Upload du live set', time: '19:00' },
  { day: 'VEN', platform: 'Instagram', task: 'Post promo événement', time: '17:00' },
  { day: 'SAM', platform: 'TikTok', task: 'Contenu jour d\'événement', time: '20:00' },
  { day: 'DIM', platform: 'Général', task: 'Planning & scheduling', time: '15:00' },
]

const platformColors: Record<string, string> = {
  TikTok: '#fe2c55',
  Instagram: '#f0c060',
  SoundCloud: '#ff5500',
  YouTube: '#ff0000',
  Général: '#7c3aed',
}

export default function PlanningPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [newTask, setNewTask] = useState('')

  const addTask = () => {
    if (!newTask.trim()) return
    setTasks([...tasks, { id: Date.now(), title: newTask, category: 'Général', status: 'todo' }])
    setNewTask('')
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const moveTask = (id: number, newStatus: Task['status']) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t))
  }

  const todoTasks = tasks.filter(t => t.status === 'todo')
  const progressTasks = tasks.filter(t => t.status === 'progress')
  const doneTasks = tasks.filter(t => t.status === 'done')

  const columns = [
    { title: 'À Faire', status: 'todo' as const, tasks: todoTasks, color: '#eab308', next: 'progress' as const },
    { title: 'En Cours', status: 'progress' as const, tasks: progressTasks, color: '#f59e0b', next: 'done' as const },
    { title: 'Terminé', status: 'done' as const, tasks: doneTasks, color: '#10b981', next: null },
  ]

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="À Faire" value={`${todoTasks.length}`} color="#eab308" />
        <KpiCard label="En Cours" value={`${progressTasks.length}`} color="#f59e0b" />
        <KpiCard label="Terminé" value={`${doneTasks.length}`} color="#10b981" />
        <KpiCard label="Événements à venir" value="4" color="#00d4aa" />
      </div>

      {/* Quick Add */}
      <div className="card flex gap-3">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Ajouter une nouvelle tâche..."
          className="flex-1 bg-[#0a0a0f] border border-white/5 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-white/10"
        />
        <button
          onClick={addTask}
          className="px-6 py-3 bg-planning text-white rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Ajouter
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.status}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ background: col.color }} />
              <h3 className="font-semibold text-sm">{col.title}</h3>
              <span className="text-xs text-gray-500 ml-auto">{col.tasks.length}</span>
            </div>
            <div className="space-y-3">
              {col.tasks.map((task) => (
                <div key={task.id} className="card !p-4 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400">
                        {task.category}
                      </span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {col.next && (
                        <button
                          onClick={() => moveTask(task.id, col.next!)}
                          className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
                          title="Avancer"
                        >
                          →
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Events */}
      <div className="card">
        <h3 className="section-title">Événements à venir</h3>
        <div className="space-y-3">
          {upcomingEvents.map((event, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded hover:bg-[#16161f] transition-colors">
              <div className="text-center flex-shrink-0 w-16">
                <p className="text-sm font-bold text-shotgun">{event.date}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-gray-500">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Content Calendar */}
      <div className="card">
        <h3 className="section-title">Calendrier de contenu — Semaine</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {weeklyContent.map((day, i) => (
            <div key={i} className="p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
              <p className="text-xs font-bold text-gray-400 mb-2">{day.day}</p>
              <p className="text-xs font-semibold mb-1" style={{ color: platformColors[day.platform] || '#999' }}>
                {day.platform}
              </p>
              <p className="text-xs text-gray-300">{day.task}</p>
              <p className="text-[10px] text-gray-600 mt-1">{day.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
