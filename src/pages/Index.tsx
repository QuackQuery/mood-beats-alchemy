
import { useState } from "react";
import { MoodAnalysis, Playlist } from "@/types";
import { analyzeMood, generatePlaylist } from "@/utils/api";
import { MoodInput } from "@/components/MoodInput";
import { PlaylistDisplay } from "@/components/PlaylistDisplay";
import { MoodHeader } from "@/components/MoodHeader";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<MoodAnalysis | null>(null);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [userMoodDescription, setUserMoodDescription] = useState("");
  const { toast } = useToast();

  const handleMoodSubmit = async (description: string) => {
    setUserMoodDescription(description);
    setIsAnalyzing(true);
    
    try {
      const response = await analyzeMood(description);
      setMoodAnalysis(response.moodAnalysis);
      
      // Now generate the playlist
      setIsGenerating(true);
      const playlistData = await generatePlaylist(response.moodAnalysis);
      setPlaylist(playlistData);
      
      toast({
        title: "Playlist generated!",
        description: `We've created a "${playlistData.name}" based on your mood.`,
      });
    } catch (error) {
      console.error("Error analyzing mood:", error);
      toast({
        title: "Error",
        description: "Something went wrong while analyzing your mood.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setIsGenerating(false);
    }
  };

  const handleRegeneratePlaylist = async () => {
    if (!moodAnalysis) return;
    
    setIsGenerating(true);
    
    try {
      const playlistData = await generatePlaylist(moodAnalysis);
      setPlaylist(playlistData);
      
      toast({
        title: "Playlist regenerated!",
        description: `We've created a new "${playlistData.name}" for you.`,
      });
    } catch (error) {
      console.error("Error regenerating playlist:", error);
      toast({
        title: "Error",
        description: "Something went wrong while regenerating your playlist.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Dynamic background color based on mood
  const bgStyle = moodAnalysis
    ? {
        background: `radial-gradient(circle at center, ${moodAnalysis.color}22 0%, transparent 70%)`,
      }
    : {};

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8"
      style={bgStyle}
    >
      <div className="w-full max-w-3xl mx-auto">
        <MoodHeader />
        
        {!playlist ? (
          <MoodInput 
            onSubmit={handleMoodSubmit} 
            isLoading={isAnalyzing || isGenerating}
          />
        ) : (
          <PlaylistDisplay 
            playlist={playlist} 
            moodAnalysis={moodAnalysis!}
            onRegeneratePlaylist={handleRegeneratePlaylist}
            isRegenerating={isGenerating}
          />
        )}
        
        {playlist && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setPlaylist(null);
                setMoodAnalysis(null);
              }}
              className="text-sm text-primary underline hover:text-primary/80 transition-colors"
            >
              Describe a new mood
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
