import { getActivities, getAthlete, isStravaConfigured } from '../../lib/strava.js';

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Check if Strava is configured
    if (!isStravaConfigured()) {
      res.status(500).json({ 
        error: 'Strava API credentials are not configured. Please check your environment variables.'
      });
      return;
    }

    // Get URL parameters
    const { per_page = '10', page = '1' } = req.query;
    const perPage = parseInt(per_page);
    const pageNum = parseInt(page);

    // Log environment variables (without sensitive data)
    console.log('Environment variables:', {
      CLIENT_ID: process.env.STRAVA_CLIENT_ID ? process.env.STRAVA_CLIENT_ID.substring(0, 6) + '***' : 'undefined',
      CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET ? '***' : 'undefined',
      ACCESS_TOKEN: process.env.STRAVA_ACCESS_TOKEN ? '***' : 'undefined',
      REFRESH_TOKEN: process.env.STRAVA_REFRESH_TOKEN ? '***' : 'undefined',
    });

    // Fetch athlete and activities data
    const [athlete, activities] = await Promise.all([
      getAthlete(),
      getActivities(undefined, perPage, pageNum)
    ]);

    res.status(200).json({
      athlete,
      activities
    });

  } catch (error) {
    console.error('Strava API Error:', error);
    
    let errorMessage = 'Failed to fetch Strava data';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ 
      error: errorMessage 
    });
  }
} 