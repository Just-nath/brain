import { NextResponse } from 'next/server'

export async function GET() {
  // This will be updated with the actual verification data from Farcaster
  const farcasterConfig = {
    "name": "Brains - Farcaster PFP Quiz",
    "version": "1.0.0",
    "description": "Test your knowledge of Farcaster community members",
    "icon": "https://brain-three-jet.vercel.app/icon.png",
    "splashBackgroundColor": "#3b82f6",
    "splashTextColor": "#ffffff",
    "domain": "brain-three-jet.vercel.app",
    "verification": {
      "signature": "PLACEHOLDER_SIGNATURE",
      "timestamp": "PLACEHOLDER_TIMESTAMP",
      "fid": "PLACEHOLDER_FID"
    }
  }

  return NextResponse.json(farcasterConfig, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
