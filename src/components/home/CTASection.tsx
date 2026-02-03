import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic2, Users } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 bg-hero-gradient">
      <div className="container-tight">
        <div className="grid md:grid-cols-2 gap-8">
          {/* For Organizers */}
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-primary-foreground/20">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-primary-foreground mb-4">
              For Event Organizers
            </h3>
            <p className="text-primary-foreground/70 mb-6 leading-relaxed">
              Find and book verified speakers for your college events, corporate
              conferences, or public gatherings. Get instant quotes and
              hassle-free booking.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Access 500+ verified speakers",
                "Compare prices instantly",
                "Secure payment protection",
                "24/7 support",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-primary-foreground/80 text-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/speakers">
              <Button variant="hero" size="lg" className="gap-2">
                Find Speakers
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* For Speakers */}
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-primary-foreground/20">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-6">
              <Mic2 className="w-7 h-7 text-accent-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-primary-foreground mb-4">
              For Speakers & Guests
            </h3>
            <p className="text-primary-foreground/70 mb-6 leading-relaxed">
              Expand your reach and get discovered by thousands of event
              organizers. Manage bookings, set your rates, and grow your
              speaking career.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Free profile creation",
                "Get discovered by organizers",
                "Manage your calendar",
                "Secure payments",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-primary-foreground/80 text-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-accent-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Button variant="accent" size="lg" className="gap-2">
              List as Speaker
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
