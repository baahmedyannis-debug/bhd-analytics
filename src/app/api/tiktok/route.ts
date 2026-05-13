import { NextResponse } from 'next/server'

// TikTok API est très restrictive — nécessite une app approuvée
// Pour l'instant, on prépare l'infrastructure
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN

export async function GET() {
  if (!TIKTOK_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'TikTok API non configurée', connected: false })
  }

  try {
    // TikTok Research API — nécessite app validée
    const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TIKTOK_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: ['display_name', 'follower_count', 'following_count', 'likes_count', 'video_count', 'avatar_url'],
      }),
    })
    const userData = await userRes.json()
    const user = userData.data?.user || {}

    // Vidéos récentes
    const videosRes = await fetch('https://open.tiktokapis.com/v2/video/list/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TIKTOK_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        max_count: 20,
        fields: ['id', 'title', 'create_time', 'like_count', 'comment_count', 'share_count', 'view_count', 'duration'],
      }),
    })
    const videosData = await videosRes.json()

    return NextResponse.json({
      connected: true,
      profile: {
        displayName: user.display_name,
        followers: user.follower_count || 0,
        likes: user.likes_count || 0,
        videoCount: user.video_count || 0,
        avatar: user.avatar_url,
      },
      videos: (videosData.data?.videos || []).map((v: any) => ({
        title: v.title,
        views: v.view_count || 0,
        likes: v.like_count || 0,
        comments: v.comment_count || 0,
        shares: v.share_count || 0,
        duration: v.duration,
        createdAt: v.create_time,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur TikTok API', connected: false })
  }
}
