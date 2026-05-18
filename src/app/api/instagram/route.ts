import { NextResponse } from 'next/server'

const INSTAGRAM_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID

// Note: on utilise l'API Facebook Graph (pas Instagram direct) car le token
// vient d'un OAuth Facebook (Page Access Token de la Page liée au compte IG Business).
// INSTAGRAM_USER_ID = ID du compte Instagram Business (ex: 17841466548130737)
const GRAPH_BASE = 'https://graph.facebook.com/v21.0'

export async function GET() {
  if (!INSTAGRAM_TOKEN || !INSTAGRAM_USER_ID) {
    return NextResponse.json({ error: 'Instagram API non configurée', connected: false })
  }

  try {
    // Récupérer le profil (abonnés, publications)
    const profileRes = await fetch(
      `${GRAPH_BASE}/${INSTAGRAM_USER_ID}?fields=id,username,name,profile_picture_url,biography,media_count,followers_count,follows_count&access_token=${INSTAGRAM_TOKEN}`,
      { next: { revalidate: 300 } }
    )
    const profile = await profileRes.json()

    // Si l'appel profil échoue (token expiré, mauvaises perms), on remonte l'erreur
    if (profile.error) {
      return NextResponse.json({
        error: profile.error.message || 'Erreur Instagram API',
        connected: false,
      })
    }

    // Récupérer les derniers posts
    const mediaRes = await fetch(
      `${GRAPH_BASE}/${INSTAGRAM_USER_ID}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink&limit=12&access_token=${INSTAGRAM_TOKEN}`,
      { next: { revalidate: 300 } }
    )
    const media = await mediaRes.json()

    // Récupérer les insights du compte (portée, vues)
    // Métriques disponibles pour IG Business via Graph API : reach, impressions (deprecated v22+), profile_views, etc.
    let insights = null
    try {
      const insightsRes = await fetch(
        `${GRAPH_BASE}/${INSTAGRAM_USER_ID}/insights?metric=reach&period=day&metric_type=total_value&access_token=${INSTAGRAM_TOKEN}`,
        { next: { revalidate: 300 } }
      )
      const insightsJson = await insightsRes.json()
      if (!insightsJson.error) {
        insights = insightsJson
      }
    } catch (e) {
      // Insights might require business account + extra permissions
    }

    return NextResponse.json({
      connected: true,
      profile: {
        id: profile.id,
        username: profile.username,
        name: profile.name || profile.username,
        biography: profile.biography || '',
        profilePicture: profile.profile_picture_url || null,
        followers: profile.followers_count || 0,
        follows: profile.follows_count || 0,
        mediaCount: profile.media_count || 0,
      },
      posts: media.data || [],
      insights: insights?.data || null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur Instagram API', connected: false })
  }
}
