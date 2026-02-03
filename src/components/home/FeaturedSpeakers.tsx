import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SpeakerCard from "@/components/speakers/SpeakerCard";
import { supabase } from "@/integrations/supabase/client";

const categories = ["All", "Motivational", "Comedy", "Business", "Technology", "Education"];

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
}

const FeaturedSpeakers = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("speakers")
      .select("*")
      .order("rating", { ascending: false })
      .limit(12);

    if (error) {
      console.error("Error fetching speakers:", error);
    } else {
      setSpeakers(data || []);
    }
    setLoading(false);
  };

  const filteredSpeakers =
    activeCategory === "All"
      ? speakers
      : speakers.filter(
          (speaker) => speaker.category.toLowerCase() === activeCategory.toLowerCase()
        );

  // Map DB speaker to card format
  const mapSpeakerToCardFormat = (speaker: Speaker) => ({
    id: speaker.id,
    name: speaker.name,
    title: speaker.title,
    category: speaker.category,
    location: speaker.location,
    image: speaker.image_url || "/placeholder.svg",
    rating: speaker.rating || 4.5,
    reviewCount: speaker.review_count || 0,
    priceRange: speaker.price_min && speaker.price_max
      ? `₹${(speaker.price_min / 1000).toFixed(0)}K - ₹${(speaker.price_max / 1000).toFixed(0)}K`
      : "₹25K - ₹100K",
    isVerified: speaker.is_verified || false,
    isInstantBook: speaker.is_instant_book || false,
    experience: speaker.experience_years ? `${speaker.experience_years}+ years` : "1+ years",
    events: speaker.total_events || 0,
    languages: speaker.languages || ["English", "Hindi"],
    tags: speaker.tags || [],
  });

  return (
    <section className="py-20 bg-muted/50">
      <div className="container-tight">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-foreground mb-4">Featured Speakers</h2>
            <p className="text-muted-foreground text-lg">
              Discover top-rated speakers for your next event
            </p>
          </div>
          <Link to="/speakers">
            <Button variant="outline" className="gap-2">
              View All Speakers
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted border border-border"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Speakers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredSpeakers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpeakers.slice(0, 6).map((speaker) => (
              <SpeakerCard key={speaker.id} speaker={mapSpeakerToCardFormat(speaker)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No speakers found in this category yet.</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/speakers">
            <Button variant="hero" size="xl" className="gap-2">
              Explore All Speakers
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSpeakers;
