
import { SpotifySearchResponse, Track } from "@/types";

// Note: In a production app, these would be stored securely
// These are client credentials which are relatively safe to expose in client-side code
const CLIENT_ID = "31c9ac56bdf1463abb98f91536bc7b0a";
const CLIENT_SECRET = "6a1e91fe5c5e4c6586c5e9d78ea3282d";
let accessToken: string | null = null;
let tokenExpiration: number = 0;

// Get Spotify access token using Client Credentials flow
async function getAccessToken(): Promise<string> {
  // Check if we have a valid token
  if (accessToken && tokenExpiration > Date.now()) {
    return accessToken;
  }
  
  // Get a new token
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
    },
    body: "grant_type=client_credentials"
  });
  
  if (!response.ok) {
    throw new Error("Failed to get Spotify access token");
  }
  
  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiration = Date.now() + (data.expires_in * 1000);
  
  return accessToken;
}

// Search Spotify for tracks based on genres and mood
export async function searchSpotifyTracks(genres: string[], mood: string, limit: number = 5): Promise<Track[]> {
  try {
    const token = await getAccessToken();
    
    // Build search query using genres and mood
    const searchQuery = `genre:${genres.join(" OR genre:")} ${mood}`;
    const searchParams = new URLSearchParams({
      q: searchQuery,
      type: "track",
      limit: limit.toString(),
      market: "US" // Ensure we get tracks that are available in the US market
    });
    
    const response = await fetch(`https://api.spotify.com/v1/search?${searchParams}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to search Spotify tracks");
    }
    
    const data: SpotifySearchResponse = await response.json();
    
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
