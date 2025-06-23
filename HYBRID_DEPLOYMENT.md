# Hybrid Deployment Guide

Your project is now configured for a **hybrid deployment**:
- **Main site**: Static deployment on GitHub Pages
- **Strava API**: Server-side deployment on Vercel

## Architecture Overview

```
┌─────────────────┐    CORS-enabled     ┌──────────────────┐
│  GitHub Pages   │ ─────────────────→  │  Vercel API      │
│  (Static Site)  │    API requests     │  (Multi-Service) │  
│                 │                     │                  │
│ - Home          │                     │ - /api/strava/   │
│ - About         │                     │   activities     │
│ - Work          │                     │ - /api/reading/  │
│ - Workout       │                     │   items          │
│ - Reading       │                     │ - Environment    │
│ - Store         │                     │   Variables      │
└─────────────────┘                     │ - CORS Headers   │
                                        │ - Data Storage   │
                                        └──────────────────┘
```

## Features

This hybrid deployment provides:

1. **Static Site**: Fast loading, CDN-distributed main website
2. **Dynamic API**: Server-side Strava integration with secure credential storage
3. **Persistent Reading List**: Cloud-based storage for your reading list items
4. **CORS Support**: Proper cross-origin handling for API requests
5. **Environment Variables**: Secure credential management on Vercel

## Part 1: Deploy Strava API to Vercel

### 1. Create Vercel Project

```bash
cd strava-api
npm install
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

### 3. Set Environment Variables in Vercel

Go to your Vercel dashboard → Project Settings → Environment Variables:

```
STRAVA_CLIENT_ID=165153
STRAVA_CLIENT_SECRET=d88dc10353cf0b5cd18360234d407d7e34b44f49
STRAVA_ACCESS_TOKEN=77b51e8eb6c35f141313ad9beb9585a2c576de4a
STRAVA_REFRESH_TOKEN=0c10bd23a988d97a0e409f8b7fa2e02c611526b0
```

### 4. Test Your API

Your Vercel API will be available at:
```
https://your-strava-api.vercel.app/api/strava/activities
https://your-strava-api.vercel.app/api/reading/items
```

#### Available Endpoints

**Strava Integration:**
- `GET /api/strava/activities` - Fetch recent Strava activities and athlete data

**Reading List Management:**
- `GET /api/reading/items` - Get all reading list items
- `POST /api/reading/items` - Add new reading list item
- `PUT /api/reading/items` - Update existing item (toggle read status, add comment)
- `DELETE /api/reading/items?id={itemId}` - Delete reading list item

## Part 2: Update Main Site for GitHub Pages

### 1. Update API URLs

Edit both `src/components/StravaActivities.tsx` and `src/components/ReadingList.tsx` and replace:
```typescript
const API_BASE_URL = 'https://your-strava-api.vercel.app';
```

With your actual Vercel deployment URL.

### 2. Build and Deploy to GitHub Pages

```bash
# Build the static site
npm run build

# The dist/ folder contains your static site
```

### 3. Configure GitHub Pages

1. Go to your GitHub repository
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: `main` / `docs` (or create `gh-pages` branch)
5. Folder: `/` (if you commit dist/ to main) or `/dist`

### 4. GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## Part 3: Complete Setup Checklist

### ✅ Vercel API Service
- [ ] `strava-api/` folder deployed to Vercel
- [ ] Environment variables configured in Vercel dashboard
- [ ] API endpoint accessible: `https://your-app.vercel.app/api/strava/activities`
- [ ] CORS headers working (test with curl or browser)

### ✅ GitHub Pages Site
- [ ] Updated `API_BASE_URL` in `StravaActivities.tsx`
- [ ] Built static site with `npm run build`
- [ ] Deployed to GitHub Pages
- [ ] Site accessible at `https://username.github.io/repository` or custom domain

### ✅ Integration Testing
- [ ] Main site loads correctly
- [ ] Workout page displays without errors
- [ ] "Load Activities" button triggers external API call
- [ ] Strava data displays correctly (or shows proper error messages)

## Benefits of This Architecture

### ✅ Advantages
- **Fast static site** on GitHub Pages (free)
- **Server-side API** capability for sensitive operations
- **Separate deployments** - can update API without rebuilding site
- **Environment variables** secure on Vercel server
- **CORS configured** for cross-origin requests

### ⚠️ Considerations
- **Two deployments** to manage
- **API URL dependency** - need to update if Vercel URL changes
- **CORS limitations** - API is publicly accessible
- **Cold starts** - Vercel functions may have slight delay on first request

## URLs After Deployment

```
Main Site (GitHub Pages):    https://monkeybusiness101.com
Strava API (Vercel):         https://your-strava-api.vercel.app
API Endpoint:                https://your-strava-api.vercel.app/api/strava/activities
```

## Troubleshooting

### CORS Issues
If you get CORS errors, verify:
- `vercel.json` has correct CORS headers
- API endpoint responds to OPTIONS requests
- Browser console shows proper preflight requests

### API Not Found
- Check Vercel deployment logs
- Verify file structure: `strava-api/api/strava/activities.js`
- Test API endpoint directly in browser

### Environment Variables
- Verify all variables are set in Vercel dashboard
- Check Vercel function logs for configuration errors
- Test with latest Strava tokens (access tokens expire)

## Next Steps

1. **Deploy Strava API to Vercel first**
2. **Test API endpoint independently**
3. **Update main site with correct API URL**
4. **Deploy main site to GitHub Pages**
5. **Test end-to-end integration**

Your site will be live on GitHub Pages with full Strava integration! 