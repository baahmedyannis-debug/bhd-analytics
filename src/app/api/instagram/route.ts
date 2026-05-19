import { NextResponse } from 'next/server'

const INSTAGRAM_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID

// On utilise l'API Facebook Graph (pas IG direct) car le token vient
// d'un OAuth Facebook (Page Access Token de la Page liée au compte IG Business).
const GRAPH_BASE = 'https://graph.facebook.com/v21.0'

// ── Helpers backend ───────────────────────────────────
interface RawMedia {
  id: string
  caption?: string
  media_type: string
  media_url?: string
  thumbnail_url?: string
  timestamp: string
  like_count?: number
  comments_count?: number
  permalink?: string
}

interface DemoBreakdown {
  dimension_values: string[]
  value: number
}

function safeFetch<T>(url: string): Promise<T | { error: { message: string } }> {
  return fetch(url, { next: { revalidate: 300 } })
    .then((r) => r.json())
    .catch((e) => ({ error: { message: e?.message || 'fetch failed' } }))
}

function extractDemographics(json: { data?: { total_value?: { breakdowns?: { results?: DemoBreakdown[] }[] } }[] }) {
  const results = json?.data?.[0]?.total_value?.breakdowns?.[0]?.results || []
  return results.map((r) => ({ key: r.dimension_values.join(' / '), value: r.value }))
}

function topN<T extends { value: number }>(arr: T[], n: number): T[] {
  return [...arr].sort((a, b) => b.value - a.value).slice(0, n)
}

function extractHashtags(text: string | undefined): string[] {
  if (!text) return []
  // ASCII + Latin-1 Suppl (accents FR) + Arabe (sans flag /u pour compat ES5)
  const matches = text.match(/#[\wÀ-ÖØ-öø-ÿ\u0600-\u06FF]+/g) || []
  return matches.map((h) => h.toLowerCase())
}

// ── Route handler ─────────────────────────────────────
export async function GET() {
  if (!INSTAGRAM_TOKEN || !INSTAGRAM_USER_ID) {
    return NextResponse.json({ error: 'Instagram API non configurée', connected: false })
  }

  try {
    // Profil
    const profileUrl = `${GRAPH_BASE}/${INSTAGRAM_USER_ID}?fields=id,username,name,profile_picture_url,biography,media_count,followers_count,follows_count&access_token=${INSTAGRAM_TOKEN}`
    // Media — limit 50 pour avoir une bonne base d'analyse (hashtags, top engagement)
    const mediaUrl = `${GRAPH_BASE}/${INSTAGRAM_USER_ID}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink&limit=50&access_token=${INSTAGRAM_TOKEN}`
    // Demographics — 3 breakdowns en parallèle
    const demoCountry = `${GRAPH_BASE}/${INSTAGRAM_USER_ID}/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=country&access_token=${INSTAGRAM_TOKEN}`
    const demoCity = `${GRAPH_BASE}/${INSTAGRAM_USER_ID}/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=city&access_token=${INSTAGRAM_TOKEN}`
    const demoAgeGender = `${GRAPH_BASE}/${INSTAGRAM_USER_ID}/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=age%2Cgender&access_token=${INSTAGRAM_TOKEN}`
    // Reach (existant)
    const reachUrl = `${GRAPH_BASE}/${INSTAGRAM_USER_ID}/insights?metric=reach&period=day&metric_type=total_value&access_token=${INSTAGRAM_TOKEN}`
    // Churn 30j : abonnés gagnés + perdus (total période, breakdown follow_type)
    const nowSec = Math.floor(Date.now() / 1000)
    const since30 = nowSec - 30 * 24 * 3600
    const churnTotalUrl = `${GRAPH_BASE}/${INSTAGRAM_USER_ID}/insights?metric=follows_and_unfollows&period=day&metric_type=total_value&breakdown=follow_type&since=${since30}&until=${nowSec}&access_token=${INSTAGRAM_TOKEN}`
    // Daily gains: time series sur 30j
    const dailyGainsUrl = `${GRAPH_BASE}/${INSTAGRAM_USER_ID}/insights?metric=follower_count&period=day&since=${since30}&until=${nowSec}&access_token=${INSTAGRAM_TOKEN}`

    const [profileRaw, mediaRaw, countryRaw, cityRaw, ageGenderRaw, reachRaw, churnTotalRaw, dailyGainsRaw] = await Promise.all([
      safeFetch<{ id: string; username: string; name?: string; biography?: string; profile_picture_url?: string; media_count?: number; followers_count?: number; follows_count?: number; error?: { message: string } }>(profileUrl),
      safeFetch<{ data?: RawMedia[]; error?: { message: string } }>(mediaUrl),
      safeFetch<{ data?: { total_value?: { breakdowns?: { results?: DemoBreakdown[] }[] } }[]; error?: { message: string } }>(demoCountry),
      safeFetch<{ data?: { total_value?: { breakdowns?: { results?: DemoBreakdown[] }[] } }[]; error?: { message: string } }>(demoCity),
      safeFetch<{ data?: { total_value?: { breakdowns?: { results?: DemoBreakdown[] }[] } }[]; error?: { message: string } }>(demoAgeGender),
      safeFetch<{ data?: unknown[]; error?: { message: string } }>(reachUrl),
      safeFetch<{ data?: { total_value?: { breakdowns?: { results?: DemoBreakdown[] }[] } }[]; error?: { message: string } }>(churnTotalUrl),
      safeFetch<{ data?: { values?: { value: number; end_time: string }[] }[]; error?: { message: string } }>(dailyGainsUrl),
    ])

    // Profile error → bloque tout
    const profile = profileRaw as { error?: { message: string }; id?: string; username?: string; name?: string; biography?: string; profile_picture_url?: string; media_count?: number; followers_count?: number; follows_count?: number }
    if (profile.error) {
      return NextResponse.json({ error: profile.error.message, connected: false })
    }

    const media = mediaRaw as { data?: RawMedia[]; error?: { message: string } }
    const allPosts = media.data || []
    const followers = profile.followers_count || 0

    // ── Top posts par engagement ──────────────────────
    const postsWithEng = allPosts.map((p) => {
      const total = (p.like_count || 0) + (p.comments_count || 0)
      const rate = followers > 0 ? (total / followers) * 100 : 0
      return {
        id: p.id,
        caption: p.caption || '',
        permalink: p.permalink,
        thumbnail: p.thumbnail_url || p.media_url,
        media_type: p.media_type,
        timestamp: p.timestamp,
        likes: p.like_count || 0,
        comments: p.comments_count || 0,
        engagement: total,
        engagementRate: Number(rate.toFixed(2)),
      }
    })
    const topEngaged = [...postsWithEng].sort((a, b) => b.engagement - a.engagement).slice(0, 5)

    // ── Top hashtags ──────────────────────────────────
    // Pour chaque hashtag : nb d'utilisations + engagement total + engagement moyen
    const tagStats: Record<string, { count: number; totalEng: number; posts: string[] }> = {}
    for (const p of postsWithEng) {
      const tags = Array.from(new Set(extractHashtags(p.caption)))
      for (const t of tags) {
        if (!tagStats[t]) tagStats[t] = { count: 0, totalEng: 0, posts: [] }
        tagStats[t].count += 1
        tagStats[t].totalEng += p.engagement
        tagStats[t].posts.push(p.id)
      }
    }
    const topHashtags = Object.entries(tagStats)
      .map(([tag, s]) => ({
        tag,
        uses: s.count,
        avgEngagement: Math.round(s.totalEng / s.count),
        totalEngagement: s.totalEng,
      }))
      .filter((t) => t.uses >= 2) // au moins 2 utilisations pour être pertinent
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 10)

    // ── Demographics ──────────────────────────────────
    const country = countryRaw as { data?: { total_value?: { breakdowns?: { results?: DemoBreakdown[] }[] } }[]; error?: { message: string } }
    const city = cityRaw as { data?: { total_value?: { breakdowns?: { results?: DemoBreakdown[] }[] } }[]; error?: { message: string } }
    const ageGender = ageGenderRaw as { data?: { total_value?: { breakdowns?: { results?: DemoBreakdown[] }[] } }[]; error?: { message: string } }

    const countries = country.error ? [] : topN(extractDemographics(country), 8)
    const cities = city.error ? [] : topN(extractDemographics(city), 8)
    const ageGenderBreakdown = ageGender.error ? [] : extractDemographics(ageGender)

    // Reach
    const reach = reachRaw as { data?: unknown[]; error?: { message: string } }
    const insights = reach.error ? null : reach.data || null

    // ── Churn 30 jours ────────────────────────────────
    const churnTotal = churnTotalRaw as { data?: { total_value?: { breakdowns?: { results?: DemoBreakdown[] }[] } }[]; error?: { message: string } }
    let gained = 0
    let lost = 0
    if (!churnTotal.error) {
      const results = churnTotal.data?.[0]?.total_value?.breakdowns?.[0]?.results || []
      for (const r of results) {
        if (r.dimension_values?.[0] === 'FOLLOWER') gained = r.value
        else if (r.dimension_values?.[0] === 'NON_FOLLOWER') lost = r.value
      }
    }

    // Daily gains time series
    const dailyGains = dailyGainsRaw as { data?: { values?: { value: number; end_time: string }[] }[]; error?: { message: string } }
    const dailySeries = dailyGains.error
      ? []
      : (dailyGains.data?.[0]?.values || []).map((v) => ({
          date: v.end_time.slice(0, 10),
          gained: v.value,
        }))

    const churn30d = {
      gained,
      lost,
      net: gained - lost,
      churnRate: followers > 0 ? Number(((lost / followers) * 100).toFixed(2)) : 0,
      dailyGains: dailySeries,
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
      // 12 derniers pour la grille (compat avec l'UI existante)
      posts: allPosts.slice(0, 12),
      analytics: {
        topEngaged,
        topHashtags,
      },
      demographics: {
        countries,
        cities,
        ageGender: ageGenderBreakdown,
      },
      churn30d,
      insights,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erreur Instagram API'
    return NextResponse.json({ error: msg, connected: false })
  }
}
