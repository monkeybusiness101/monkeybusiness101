import type { APIRoute } from 'astro';
import { getActivities, getAthlete, isStravaConfigured } from '../../../lib/strava';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Check if Strava is configured
    if (!isStravaConfigured()) {
      return new Response(JSON.stringify({ 
        error: 'Strava API credentials are not configured. Please check your environment variables.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get URL parameters
    const url = new URL(request.url);
    const perPage = parseInt(url.searchParams.get('per_page') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');

    // Fetch athlete and activities data
    const [athlete, activities] = await Promise.all([
      getAthlete(),
      getActivities(undefined, perPage, page)
    ]);

    return new Response(JSON.stringify({
      athlete,
      activities
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Strava API Error:', error);
    
    let errorMessage = 'Failed to fetch Strava data';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 