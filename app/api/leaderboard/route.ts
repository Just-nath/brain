import { NextRequest, NextResponse } from 'next/server'
import { statements } from '@/lib/database'
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const userFid = searchParams.get('userFid')

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'Limit must be between 1 and 100' }, { status: 400 })
    }

    // Check cache first
    const cacheKey = `${CACHE_KEYS.LEADERBOARD}_${limit}`
    const cachedData = cache.get<any>(cacheKey)
    
    let leaderboard, userRank
    
    if (cachedData) {
      leaderboard = cachedData.leaderboard
      userRank = cachedData.userRank
    } else {
      // Get top leaderboard entries from database
      leaderboard = statements.getLeaderboard.all(limit)

      // Cache the leaderboard data
      cache.set(cacheKey, { leaderboard }, CACHE_TTL.LEADERBOARD)
    }

    // Calculate user rank if needed (this is not cached as it's user-specific)
    if (userFid && !isNaN(parseInt(userFid))) {
      try {
        const rankResult = statements.getUserRank.get(
          parseInt(userFid),
          parseInt(userFid),
          parseInt(userFid),
          parseInt(userFid),
          parseInt(userFid),
          parseInt(userFid)
        )
        userRank = rankResult ? (rankResult as any).rank : null
      } catch (rankError) {
        console.error('Error calculating user rank:', rankError)
        // Continue without user rank
      }
    }

    return NextResponse.json({
      leaderboard,
      userRank,
      total: leaderboard.length,
      limit
    })

  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
