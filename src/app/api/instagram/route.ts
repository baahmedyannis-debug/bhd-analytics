import { NextResponse } from 'next/server'

const INSTAGRAM_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID

export async function GET() {
  if (!INSTAGRAM_TOKEN || !INSTAGRAM_USER_ID) {
    return NextResponse.json({ error: 'Instagram API non configurée', connected: false })
  }

  try {
    // Récupérer le profil (abonnés, publications)
    const profileRes = await fetch(
      `https://graph.instagram.com/v21.0/${INSTAGRAM_USER_ID}?fields=id,username,media_count,followers_count&access_token=${INSTAGRAM_TOKEN}`,
      { next: { revalidate: 300 } }
    )
    const profile = await profileRes.json()

    // Récupérer les derniers posts
    const mediaRes = await fetch(
      `https://graph.instagram.com/v21.0/${INSTAGRAM_USER_ID}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink&limit=12&access_token=${INSTAGRAM_TOKEN}`,
      { next: { revalidate: 300 } }
    )
    const media = await mediaRes.json()

    // Récupérer les insights du compte (portée, impressions)
    let insights = null
    try {
      const insightsRes = await fetch(
        `https://graph.instagram.com/v21.0/${INSTAGRAM_USER_ID}/insights?metric=reach,impressions,follower_count&period=day&metric_type=total_value&access_token=${INSTAGRAM_TOKEN}`,
        { next: { revalidate: 300 } }
      )
      insights = await insightsRes.json()
    } catch (e) {
      // Insights might require business account
    }

    return NextResponse.json({
      connected: true,
      profile: {
        username: profile.username,
        followers: profile.followers_count,
        mediaCount: profile.media_count,
      },
      posts: media.data || [],
      insights: insights?.data || null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur Instagram API', connected: false })
  }
}
