import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const themeConfig = {
  halloween: {
    colors: {
      primary: "120 100% 25%",
      background: "25 15% 8%",
      foreground: "120 100% 85%",
      accent: "33 100% 50%",
      card: "25 20% 12%",
      "card-foreground": "120 100% 85%",
      border: "120 100% 20%",
      muted: "25 15% 15%",
      "muted-foreground": "120 50% 60%",
    },
    backgroundPattern: "radial-gradient(circle at 20% 50%, hsl(120 100% 10% / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(33 100% 30% / 0.2) 0%, transparent 50%)",
  },
  fasching: {
    colors: {
      primary: "280 100% 60%",
      background: "50 100% 97%",
      foreground: "280 100% 20%",
      accent: "340 100% 60%",
      card: "0 0% 100%",
      "card-foreground": "280 100% 20%",
      border: "280 50% 80%",
      muted: "50 100% 92%",
      "muted-foreground": "280 50% 40%",
      secondary: "160 100% 50%",
      "secondary-foreground": "0 0% 100%",
    },
    backgroundPattern: "repeating-linear-gradient(45deg, hsl(280 100% 95%), hsl(280 100% 95%) 10px, hsl(340 100% 95%) 10px, hsl(340 100% 95%) 20px, hsl(160 100% 95%) 20px, hsl(160 100% 95%) 30px)",
  },
  default: {
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

export const useActiveTheme = () => {
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    try {
      return localStorage.getItem("active-theme-name") || "default";
    } catch {
      return "default";
    }
  });

  useEffect(() => {
    // Apply cached theme immediately if present
    try {
      const cachedName = localStorage.getItem("active-theme-name");
      if (cachedName) {
        applyTheme(cachedName);
      }
    } catch (e) {
      console.error(e);
    }

    fetchActiveTheme();

    // Subscribe to theme changes
    const channel = supabase
      .channel("theme-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "app_themes",
        },
        (payload) => {
          if (payload.new.active) {
            applyTheme(payload.new.theme_name);
            setActiveTheme(payload.new.theme_name);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActiveTheme = async () => {
    const { data } = await supabase
      .from("app_themes")
      .select("theme_name")
      .eq("active", true)
      .maybeSingle();

    if (data) {
      applyTheme(data.theme_name);
      setActiveTheme(data.theme_name);
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
      root.style.setProperty('--background-pattern', theme.backgroundPattern);
    } else {
      document.body.style.backgroundImage = "none";
      root.style.setProperty('--background-pattern', "none");
    }

    try {
      localStorage.setItem("active-theme-name", themeName);
      localStorage.setItem("active-theme-data", JSON.stringify(theme));
    } catch (e) {
      console.error("Error saving theme to localStorage:", e);
    }
  };

  return activeTheme;
};

