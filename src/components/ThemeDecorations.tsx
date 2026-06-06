import { useActiveTheme } from "@/hooks/useActiveTheme";
import { Ghost, Skull, Candy, PartyPopper, Music, Sparkles, Moon, Star } from "lucide-react";
import { ConfettiEffect } from "./ConfettiEffect";

export const ThemeDecorations = () => {
  const activeTheme = useActiveTheme();

  if (activeTheme === "halloween") {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Floating ghosts */}
        <Ghost className="absolute top-10 left-10 w-16 h-16 text-primary/30 animate-bounce" style={{ animationDelay: "0s", animationDuration: "3s" }} />
        <Ghost className="absolute top-40 right-20 w-12 h-12 text-primary/20 animate-bounce" style={{ animationDelay: "1s", animationDuration: "4s" }} />
        <Ghost className="absolute bottom-20 left-1/4 w-14 h-14 text-primary/25 animate-bounce" style={{ animationDelay: "2s", animationDuration: "3.5s" }} />
        <Ghost className="absolute top-2/3 right-1/4 w-10 h-10 text-primary/20 animate-bounce" style={{ animationDelay: "2.5s", animationDuration: "3.8s" }} />
        
        {/* Skulls */}
        <Skull className="absolute top-1/4 right-10 w-10 h-10 text-accent/40 animate-pulse" style={{ animationDuration: "2s" }} />
        <Skull className="absolute bottom-40 right-1/3 w-12 h-12 text-accent/30 animate-pulse" style={{ animationDuration: "2.5s" }} />
        <Skull className="absolute top-1/2 left-20 w-9 h-9 text-accent/35 animate-pulse" style={{ animationDuration: "2.2s" }} />
        
        {/* Candy */}
        <Candy className="absolute top-60 left-1/3 w-8 h-8 text-primary/35 animate-spin" style={{ animationDuration: "8s" }} />
        <Candy className="absolute bottom-10 right-10 w-10 h-10 text-accent/35 animate-spin" style={{ animationDuration: "10s" }} />
        <Candy className="absolute top-20 right-1/2 w-7 h-7 text-primary/30 animate-spin" style={{ animationDuration: "9s" }} />
        
        {/* Moon and stars */}
        <Moon className="absolute top-5 right-5 w-20 h-20 text-accent/20" />
        <Star className="absolute top-16 right-32 w-6 h-6 text-primary/40 animate-pulse" style={{ animationDuration: "1.5s" }} />
        <Star className="absolute top-32 right-16 w-4 h-4 text-primary/30 animate-pulse" style={{ animationDelay: "0.5s", animationDuration: "2s" }} />
        <Star className="absolute top-12 right-48 w-5 h-5 text-accent/40 animate-pulse" style={{ animationDelay: "1s", animationDuration: "1.8s" }} />
      </div>
    );
  }

  if (activeTheme === "fasching") {
    return (
      <>
        <ConfettiEffect />
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Confetti particles */}
          <PartyPopper className="absolute top-10 left-20 w-12 h-12 text-primary/40 animate-bounce" style={{ animationDelay: "0s", animationDuration: "2s" }} />
          <PartyPopper className="absolute top-1/3 right-10 w-14 h-14 text-accent/40 animate-bounce" style={{ animationDelay: "0.5s", animationDuration: "2.5s" }} />
          <PartyPopper className="absolute bottom-20 left-10 w-10 h-10 text-secondary/40 animate-bounce" style={{ animationDelay: "1s", animationDuration: "3s" }} />
          <PartyPopper className="absolute bottom-1/3 right-1/4 w-11 h-11 text-primary/35 animate-bounce" style={{ animationDelay: "1.5s", animationDuration: "2.7s" }} />
          
          {/* Sparkles */}
          <Sparkles className="absolute top-20 right-1/4 w-10 h-10 text-primary/50 animate-pulse" style={{ animationDuration: "1.5s" }} />
          <Sparkles className="absolute bottom-40 left-1/3 w-12 h-12 text-accent/50 animate-pulse" style={{ animationDelay: "0.5s", animationDuration: "2s" }} />
          <Sparkles className="absolute top-1/2 right-20 w-8 h-8 text-secondary/50 animate-pulse" style={{ animationDelay: "1s", animationDuration: "1.8s" }} />
          <Sparkles className="absolute top-1/4 left-10 w-9 h-9 text-primary/45 animate-pulse" style={{ animationDelay: "0.7s", animationDuration: "1.6s" }} />
          <Sparkles className="absolute bottom-10 right-10 w-11 h-11 text-accent/45 animate-pulse" style={{ animationDelay: "1.2s", animationDuration: "1.9s" }} />
          
          {/* Music notes */}
          <Music className="absolute top-40 left-1/4 w-10 h-10 text-primary/35 animate-bounce" style={{ animationDelay: "0.3s", animationDuration: "2.8s" }} />
          <Music className="absolute bottom-10 right-1/3 w-12 h-12 text-accent/35 animate-bounce" style={{ animationDelay: "0.8s", animationDuration: "2.3s" }} />
          <Music className="absolute top-2/3 left-1/2 w-9 h-9 text-secondary/35 animate-bounce" style={{ animationDelay: "1.3s", animationDuration: "2.6s" }} />
        </div>
      </>
    );
  }

  return null;
};
