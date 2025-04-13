
import { AiResponse, GeminiRequest, GeminiResponse, MoodAnalysis, Playlist, Track } from "@/types";
import { searchSpotifyTracks } from "./spotify";

// Gemini API implementation for mood analysis
export async function analyzeMood(moodDescription: string): Promise<AiResponse> {
  console.log("Analyzing mood with Gemini API:", moodDescription);

  try {
    // Call Gemini API
    const apiKey = "AIzaSyCFWyeKi7S2gSa7_UVb4JSB9KCeh6OVvP0"; // Note: In a production app, this should be stored securely
    // Updated endpoint to v1 instead of v1beta
    const geminiEndpoint = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";
    
    const prompt = `
      Analyze the following mood description and return a JSON object with these fields:
      - moodType: A single word describing the overall mood (e.g., happy, sad, energetic, calm, focused, romantic, neutral)
      - intensity: A number between 0 and 1 representing how intense the mood is
      - description: A short sentence describing the mood analysis
      - recommendedGenres: An array of 4-5 music genres that match this mood
      - color: A hex color code that represents this mood (e.g., #FFD700 for happy)

      Mood description: "${moodDescription}"

      Return ONLY the JSON object without any additional text or explanation.
    `;

    const requestData: GeminiRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    const response = await fetch(`${geminiEndpoint}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json() as GeminiResponse;
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    let jsonStr = responseText;
    
    // If the response includes markdown code blocks, extract just the JSON
    if (responseText.includes("```json")) {
      jsonStr = responseText.split("```json")[1].split("```")[0].trim();
    } else if (responseText.includes("```")) {
      jsonStr = responseText.split("```")[1].split("```")[0].trim();
    }
    
    // Parse the JSON string into an object
    const moodAnalysis = JSON.parse(jsonStr) as MoodAnalysis;
    
    // Ensure all required fields are present
    if (!moodAnalysis.moodType || !moodAnalysis.intensity || 
        !moodAnalysis.description || !moodAnalysis.recommendedGenres || 
        !moodAnalysis.color) {
      throw new Error("Invalid response format from Gemini API");
    }
    
    return { moodAnalysis };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    // Fallback to simulated response in case of error
    return simulateMoodAnalysis(moodDescription);
  }
}

// Fallback function for simulated mood analysis
function simulateMoodAnalysis(moodDescription: string): AiResponse {
  console.log("Falling back to simulated mood analysis");
  
  const lowerCaseDescription = moodDescription.toLowerCase();
  let moodType = "neutral";
  let color = "#7B68EE"; // Default purple
  let intensity = 0.5;
  let genres: string[] = ["pop", "indie"];
  
  if (lowerCaseDescription.includes("happy") || 
      lowerCaseDescription.includes("joy") || 
      lowerCaseDescription.includes("excited")) {
    moodType = "happy";
    intensity = 0.8;
    color = "#FFD700"; // Gold
    genres = ["pop", "dance", "happy", "feel-good"];
  } else if (lowerCaseDescription.includes("sad") || 
             lowerCaseDescription.includes("down") || 
             lowerCaseDescription.includes("blue")) {
    moodType = "sad";
    intensity = 0.7;
    color = "#4682B4"; // Steel Blue
    genres = ["sad", "indie", "singer-songwriter", "melancholic"];
  } else if (lowerCaseDescription.includes("energetic") || 
             lowerCaseDescription.includes("workout") || 
             lowerCaseDescription.includes("party")) {
    moodType = "energetic";
    intensity = 0.9;
    color = "#FF4500"; // Orange Red
    genres = ["edm", "dance", "workout", "party"];
  } else if (lowerCaseDescription.includes("calm") || 
             lowerCaseDescription.includes("relax") || 
             lowerCaseDescription.includes("peaceful")) {
    moodType = "calm";
    intensity = 0.3;
    color = "#7B68EE"; // Medium Slate Blue
    genres = ["ambient", "chill", "meditation", "sleep"];
  } else if (lowerCaseDescription.includes("focus") || 
             lowerCaseDescription.includes("study") || 
             lowerCaseDescription.includes("work")) {
    moodType = "focused";
    intensity = 0.6;
    color = "#32CD32"; // Lime Green
    genres = ["focus", "instrumental", "study", "classical"];
  } else if (lowerCaseDescription.includes("romantic") || 
             lowerCaseDescription.includes("love") || 
             lowerCaseDescription.includes("date")) {
    moodType = "romantic";
    intensity = 0.7;
    color = "#FF69B4"; // Hot Pink
    genres = ["romance", "r-n-b", "love songs", "jazz"];
  }

  const moodAnalysis: MoodAnalysis = {
    moodType,
    intensity,
    description: `You seem to be feeling ${moodType} with ${Math.round(intensity * 100)}% intensity.`,
    recommendedGenres: genres,
    color
  };
  
  return { moodAnalysis };
}

// Generate playlist using Spotify API
export async function generatePlaylist(moodAnalysis: MoodAnalysis): Promise<Playlist> {
  console.log("Generating playlist based on mood:", moodAnalysis);
  
  try {
    // Get tracks from Spotify based on mood
    const tracks = await searchSpotifyTracks(
      moodAnalysis.recommendedGenres, 
      moodAnalysis.moodType,
      10 // Get 10 tracks
    );
    
    // Check if we actually got tracks back
    if (!tracks || tracks.length === 0) {
      console.log("No tracks returned from Spotify, using fallback");
      throw new Error("No tracks returned from Spotify");
    }
    
    // Create a playlist with the real Spotify tracks
    return {
      id: `playlist-${Date.now()}`,
      name: `${moodAnalysis.moodType.charAt(0).toUpperCase() + moodAnalysis.moodType.slice(1)} Mood Mix`,
      description: `A playlist generated based on your ${moodAnalysis.moodType} mood. Featuring genres like ${moodAnalysis.recommendedGenres.join(", ")}.`,
      tracks: tracks,
      external_url: `https://open.spotify.com/search/${encodeURIComponent(moodAnalysis.moodType)}`
    };
  } catch (error) {
    console.error("Error generating playlist with Spotify:", error);
    
    // Fall back to simulated playlist if Spotify API fails
    return generateSimulatedPlaylist(moodAnalysis);
  }
}

// Fallback function for simulated playlist
function generateSimulatedPlaylist(moodAnalysis: MoodAnalysis): Playlist {
  console.log("Falling back to simulated playlist");
  
  // Mock data for different moods
  const mockPlaylists: Record<string, Partial<Track>[]> = {
    happy: [
      { id: "1", name: "Happy Vibes", artists: [{ id: "a1", name: "Artist A" }], album: { id: "alb1", name: "Album 1", images: [{ url: "https://picsum.photos/seed/happy1/300", height: 300, width: 300 }] } },
      { id: "2", name: "Good Times", artists: [{ id: "a2", name: "Artist B" }], album: { id: "alb2", name: "Album 2", images: [{ url: "https://picsum.photos/seed/happy2/300", height: 300, width: 300 }] } },
      { id: "3", name: "Sunny Day", artists: [{ id: "a3", name: "Artist C" }], album: { id: "alb3", name: "Album 3", images: [{ url: "https://picsum.photos/seed/happy3/300", height: 300, width: 300 }] } },
      { id: "4", name: "Celebration", artists: [{ id: "a4", name: "Artist D" }], album: { id: "alb4", name: "Album 4", images: [{ url: "https://picsum.photos/seed/happy4/300", height: 300, width: 300 }] } },
      { id: "5", name: "Dance All Night", artists: [{ id: "a5", name: "Artist E" }], album: { id: "alb5", name: "Album 5", images: [{ url: "https://picsum.photos/seed/happy5/300", height: 300, width: 300 }] } },
    ],
    sad: [
      { id: "6", name: "Rainy Day", artists: [{ id: "a6", name: "Artist F" }], album: { id: "alb6", name: "Album 6", images: [{ url: "https://picsum.photos/seed/sad1/300", height: 300, width: 300 }] } },
      { id: "7", name: "Melancholy", artists: [{ id: "a7", name: "Artist G" }], album: { id: "alb7", name: "Album 7", images: [{ url: "https://picsum.photos/seed/sad2/300", height: 300, width: 300 }] } },
      { id: "8", name: "Blue Thoughts", artists: [{ id: "a8", name: "Artist H" }], album: { id: "alb8", name: "Album 8", images: [{ url: "https://picsum.photos/seed/sad3/300", height: 300, width: 300 }] } },
      { id: "9", name: "Late Night Feels", artists: [{ id: "a9", name: "Artist I" }], album: { id: "alb9", name: "Album 9", images: [{ url: "https://picsum.photos/seed/sad4/300", height: 300, width: 300 }] } },
      { id: "10", name: "Lonely Streets", artists: [{ id: "a10", name: "Artist J" }], album: { id: "alb10", name: "Album 10", images: [{ url: "https://picsum.photos/seed/sad5/300", height: 300, width: 300 }] } },
    ],
    energetic: [
      { id: "11", name: "Pump It Up", artists: [{ id: "a11", name: "Artist K" }], album: { id: "alb11", name: "Album 11", images: [{ url: "https://picsum.photos/seed/energy1/300", height: 300, width: 300 }] } },
      { id: "12", name: "Adrenaline Rush", artists: [{ id: "a12", name: "Artist L" }], album: { id: "alb12", name: "Album 12", images: [{ url: "https://picsum.photos/seed/energy2/300", height: 300, width: 300 }] } },
      { id: "13", name: "Power Move", artists: [{ id: "a13", name: "Artist M" }], album: { id: "alb13", name: "Album 13", images: [{ url: "https://picsum.photos/seed/energy3/300", height: 300, width: 300 }] } },
      { id: "14", name: "Workout Beat", artists: [{ id: "a14", name: "Artist N" }], album: { id: "alb14", name: "Album 14", images: [{ url: "https://picsum.photos/seed/energy4/300", height: 300, width: 300 }] } },
      { id: "15", name: "Turbo Mode", artists: [{ id: "a15", name: "Artist O" }], album: { id: "alb15", name: "Album 15", images: [{ url: "https://picsum.photos/seed/energy5/300", height: 300, width: 300 }] } },
    ],
    calm: [
      { id: "16", name: "Gentle Waves", artists: [{ id: "a16", name: "Artist P" }], album: { id: "alb16", name: "Album 16", images: [{ url: "https://picsum.photos/seed/calm1/300", height: 300, width: 300 }] } },
      { id: "17", name: "Quiet Mind", artists: [{ id: "a17", name: "Artist Q" }], album: { id: "alb17", name: "Album 17", images: [{ url: "https://picsum.photos/seed/calm2/300", height: 300, width: 300 }] } },
      { id: "18", name: "Peaceful Sounds", artists: [{ id: "a18", name: "Artist R" }], album: { id: "alb18", name: "Album 18", images: [{ url: "https://picsum.photos/seed/calm3/300", height: 300, width: 300 }] } },
      { id: "19", name: "Meditation", artists: [{ id: "a19", name: "Artist S" }], album: { id: "alb19", name: "Album 19", images: [{ url: "https://picsum.photos/seed/calm4/300", height: 300, width: 300 }] } },
      { id: "20", name: "Tranquility", artists: [{ id: "a20", name: "Artist T" }], album: { id: "alb20", name: "Album 20", images: [{ url: "https://picsum.photos/seed/calm5/300", height: 300, width: 300 }] } },
    ],
    focused: [
      { id: "21", name: "Deep Work", artists: [{ id: "a21", name: "Artist U" }], album: { id: "alb21", name: "Album 21", images: [{ url: "https://picsum.photos/seed/focus1/300", height: 300, width: 300 }] } },
      { id: "22", name: "Flow State", artists: [{ id: "a22", name: "Artist V" }], album: { id: "alb22", name: "Album 22", images: [{ url: "https://picsum.photos/seed/focus2/300", height: 300, width: 300 }] } },
      { id: "23", name: "Concentration", artists: [{ id: "a23", name: "Artist W" }], album: { id: "alb23", name: "Album 23", images: [{ url: "https://picsum.photos/seed/focus3/300", height: 300, width: 300 }] } },
      { id: "24", name: "Study Session", artists: [{ id: "a24", name: "Artist X" }], album: { id: "alb24", name: "Album 24", images: [{ url: "https://picsum.photos/seed/focus4/300", height: 300, width: 300 }] } },
      { id: "25", name: "Mind Clarity", artists: [{ id: "a25", name: "Artist Y" }], album: { id: "alb25", name: "Album 25", images: [{ url: "https://picsum.photos/seed/focus5/300", height: 300, width: 300 }] } },
    ],
    romantic: [
      { id: "26", name: "Candlelight", artists: [{ id: "a26", name: "Artist Z" }], album: { id: "alb26", name: "Album 26", images: [{ url: "https://picsum.photos/seed/romance1/300", height: 300, width: 300 }] } },
      { id: "27", name: "Sweet Serenade", artists: [{ id: "a27", name: "Artist AA" }], album: { id: "alb27", name: "Album 27", images: [{ url: "https://picsum.photos/seed/romance2/300", height: 300, width: 300 }] } },
      { id: "28", name: "Love Song", artists: [{ id: "a28", name: "Artist AB" }], album: { id: "alb28", name: "Album 28", images: [{ url: "https://picsum.photos/seed/romance3/300", height: 300, width: 300 }] } },
      { id: "29", name: "Date Night", artists: [{ id: "a29", name: "Artist AC" }], album: { id: "alb29", name: "Album 29", images: [{ url: "https://picsum.photos/seed/romance4/300", height: 300, width: 300 }] } },
      { id: "30", name: "Heartfelt", artists: [{ id: "a30", name: "Artist AD" }], album: { id: "alb30", name: "Album 30", images: [{ url: "https://picsum.photos/seed/romance5/300", height: 300, width: 300 }] } },
    ],
    neutral: [
      { id: "31", name: "Everyday Playlist", artists: [{ id: "a31", name: "Artist AE" }], album: { id: "alb31", name: "Album 31", images: [{ url: "https://picsum.photos/seed/neutral1/300", height: 300, width: 300 }] } },
      { id: "32", name: "Background Music", artists: [{ id: "a32", name: "Artist AF" }], album: { id: "alb32", name: "Album 32", images: [{ url: "https://picsum.photos/seed/neutral2/300", height: 300, width: 300 }] } },
      { id: "33", name: "General Vibes", artists: [{ id: "a33", name: "Artist AG" }], album: { id: "alb33", name: "Album 33", images: [{ url: "https://picsum.photos/seed/neutral3/300", height: 300, width: 300 }] } },
      { id: "34", name: "Mixed Mood", artists: [{ id: "a34", name: "Artist AH" }], album: { id: "alb34", name: "Album 34", images: [{ url: "https://picsum.photos/seed/neutral4/300", height: 300, width: 300 }] } },
      { id: "35", name: "Easy Listening", artists: [{ id: "a35", name: "Artist AI" }], album: { id: "alb35", name: "Album 35", images: [{ url: "https://picsum.photos/seed/neutral5/300", height: 300, width: 300 }] } },
    ],
  };
  
  // Get the appropriate playlist based on mood type or fallback to neutral
  const tracks = mockPlaylists[moodAnalysis.moodType] || mockPlaylists.neutral;
  
  // Add the required external_urls to each track
  const completeTrackList = tracks.map(track => ({
    ...track,
    external_urls: { spotify: `https://open.spotify.com/track/${track.id}` },
    preview_url: null
  })) as Track[];
  
  return {
    id: `playlist-${moodAnalysis.moodType}`,
    name: `${moodAnalysis.moodType.charAt(0).toUpperCase() + moodAnalysis.moodType.slice(1)} Mood Mix`,
    description: `A playlist generated based on your ${moodAnalysis.moodType} mood. Featuring genres like ${moodAnalysis.recommendedGenres.join(", ")}.`,
    tracks: completeTrackList,
    external_url: `https://open.spotify.com/playlist/playlist-${moodAnalysis.moodType}`
  };
}
