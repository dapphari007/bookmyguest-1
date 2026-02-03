import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, MapPin, User, Bell } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface Availability {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface Booking {
  id: string;
  event_name: string;
  event_location: string | null;
  attendees: number | null;
  speaker_availability: {
    date: string;
    start_time: string;
    end_time: string;
  };
}

interface SpeakerCalendarProps {
  speakerId: string;
  isOwner?: boolean;
}

const SpeakerCalendar = ({ speakerId, isOwner = false }: SpeakerCalendarProps) => {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    fetchData();
  }, [speakerId]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch availability
    const { data: availData } = await supabase
      .from("speaker_availability")
      .select("*")
      .eq("speaker_id", speakerId)
      .gte("date", format(new Date(), "yyyy-MM-dd"))
      .order("date", { ascending: true });

    if (availData) {
      setAvailability(availData as Availability[]);
    }

    // Fetch bookings if owner
    if (isOwner) {
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(`*, speaker_availability (date, start_time, end_time)`)
        .eq("speaker_id", speakerId)
        .order("created_at", { ascending: false });

      if (bookingsData) {
        setBookings(bookingsData as unknown as Booking[]);
      }
    }

    setLoading(false);
  };

  const getDateStatus = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const slots = availability.filter((a) => a.date === dateStr);

    if (slots.length === 0) return null;

    const hasBooked = slots.some((s) => s.status === "booked");
    const hasAvailable = slots.some((s) => s.status === "available");

    if (hasBooked && hasAvailable) return "mixed";
    if (hasBooked) return "booked";
    if (hasAvailable) return "available";
    return null;
  };

  const getSlotsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return availability.filter((a) => a.date === dateStr);
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((b) =>
      isSameDay(new Date(b.speaker_availability.date), date)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const selectedSlots = selectedDate ? getSlotsForDate(selectedDate) : [];
  const selectedBookings = selectedDate && isOwner ? getBookingsForDate(selectedDate) : [];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Calendar */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="pointer-events-auto"
          modifiers={{
            available: (date) => getDateStatus(date) === "available",
            booked: (date) => getDateStatus(date) === "booked",
            mixed: (date) => getDateStatus(date) === "mixed",
          }}
          modifiersClassNames={{
            available: "!bg-success/20 !text-success font-bold",
            booked: "!bg-destructive/20 !text-destructive font-bold",
            mixed: "!bg-accent/20 !text-accent font-bold",
          }}
        />
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-xs text-muted-foreground">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-xs text-muted-foreground">Mixed</span>
          </div>
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold text-lg mb-4">
          {selectedDate
            ? format(selectedDate, "EEEE, MMMM d, yyyy")
            : "Select a date"}
        </h3>

        {selectedSlots.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No availability slots for this date.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">Time Slots:</p>
            {selectedSlots.map((slot) => (
              <div
                key={slot.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl",
                  slot.status === "available"
                    ? "bg-success/10 border border-success/20"
                    : "bg-destructive/10 border border-destructive/20"
                )}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                  </span>
                </div>
                <Badge
                  variant={slot.status === "available" ? "verified" : "destructive"}
                >
                  {slot.status}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Bookings for owner */}
        {isOwner && selectedBookings.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium">Events on this day:</p>
            </div>
            {selectedBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-3 rounded-xl bg-primary/5 border border-primary/20 mb-2"
              >
                <p className="font-medium text-foreground">{booking.event_name}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {booking.speaker_availability.start_time.slice(0, 5)} -{" "}
                    {booking.speaker_availability.end_time.slice(0, 5)}
                  </span>
                  {booking.event_location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {booking.event_location}
                    </span>
                  )}
                  {booking.attendees && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {booking.attendees} attendees
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeakerCalendar;
