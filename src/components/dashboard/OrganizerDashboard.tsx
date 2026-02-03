import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Search,
  Heart,
  MessageCircle,
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
  User,
  Trash2,
  Star,
} from "lucide-react";
import { format } from "date-fns";

interface Booking {
  id: string;
  event_name: string;
  event_type: string | null;
  event_location: string | null;
  status: string;
  created_at: string;
  speaker_id: string;
  availability_id: string;
  speakers: {
    name: string;
    image_url: string | null;
    category: string;
  };
  speaker_availability: {
    date: string;
    start_time: string;
    end_time: string;
  };
}

interface SavedSpeaker {
  id: string;
  speaker_id: string;
  speakers: {
    id: string;
    name: string;
    title: string;
    category: string;
    image_url: string | null;
    location: string;
    rating: number;
  };
}

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [savedSpeakers, setSavedSpeakers] = useState<SavedSpeaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch bookings
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select(`
        *,
        speakers (name, image_url, category),
        speaker_availability (date, start_time, end_time)
      `)
      .eq("organizer_id", user?.id)
      .order("created_at", { ascending: false });

    if (bookingsData) {
      setBookings(bookingsData as unknown as Booking[]);
    }

    // Fetch saved speakers
    const { data: savedData } = await supabase
      .from("saved_speakers")
      .select(`
        *,
        speakers (id, name, title, category, image_url, location, rating)
      `)
      .eq("user_id", user?.id);

    if (savedData) {
      setSavedSpeakers(savedData as unknown as SavedSpeaker[]);
    }

    setLoading(false);
  };

  const handleUnsaveSpeaker = async (savedId: string) => {
    const { error } = await supabase
      .from("saved_speakers")
      .delete()
      .eq("id", savedId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove saved speaker.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Speaker removed",
        description: "Speaker removed from your saved list.",
      });
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container-tight py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Organizer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your bookings and find new speakers
          </p>
        </div>
        <Link to="/speakers">
          <Button variant="hero" className="gap-2">
            <Search className="w-4 h-4" />
            Find Speakers
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {bookings.filter(b => b.status === "confirmed").length}
              </p>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{savedSpeakers.length}</p>
              <p className="text-sm text-muted-foreground">Saved Speakers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upcoming Bookings */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Your Bookings</h2>
            {bookings.length > 3 && (
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No bookings yet</p>
              <Link to="/speakers">
                <Button variant="outline" size="sm">
                  Browse Speakers
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                    {booking.speakers.image_url ? (
                      <img
                        src={booking.speakers.image_url}
                        alt={booking.speakers.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-primary">
                        {booking.speakers.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {booking.event_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.speakers.name} •{" "}
                      {format(new Date(booking.speaker_availability.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      booking.status === "confirmed"
                        ? "verified"
                        : booking.status === "pending"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Speakers */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Saved Speakers</h2>
          </div>

          {savedSpeakers.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No saved speakers</p>
              <Link to="/speakers">
                <Button variant="outline" size="sm">
                  Explore Speakers
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {savedSpeakers.slice(0, 5).map((saved) => (
                  <div
                    key={saved.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <Link to={`/speaker/${saved.speakers.id}`} className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                      {saved.speakers.image_url ? (
                        <img
                          src={saved.speakers.image_url}
                          alt={saved.speakers.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {saved.speakers.name.charAt(0)}
                        </span>
                      )}
                    </Link>
                    <Link to={`/speaker/${saved.speakers.id}`} className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {saved.speakers.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{saved.speakers.location}</span>
                        <Star className="w-3 h-3 text-accent ml-2" />
                        <span>{saved.speakers.rating?.toFixed(1)}</span>
                      </div>
                    </Link>
                    <Badge variant="category" className="shrink-0">{saved.speakers.category}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-destructive hover:text-destructive"
                      onClick={() => handleUnsaveSpeaker(saved.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
