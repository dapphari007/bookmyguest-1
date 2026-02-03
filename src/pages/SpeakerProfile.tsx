import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SpeakerCard from "@/components/speakers/SpeakerCard";
import SpeakerCalendar from "@/components/speakers/SpeakerCalendar";
import SlotBookingCalendar from "@/components/booking/SlotBookingCalendar";
import InquiryForm from "@/components/booking/InquiryForm";
import {
  Star,
  MapPin,
  CheckCircle2,
  Zap,
  Calendar,
  Clock,
  Users,
  Globe,
  ArrowLeft,
  Heart,
  Share2,
  MessageCircle,
  Download,
  Loader2,
  Car,
  Home,
  IndianRupee,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Speaker {
  id: string;
  name: string;
  title: string;
  category: string;
  location: string;
  bio: string | null;
  image_url: string | null;
  rating: number | null;
  review_count: number | null;
  experience_years: number | null;
  total_events: number | null;
  price_min: number | null;
  price_max: number | null;
  is_verified: boolean | null;
  is_instant_book: boolean | null;
  languages: string[] | null;
  topics: string[] | null;
  tags: string[] | null;
  base_district: string | null;
  travel_charge: number | null;
  accommodation_charge: number | null;
}

const SpeakerProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [speaker, setSpeaker] = useState<Speaker | null>(null);
  const [similarSpeakers, setSimilarSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSpeaker();
      checkIfSaved();
    }
  }, [id, user]);

  const fetchSpeaker = async () => {
    setLoading(true);
    
    // Fetch main speaker
    const { data, error } = await supabase
      .from("speakers")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching speaker:", error);
    } else if (data) {
      setSpeaker(data);
      
      // Fetch similar speakers
      const { data: similar } = await supabase
        .from("speakers")
        .select("*")
        .eq("category", data.category)
        .neq("id", id)
        .limit(3);

      setSimilarSpeakers(similar || []);
    }
    
    setLoading(false);
  };

  const checkIfSaved = async () => {
    if (!user || !id) return;
    
    const { data } = await supabase
      .from("saved_speakers")
      .select("id")
      .eq("user_id", user.id)
      .eq("speaker_id", id)
      .maybeSingle();

    setIsSaved(!!data);
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save speakers.",
        variant: "destructive",
      });
      return;
    }

    if (isSaved) {
      // Unsave
      await supabase
        .from("saved_speakers")
        .delete()
        .eq("user_id", user.id)
        .eq("speaker_id", id);
      setIsSaved(false);
      toast({ title: "Speaker removed from saved list" });
    } else {
      // Save
      await supabase
        .from("saved_speakers")
        .insert({ user_id: user.id, speaker_id: id });
      setIsSaved(true);
      toast({ title: "Speaker saved!" });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: speaker?.name,
        text: `Check out ${speaker?.name} on bookyourguests`,
        url: window.location.href,
      });
    } catch {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  // Map DB speaker to card format for similar speakers
  const mapSpeakerToCardFormat = (s: Speaker) => ({
    id: s.id,
    name: s.name,
    title: s.title,
    category: s.category,
    location: s.location,
    image: s.image_url || "/placeholder.svg",
    rating: s.rating || 4.5,
    reviewCount: s.review_count || 0,
    priceRange: s.price_min && s.price_max
      ? `₹${(s.price_min / 1000).toFixed(0)}K - ₹${(s.price_max / 1000).toFixed(0)}K`
      : "₹25K - ₹100K",
    isVerified: s.is_verified || false,
    isInstantBook: s.is_instant_book || false,
    experience: s.experience_years ? `${s.experience_years}+ years` : "1+ years",
    events: s.total_events || 0,
    languages: s.languages || ["English", "Hindi"],
    tags: s.tags || [],
  });

  if (loading) {
    return (
      <Layout>
        <div className="pt-24 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!speaker) {
    return (
      <Layout>
        <div className="pt-24 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Speaker not found
            </h1>
            <Link to="/speakers">
              <Button>Browse Speakers</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const priceRange = speaker.price_min && speaker.price_max
    ? `₹${(speaker.price_min / 1000).toFixed(0)}K - ₹${(speaker.price_max / 1000).toFixed(0)}K`
    : "₹25K - ₹100K";

  return (
    <Layout>
      <div className="pt-20 md:pt-24 min-h-screen bg-background">
        {/* Back Button */}
        <div className="container-tight py-4">
          <Link
            to="/speakers"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Speakers
          </Link>
        </div>

        {/* Main Content */}
        <div className="container-tight pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header Card */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="md:flex">
                  {/* Image */}
                  <div className="md:w-80 relative">
                    <div className="aspect-[4/5] md:h-full">
                      <img
                        src={speaker.image_url || "/placeholder.svg"}
                        alt={speaker.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {speaker.is_verified && (
                        <Badge variant="verified" className="gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </Badge>
                      )}
                      {speaker.is_instant_book && (
                        <Badge variant="instant" className="gap-1">
                          <Zap className="w-3 h-3" />
                          Instant Book
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-6 md:p-8">
                    <Badge variant="category" className="mb-3">
                      {speaker.category}
                    </Badge>

                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                      {speaker.name}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">
                      {speaker.title}
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="w-5 h-5" />
                      <span>{speaker.location}</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-5 h-5 fill-accent text-accent" />
                        <span className="text-lg font-semibold text-foreground">
                          {speaker.rating || 4.5}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        ({speaker.review_count || 0} reviews)
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-xl font-bold text-foreground">
                          {speaker.experience_years || 1}+
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Years Exp
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-xl font-bold text-foreground">
                          {speaker.total_events || 0}+
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Events
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-xl font-bold text-foreground">
                          {speaker.languages?.length || 2}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Languages
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  About
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {speaker.bio || `${speaker.name} is an experienced ${speaker.category.toLowerCase()} speaker based in ${speaker.location}. With ${speaker.experience_years || 1}+ years of experience and ${speaker.total_events || 0}+ events, they bring energy and insight to every engagement.`}
                </p>
              </div>

              {/* Topics */}
              {speaker.topics && speaker.topics.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Topics & Expertise
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {speaker.topics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-sm">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {speaker.languages && speaker.languages.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Languages
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {speaker.languages.map((lang) => (
                      <Badge key={lang} variant="outline" className="text-sm">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Calendar */}
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Availability Calendar
                </h2>
                <SpeakerCalendar speakerId={speaker.id} isOwner={false} />
              </div>

              {/* Travel & Accommodation */}
              {(speaker.travel_charge || speaker.accommodation_charge) && (
                <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Travel & Accommodation
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {speaker.base_district 
                      ? `Based in ${speaker.base_district}. Additional charges apply for events outside this district.`
                      : "Additional charges may apply for out-of-district events."}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {speaker.travel_charge && speaker.travel_charge > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Car className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Travel</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" />
                            {speaker.travel_charge.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {speaker.accommodation_charge && speaker.accommodation_charge > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Home className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Accommodation</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" />
                            {speaker.accommodation_charge.toLocaleString()}/night
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                  {/* Price */}
                  <div className="mb-6">
                    <div className="text-sm text-muted-foreground mb-1">
                      Starting from
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {priceRange}
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3 mb-6">
                    <Button variant="hero" size="lg" className="w-full gap-2" onClick={() => setShowBooking(true)}>
                      <Calendar className="w-5 h-5" />
                      Check Availability
                    </Button>
                    <Button variant="outline" size="lg" className="w-full gap-2" onClick={() => setShowInquiry(true)}>
                      <MessageCircle className="w-5 h-5" />
                      Send Inquiry
                    </Button>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex-1 gap-2 ${isSaved ? "text-destructive" : ""}`}
                      onClick={handleSave}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => toast({ title: "PDF download coming soon!" })}
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </Button>
                  </div>
                </div>

                {/* Trust Signals */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span>Identity verified</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>Usually responds within 24 hours</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Users className="w-5 h-5 text-accent" />
                    <span>
                      Booked {Math.floor(Math.random() * 10 + 5)} times this
                      month
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Calendar Modal */}
          <SlotBookingCalendar
            speakerId={id || ""}
            speakerName={speaker.name}
            isOpen={showBooking}
            onClose={() => setShowBooking(false)}
          />

          {/* Inquiry Form Modal */}
          <InquiryForm
            speakerId={id || ""}
            speakerName={speaker.name}
            isOpen={showInquiry}
            onClose={() => setShowInquiry(false)}
          />

          {/* Similar Speakers */}
          {similarSpeakers.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-semibold text-foreground mb-8">
                Similar Speakers
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarSpeakers.map((s) => (
                  <SpeakerCard key={s.id} speaker={mapSpeakerToCardFormat(s)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SpeakerProfile;
