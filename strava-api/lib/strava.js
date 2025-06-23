/**
 * Strava API Integration
 * 
 * Environment Variables Required:
 * - STRAVA_CLIENT_ID: Your Strava application's Client ID
 * - STRAVA_CLIENT_SECRET: Your Strava application's Client Secret
 * - STRAVA_ACCESS_TOKEN: Access token for reading data (expires every 6 hours)
 * - STRAVA_REFRESH_TOKEN: Refresh token for getting new access tokens
 */

// Strava API Configuration
export const STRAVA_CONFIG = {
  CLIENT_ID: process.env.STRAVA_CLIENT_ID,
  CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET,
  ACCESS_TOKEN: process.env.STRAVA_ACCESS_TOKEN,
  REFRESH_TOKEN: process.env.STRAVA_REFRESH_TOKEN,
  REDIRECT_URI: process.env.STRAVA_REDIRECT_URI || "http://localhost:4322/auth/strava/callback",
  BASE_URL: "https://www.strava.com/api/v3",
  AUTH_URL: "https://www.strava.com/oauth/authorize",
  TOKEN_URL: "https://www.strava.com/oauth/token",
};

// Check if Strava is configured
export function isStravaConfigured() {
  return !!(STRAVA_CONFIG.CLIENT_ID && STRAVA_CONFIG.CLIENT_SECRET);
}

// Generate authorization URL for OAuth flow
export function getAuthorizationUrl(scopes = ["read", "activity:read_all"]) {
  if (!STRAVA_CONFIG.CLIENT_ID) {
    throw new Error("STRAVA_CLIENT_ID is not configured");
  }

  const params = new URLSearchParams({
    client_id: STRAVA_CONFIG.CLIENT_ID,
    redirect_uri: STRAVA_CONFIG.REDIRECT_URI,
    response_type: "code",
    approval_prompt: "auto",
    scope: scopes.join(","),
  });

  return `${STRAVA_CONFIG.AUTH_URL}?${params.toString()}`;
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code) {
  if (!STRAVA_CONFIG.CLIENT_ID || !STRAVA_CONFIG.CLIENT_SECRET) {
    throw new Error("Strava client credentials are not configured");
  }

  const response = await fetch(STRAVA_CONFIG.TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: STRAVA_CONFIG.CLIENT_ID,
      client_secret: STRAVA_CONFIG.CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.statusText}`);
  }

  return response.json();
}

// Refresh access token using refresh token
export async function refreshAccessToken(refreshToken) {
  if (!STRAVA_CONFIG.CLIENT_ID || !STRAVA_CONFIG.CLIENT_SECRET) {
    throw new Error("Strava client credentials are not configured");
  }

  const response = await fetch(STRAVA_CONFIG.TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: STRAVA_CONFIG.CLIENT_ID,
      client_secret: STRAVA_CONFIG.CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh access token: ${response.statusText}`);
  }

  return response.json();
}

// Make authenticated API request to Strava
async function makeStravaRequest(endpoint, accessToken) {
  const token = accessToken || STRAVA_CONFIG.ACCESS_TOKEN;
  
  if (!token) {
    throw new Error("No access token available for Strava API request");
  }

  const response = await fetch(`${STRAVA_CONFIG.BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // Get the response body for more detailed error info
    let errorBody;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }
    
    console.error(`Strava API Error (${response.status}):`, errorBody);
    
    if (response.status === 401) {
      throw new Error(`Strava access token is invalid or expired: ${JSON.stringify(errorBody)}`);
    }
    throw new Error(`Strava API request failed (${response.status}): ${JSON.stringify(errorBody)}`);
  }

  return response.json();
}

// Get authenticated athlete information
export async function getAthlete(accessToken) {
  return makeStravaRequest("/athlete", accessToken);
}

// Get athlete's activities
export async function getActivities(accessToken, perPage = 30, page = 1) {
  return makeStravaRequest(`/athlete/activities?per_page=${perPage}&page=${page}`, accessToken);
}

// Get specific activity by ID
export async function getActivity(activityId, accessToken) {
  return makeStravaRequest(`/activities/${activityId}`, accessToken);
}

// Format distance for display (meters to km/miles)
export function formatDistance(meters, unit = "metric") {
  if (unit === "imperial") {
    const miles = meters * 0.000621371;
    return `${miles.toFixed(2)} mi`;
  }
  const km = meters / 1000;
  return `${km.toFixed(2)} km`;
}

// Format time for display (seconds to readable format)
export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Format speed for display (m/s to readable format)
export function formatSpeed(metersPerSecond, unit = "metric") {
  if (unit === "imperial") {
    const mph = metersPerSecond * 2.237;
    return `${mph.toFixed(1)} mph`;
  }
  const kmh = metersPerSecond * 3.6;
  return `${kmh.toFixed(1)} km/h`;
} 