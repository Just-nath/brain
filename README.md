# Brains - Farcaster Mini App

A Farcaster Mini App that tests your knowledge of the Farcaster community by identifying users from their profile pictures.

## Features

- 🧠 **20-Question Quiz**: Test your knowledge of Farcaster community members
- 🏆 **Score Tracking**: Track your performance and personal bests
- 📱 **Farcaster Integration**: Built as a native Farcaster Mini App
- 🖼️ **Frame Generation**: Shareable Farcaster frames with your results
- 🎯 **Categories**: Get ranked based on your performance
- 🔄 **Social Sharing**: Challenge friends and share your scores

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **Farcaster**: @farcaster/core, @farcaster/hub-web
- **API**: Neynar API for Farcaster data
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Neynar API key (for production)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd brain
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file
NEYNAR_API_KEY=your_neynar_api_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Farcaster Mini App Configuration

The app is configured as a Farcaster Mini App with:

- **Manifest**: `farcaster.json` with proper metadata
- **Splash Screen**: Custom brain-themed splash screen
- **Frame Support**: Dynamic frame generation for sharing
- **Authentication**: Farcaster user authentication
- **Social Features**: Score sharing and friend challenges

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEYNAR_API_KEY` | API key for Neynar services | Yes (production) |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | Yes |
| `NEXT_PUBLIC_APP_NAME` | App name for sharing | No |
| `NEXT_PUBLIC_APP_DESCRIPTION` | App description | No |

## API Endpoints

- `GET /api/frame-image` - Generate dynamic frame images
- `POST /api/frame` - Handle frame interactions
- `GET /frame` - Display frame content

## Farcaster Integration

### Frame Meta Tags

The app includes proper Farcaster frame meta tags:
- `fc:frame`: vNext
- `fc:frame:image`: Dynamic score image
- `fc:frame:button:1`: "Take Quiz"
- `fc:frame:button:2`: "View Results"
- `fc:frame:aspect_ratio`: 1.91:1

### Mini App Features

- **Authentication**: Sign in with Farcaster
- **Profile Integration**: Display user's Farcaster profile
- **Social Sharing**: Generate shareable content
- **Frame Generation**: Create interactive frames

## Development

### Project Structure

```
brain/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── frame/             # Frame display page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # UI components
│   ├── farcaster-auth.tsx
│   └── quiz-engine.tsx
├── src/
│   ├── hooks/            # Custom hooks
│   └── utils/            # Utility functions
├── public/               # Static assets
├── farcaster.json        # Farcaster manifest
└── next.config.ts        # Next.js configuration
```

### Key Components

- **QuizEngine**: Main quiz component with Farcaster integration
- **FarcasterAuth**: Authentication wrapper
- **useFarcaster**: Hook for Farcaster functionality
- **Frame Generation**: Dynamic frame image creation

## Testing

### Local Testing

1. Run the development server
2. Test authentication flow
3. Verify frame generation
4. Check personal best tracking

### Frame Testing

1. Use Farcaster frame validator
2. Test frame image generation
3. Verify meta tag compliance
4. Test frame interactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Check the Farcaster documentation
- Review frame validation tools
- Test with Farcaster's frame testing environment

---

**Note**: This app requires HTTPS for proper Farcaster Mini App functionality. Use Vercel or another HTTPS-enabled hosting service for production deployment.