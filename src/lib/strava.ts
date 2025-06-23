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
  CLIENT_ID: import.meta.env.STRAVA_CLIENT_ID,
  CLIENT_SECRET: import.meta.env.STRAVA_CLIENT_SECRET,
  ACCESS_TOKEN: import.meta.env.STRAVA_ACCESS_TOKEN,
  REFRESH_TOKEN: import.meta.env.STRAVA_REFRESH_TOKEN,
  REDIRECT_URI: import.meta.env.STRAVA_REDIRECT_URI, // Will be dynamically generated when needed
  BASE_URL: "https://www.strava.com/api/v3",
  AUTH_URL: "https://www.strava.com/oauth/authorize",
  TOKEN_URL: "https://www.strava.com/oauth/token",
};

// Strava API Response Types
export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile_medium: string;
  profile: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  elev_high?: number;
  elev_low?: number;
  calories?: number;
  
  // Additional detailed data (available when fetching individual activities)
  description?: string;
  type: string;
  workout_type?: number;
  external_id?: string;
  upload_id?: number;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  achievement_count?: number;
  kudos_count?: number;
  comment_count?: number;
  athlete_count?: number;
  photo_count?: number;
  map?: {
    id: string;
    summary_polyline: string;
    resource_state: number;
  };
  trainer?: boolean;
  commute?: boolean;
  manual?: boolean;
  private?: boolean;
  flagged?: boolean;
  gear_id?: string;
  from_accepted_tag?: boolean;
  average_watts?: number;
  max_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  device_watts?: boolean;
  has_heartrate?: boolean;
  heartrate_opt_out?: boolean;
  display_hide_heartrate_option?: boolean;
  pr_count?: number;
  total_photo_count?: number;
  has_kudoed?: boolean;
  suffer_score?: number;
  
  // Splits data
  splits_metric?: Array<{
    distance: number;
    elapsed_time: number;
    elevation_difference: number;
    moving_time: number;
    split: number;
    average_speed: number;
    pace_zone?: number;
  }>;
  
  // Laps data
  laps?: Array<{
    id: number;
    elapsed_time: number;
    moving_time: number;
    start_date: string;
    start_date_local: string;
    distance: number;
    start_index: number;
    end_index: number;
    total_elevation_gain: number;
    average_speed: number;
    max_speed: number;
    average_heartrate?: number;
    max_heartrate?: number;
    lap_index: number;
  }>;
  
  // Segment efforts
  segment_efforts?: Array<{
    id: number;
    elapsed_time: number;
    moving_time: number;
    start_date: string;
    start_date_local: string;
    distance: number;
    start_index: number;
    end_index: number;
    average_heartrate?: number;
    max_heartrate?: number;
    segment: {
      id: number;
      name: string;
      activity_type: string;
      distance: number;
      average_grade: number;
      maximum_grade: number;
      elevation_high: number;
      elevation_low: number;
      climb_category: number;
    };
  }>;
}

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
  athlete: StravaAthlete;
}

// Simple in-memory token storage (for development only)
// In production, you'd use a database or session storage
interface TokenStorage {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: any;
}

let currentTokens: TokenStorage | null = null;

// Function to store tokens after OAuth exchange
export function storeTokens(tokenResponse: any) {
  currentTokens = {
    access_token: tokenResponse.access_token,
    refresh_token: tokenResponse.refresh_token,
    expires_at: tokenResponse.expires_at,
    athlete: tokenResponse.athlete
  };
  console.log('Tokens stored in memory:', {
    athlete: tokenResponse.athlete.firstname + ' ' + tokenResponse.athlete.lastname,
    expires_at: new Date(tokenResponse.expires_at * 1000).toISOString()
  });
}

// Function to get the current access token (prioritize OAuth tokens over env)
export function getCurrentAccessToken(): string | null {
  // First check if we have fresh OAuth tokens
  if (currentTokens && currentTokens.expires_at > Math.floor(Date.now() / 1000)) {
    console.log('Using OAuth access token');
    return currentTokens.access_token;
  }
  
  // Fall back to environment variable
  const envToken = import.meta.env.STRAVA_ACCESS_TOKEN;
  if (envToken) {
    console.log('Using environment access token');
    return envToken;
  }
  
  console.log('No valid access token available');
  return null;
}

// Check if Strava is configured
export function isStravaConfigured(): boolean {
  return !!(STRAVA_CONFIG.CLIENT_ID && STRAVA_CONFIG.CLIENT_SECRET);
}

// Generate authorization URL for OAuth flow
export function getAuthorizationUrl(
  redirectUri: string, 
  scopes: string[] = ["read", "activity:read_all"]
): string {
  if (!STRAVA_CONFIG.CLIENT_ID) {
    throw new Error("STRAVA_CLIENT_ID is not configured");
  }

  if (!redirectUri) {
    throw new Error("Redirect URI is required and must be dynamically generated from the request");
  }

  const params = new URLSearchParams({
    client_id: STRAVA_CONFIG.CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    approval_prompt: "force",
    scope: scopes.join(","),
  });

  return `${STRAVA_CONFIG.AUTH_URL}?${params.toString()}`;
}

// Helper function to build redirect URI from request
export function buildRedirectUri(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}/api/auth/strava/callback`;
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code: string): Promise<StravaTokenResponse> {
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
export async function refreshAccessToken(refreshToken: string): Promise<StravaTokenResponse> {
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
async function makeStravaRequest(endpoint: string, accessToken?: string): Promise<any> {
  const token = accessToken || getCurrentAccessToken();
  
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
export async function getAthlete(accessToken?: string): Promise<StravaAthlete> {
  return makeStravaRequest("/athlete", accessToken);
}

// Get athlete's activities
export async function getActivities(
  accessToken?: string, 
  perPage: number = 30, 
  page: number = 1,
  after?: Date,
  before?: Date
): Promise<StravaActivity[]> {
  const params = new URLSearchParams({
    per_page: perPage.toString(),
    page: page.toString()
  });
  
  if (after) {
    // Strava expects Unix timestamp
    params.append('after', Math.floor(after.getTime() / 1000).toString());
  }
  
  if (before) {
    // Strava expects Unix timestamp
    params.append('before', Math.floor(before.getTime() / 1000).toString());
  }
  
  return makeStravaRequest(`/athlete/activities?${params.toString()}`, accessToken);
}

// Get specific activity by ID
export async function getActivity(activityId: number, accessToken?: string): Promise<StravaActivity> {
  return makeStravaRequest(`/activities/${activityId}`, accessToken);
}

// Format distance for display (meters to km/miles)
export function formatDistance(meters: number, unit: "metric" | "imperial" = "metric"): string {
  if (unit === "imperial") {
    const miles = meters * 0.000621371;
    return `${miles.toFixed(2)} mi`;
  }
  const km = meters / 1000;
  return `${km.toFixed(2)} km`;
}

// Format time for display (seconds to HH:MM:SS)
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Format speed for display (m/s to km/h or mph)
export function formatSpeed(metersPerSecond: number, unit: "metric" | "imperial" = "metric"): string {
  if (unit === "imperial") {
    const mph = metersPerSecond * 2.237;
    return `${mph.toFixed(1)} mph`;
  }
  const kmh = metersPerSecond * 3.6;
  return `${kmh.toFixed(1)} km/h`;
} 