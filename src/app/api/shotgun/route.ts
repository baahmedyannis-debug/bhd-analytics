import { NextResponse } from 'next/server'

const SHOTGUN_API_KEY = process.env.SHOTGUN_API_KEY
const SHOTGUN_PROMOTER_ID = process.env.SHOTGUN_PROMOTER_ID

export async function GET() {
  if (!SHOTGUN_API_KEY || !SHOTGUN_PROMOTER_ID) {
    return NextResponse.json({ error: 'Shotgun API non configurée', connected: false })
  }

  try {
    // Événements du promoteur
    const eventsRes = await fetch(
      `https://api.shotgun.live/api/v1/promoters/${SHOTGUN_PROMOTER_ID}/events`,
      {
        headers: { Authorization: `Bearer ${SHOTGUN_API_KEY}` },
        next: { revalidate: 300 },
      }
    )
    const eventsData = await eventsRes.json()

    return NextResponse.json({
      connected: true,
      events: (eventsData.data || eventsData || []).map((e: any) => ({
        title: e.name || e.title,
        date: e.start_date || e.date,
        venue: e.venue?.name || e.location,
        ticketsSold: e.tickets_sold || 0,
        ticketsTotal: e.tickets_total || e.capacity || 0,
        status: e.status,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur Shotgun API', connected: false })
  }
}
