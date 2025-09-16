import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const score = searchParams.get('score') || '0'
  const total = searchParams.get('total') || '20'
  const percentage = searchParams.get('percentage') || '0'
  const category = searchParams.get('category') || 'Quiz Taker'

  // For now, return a simple SVG image
  // In production, you could use a library like Canvas or Sharp to generate more complex images
  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="url(#gradient)"/>
      
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background Pattern -->
      <circle cx="100" cy="100" r="50" fill="rgba(255,255,255,0.1)"/>
      <circle cx="1100" cy="530" r="80" fill="rgba(255,255,255,0.1)"/>
      <circle cx="200" cy="500" r="30" fill="rgba(255,255,255,0.1)"/>
      
      <!-- Main Content -->
      <rect x="100" y="100" width="1000" height="430" rx="20" fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      
      <!-- Brain Icon -->
      <circle cx="200" cy="200" r="60" fill="#8B5CF6"/>
      <text x="200" y="210" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="40" font-weight="bold">🧠</text>
      
      <!-- Title -->
      <text x="600" y="180" text-anchor="middle" fill="#1f2937" font-family="Arial, sans-serif" font-size="48" font-weight="bold">Brains Quiz Results</text>
      
      <!-- Score -->
      <text x="600" y="280" text-anchor="middle" fill="#8B5CF6" font-family="Arial, sans-serif" font-size="72" font-weight="bold">${score}/${total}</text>
      
      <!-- Percentage -->
      <text x="600" y="340" text-anchor="middle" fill="#10b981" font-family="Arial, sans-serif" font-size="48" font-weight="bold">${percentage}%</text>
      
      <!-- Category -->
      <rect x="400" y="380" width="400" height="60" rx="30" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
      <text x="600" y="420" text-anchor="middle" fill="#374151" font-family="Arial, sans-serif" font-size="24" font-weight="bold">${category}</text>
      
      <!-- CTA -->
      <text x="600" y="520" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="20">Take the quiz at brains.quiz</text>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}











