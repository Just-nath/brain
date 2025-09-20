import { NextRequest, NextResponse } from 'next/server'
import db, { statements } from '@/lib/database'
import { cache, CACHE_KEYS } from '@/lib/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userFid, username, displayName, pfpUrl, score, totalQuestions, timeTaken, quizData } = body

    // Validate required fields
    if (!userFid || typeof userFid !== 'number') {
      return NextResponse.json({ error: 'Invalid userFid' }, { status: 400 })
    }
    
    if (typeof score !== 'number' || score < 0 || score > totalQuestions) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 })
    }
    
    if (!totalQuestions || typeof totalQuestions !== 'number' || totalQuestions <= 0) {
      return NextResponse.json({ error: 'Invalid totalQuestions' }, { status: 400 })
    }

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Invalid username' }, { status: 400 })
    }

    const percentage = Math.round((score / totalQuestions) * 100)

    // Validate percentage
    if (percentage < 0 || percentage > 100) {
      return NextResponse.json({ error: 'Invalid percentage calculated' }, { status: 400 })
    }

    // Insert or update user
    try {
      statements.insertUser.run(userFid, username, displayName || username, pfpUrl || '/icon.png')
    } catch (userError) {
      console.error('Error inserting user:', userError)
      return NextResponse.json({ error: 'Failed to save user data' }, { status: 500 })
    }

    // Insert quiz score
    try {
      statements.insertQuizScore.run(
        userFid,
        score,
        totalQuestions,
        percentage,
        timeTaken || 0,
        JSON.stringify(quizData || [])
      )
    } catch (scoreError) {
      console.error('Error inserting quiz score:', scoreError)
      return NextResponse.json({ error: 'Failed to save quiz score' }, { status: 500 })
    }

    // Update leaderboard
    try {
      statements.updateLeaderboard.run(userFid, score, percentage)
      
      // Invalidate leaderboard cache since it's been updated
      cache.delete(CACHE_KEYS.LEADERBOARD)
    } catch (leaderboardError) {
      console.error('Error updating leaderboard:', leaderboardError)
      // Don't fail the request if leaderboard update fails
    }

    return NextResponse.json({ 
      success: true,
      score,
      percentage,
      message: 'Score saved successfully'
    })

  } catch (error) {
    console.error('Error saving score:', error)
    
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userFid = searchParams.get('userFid')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!userFid || isNaN(parseInt(userFid))) {
      return NextResponse.json({ error: 'Valid userFid is required' }, { status: 400 })
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'Limit must be between 1 and 100' }, { status: 400 })
    }

    const scores = statements.getUserScores.all(parseInt(userFid), limit)
    
    return NextResponse.json({ 
      scores,
      total: scores.length,
      userFid: parseInt(userFid)
    })

  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 })
  }
}
