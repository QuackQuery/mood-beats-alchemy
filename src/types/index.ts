
export interface MoodAnalysis {
  moodType: string;
  intensity: number;
  description: string;
  recommendedGenres: string[];
  recommendedArtists?: string[];
  color: string;
}

export interface Track {
  id: string;
  name: string;
  artists: {
    id: string;
    name: string;
  }[];
  album: {
    id: string;
    name: string;
    images: {
      url: string;
      height: number;
      width: number;
    }[];
  };
  external_urls: {
    spotify: string;
  };
  preview_url: string | null;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
  external_url?: string;
}

export interface AiResponse {
  moodAnalysis: MoodAnalysis;
}

// Gemini API related types
export interface GeminiRequestContent {
  parts: {
    text: string;
  }[];
}

export interface GeminiRequest {
  contents: GeminiRequestContent[];
}

export interface GeminiResponsePart {
  text: string;
}

export interface GeminiResponseContent {
  parts: GeminiResponsePart[];
  role: string;
}

export interface GeminiResponse {
  candidates: {
    content: GeminiResponseContent;
    finishReason: string;
    index: number;
  }[];
}
