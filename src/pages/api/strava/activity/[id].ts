import type { APIRoute } from 'astro';
import { getActivity } from '../../../../lib/strava';

export const prerender = false;

export const GET: APIRoute = async ({ params, url }) => {
  try {
    const activityId = params.id;
    
    if (!activityId || isNaN(Number(activityId))) {
      return new Response(JSON.stringify({
        error: 'Invalid activity ID'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    console.log(`Fetching detailed Strava activity: ${activityId}`);

    // Get detailed activity data
    const activity = await getActivity(Number(activityId));

    return new Response(JSON.stringify({
      activity
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Failed to fetch Strava activity:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to fetch Strava activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}; 