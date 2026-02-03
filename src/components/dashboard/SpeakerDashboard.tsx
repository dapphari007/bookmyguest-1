import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Eye,
  MessageCircle,
  TrendingUp,
  Clock,
  Loader2,
  CheckCircle2,
  MapPin,
  User,
  Mail,
  Phone,
  IndianRupee,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import AvailabilityManager from "@/components/speakers/AvailabilityManager";
import SpeakerProfileEditor from "@/components/speakers/SpeakerProfileEditor";
import SpeakerCalendar from "@/components/speakers/SpeakerCalendar";

interface Booking {
  id: string;
  event_name: string;
  event_type: string | null;
  event_location: string | null;
  notes: string | null;
  attendees: number | null;
  status: string;
  created_at: string;
  organizer_id: string;
  organizer_name: string | null;
  organizer_email: string | null;
  organizer_phone: string | null;
  speaker_availability: {
    date: string;
    start_time: string;
    end_time: string;
  };
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  event_date: string | null;
  status: string;
  created_at: string;
}

interface SpeakerProfile {
  id: string;
  name: string;
  title: string;
  category: string;
  location: string;
  bio: string | null;
  price_min: number | null;
  price_max: number | null;
  is_verified: boolean | null;
  is_instant_book: boolean | null;
  rating: number | null;
  review_count: number | null;
  total_events: number | null;
  experience_years: number | null;
  languages: string[] | null;
  topics: string[] | null;
  tags: string[] | null;
  image_url: string | null;
}

const SpeakerDashboard = () => {
  const { user, speakerId } = useAuth();
  const [profile, setProfile] = useState<SpeakerProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAvailability, setShowAvailability] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (user && speakerId) {
      fetchData();
    }
  }, [user, speakerId]);

  const fetchData = async () => {
    if (!speakerId) return;
    
    setLoading(true);

    // Fetch speaker profile
    const { data: profileData } = await supabase
      .from("speakers")
      .select("*")
      .eq("id", speakerId)
      .single();

    if (profileData) {
      setProfile(profileData as SpeakerProfile);
    }

    // Fetch bookings with organizer info
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select(`
        *,
        speaker_availability (date, start_time, end_time)
      `)
      .eq("speaker_id", speakerId)
      .order("created_at", { ascending: false });

    if (bookingsData) {
      setBookings(bookingsData as unknown as Booking[]);
    }

    // Fetch inquiries
    const { data: inquiriesData } = await supabase
      .from("inquiries")
      .select("*")
      .eq("speaker_id", speakerId)
      .order("created_at", { ascending: false });

    if (inquiriesData) {
      setInquiries(inquiriesData as Inquiry[]);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container-tight py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Speaker profile not found</p>
          <Button variant="hero" onClick={() => setShowProfileEditor(true)}>
            Complete Your Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-tight py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Speaker Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your profile, availability, and bookings
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowProfileEditor(!showProfileEditor)}
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => { setShowCalendar(!showCalendar); setShowAvailability(false); }}
          >
            <Calendar className="w-4 h-4" />
            View Calendar
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => { setShowAvailability(!showAvailability); setShowCalendar(false); }}
          >
            <Edit className="w-4 h-4" />
            Manage Slots
          </Button>
          <Link to={`/speaker/${speakerId}`}>
            <Button variant="hero" className="gap-2">
              <Eye className="w-4 h-4" />
              View Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Editor - New Component with Photo Upload */}
      {showProfileEditor && profile && (
        <SpeakerProfileEditor
          profile={profile}
          onClose={() => setShowProfileEditor(false)}
          onSave={fetchData}
        />
      )}

      {/* Profile Summary */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
            {profile.image_url ? (
              <img src={profile.image_url} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-primary">
                {profile.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-semibold text-foreground">{profile.name}</h2>
              {profile.is_verified && (
                <CheckCircle2 className="w-5 h-5 text-success" />
              )}
            </div>
            <p className="text-muted-foreground">{profile.title}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="category">{profile.category}</Badge>
              <Badge variant="outline" className="gap-1">
                <MapPin className="w-3 h-3" />
                {profile.location}
              </Badge>
              {profile.price_min && profile.price_max && (
                <Badge variant="outline" className="gap-1">
                  <IndianRupee className="w-3 h-3" />
                  {(profile.price_min / 1000).toFixed(0)}k - {(profile.price_max / 1000).toFixed(0)}k
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{profile.rating?.toFixed(1) || "N/A"}</p>
              <p className="text-sm text-muted-foreground">Rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{profile.review_count || 0}</p>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{profile.total_events || 0}</p>
              <p className="text-sm text-muted-foreground">Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Availability Manager */}
      {showAvailability && speakerId && (
        <div className="mb-8">
          <AvailabilityManager speakerId={speakerId} />
        </div>
      )}

      {/* Calendar View */}
      {showCalendar && speakerId && (
        <div className="mb-8">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">My Event Calendar</h2>
            <SpeakerCalendar speakerId={speakerId} isOwner={true} />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-foreground">{bookings.length}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Bookings</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-success/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-success" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {bookings.filter(b => b.status === "confirmed").length}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Confirmed</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-accent" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-foreground">{inquiries.length}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Inquiries</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-foreground">{profile.experience_years || 0}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Yrs Exp</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Bookings with Full Details */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Upcoming Events</h2>

          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No bookings yet</p>
              <p className="text-sm text-muted-foreground">
                Add availability slots to start receiving bookings
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`p-4 rounded-xl border ${
                    booking.status === "confirmed" 
                      ? "bg-success/5 border-success/20" 
                      : "bg-muted/50 border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{booking.event_name}</h3>
                      {booking.event_type && (
                        <p className="text-sm text-muted-foreground">{booking.event_type}</p>
                      )}
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
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>
                        {format(new Date(booking.speaker_availability.date), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>
                        {booking.speaker_availability.start_time.slice(0, 5)} - {booking.speaker_availability.end_time.slice(0, 5)}
                      </span>
                    </div>
                    {booking.event_location && (
                      <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{booking.event_location}</span>
                      </div>
                    )}
                    {booking.attendees && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4 text-primary" />
                        <span>{booking.attendees} attendees</span>
                      </div>
                    )}
                  </div>
                  
                  {booking.notes && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Notes:</span> {booking.notes}
                      </p>
                    </div>
                  )}
                  
                  {(booking.organizer_name || booking.organizer_email) && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Organizer:</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        {booking.organizer_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {booking.organizer_name}
                          </span>
                        )}
                        {booking.organizer_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {booking.organizer_email}
                          </span>
                        )}
                        {booking.organizer_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {booking.organizer_phone}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Recent Inquiries</h2>

          {inquiries.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No inquiries yet</p>
              <p className="text-sm text-muted-foreground">
                When organizers send you messages, they'll appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className={`p-4 rounded-xl border ${
                    inquiry.status === "pending" 
                      ? "bg-accent/5 border-accent/20" 
                      : "bg-muted/50 border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground">{inquiry.name}</h3>
                    <Badge
                      variant={inquiry.status === "pending" ? "secondary" : "outline"}
                    >
                      {inquiry.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {inquiry.message}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {inquiry.email}
                    </span>
                    {inquiry.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {inquiry.phone}
                      </span>
                    )}
                    {inquiry.event_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {format(new Date(inquiry.event_date), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    Received: {format(new Date(inquiry.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeakerDashboard;