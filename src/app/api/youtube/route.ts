import { NextResponse } from 'next/server'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID

export async function GET() {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    return NextResponse.json({ error: 'YouTube API non configurée', connected: false })
  }

  try {
    // Infos chaîne (abonnés, vues totales, vidéos)
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,contentDetails&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`,
      { next: { revalidate: 300 } }
    )
    const channelData = await channelRes.json()
    const channel = channelData.items?.[0]

    if (!channel) {
      return NextResponse.json({ error: 'Chaîne YouTube introuvable', connected: false })
    }

    // Dernières vidéos
    const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads
    let videos: any[] = []

    if (uploadsPlaylistId) {
      const videosRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=10&key=${YOUTUBE_API_KEY}`,
        { next: { revalidate: 300 } }
      )
      const videosData = await videosRes.json()

      // Récupérer les stats de chaque vidéo
      const videoIds = (videosData.items || []).map((v: any) => v.contentDetails.videoId).join(',')
      if (videoIds) {
        const statsRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`,
          { next: { revalidate: 300 } }
        )
        const statsData = await statsRes.json()

        videos = (videosData.items || []).map((v: any, i: number) => {
          const stats = statsData.items?.[i]?.statistics || {}
          const duration = statsData.items?.[i]?.contentDetails?.duration || ''
          return {
            title: v.snippet.title,
            thumbnail: v.snippet.thumbnails?.medium?.url || null,
            publishedAt: v.snippet.publishedAt,
            views: parseInt(stats.viewCount || '0'),
            likes: parseInt(stats.likeCount || '0'),
            comments: parseInt(stats.commentCount || '0'),
            duration,
          }
        })
      }
    }

    return NextResponse.json({
      connected: true,
      channel: {
        name: channel.snippet.title,
        description: channel.snippet.description,
        thumbnail: channel.snippet.thumbnails?.default?.url,
        subscribers: parseInt(channel.statistics.subscriberCount || '0'),
        totalViews: parseInt(channel.statistics.viewCount || '0'),
        videoCount: parseInt(channel.statistics.videoCount || '0'),
      },
      videos,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur YouTube API', connected: false })
  }
}
