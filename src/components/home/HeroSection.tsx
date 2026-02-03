import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const categories = [
  "All Categories",
  "Motivational",
  "Comedy",
  "Business",
  "Technology",
  "Education",
  "Entertainment",
];

const budgets = [
  "All Budgets",
  "Under ₹10,000",
  "₹10,000 - ₹50,000",
  "₹50,000 - ₹1,00,000",
  "₹1,00,000+",
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedBudget, setSelectedBudget] = useState("All Budgets");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCategory !== "All Categories") {
      params.set("category", selectedCategory.toLowerCase());
    }
    if (selectedBudget !== "All Budgets") {
      params.set("budget", selectedBudget);
    }
    if (searchQuery) {
      params.set("q", searchQuery);
    }
    navigate(`/speakers?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Event with speaker"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/50" />
      </div>

      {/* Content */}
      <div className="relative container-tight py-32 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
            <span className="text-sm font-medium">India's #1 Guest Booking Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-primary-foreground mb-6">
            Book Top Speakers & Guests
            <br />
            <span className="text-gradient">for Your Events</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            India's largest platform connecting event organizers with verified speakers,
            performers, and guests for colleges, corporates, and public events.
          </p>

          {/* Search Box */}
          <div className="bg-background/95 backdrop-blur-lg rounded-2xl p-4 shadow-elevated max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search Input */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search speakers, topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Category Select */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-12 px-4 pr-10 rounded-xl bg-muted border-0 text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>

              {/* Search Button */}
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>

            {/* Quick filters */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">Popular:</span>
              {["For Colleges", "For Corporates", "For Public Events"].map((filter) => (
                <button
                  key={filter}
                  className="px-3 py-1.5 text-sm rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
            {[
              { value: "500+", label: "Verified Speakers" },
              { value: "10,000+", label: "Events Booked" },
              { value: "4.8★", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground/60 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-primary-foreground/50" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
