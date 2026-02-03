import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import SpeakerCard from "@/components/speakers/SpeakerCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X, MapPin, ChevronDown, Loader2 } from "lucide-react";

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

const categories = [
  "All Categories",
  "Motivational",
  "Comedy",
  "Business",
  "Technology",
  "Education",
  "Entertainment",
];

const budgetRanges = [
  "All Budgets",
  "Under ₹25,000",
  "₹25,000 - ₹50,000",
  "₹50,000 - ₹1,00,000",
  "₹1,00,000+",
];

const locations = [
  "All Locations",
  "Mumbai",
  "Delhi NCR",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Pune",
  "India",
];

const Speakers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);

  const initialCategory = searchParams.get("category") || "All Categories";
  const [selectedCategory, setSelectedCategory] = useState(
    categories.find((c) => c.toLowerCase() === initialCategory.toLowerCase()) ||
      "All Categories"
  );
  const [selectedBudget, setSelectedBudget] = useState("All Budgets");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("speakers")
      .select("*")
      .order("rating", { ascending: false });

    if (error) {
      console.error("Error fetching speakers:", error);
    } else {
      setSpeakers(data || []);
    }
    setLoading(false);
  };

  const filteredSpeakers = useMemo(() => {
    return speakers.filter((speaker) => {
      // Category filter
      if (
        selectedCategory !== "All Categories" &&
        speaker.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // Location filter
      if (
        selectedLocation !== "All Locations" &&
        !speaker.location.toLowerCase().includes(selectedLocation.toLowerCase())
      ) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          speaker.name.toLowerCase().includes(query) ||
          speaker.title.toLowerCase().includes(query) ||
          speaker.category.toLowerCase().includes(query) ||
          speaker.tags?.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [speakers, selectedCategory, selectedLocation, searchQuery]);

  const clearFilters = () => {
    setSelectedCategory("All Categories");
    setSelectedBudget("All Budgets");
    setSelectedLocation("All Locations");
    setSearchQuery("");
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedCategory !== "All Categories" ||
    selectedBudget !== "All Budgets" ||
    selectedLocation !== "All Locations" ||
    searchQuery;

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
    <Layout>
      <div className="pt-20 md:pt-24 min-h-screen bg-background">
        {/* Header */}
        <div className="bg-muted border-b border-border">
          <div className="container-tight py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Browse Speakers
            </h1>
            <p className="text-muted-foreground">
              Find the perfect speaker for your next event
            </p>
          </div>
        </div>

        <div className="container-tight py-8">
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search speakers, topics, expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <Button
              variant="outline"
              className="md:hidden gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="default" className="ml-1">
                  Active
                </Badge>
              )}
            </Button>

            {/* Desktop Filters */}
            <div className="hidden md:flex gap-3">
              {/* Category Select */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-12 px-4 pr-10 rounded-xl bg-card border border-border text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer min-w-[160px]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>

              {/* Location Select */}
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="h-12 px-4 pr-10 rounded-xl bg-card border border-border text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer min-w-[160px]"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>

              {/* Budget Select */}
              <div className="relative">
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="h-12 px-4 pr-10 rounded-xl bg-card border border-border text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer min-w-[180px]"
                >
                  {budgetRanges.map((budget) => (
                    <option key={budget} value={budget}>
                      {budget}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="md:hidden bg-card rounded-xl border border-border p-4 mb-6 animate-fade-in">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-muted border-0 text-foreground"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-muted border-0 text-foreground"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Budget
                  </label>
                  <select
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-muted border-0 text-foreground"
                  >
                    {budgetRanges.map((budget) => (
                      <option key={budget} value={budget}>
                        {budget}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedCategory !== "All Categories" && (
                <Badge variant="secondary" className="gap-1">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory("All Categories")}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedLocation !== "All Locations" && (
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedLocation}
                  <button onClick={() => setSelectedLocation("All Locations")}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredSpeakers.length}
              </span>{" "}
              speakers
            </p>
          </div>

          {/* Speakers Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredSpeakers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpeakers.map((speaker) => (
                <SpeakerCard key={speaker.id} speaker={mapSpeakerToCardFormat(speaker)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No speakers found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search query
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Speakers;
