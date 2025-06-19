# Deployment Guide

Your project is now configured for production deployment with server-side functionality.

## Current Architecture

- **Frontend**: Astro with React components
- **API**: Astro API routes (`/api/strava/activities`)
- **Database**: None (using Strava API directly)
- **Backend**: Ruby/Sinatra (currently unused)

## Recommended Deployment: Vercel

### Why Vercel?
- ✅ Perfect for Astro with server-side functionality
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Easy environment variable management
- ✅ GitHub integration for auto-deployment
- ✅ Free tier available

### Deployment Steps

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Configure for production deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub account
   - Import your repository
   - Vercel will auto-detect Astro and configure build settings

3. **Set Environment Variables in Vercel**:
   - Go to your project settings in Vercel
   - Navigate to "Environment Variables"
   - Add these variables:
     ```
     STRAVA_CLIENT_ID=165153
     STRAVA_CLIENT_SECRET=d88dc10353cf0b5cd18360234d407d7e34b44f49
     STRAVA_ACCESS_TOKEN=77b51e8eb6c35f141313ad9beb9585a2c576de4a
     STRAVA_REFRESH_TOKEN=0c10bd23a988d97a0e409f8b7fa2e02c611526b0
     STRAVA_REDIRECT_URI=https://your-domain.vercel.app/auth/strava/callback
     ```

4. **Update Strava App Settings**:
   - Go to [Strava API Settings](https://www.strava.com/settings/api)
   - Update the Authorization Callback Domain to your Vercel domain

## Alternative Deployment Options

### Option 2: Netlify
```bash
npm install --save-dev @astrojs/netlify
```
Update `astro.config.mjs`:
```js
import netlify from "@astrojs/netlify/functions";

export default defineConfig({
  // ... other config
  adapter: netlify(),
});
```

### Option 3: Railway
Railway provides full server capabilities and can run both your Astro app and Ruby backend if needed.

### Option 4: DigitalOcean App Platform
Good for full-stack applications with multiple services.

## Environment Variables for Production

Your production environment needs these variables:
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET` 
- `STRAVA_ACCESS_TOKEN`
- `STRAVA_REFRESH_TOKEN`
- `STRAVA_REDIRECT_URI` (update to production URL)

## Do You Need the Ruby Backend?

Currently, **NO** - your Strava integration works entirely through Astro's API routes. The Ruby backend is unused.

### If you want to use the Ruby backend later:
1. Deploy to a platform that supports multiple services (Railway, DigitalOcean)
2. Set up separate deployments for frontend and backend
3. Update API calls to point to your Ruby backend

## Build Commands

The following commands work for production:

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Next Steps

1. **Deploy to Vercel** - easiest option
2. **Set up environment variables** in Vercel dashboard
3. **Update Strava redirect URI** to production URL
4. **Test the deployment** - your Strava integration should work seamlessly

Your app will automatically handle:
- Server-side API routes
- Environment variable loading
- React component hydration
- Static asset optimization

The deployment will be production-ready with the same functionality you have locally! 