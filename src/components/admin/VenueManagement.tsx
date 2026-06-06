import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Venue {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

export const VenueManagement = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [newVenueName, setNewVenueName] = useState("");
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching venues:", error);
      toast({
        title: "Fehler",
        description: "Discos konnten nicht geladen werden.",
        variant: "destructive",
      });
    } else {
      setVenues(data || []);
    }
  };

  const handleCreateVenue = async () => {
    if (!newVenueName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib einen Namen ein.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("venues")
      .insert([{ name: newVenueName.trim() }]);

    if (error) {
      console.error("Error creating venue:", error);
      toast({
        title: "Fehler",
        description: "Disco konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erfolg",
        description: "Disco wurde erstellt.",
      });
      setNewVenueName("");
      setIsDialogOpen(false);
      fetchVenues();
    }
  };

  const handleUpdateVenue = async () => {
    if (!editingVenue) return;

    const { error } = await supabase
      .from("venues")
      .update({ 
        name: editingVenue.name,
        active: editingVenue.active
      })
      .eq("id", editingVenue.id);

    if (error) {
      console.error("Error updating venue:", error);
      toast({
        title: "Fehler",
        description: "Disco konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erfolg",
        description: "Disco wurde aktualisiert.",
      });
      setEditingVenue(null);
      fetchVenues();
    }
  };

  const handleDeleteVenue = async (id: string) => {
    const { error } = await supabase
      .from("venues")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting venue:", error);
      toast({
        title: "Fehler",
        description: "Disco konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erfolg",
        description: "Disco wurde gelöscht.",
      });
      fetchVenues();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Disco Verwaltung</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl">
              <Plus className="w-4 h-4" />
              Neue Disco
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Neue Disco erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Disco Name"
                value={newVenueName}
                onChange={(e) => setNewVenueName(e.target.value)}
                className="rounded-xl"
              />
              <Button
                onClick={handleCreateVenue}
                className="w-full rounded-xl"
              >
                Erstellen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {venues.map((venue) => (
          <Card key={venue.id} className="p-4 rounded-2xl">
            {editingVenue?.id === venue.id ? (
              <div className="space-y-4">
                <Input
                  value={editingVenue.name}
                  onChange={(e) =>
                    setEditingVenue({ ...editingVenue, name: e.target.value })
                  }
                  className="rounded-xl"
                />
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingVenue.active}
                    onCheckedChange={(checked) =>
                      setEditingVenue({ ...editingVenue, active: checked })
                    }
                  />
                  <Label>Aktiv</Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateVenue}
                    className="flex-1 rounded-xl"
                  >
                    Speichern
                  </Button>
                  <Button
                    onClick={() => setEditingVenue(null)}
                    variant="outline"
                    className="flex-1 rounded-xl"
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{venue.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {venue.active ? "Aktiv" : "Inaktiv"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setEditingVenue(venue)}
                    variant="outline"
                    size="icon"
                    className="rounded-xl"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteVenue(venue.id)}
                    variant="destructive"
                    size="icon"
                    className="rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
