import type { APIRoute } from 'astro';
import { getAuthorizationUrl, buildRedirectUri } from '../../../../lib/strava';

export const prerender = false;

export const GET: APIRoute = async ({ request, redirect }) => {
  try {
    // Build dynamic redirect URI based on current request
    const redirectUri = buildRedirectUri(request);
    console.log('Strava auth initiated:', { 
      requestUrl: request.url,
      dynamicRedirectUri: redirectUri 
    });
    
    const authUrl = getAuthorizationUrl(redirectUri);
    console.log('Redirecting to Strava with URL:', authUrl);
    
    // Try manual redirect as backup
    return new Response(null, {
      status: 302,
      headers: {
        'Location': authUrl,
      },
    });
  } catch (error) {
    console.error('Strava auth error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to initiate Strava authentication',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}; 