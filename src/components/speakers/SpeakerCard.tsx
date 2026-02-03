import { Link } from "react-router-dom";
import { Star, MapPin, CheckCircle2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Speaker {
  id: string;
  name: string;
  title: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  image: string;
  isVerified?: boolean;
  isInstantBook?: boolean;
  tags?: string[];
}

interface SpeakerCardProps {
  speaker: Speaker;
}

const SpeakerCard = ({ speaker }: SpeakerCardProps) => {
  return (
    <Link
      to={`/speaker/${speaker.id}`}
      className="group block bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={speaker.image}
          alt={speaker.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {speaker.isVerified && (
            <Badge variant="verified" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </Badge>
          )}
          {speaker.isInstantBook && (
            <Badge variant="instant" className="gap-1">
              <Zap className="w-3 h-3" />
              Instant Book
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <span className="text-sm font-semibold text-foreground">
              {speaker.priceRange}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category Badge */}
        <Badge variant="category" className="mb-2">
          {speaker.category}
        </Badge>

        {/* Name & Title */}
        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {speaker.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
          {speaker.title}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1.5 mt-3 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{speaker.location}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-semibold text-foreground">{speaker.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({speaker.reviewCount} reviews)
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SpeakerCard;
