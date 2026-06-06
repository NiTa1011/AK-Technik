import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MusicRequestsList } from "@/components/admin/MusicRequestsList";
import { UserManagement } from "@/components/admin/UserManagement";
import { ThemeManagement } from "@/components/admin/ThemeManagement";
import { VenueManagement } from "@/components/admin/VenueManagement";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [canManageRequests, setCanManageRequests] = useState(false);
  const [canChangeTheme, setCanChangeTheme] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn");
    const userId = localStorage.getItem("adminUserId");
    if (loggedIn === "true" && userId) {
      setIsLoggedIn(true);
      setCurrentUserId(userId);
      checkUserPermissions(userId);
    }
  }, []);

  const checkUserPermissions = async (userId: string) => {
    try {
      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (roleError) {
        console.error("Error fetching role:", roleError);
      }

      const hasAdminRole = roleData?.role === "admin";
      setIsAdmin(hasAdminRole);

      // Check if user can manage requests and themes
      const { data: userData, error: userError } = await supabase
        .from("admin_users")
        .select("can_manage_requests, can_change_theme")
        .eq("id", userId)
        .maybeSingle();

      if (userError) {
        console.error("Error fetching user data:", userError);
      }

      setCanManageRequests(userData?.can_manage_requests || false);
      setCanChangeTheme(userData?.can_change_theme || false);

      console.log("Permissions loaded:", {
        isAdmin: hasAdminRole,
        canManageRequests: userData?.can_manage_requests,
        canChangeTheme: userData?.can_change_theme
      });
    } catch (error) {
      console.error("Error in checkUserPermissions:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminUserId", data.id);
        setIsLoggedIn(true);
        setCurrentUserId(data.id);
        await checkUserPermissions(data.id);
        toast({
          title: "Erfolgreich angemeldet",
          description: `Willkommen, ${username}!`,
        });
      } else {
        toast({
          title: "Login fehlgeschlagen",
          description: "Benutzername oder Passwort falsch.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Fehler",
        description: "Es gab ein Problem beim Login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminUserId");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCanManageRequests(false);
    navigate("/");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Admin Login
            </h1>
            <p className="text-muted-foreground">
              Melde dich an um die Musikwünsche zu sehen
            </p>
          </div>

          <Card className="p-8 glass-card rounded-3xl shadow-xl">
            <form onSubmit={handleLogin} className="space-y-5">
              <Input
                type="text"
                placeholder="Benutzername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 px-4 text-base rounded-2xl border-border/50 glass-input"
                required
              />

              <Input
                type="password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 px-4 text-base rounded-2xl border-border/50 glass-input"
                required
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold rounded-2xl bg-gradient-button hover:opacity-90 transition-opacity shadow-lg shadow-primary/15"
              >
                {isLoading ? "Wird angemeldet..." : "Anmelden"}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Zurück zur Startseite
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Verwaltung deiner Musikwünsche-App</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </Button>
        </div>

        <Tabs defaultValue="requests" className="w-full animate-fade-in">
          <TabsList className={`grid w-full transition-all gap-1 md:gap-2 bg-card/50 backdrop-blur-sm p-1 md:p-2 rounded-2xl text-xs md:text-sm ${isAdmin && canChangeTheme ? 'grid-cols-4' : isAdmin ? 'grid-cols-3' : canChangeTheme ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <TabsTrigger value="requests" className="rounded-xl px-2 md:px-4 py-2 data-[state=active]:bg-gradient-button data-[state=active]:text-white">
              <span className="hidden sm:inline">Musikwünsche</span>
              <span className="sm:hidden">Wünsche</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="users" className="rounded-xl px-2 md:px-4 py-2 data-[state=active]:bg-gradient-button data-[state=active]:text-white">
                <span className="hidden sm:inline">Benutzerverwaltung</span>
                <span className="sm:hidden">Benutzer</span>
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="venues" className="rounded-xl px-2 md:px-4 py-2 data-[state=active]:bg-gradient-button data-[state=active]:text-white">
                Discos
              </TabsTrigger>
            )}
            {canChangeTheme && (
              <TabsTrigger value="themes" className="rounded-xl px-2 md:px-4 py-2 data-[state=active]:bg-gradient-button data-[state=active]:text-white">
                Design
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="requests" className="mt-6 animate-fade-in relative z-10">
            <MusicRequestsList canManageRequests={canManageRequests} />
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="users" className="mt-6 animate-fade-in relative z-10">
              <UserManagement currentUserId={currentUserId} />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="venues" className="mt-6 animate-fade-in relative z-10">
              <VenueManagement />
            </TabsContent>
          )}

          {canChangeTheme && (
            <TabsContent value="themes" className="mt-6 animate-fade-in relative z-10">
              <ThemeManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
