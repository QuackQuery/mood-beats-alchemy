
import { cn } from "@/lib/utils";

interface MusicWaveformProps {
  isPlaying?: boolean;
  className?: string;
}

export function MusicWaveform({ isPlaying = true, className }: MusicWaveformProps) {
  return (
    <div className={cn("music-wave", className)}>
      <span className={`bar ${isPlaying ? "animate-wave" : ""}`} style={{ animationPlayState: isPlaying ? "running" : "paused" }}></span>
      <span className={`bar ${isPlaying ? "animate-wave" : ""}`} style={{ animationPlayState: isPlaying ? "running" : "paused", animationDelay: "0.1s" }}></span>
      <span className={`bar ${isPlaying ? "animate-wave" : ""}`} style={{ animationPlayState: isPlaying ? "running" : "paused", animationDelay: "0.2s" }}></span>
      <span className={`bar ${isPlaying ? "animate-wave" : ""}`} style={{ animationPlayState: isPlaying ? "running" : "paused", animationDelay: "0.3s" }}></span>
      <span className={`bar ${isPlaying ? "animate-wave" : ""}`} style={{ animationPlayState: isPlaying ? "running" : "paused", animationDelay: "0.4s" }}></span>
    </div>
  );
}
