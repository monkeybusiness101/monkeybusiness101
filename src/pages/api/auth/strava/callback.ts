import type { APIRoute } from 'astro';
import { exchangeCodeForToken, storeTokens } from '../../../../lib/strava';

export const prerender = false;

export const GET: APIRoute = async ({ url, redirect, request }) => {
  const searchParams = new URL(url).searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');
  const scope = searchParams.get('scope');

  // Log callback for debugging
  console.log('Strava callback received with code:', code ? 'SUCCESS' : 'NO CODE');

  if (error) {
    console.error('Strava OAuth error:', error);
    return redirect('/workout?error=strava_auth_failed');
  }

  if (!code) {
    console.error('No authorization code received from Strava');
    return redirect('/workout?error=no_code');
  }

  try {
    const tokenResponse = await exchangeCodeForToken(code);
    
    // Store the tokens in memory for this session
    storeTokens(tokenResponse);
    
    console.log('Strava auth successful:', {
      athlete: tokenResponse.athlete.firstname + ' ' + tokenResponse.athlete.lastname,
      expires_at: new Date(tokenResponse.expires_at * 1000).toISOString()
    });

    // Redirect back to workout page with success message
    return redirect('/workout?strava_auth=success');
    
  } catch (error) {
    console.error('Failed to exchange code for token:', error);
    return redirect('/workout?error=token_exchange_failed');
  }
}; 