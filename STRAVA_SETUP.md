# Strava API Integration Setup

This guide will help you set up Strava API integration to display workout activities on your website.

## Step 1: Create a Strava Application

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Click "Create & Manage Your App"
3. Fill out the application form:
   - **Application Name**: Your app name (e.g., "My Workout Tracker")
   - **Category**: Choose appropriate category
   - **Club**: Leave blank unless you have a club
   - **Website**: Your website URL or `http://localhost:4322` for development
   - **Authorization Callback Domain**: `localhost` for development

## Step 2: Get Your API Credentials

After creating your app, you'll see:
- **Client ID**: A public identifier for your app
- **Client Secret**: Keep this secret and secure!
- **Access Token**: For API requests (expires every 6 hours)
- **Refresh Token**: To get new access tokens

## Step 3: Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# Strava API Configuration
STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here
STRAVA_ACCESS_TOKEN=your_access_token_here
STRAVA_REFRESH_TOKEN=your_refresh_token_here
STRAVA_REDIRECT_URI=http://localhost:4322/auth/strava/callback
```

### Important Security Notes:
- **Never commit your `.env` file to Git**
- The `.env` file should be added to your `.gitignore`
- Client Secret and tokens should be kept private

## Step 4: OAuth Authorization Flow

For production use, you'll need to implement the full OAuth flow:

1. **Redirect users to Strava authorization**:
   ```
   https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=read,activity:read_all
   ```

2. **Handle the callback**: After user authorizes, Strava redirects back with a code
3. **Exchange code for tokens**: Use the code to get access and refresh tokens
4. **Store tokens securely**: Save tokens for the user

## Step 5: API Scopes

Choose appropriate scopes for your use case:

- `read`: Read public segments, public routes, public profile data, public posts, public events, club feeds, and leaderboards
- `read_all`: Read private routes, private segments, and private events for the user
- `profile:read_all`: Read all profile information even if the user has set their profile visibility to Followers or Only You
- `activity:read`: Read the user's activity data for activities that are visible to Everyone and Followers
- `activity:read_all`: Read all activities including private ones
- `activity:write`: Create manual activities and uploads, and edit activities

## Step 6: Rate Limits

Strava API has rate limits:
- **200 requests per 15 minutes**
- **2,000 requests per day**

Plan your API usage accordingly and implement caching where possible.

## Step 7: Testing

1. Add your credentials to the `.env` file
2. Start your development server: `npm run dev`
3. Visit the workout page: `http://localhost:4322/workout`
4. Click "Load Activities" to test the integration

## Troubleshooting

### Common Issues:

1. **"No access token available"**
   - Check your `.env` file has the correct `STRAVA_ACCESS_TOKEN`
   - Ensure the access token hasn't expired (they last 6 hours)

2. **"Strava access token is invalid or expired"**
   - Your access token has expired
   - Use the refresh token to get a new access token

3. **CORS errors in browser**
   - These are normal for client-side requests
   - Consider moving API calls to server-side endpoints

4. **Rate limit exceeded**
   - You've hit the 200 requests per 15 minutes limit
   - Wait or implement request caching

## Next Steps

1. Implement server-side API endpoints for better security
2. Add token refresh logic for automatic token renewal
3. Implement user authentication to store multiple user tokens
4. Add more detailed activity analytics and visualizations
5. Consider implementing webhooks for real-time activity updates

## Resources

- [Strava API Documentation](https://developers.strava.com/docs/)
- [Strava OAuth Guide](https://developers.strava.com/docs/authentication/)
- [Strava API Playground](https://developers.strava.com/playground/) 