import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, Clock } from "lucide-react";
import { format, addDays } from "date-fns";

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "available" | "booked" | "pending";
}

interface AvailabilityManagerProps {
  speakerId: string;
}

const AvailabilityManager = ({ speakerId }: AvailabilityManagerProps) => {
  const { toast } = useToast();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, [speakerId]);

  const fetchSlots = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("speaker_availability")
      .select("*")
      .eq("speaker_id", speakerId)
      .gte("date", format(new Date(), "yyyy-MM-dd"))
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching slots:", error);
    } else {
      setSlots(data as TimeSlot[]);
    }
    setLoading(false);
  };

  const addSlot = async () => {
    if (!selectedDate) return;

    setIsSaving(true);

    const { error } = await supabase.from("speaker_availability").insert({
      speaker_id: speakerId,
      date: format(selectedDate, "yyyy-MM-dd"),
      start_time: startTime,
      end_time: endTime,
      status: "available",
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Slot added!",
        description: "Your availability has been updated.",
      });
      fetchSlots();
      setIsDialogOpen(false);
    }

    setIsSaving(false);
  };

  const deleteSlot = async (slotId: string) => {
    const { error } = await supabase
      .from("speaker_availability")
      .delete()
      .eq("id", slotId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Slot removed",
        description: "Your availability has been updated.",
      });
      fetchSlots();
    }
  };

  // Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  // Get dates with slots for calendar highlighting
  const datesWithSlots = slots.map((slot) => new Date(slot.date));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Manage Availability
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Set your available time slots for bookings
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Slot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Available Time Slot</DialogTitle>
              <DialogDescription>
                Select a date and time when you're available for bookings.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="hero"
                onClick={addSlot}
                disabled={isSaving || !selectedDate}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Add Slot"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Slots Legend */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-sm text-muted-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-sm text-muted-foreground">Pending</span>
        </div>
      </div>

      {/* Slots List */}
      {Object.keys(groupedSlots).length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
          <Clock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No availability set</p>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            Add Your First Slot
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSlots).map(([date, dateSlots]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-foreground mb-3">
                {format(new Date(date), "EEEE, MMMM d, yyyy")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {dateSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      slot.status === "available"
                        ? "bg-success/10 border-success/30"
                        : slot.status === "booked"
                        ? "bg-destructive/10 border-destructive/30"
                        : "bg-accent/10 border-accent/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </span>
                    </div>
                    {slot.status === "available" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteSlot(slot.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    {slot.status === "booked" && (
                      <span className="text-xs font-medium text-destructive">
                        Booked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailabilityManager;
