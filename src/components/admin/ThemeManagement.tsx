import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Palette } from "lucide-react";

interface Theme {
  id: string;
  theme_name: string;
  active: boolean;
}

const themeConfig = {
  halloween: {
    name: "Halloween 🎃",
    icon: "🎃",
    description: "Gruselig & Dunkel",
    colors: {
      primary: "120 100% 25%",        // Giftgrün
      background: "25 15% 8%",        // Sehr dunkel
      foreground: "120 100% 85%",     // Helles Giftgrün
      accent: "33 100% 50%",          // Kürbis Orange
      card: "25 20% 12%",             // Dunkelgrau
      "card-foreground": "120 100% 85%",
      border: "120 100% 20%",
      muted: "25 15% 15%",
      "muted-foreground": "120 50% 60%",
    },
    backgroundPattern: "radial-gradient(circle at 20% 50%, hsl(120 100% 10% / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(33 100% 30% / 0.2) 0%, transparent 50%)",
  },
  fasching: {
    name: "Fasching 🎭",
    icon: "🎭",
    description: "Bunt & Festlich",
    colors: {
      primary: "280 100% 60%",        // Lila
      background: "50 100% 97%",      // Cremeweiß
      foreground: "280 100% 20%",     // Dunkellila
      accent: "340 100% 60%",         // Pink
      card: "0 0% 100%",              // Weiß
      "card-foreground": "280 100% 20%",
      border: "280 50% 80%",
      muted: "50 100% 92%",
      "muted-foreground": "280 50% 40%",
      secondary: "160 100% 50%",      // Türkis
      "secondary-foreground": "0 0% 100%",
    },
    backgroundPattern: "repeating-linear-gradient(45deg, hsl(280 100% 95%), hsl(280 100% 95%) 10px, hsl(340 100% 95%) 10px, hsl(340 100% 95%) 20px, hsl(160 100% 95%) 20px, hsl(160 100% 95%) 30px)",
  },
  default: {
    name: "Standard ✨",
    icon: "✨",
    description: "Klassisch",
    colors: {
      primary: "271 81% 56%",
      background: "280 60% 96%",
      foreground: "240 10% 25%",
      accent: "330 81% 60%",
      card: "0 0% 100%",
      "card-foreground": "240 10% 25%",
      border: "280 30% 88%",
      muted: "280 40% 92%",
      "muted-foreground": "240 5% 50%",
    },
    backgroundPattern: "none",
  },
};

export const ThemeManagement = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeTheme, setActiveTheme] = useState<string>("default");
  const { toast } = useToast();

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    const { data, error } = await supabase
      .from("app_themes")
      .select("*");

    if (error) {
      toast({
        title: "Fehler",
        description: "Konnte Themes nicht laden.",
        variant: "destructive",
      });
      return;
    }

    setThemes(data || []);
    const active = data?.find((t) => t.active);
    if (active) {
      setActiveTheme(active.theme_name);
      applyTheme(active.theme_name);
    }
  };

  const applyTheme = (themeName: string) => {
    const theme = themeConfig[themeName as keyof typeof themeConfig];
    if (!theme) return;

    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    // Apply background pattern
    if (theme.backgroundPattern && theme.backgroundPattern !== "none") {
      document.body.style.backgroundImage = theme.backgroundPattern;
    } else {
      document.body.style.backgroundImage = "none";
    }
  };

  const handleThemeChange = async (themeName: string) => {
    // Deactivate all themes
    await supabase
      .from("app_themes")
      .update({ active: false })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    // Activate selected theme
    const { error } = await supabase
      .from("app_themes")
      .update({ active: true })
      .eq("theme_name", themeName);

    if (error) {
      toast({
        title: "Fehler",
        description: "Theme konnte nicht aktiviert werden.",
        variant: "destructive",
      });
      return;
    }

    setActiveTheme(themeName);
    applyTheme(themeName);
    
    toast({
      title: "Theme geändert",
      description: `${themeConfig[themeName as keyof typeof themeConfig].name} aktiviert`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5" />
          <h3 className="text-xl font-semibold">Design-Verwaltung</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(themeConfig).map(([key, theme]) => (
            <Card
              key={key}
              className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                activeTheme === key
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:shadow-md"
              }`}
              onClick={() => handleThemeChange(key)}
            >
              <div className="text-center space-y-2">
                <div className="text-5xl mb-3 animate-bounce">{theme.icon}</div>
                <h4 className="font-bold text-lg">{theme.name}</h4>
                <p className="text-xs text-muted-foreground">{theme.description}</p>
                {activeTheme === key && (
                  <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold animate-fade-in">
                    ✓ Aktiv
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};
