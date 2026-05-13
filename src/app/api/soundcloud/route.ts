import { NextResponse } from 'next/server'

const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID
const SOUNDCLOUD_USER_ID = process.env.SOUNDCLOUD_USER_ID

export async function GET() {
  if (!SOUNDCLOUD_CLIENT_ID || !SOUNDCLOUD_USER_ID) {
    return NextResponse.json({ error: 'SoundCloud API non configurée', connected: false })
  }

  try {
    // Profil utilisateur
    const profileRes = await fetch(
      `https://api.soundcloud.com/users/${SOUNDCLOUD_USER_ID}?client_id=${SOUNDCLOUD_CLIENT_ID}`,
      { next: { revalidate: 300 } }
    )
    const profile = await profileRes.json()

    // Morceaux
    const tracksRes = await fetch(
      `https://api.soundcloud.com/users/${SOUNDCLOUD_USER_ID}/tracks?client_id=${SOUNDCLOUD_CLIENT_ID}&limit=20`,
      { next: { revalidate: 300 } }
    )
    const tracks = await tracksRes.json()

    return NextResponse.json({
      connected: true,
      profile: {
        username: profile.username,
        followers: profile.followers_count || 0,
        trackCount: profile.track_count || 0,
        playbackCount: profile.playback_count || 0,
        likesCount: profile.likes_count || 0,
        avatar: profile.avatar_url,
      },
      tracks: (Array.isArray(tracks) ? tracks : []).map((t: any) => ({
        title: t.title,
        plays: t.playback_count || 0,
        likes: t.likes_count || 0,
        reposts: t.reposts_count || 0,
        duration: t.duration,
        createdAt: t.created_at,
        artworkUrl: t.artwork_url,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur SoundCloud API', connected: false })
  }
}
