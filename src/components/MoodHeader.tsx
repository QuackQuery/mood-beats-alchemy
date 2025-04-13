
import { Sparkles } from "lucide-react";

export function MoodHeader() {
  return (
    <div className="w-full text-center mb-8 md:mb-12 animate-fade-in">
      <div className="inline-flex items-center justify-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="text-sm uppercase tracking-widest text-primary font-medium">
          AI-Powered Music
        </span>
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      
      <h1 className="text-3xl md:text-5xl font-bold mb-4 gradient-text animate-gradient-x">
        Mood Beats Alchemy
      </h1>
      
      <p className="text-lg text-muted-foreground max-w-xl mx-auto">
        Describe how you're feeling, and our AI will craft the perfect playlist to match your mood.
      </p>
    </div>
  );
}
