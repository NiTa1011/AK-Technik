import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Music2, TrendingUp, Check, X, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Venue {
  id: string;
  name: string;
  active: boolean;
}

interface MusicRequest {
  id: string;
  song_title: string;
  artist_name: string;
  request_count: number;
  status: string;
  created_at: string;
  venue_id: string | null;
}

export const MusicRequestsList = ({ canManageRequests }: { canManageRequests: boolean }) => {
  const [requests, setRequests] = useState<MusicRequest[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchVenues();
    fetchRequests();

    // Set up realtime subscription for new music requests
    const channel = supabase
      .channel('music-requests-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'music_requests'
        },
        (payload) => {
          console.log('New music request:', payload);
          const newRequest = payload.new as MusicRequest;
          
          toast({
            title: "🎵 Neuer Musikwunsch!",
            description: `${newRequest.song_title} - ${newRequest.artist_name}`,
          });
          
          // Refresh the list
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [canManageRequests]);

  useEffect(() => {
    fetchRequests();
  }, [selectedVenue, canManageRequests]);

  const fetchVenues = async () => {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching venues:", error);
    } else {
      setVenues(data || []);
    }
  };

  const fetchRequests = async () => {
    // If user can't manage requests, only show accepted ones
    let query = supabase
      .from("music_requests")
      .select("*");

    if (!canManageRequests) {
      query = query.eq("status", "accepted");
    }

    // Filter by venue if selected
    if (selectedVenue !== "all") {
      query = query.eq("venue_id", selectedVenue);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Fehler",
        description: "Konnte Musikwünsche nicht laden.",
        variant: "destructive",
      });
      return;
    }

    setRequests(data || []);
  };

  const handleStatusChange = async (id: string, status: "accepted" | "rejected" | "pending") => {
    const { error } = await supabase
      .from("music_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
      return;
    }

    let statusText = "Wunsch ausstehend";
    if (status === "accepted") statusText = "Wunsch akzeptiert";
    if (status === "rejected") statusText = "Wunsch abgelehnt";

    toast({
      title: "Erfolg",
      description: statusText,
    });

    fetchRequests();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white font-medium shadow-sm border-0">Akzeptiert</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="font-medium shadow-sm border-0">Abgelehnt</Badge>;
      default:
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 font-medium">Ausstehend</Badge>;
    }
  };

  const getVenueName = (venueId: string | null) => {
    if (!venueId) return "Keine Disco";
    const venue = venues.find(v => v.id === venueId);
    return venue ? venue.name : "Unbekannte Disco";
  };

  // Helper to sort requests (active first, then rejected, both by count desc)
  const getSortedRequests = (reqList: MusicRequest[]) => {
    const active = reqList.filter(r => r.status !== "rejected");
    const rejected = reqList.filter(r => r.status === "rejected");
    
    active.sort((a, b) => b.request_count - a.request_count);
    rejected.sort((a, b) => b.request_count - a.request_count);
    
    return [...active, ...rejected];
  };

  const renderRequestList = (reqList: MusicRequest[]) => {
    return (
      <div className="space-y-3">
        {reqList.map((request) => {
          const isRejected = request.status === "rejected";
          const isAccepted = request.status === "accepted";
          
          return (
            <Card 
              key={request.id} 
              className={`p-4 md:p-5 transition-all duration-300 border rounded-2xl ${
                isRejected 
                  ? "bg-card/30 border-border/30 opacity-60 hover:opacity-85 hover:border-border/60 shadow-none" 
                  : isAccepted
                    ? "bg-card/90 border-green-500/20 shadow-sm hover:shadow-md hover:border-green-500/40"
                    : "bg-card border-border hover:shadow-md hover:border-primary/40"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1 w-full sm:w-auto">
                  <h3 className={`text-base md:text-lg font-bold mb-1 tracking-tight ${isRejected ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {request.song_title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 font-medium">
                    {request.artist_name}
                  </p>
                  <div className="flex flex-wrap gap-2 items-center">
                    {getStatusBadge(request.status)}
                    {selectedVenue === "all" && (
                      <Badge variant="outline" className="bg-background/40 font-medium">
                        {getVenueName(request.venue_id)}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-between sm:justify-start">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs md:text-sm font-semibold transition-all ${
                    isRejected
                      ? "bg-muted text-muted-foreground border-border"
                      : isAccepted
                        ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-sm shadow-green-500/5"
                        : "bg-primary/10 text-primary border-primary/20 shadow-sm shadow-primary/5 animate-pulse-subtle"
                  }`}>
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{request.request_count}x gewünscht</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {canManageRequests && request.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(request.id, "accepted")}
                          className="h-8 gap-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg px-3"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Akzeptieren</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(request.id, "rejected")}
                          className="h-8 gap-1 text-xs rounded-lg px-3"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Ablehnen</span>
                        </Button>
                      </>
                    )}

                    {canManageRequests && request.status !== "pending" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusChange(request.id, "pending")}
                        className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg px-3 gap-1 border border-border/50"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>Zurücksetzen</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderGroupedRequests = () => {
    const grouped: { [key: string]: MusicRequest[] } = {};
    
    requests.forEach(req => {
      const vId = req.venue_id || "no-venue";
      if (!grouped[vId]) {
        grouped[vId] = [];
      }
      grouped[vId].push(req);
    });

    const venuesToShow = [
      ...venues,
      { id: "no-venue", name: "Ohne zugeordnete Disco", active: false }
    ].filter(v => grouped[v.id] && grouped[v.id].length > 0);

    if (venuesToShow.length === 0) {
      return (
        <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-dashed">
          <Music2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground font-medium">
            Noch keine Musikwünsche vorhanden
          </p>
        </Card>
      );
    }

    return (
      <Accordion type="multiple" defaultValue={venuesToShow.map(v => v.id)} className="w-full space-y-4">
        {venuesToShow.map(venue => {
          const venueReqs = getSortedRequests(grouped[venue.id]);
          const activeCount = venueReqs.filter(r => r.status !== "rejected").length;
          const totalCount = venueReqs.length;

          return (
            <AccordionItem 
              key={venue.id} 
              value={venue.id}
              className="border border-border/60 rounded-2xl bg-card/50 backdrop-blur-md overflow-hidden px-4 md:px-6 shadow-sm"
            >
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full text-left gap-2 pr-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground tracking-tight">{venue.name}</h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {venue.id === "no-venue" ? "Keine Zuweisung" : venue.active ? "Aktive Disco" : "Inaktive Disco"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 font-semibold">
                      {activeCount} Wünsche
                    </Badge>
                    {totalCount > activeCount && (
                      <Badge variant="outline" className="text-muted-foreground font-semibold">
                        {totalCount - activeCount} abgelehnt
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2 space-y-4">
                {renderRequestList(venueReqs)}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  };

  if (requests.length === 0) {
    return (
      <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-dashed">
        <Music2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg text-muted-foreground font-medium">
          Noch keine Musikwünsche vorhanden
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Aktuelle Musikwünsche
        </h2>
        {venues.length > 0 && (
          <Select value={selectedVenue} onValueChange={setSelectedVenue}>
            <SelectTrigger className="w-full sm:w-64 rounded-xl border-border bg-card/50 backdrop-blur-sm h-11">
              <SelectValue placeholder="Alle Discos" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">Alle Discos</SelectItem>
              {venues.map((venue) => (
                <SelectItem key={venue.id} value={venue.id} className="rounded-lg">
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedVenue === "all" ? renderGroupedRequests() : renderRequestList(getSortedRequests(requests))}
    </div>
  );
};
