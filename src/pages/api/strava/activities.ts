import type { APIRoute } from 'astro';
import { getActivities, getAthlete } from '../../../lib/strava';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = new URL(url).searchParams;
    const perPage = parseInt(searchParams.get('per_page') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const days = searchParams.get('days'); // e.g., "30", "60", "90"

    let after: Date | undefined;
    let before: Date | undefined;

    // Calculate date range if days parameter is provided
    if (days) {
      const daysNumber = parseInt(days);
      if (!isNaN(daysNumber) && daysNumber > 0) {
        after = new Date();
        after.setDate(after.getDate() - daysNumber);
        // Set to start of day
        after.setHours(0, 0, 0, 0);
        
        before = new Date();
        // Set to end of day
        before.setHours(23, 59, 59, 999);
      }
    }

    console.log(`Fetching Strava activities: ${perPage} per page, page ${page}${days ? `, last ${days} days` : ''}`);

    // Get athlete info and activities using the tokens from .env
    const [athlete, activities] = await Promise.all([
      getAthlete(),
      getActivities(undefined, perPage, page, after, before)
    ]);

    return new Response(JSON.stringify({
      athlete,
      activities
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Failed to fetch Strava activities:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to fetch Strava activities',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}; 