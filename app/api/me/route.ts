import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // For now, return a mock user since the SDK is still being set up
    // In production, this would use the actual Farcaster SDK
    const mockUser = {
      fid: 12345,
      username: 'demo.user',
      displayName: 'Demo User',
      pfpUrl: '/default-pfp.png'
    }

    return NextResponse.json(mockUser)
  } catch (error) {
    console.error('Error getting user:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
