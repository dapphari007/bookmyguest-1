import Layout from "@/components/layout/Layout";
import { Search, CalendarCheck, CreditCard, Star, CheckCircle2, Shield, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: Search,
    title: "1. Browse & Discover",
    description: "Search from our curated collection of 500+ verified speakers across various categories. Use filters to narrow down by budget, location, expertise, and availability.",
    details: [
      "Advanced search with smart filters",
      "View speaker profiles with ratings & reviews",
      "Compare multiple speakers side-by-side",
      "Save favorites to your shortlist"
    ]
  },
  {
    icon: CalendarCheck,
    title: "2. Check Availability",
    description: "View real-time availability calendars for speakers. Many speakers offer instant booking confirmation, while others may need a day to respond.",
    details: [
      "Real-time calendar availability",
      "Instant Book for quick confirmation",
      "Request specific dates & timings",
      "Flexible scheduling options"
    ]
  },
  {
    icon: CreditCard,
    title: "3. Book & Pay Securely",
    description: "Complete your booking with our secure payment gateway. Your payment is protected until the event is completed successfully.",
    details: [
      "Multiple payment options (UPI, Cards, NetBanking)",
      "Booking protection guarantee",
      "Transparent pricing - no hidden fees",
      "Automated invoicing & receipts"
    ]
  },
  {
    icon: Star,
    title: "4. Host & Review",
    description: "Host your amazing event with your chosen speaker. After the event, share your feedback to help other organizers make informed decisions.",
    details: [
      "Pre-event coordination support",
      "Day-of event assistance",
      "Post-event feedback system",
      "Dispute resolution support"
    ]
  },
];

const benefits = [
  {
    icon: CheckCircle2,
    title: "Verified Profiles",
    description: "Every speaker on our platform goes through a rigorous verification process."
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Your payments are protected with our escrow-like booking guarantee."
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Our support team is available round the clock to help you."
  },
  {
    icon: MessageCircle,
    title: "Direct Communication",
    description: "Chat directly with speakers before making a booking decision."
  }
];

const HowItWorks = () => {
  return (
    <Layout>
      <div className="pt-20 md:pt-24 min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-hero-gradient text-primary-foreground py-16 md:py-24">
          <div className="container-tight text-center">
            <h1 className="mb-6">How BookMyGuest Works</h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Book your perfect speaker in 4 simple steps. We make the process seamless, secure, and stress-free.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="container-tight py-16">
          <div className="space-y-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              return (
                <div 
                  key={step.title}
                  className={`grid md:grid-cols-2 gap-8 items-center ${!isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className={`${!isEven ? 'md:order-2' : ''}`}>
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                      {step.title}
                    </h2>
                    <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                      {step.description}
                    </p>
                    <ul className="space-y-3">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`${!isEven ? 'md:order-1' : ''}`}>
                    <div className="bg-muted rounded-2xl aspect-video flex items-center justify-center">
                      <Icon className="w-24 h-24 text-primary/20" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-muted/50 py-16">
          <div className="container-tight">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              Why Choose BookMyGuest?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div key={benefit.title} className="bg-card rounded-xl p-6 border border-border text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="container-tight py-16 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Find Your Perfect Speaker?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of organizers who trust BookMyGuest for their events
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/speakers">
              <Button variant="hero" size="xl">
                Browse Speakers
              </Button>
            </Link>
            <Button variant="outline" size="xl">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HowItWorks;
