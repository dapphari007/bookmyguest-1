import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "available" | "booked" | "pending";
}

interface SlotBookingCalendarProps {
  speakerId: string;
  speakerName: string;
  isOpen: boolean;
  onClose: () => void;
}

const SlotBookingCalendar = ({
  speakerId,
  speakerName,
  isOpen,
  onClose,
}: SlotBookingCalendarProps) => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Booking form
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [attendees, setAttendees] = useState("");
  const [notes, setNotes] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [organizerPhone, setOrganizerPhone] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchSlots();
    }
  }, [isOpen, speakerId]);

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

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to book a speaker.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (userRole !== "organizer") {
      toast({
        title: "Organizer account required",
        description: "Only organizers can book speakers.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSlot || !eventName) {
      toast({
        title: "Missing information",
        description: "Please select a slot and provide event details.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    const { error } = await supabase.from("bookings").insert({
      availability_id: selectedSlot.id,
      speaker_id: speakerId,
      organizer_id: user.id,
      event_name: eventName,
      event_type: eventType || null,
      event_location: eventLocation || null,
      attendees: attendees ? parseInt(attendees) : null,
      notes: notes || null,
      organizer_name: organizerName || null,
      organizer_email: organizerEmail || null,
      organizer_phone: organizerPhone || null,
      status: "confirmed",
    });

    if (error) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Booking confirmed! 🎉",
        description: `Your booking with ${speakerName} has been confirmed.`,
      });
      onClose();
      navigate("/dashboard");
    }

    setIsBooking(false);
  };

  // Get slots for selected date
  const slotsForDate = selectedDate
    ? slots.filter((slot) => slot.date === format(selectedDate, "yyyy-MM-dd"))
    : [];

  // Get dates that have slots
  const datesWithSlots = [...new Set(slots.map((slot) => slot.date))].map(
    (date) => new Date(date)
  );

  // Check if date has available slots
  const hasAvailableSlots = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return slots.some(
      (slot) => slot.date === dateStr && slot.status === "available"
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {speakerName}</DialogTitle>
          <DialogDescription>
            Select an available time slot and provide your event details.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No available slots at the moment.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please send an inquiry to request specific dates.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Legend */}
            <div className="flex gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-sm text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-sm text-muted-foreground">Booked</span>
              </div>
            </div>

            {/* Calendar */}
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) =>
                  date < new Date() ||
                  !datesWithSlots.some(
                    (d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                  )
                }
                modifiers={{
                  available: (date) => hasAvailableSlots(date),
                }}
                modifiersStyles={{
                  available: {
                    backgroundColor: "hsl(var(--success) / 0.2)",
                    color: "hsl(var(--success))",
                    fontWeight: "bold",
                  },
                }}
                className="rounded-md border"
              />
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Available Slots for {format(selectedDate, "MMMM d, yyyy")}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {slotsForDate.map((slot) => (
                    <button
                      key={slot.id}
                      disabled={slot.status !== "available"}
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                        slot.status === "available"
                          ? selectedSlot?.id === slot.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-success/10 border-success/30 hover:border-success text-foreground"
                          : "bg-destructive/10 border-destructive/30 text-destructive cursor-not-allowed"
                      }`}
                    >
                      {slot.status === "available" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span className="font-medium">
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Form */}
            {selectedSlot && (
              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="font-medium text-foreground">Event Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-name">Event Name *</Label>
                    <Input
                      id="event-name"
                      placeholder="Annual Conference 2025"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-type">Event Type</Label>
                    <Input
                      id="event-type"
                      placeholder="Corporate, College, Wedding..."
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-location">Location *</Label>
                    <Input
                      id="event-location"
                      placeholder="Mumbai, Maharashtra"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attendees">Expected Attendees</Label>
                    <Input
                      id="attendees"
                      type="number"
                      placeholder="500"
                      value={attendees}
                      onChange={(e) => setAttendees(e.target.value)}
                    />
                  </div>
                </div>

                <h3 className="font-medium text-foreground pt-4">Your Contact Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizer-name">Your Name *</Label>
                    <Input
                      id="organizer-name"
                      placeholder="John Doe"
                      value={organizerName}
                      onChange={(e) => setOrganizerName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="organizer-email">Email *</Label>
                    <Input
                      id="organizer-email"
                      type="email"
                      placeholder="john@example.com"
                      value={organizerEmail}
                      onChange={(e) => setOrganizerEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="organizer-phone">Phone</Label>
                    <Input
                      id="organizer-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={organizerPhone}
                      onChange={(e) => setOrganizerPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any specific requirements or topics you'd like covered..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={handleBooking}
            disabled={!selectedSlot || !eventName || !eventLocation || !organizerName || !organizerEmail || isBooking}
          >
            {isBooking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SlotBookingCalendar;
