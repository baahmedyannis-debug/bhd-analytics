import { NextResponse } from 'next/server'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const SPOTIFY_ARTIST_ID = process.env.SPOTIFY_ARTIST_ID

async function getSpotifyToken(): Promise<string | null> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) return null

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token || null
}

export async function GET() {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_ARTIST_ID) {
    return NextResponse.json({ error: 'Spotify API non configurée', connected: false })
  }

  try {
    const token = await getSpotifyToken()
    if (!token) return NextResponse.json({ error: 'Token Spotify invalide', connected: false })

    const headers = { Authorization: `Bearer ${token}` }

    // Infos artiste (followers, popularité)
    const artistRes = await fetch(`https://api.spotify.com/v1/artists/${SPOTIFY_ARTIST_ID}`, { headers, next: { revalidate: 300 } })
    const artist = await artistRes.json()

    // Top tracks
    const tracksRes = await fetch(`https://api.spotify.com/v1/artists/${SPOTIFY_ARTIST_ID}/top-tracks?market=FR`, { headers, next: { revalidate: 300 } })
    const tracks = await tracksRes.json()

    // Albums / singles
    const albumsRes = await fetch(`https://api.spotify.com/v1/artists/${SPOTIFY_ARTIST_ID}/albums?include_groups=single,album&market=FR&limit=20`, { headers, next: { revalidate: 300 } })
    const albums = await albumsRes.json()

    return NextResponse.json({
      connected: true,
      artist: {
        name: artist.name,
        followers: artist.followers?.total || 0,
        popularity: artist.popularity || 0,
        genres: artist.genres || [],
        image: artist.images?.[0]?.url || null,
      },
      topTracks: (tracks.tracks || []).map((t: any) => ({
        name: t.name,
        popularity: t.popularity,
        previewUrl: t.preview_url,
        albumImage: t.album?.images?.[1]?.url || null,
        durationMs: t.duration_ms,
      })),
      albums: (albums.items || []).map((a: any) => ({
        name: a.name,
        releaseDate: a.release_date,
        totalTracks: a.total_tracks,
        image: a.images?.[1]?.url || null,
        type: a.album_type,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur Spotify API', connected: false })
  }
}
