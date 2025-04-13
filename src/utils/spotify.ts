
import { SpotifySearchResponse, Track } from "@/types";

// Note: In a production app, these would be stored securely
// These are client credentials which are relatively safe to expose in client-side code
const CLIENT_ID = "31c9ac56bdf1463abb98f91536bc7b0a";
const CLIENT_SECRET = "cdbcf98eeb7749da9838c9b4eb9ba8ee";
let accessToken: string | null = null;
let tokenExpiration: number = 0;

// Get Spotify access token using Client Credentials flow
async function getAccessToken(): Promise<string> {
  // Check if we have a valid token
  if (accessToken && tokenExpiration > Date.now()) {
    return accessToken;
  }
  
  // Get a new token using URLSearchParams for proper encoding
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const authHeader = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  
  const body = new URLSearchParams();
  body.append('grant_type', 'client_credentials');
  
  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`
      },
      body: body.toString()
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Spotify auth error response:', errorText);
      throw new Error(`Failed to get Spotify access token: ${response.status}`);
    }
    
    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiration = Date.now() + (data.expires_in * 1000);
    console.log('Successfully obtained Spotify access token');
    
    return accessToken;
  } catch (error) {
    console.error('Error in getAccessToken:', error);
    throw error;
  }
}

// Search Spotify for tracks based on genres and mood
export async function searchSpotifyTracks(genres: string[], mood: string, limit: number = 10): Promise<Track[]> {
  try {
    const token = await getAccessToken();
    
    // Build search query - use simpler query format
    // Instead of complex genre filters, use a simpler approach that works better with Spotify search
    const searchQuery = `${mood} ${genres.slice(0, 2).join(' ')}`;
    console.log('Searching Spotify with query:', searchQuery);
    
    const searchParams = new URLSearchParams({
      q: searchQuery,
      type: 'track',
      limit: limit.toString(),
      market: 'US' // Ensure we get tracks that are available in the US market
    });
    
    const searchUrl = `https://api.spotify.com/v1/search?${searchParams.toString()}`;
    console.log('Searching Spotify at URL:', searchUrl);
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Spotify search error response:', errorText);
      throw new Error(`Failed to search Spotify tracks: ${response.status}`);
    }
    
    const data: SpotifySearchResponse = await response.json();
    console.log('Spotify returned tracks:', data.tracks.items.length);
    
    // Map Spotify track format to our Track interface
    return data.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artists: track.artists,
      album: track.album,
      external_urls: track.external_urls,
      preview_url: track.preview_url
    }));
  } catch (error) {
    console.error("Error searching Spotify:", error);
    throw error;
  }
}
