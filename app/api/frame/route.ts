import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle frame interaction
    // In a real implementation, you would process the frame data
    // and potentially redirect to the quiz or results page
    
    console.log('Frame interaction received:', body)
    
    // Redirect to the main quiz page
    return NextResponse.redirect(new URL('/', request.url), 302)
  } catch (error) {
    console.error('Frame API error:', error)
    return NextResponse.redirect(new URL('/', request.url), 302)
  }
}

export async function GET() {
  // Handle GET requests to the frame endpoint
  // This could be used for frame validation
  return NextResponse.json({
    message: 'Brains Quiz Frame API',
    version: '1.0.0',
    endpoints: {
      quiz: '/',
      frame: '/frame',
      image: '/api/frame-image'
    }
  })
}
