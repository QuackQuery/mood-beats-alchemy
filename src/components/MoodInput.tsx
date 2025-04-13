
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal, Sparkles } from "lucide-react";

interface MoodInputProps {
  onSubmit: (description: string) => void;
  isLoading: boolean;
}

export function MoodInput({ onSubmit, isLoading }: MoodInputProps) {
  const [moodDescription, setMoodDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (moodDescription.trim()) {
      onSubmit(moodDescription);
    }
  };

  const placeholderExamples = [
    "I'm feeling energetic and ready to workout...",
    "Feeling calm and need music to meditate...",
    "Sad and looking for something soothing...",
    "Need to focus on my work for the next few hours...",
    "Feeling happy and want to celebrate...",
  ];

  const randomPlaceholder = placeholderExamples[Math.floor(Math.random() * placeholderExamples.length)];

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 animate-fade-in">
      <div className="relative">
        <Textarea
          value={moodDescription}
          onChange={(e) => setMoodDescription(e.target.value)}
          placeholder={randomPlaceholder}
          className="min-h-[120px] p-4 text-base rounded-xl bg-secondary/50 backdrop-blur-sm border-primary/20 resize-none focus:border-primary/50 transition-all"
          disabled={isLoading}
        />
        <Sparkles 
          className="absolute top-4 right-4 text-primary/40" 
          size={18} 
        />
      </div>
      
      <Button
        type="submit"
        className="w-full gap-2 bg-primary hover:bg-primary/90 text-white py-6 rounded-xl transition-all"
        disabled={isLoading || !moodDescription.trim()}
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            Analyzing your mood...
          </>
        ) : (
          <>
            <SendHorizonal className="h-5 w-5" />
            Generate Playlist
          </>
        )}
      </Button>
    </form>
  );
}
