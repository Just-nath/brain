import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // In a real Farcaster Mini App, this would use the actual Farcaster SDK
    // to get the authenticated user's data from the Mini App context
    const mockUser = {
      fid: 12345,
      username: 'farcaster.user',
      displayName: 'Farcaster User',
      pfpUrl: '/default-pfp.png'
    }

    return NextResponse.json(mockUser)
  } catch (error) {
    console.error('Error getting user:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
