# Brains - Farcaster Mini App Deployment Guide

## 🚀 Quick Deployment to Vercel

### 1. Prerequisites
- GitHub account
- Vercel account
- Neynar API key (for production)

### 2. Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial Farcaster Mini App setup"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Set Environment Variables:**
   In Vercel dashboard, go to Settings > Environment Variables:
   ```
   NEYNAR_API_KEY=your_neynar_api_key_here
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-app-name.vercel.app`

### 3. Configure Farcaster Mini App

1. **Update farcaster.json:**
   - Change `domain` to your Vercel domain
   - Update `homeUrl`, `frameUrl`, `apiUrl` accordingly

2. **Test Frame Generation:**
   - Visit: `https://your-app-name.vercel.app/api/frame-image?score=15&total=20&percentage=75&category=Expert`
   - Should display a generated frame image

3. **Test Frame Page:**
   - Visit: `https://your-app-name.vercel.app/frame?score=15&total=20&percentage=75&category=Expert`
   - Should display the frame content

### 4. Farcaster Integration

1. **Frame Validator:**
   - Use Farcaster's frame validator tools
   - Test your frame URLs for compliance

2. **Mini App Testing:**
   - Test in Farcaster's preview environment
   - Verify authentication flow
   - Test social sharing features

## 🔧 Local Development

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## 📱 Farcaster Mini App Features

### ✅ Implemented Features
- **Authentication**: Farcaster user sign-in
- **Quiz Engine**: 20-question Farcaster profile quiz
- **Frame Generation**: Dynamic shareable frames
- **Social Sharing**: Farcaster cast integration
- **Score Tracking**: Personal best tracking
- **Responsive Design**: Mobile-optimized UI
- **Splash Screen**: Brain-themed loading screen

### 🎯 Key URLs
- **Home**: `/`
- **Quiz**: `/` (starts when user clicks "Start Quiz")
- **Frame Display**: `/frame?score=X&total=Y&percentage=Z&category=CATEGORY`
- **Frame Image API**: `/api/frame-image?score=X&total=Y&percentage=Z&category=CATEGORY`
- **Profile**: `/profile`

### 🖼️ Frame Meta Tags
The app includes proper Farcaster frame meta tags:
- `fc:frame`: vNext
- `fc:frame:image`: Dynamic score image
- `fc:frame:button:1`: "Take Quiz"
- `fc:frame:button:2`: "View Results"
- `fc:frame:aspect_ratio`: 1.91:1

## 🎨 Customization

### Splash Screen
- **Image**: Uses `/artificial-brain.svg` from public folder
- **Colors**: Purple theme (`#8B5CF6`)
- **Configuration**: Set in `farcaster.json`

### Quiz Questions
- **Source**: Neynar API for Farcaster users
- **Filter**: Users with 2000+ followers
- **Format**: "Who is this Farcaster user?" with 4 options

### Scoring System
- **Categories**: OG, Expert, Regular, Casual, Newbie
- **Thresholds**: 90%, 70%, 50%, 30%, 0%
- **Messages**: Personalized feedback for each category

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors:**
   - Check TypeScript errors: `npm run build`
   - Fix linting issues: `npm run lint`

2. **Frame Not Loading:**
   - Verify HTTPS is enabled
   - Check frame meta tags
   - Test with Farcaster frame validator

3. **API Errors:**
   - Verify Neynar API key is set
   - Check network requests in browser dev tools

4. **Authentication Issues:**
   - Check Farcaster SDK integration
   - Verify user permissions

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 📊 Performance

### Optimizations
- **Images**: Unoptimized for frame compatibility
- **Caching**: Frame images cached for 1 hour
- **Bundle Size**: Optimized with Next.js 15
- **Loading**: Suspense boundaries for better UX

### Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **Error Tracking**: Console logging for debugging
- **Frame Metrics**: Track frame generation success

## 🔐 Security

### Headers
- `X-Frame-Options`: SAMEORIGIN
- `X-Content-Type-Options`: nosniff
- `Referrer-Policy`: origin-when-cross-origin

### API Security
- Environment variables for sensitive data
- Input validation for frame parameters
- Error handling for API failures

## 🚀 Going Live

### Pre-Launch Checklist
- [ ] Deploy to Vercel
- [ ] Set environment variables
- [ ] Test frame generation
- [ ] Validate with Farcaster tools
- [ ] Test authentication flow
- [ ] Verify social sharing
- [ ] Check mobile responsiveness

### Post-Launch
- [ ] Monitor performance
- [ ] Track user engagement
- [ ] Collect feedback
- [ ] Iterate and improve

---

**🎉 Your Farcaster Mini App is now ready for production!**

The app includes all the features needed for a successful Farcaster Mini App:
- ✅ Production-ready build
- ✅ Frame generation
- ✅ Social sharing
- ✅ User authentication
- ✅ Mobile optimization
- ✅ Error handling
- ✅ Performance optimization
