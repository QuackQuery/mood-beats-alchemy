
import { useState } from "react";
import { MoodAnalysis, Playlist, Track } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Music, Play, RefreshCw, Sparkles } from "lucide-react";
import { MusicWaveform } from "./MusicWaveform";

interface PlaylistDisplayProps {
  playlist: Playlist;
  moodAnalysis: MoodAnalysis;
  onRegeneratePlaylist: () => void;
  isRegenerating: boolean;
}

export function PlaylistDisplay({ 
  playlist, 
  moodAnalysis, 
  onRegeneratePlaylist,
  isRegenerating 
}: PlaylistDisplayProps) {
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);
  
  const colorHex = moodAnalysis.color;
  
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6 text-center space-y-2">
        <h2 
          className="text-2xl md:text-3xl font-bold"
          style={{ color: colorHex }}
        >
          {playlist.name}
        </h2>
        <p className="text-muted-foreground">{playlist.description}</p>
        
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button 
            variant="outline" 
            className="gap-2 rounded-full border-primary/20 hover:border-primary/40 bg-background"
            onClick={onRegeneratePlaylist}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <RefreshCw size={16} />
            )}
            Regenerate
          </Button>
          
          <Button 
            variant="default"
            className="gap-2 rounded-full bg-spotify hover:bg-spotify/90 text-white"
            onClick={() => window.open(playlist.external_url, '_blank')}
          >
            <ExternalLink size={16} />
            Open in Spotify
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {playlist.tracks.map((track, index) => (
          <TrackCard 
            key={track.id} 
            track={track} 
            index={index + 1}
            isHovered={hoveredTrack === track.id}
            onMouseEnter={() => setHoveredTrack(track.id)}
            onMouseLeave={() => setHoveredTrack(null)}
            colorHex={colorHex}
          />
        ))}
      </div>
    </div>
  );
}

interface TrackCardProps {
  track: Track;
  index: number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  colorHex: string;
}

function TrackCard({ track, index, isHovered, onMouseEnter, onMouseLeave, colorHex }: TrackCardProps) {
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:translate-x-1 glass-card"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardContent className="p-0 flex items-center">
        <div 
          className="w-[60px] h-[60px] flex items-center justify-center text-lg font-semibold"
          style={{ backgroundColor: `${colorHex}30` }}
        >
          {isHovered ? (
            <Play className="h-5 w-5" fill="currentColor" />
          ) : (
            index
          )}
        </div>
        
        <div className="flex items-center flex-1 p-3">
          {track.album.images.length > 0 && (
            <img 
              src={track.album.images[0].url} 
              alt={track.album.name}
              className="w-12 h-12 rounded mr-3 object-cover"
            />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{track.name}</div>
            <div className="text-sm text-muted-foreground truncate">
              {track.artists.map(artist => artist.name).join(", ")}
            </div>
          </div>
          
          <div className="ml-2 flex items-center space-x-2">
            {isHovered && (
              <MusicWaveform className="h-6 text-primary" />
            )}
            <Music className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
