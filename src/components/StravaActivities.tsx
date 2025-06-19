import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, Clock, MapPin, Zap } from "lucide-react";
// Types for Strava data
interface StravaAthlete {
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

interface StravaActivity {
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
}

// Client-side formatting functions (duplicated from server-side lib)
function formatDistance(meters: number, unit: "metric" | "imperial" = "metric"): string {
  if (unit === "imperial") {
    const miles = meters * 0.000621371;
    return `${miles.toFixed(2)} mi`;
  }
  const km = meters / 1000;
  return `${km.toFixed(2)} km`;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatSpeed(metersPerSecond: number, unit: "metric" | "imperial" = "metric"): string {
  if (unit === "imperial") {
    const mph = metersPerSecond * 2.237;
    return `${mph.toFixed(1)} mph`;
  }
  const kmh = metersPerSecond * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

export function StravaActivities() {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [athlete, setAthlete] = useState<StravaAthlete | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStravaData();
  }, []);

  const handleConnectStrava = () => {
    window.location.href = '/auth/strava';
  };

  const loadStravaData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/strava/activities?per_page=10&page=1');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch Strava data');
      }

      const data = await response.json();
      const { athlete: athleteData, activities: activitiesData } = data;
      
      setAthlete(athleteData);
      setActivities(activitiesData);
    } catch (err) {
      console.error("Error loading Strava data:", err);
      setError(err instanceof Error ? err.message : "Failed to load Strava data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Show configuration error if we have an error and no athlete data
  if (error && !athlete && !loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-orange-500" />
            Strava Configuration Issue
          </CardTitle>
          <CardDescription>
            There's an issue connecting to your Strava account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="mb-4 text-red-600">
              {error}
            </p>
            <p className="mb-6 text-sm text-gray-500">
              Please check that your Strava API credentials are properly configured in your environment variables.
            </p>
            <Button onClick={() => loadStravaData()}>
              <Activity className="mr-2 h-4 w-4" />
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-orange-500" />
            Strava Workouts
          </CardTitle>
          <CardDescription>
            {athlete ? (
              `Recent activities from ${athlete.firstname} ${athlete.lastname}`
            ) : (
              "Connect your Strava account to view your recent activities"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={loadStravaData} disabled={loading}>
              {loading ? "Loading..." : "Load Activities"}
            </Button>
            <Button variant="outline" onClick={handleConnectStrava}>
              <Activity className="mr-2 h-4 w-4" />
              Connect Strava
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Athlete Info */}
      {athlete && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <img
                src={athlete.profile_medium}
                alt={`${athlete.firstname} ${athlete.lastname}`}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-lg">
                  {athlete.firstname} {athlete.lastname}
                </h3>
                <p className="text-gray-600 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {athlete.city && athlete.state ? 
                    `${athlete.city}, ${athlete.state}` : 
                    athlete.country || "Location not set"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities List */}
      {activities.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Recent Activities</h3>
          {activities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{activity.name}</h4>
                    <p className="text-gray-600 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(activity.start_date_local)}
                    </p>
                  </div>
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm">
                    {activity.sport_type}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{formatDistance(activity.distance)}</p>
                      <p className="text-gray-500">Distance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{formatTime(activity.moving_time)}</p>
                      <p className="text-gray-500">Time</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{formatSpeed(activity.average_speed)}</p>
                      <p className="text-gray-500">Avg Speed</p>
                    </div>
                  </div>
                  
                  {activity.total_elevation_gain > 0 && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{Math.round(activity.total_elevation_gain)}m</p>
                        <p className="text-gray-500">Elevation</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {activity.average_heartrate && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Avg Heart Rate: <span className="font-medium">{Math.round(activity.average_heartrate)} bpm</span>
                      {activity.max_heartrate && (
                        <span className="ml-4">
                          Max: <span className="font-medium">{Math.round(activity.max_heartrate)} bpm</span>
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Activities Message */}
      {!loading && activities.length === 0 && athlete && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No activities found. Start tracking your workouts on Strava!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 