import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, Clock, MapPin, Zap, ChevronDown, ChevronUp, Heart, Trophy, Users, Camera } from "lucide-react";
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
  
  // Additional detailed data
  description?: string;
  kudos_count?: number;
  comment_count?: number;
  achievement_count?: number;
  photo_count?: number;
  average_watts?: number;
  max_watts?: number;
  kilojoules?: number;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  suffer_score?: number;
  splits_metric?: Array<{
    distance: number;
    elapsed_time: number;
    split: number;
  }>;
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
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [athlete, setAthlete] = useState<StravaAthlete | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [perPage] = useState(100); // High number to get more activities per request
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);
  const [detailedActivity, setDetailedActivity] = useState<StravaActivity | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedSportType, setSelectedSportType] = useState<string>("all");
  const [selectedDays, setSelectedDays] = useState<string>("30"); // "30", "60", "90"

  const handleConnectStrava = () => {
    window.location.href = "/api/auth/strava";
  };

  const loadStravaData = async (page = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setCurrentPage(1);
      setHasMore(true);
    }
    setError(null);
    
    try {
      // Build URL with date filter (always include days since we removed "all time")
      let url = `/api/strava/activities?per_page=${perPage}&page=${page}&days=${selectedDays}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch Strava data');
      }

      const data = await response.json();
      const { athlete: athleteData, activities: activitiesData } = data;
      
      setAthlete(athleteData);
      
      if (append) {
        setActivities(prev => [...prev, ...activitiesData]);
      } else {
        setActivities(activitiesData);
      }
      
      // Check if we have more data (if we got less than perPage, we're at the end)
      setHasMore(activitiesData.length === perPage);
      setCurrentPage(page);
      
    } catch (err) {
      console.error("Error loading Strava data:", err);
      setError(err instanceof Error ? err.message : "Failed to load Strava data");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreActivities = () => {
    if (!loadingMore && hasMore) {
      loadStravaData(currentPage + 1, true);
    }
  };

  const handleDateFilterChange = (days: string) => {
    setSelectedDays(days);
    // Reset to first page and reload data
    loadStravaData(1, false);
  };

  const loadActivityDetail = async (activityId: number) => {
    if (expandedActivity === activityId) {
      // Collapse if already expanded
      setExpandedActivity(null);
      setDetailedActivity(null);
      return;
    }

    setLoadingDetail(true);
    setExpandedActivity(activityId);
    
    try {
      const response = await fetch(`/api/strava/activity/${activityId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch activity details');
      }

      const data = await response.json();
      setDetailedActivity(data.activity);
    } catch (err) {
      console.error("Error loading activity detail:", err);
      setError(err instanceof Error ? err.message : "Failed to load activity details");
      setExpandedActivity(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get unique sport types from activities
  const getUniqueSportTypes = () => {
    const types = activities.map(activity => activity.sport_type);
    return [...new Set(types)].sort();
  };

  // Filter activities based on selected sport type
  const filteredActivities = selectedSportType === "all" 
    ? activities 
    : activities.filter(activity => activity.sport_type === selectedSportType);

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
      {/* Header - Only show connection controls if not connected */}
      {!athlete && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-orange-500" />
              Strava Workouts
            </CardTitle>
            <CardDescription>
              Connect your Strava account to view your recent activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={() => loadStravaData()} disabled={loading}>
                {loading ? "Loading..." : "Load Activities"}
              </Button>
              <Button variant="outline" onClick={handleConnectStrava}>
                <Activity className="mr-2 h-4 w-4" />
                Connect Strava
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={athlete.profile_medium}
                  alt={`${athlete.firstname} ${athlete.lastname}`}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">
                      {athlete.firstname} {athlete.lastname}
                    </h3>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
                      Connected
                    </span>
                  </div>
                  <p className="text-gray-600 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {athlete.city && athlete.state ? 
                      `${athlete.city}, ${athlete.state}` : 
                      athlete.country || "Location not set"
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => loadStravaData()} disabled={loading} size="sm">
                  {loading ? "Loading..." : "Refresh"}
                </Button>
                <Button variant="outline" onClick={handleConnectStrava} size="sm">
                  <Activity className="mr-2 h-4 w-4" />
                  Reconnect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Section */}
      {activities.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <h3 className="font-medium">Activity Type</h3>
                    <select
                      value={selectedSportType}
                      onChange={(e) => setSelectedSportType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="all">All Activities ({activities.length})</option>
                      {getUniqueSportTypes().map((type) => {
                        const count = activities.filter(a => a.sport_type === type).length;
                        return (
                          <option key={type} value={type}>
                            {type} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <h3 className="font-medium">Time Period</h3>
                    <select
                      value={selectedDays}
                      onChange={(e) => handleDateFilterChange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="30">Last 30 Days</option>
                      <option value="60">Last 60 Days</option>
                      <option value="90">Last 90 Days</option>
                    </select>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {selectedSportType === "all" 
                    ? `Showing all ${activities.length} activities`
                    : `Showing ${filteredActivities.length} ${selectedSportType} activities`
                  }
                  <span className="ml-2 text-orange-600">
                    (Last {selectedDays} days)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities List */}
      {filteredActivities.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">
            {selectedSportType === "all" ? "Recent Activities" : `${selectedSportType} Activities`}
          </h3>
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{activity.name}</h4>
                    <p className="text-gray-600 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(activity.start_date_local)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm">
                      {activity.sport_type}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadActivityDetail(activity.id)}
                      disabled={loadingDetail && expandedActivity === activity.id}
                    >
                      {loadingDetail && expandedActivity === activity.id ? (
                        "Loading..."
                      ) : expandedActivity === activity.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
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
                
                {/* Basic stats row */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                  {activity.average_heartrate && (
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>{Math.round(activity.average_heartrate)} bpm avg</span>
                    </div>
                  )}
                  {activity.calories && (
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-orange-500" />
                      <span>{activity.calories} cal</span>
                    </div>
                  )}
                </div>

                {/* Expanded detailed view */}
                {expandedActivity === activity.id && detailedActivity && (
                  <div className="mt-6 pt-6 border-t space-y-4">
                    {/* Social stats */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {detailedActivity.kudos_count !== undefined && (
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span>{detailedActivity.kudos_count} kudos</span>
                        </div>
                      )}
                      {detailedActivity.comment_count !== undefined && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span>{detailedActivity.comment_count} comments</span>
                        </div>
                      )}
                      {detailedActivity.photo_count !== undefined && detailedActivity.photo_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Camera className="h-4 w-4 text-green-500" />
                          <span>{detailedActivity.photo_count} photos</span>
                        </div>
                      )}
                      {detailedActivity.achievement_count !== undefined && detailedActivity.achievement_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-purple-500" />
                          <span>{detailedActivity.achievement_count} achievements</span>
                        </div>
                      )}
                    </div>

                    {/* Power data */}
                    {(detailedActivity.average_watts || detailedActivity.kilojoules) && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {detailedActivity.average_watts && (
                          <div>
                            <p className="font-medium">{Math.round(detailedActivity.average_watts)}W</p>
                            <p className="text-gray-500">Avg Power</p>
                          </div>
                        )}
                        {detailedActivity.max_watts && (
                          <div>
                            <p className="font-medium">{Math.round(detailedActivity.max_watts)}W</p>
                            <p className="text-gray-500">Max Power</p>
                          </div>
                        )}
                        {detailedActivity.kilojoules && (
                          <div>
                            <p className="font-medium">{Math.round(detailedActivity.kilojoules)}kJ</p>
                            <p className="text-gray-500">Energy</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {detailedActivity.description && (
                      <div>
                        <h5 className="font-medium mb-2">Description</h5>
                        <p className="text-sm text-gray-600">{detailedActivity.description}</p>
                      </div>
                    )}

                    {/* Location */}
                    {(detailedActivity.location_city || detailedActivity.location_state || detailedActivity.location_country) && (
                      <div>
                        <h5 className="font-medium mb-2">Location</h5>
                        <p className="text-sm text-gray-600">
                          {[detailedActivity.location_city, detailedActivity.location_state, detailedActivity.location_country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    )}

                    {/* Splits */}
                    {detailedActivity.splits_metric && detailedActivity.splits_metric.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Splits (per km)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {detailedActivity.splits_metric.slice(0, 6).map((split, index) => (
                            <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                              <span>Km {split.split}</span>
                              <span>{formatTime(split.elapsed_time)}</span>
                            </div>
                          ))}
                          {detailedActivity.splits_metric.length > 6 && (
                            <div className="text-gray-500 text-center col-span-full">
                              ... and {detailedActivity.splits_metric.length - 6} more splits
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Suffer Score */}
                    {detailedActivity.suffer_score && (
                      <div>
                        <h5 className="font-medium mb-2">Suffer Score</h5>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(detailedActivity.suffer_score / 200 * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{detailedActivity.suffer_score}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {activities.length > 0 && hasMore && selectedSportType === "all" && (
        <div className="text-center">
          <Button 
            onClick={loadMoreActivities} 
            disabled={loadingMore}
            variant="outline"
            className="w-full max-w-xs"
          >
            {loadingMore ? "Loading More..." : "Load More Activities"}
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Loading more activities from the last {selectedDays} days
          </p>
        </div>
      )}

      {/* Activities Summary */}
      {activities.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-600">
              {selectedSportType === "all" ? (
                <>
                  Showing {activities.length} activities
                  {!hasMore && " (all activities loaded)"}
                </>
              ) : (
                <>
                  Showing {filteredActivities.length} of {activities.length} activities
                  {hasMore && " (load more to see additional activities)"}
                </>
              )}
            </p>
          </CardContent>
        </Card>
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

      {/* No Filtered Activities Message */}
      {!loading && activities.length > 0 && filteredActivities.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">
              No {selectedSportType} activities found. Try selecting a different activity type.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSelectedSportType("all")}
              className="mt-4"
            >
              Show All Activities
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 