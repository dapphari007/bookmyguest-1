import { Search, CalendarCheck, CreditCard, Star } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse & Discover",
    description: "Search from 500+ verified speakers across various categories. Filter by budget, location, and expertise.",
    step: "01",
  },
  {
    icon: CalendarCheck,
    title: "Check Availability",
    description: "View speaker calendars and select your preferred date. Many speakers offer instant booking confirmation.",
    step: "02",
  },
  {
    icon: CreditCard,
    title: "Book & Pay Securely",
    description: "Complete your booking with secure payments. Get instant confirmation and booking protection.",
    step: "03",
  },
  {
    icon: Star,
    title: "Host & Review",
    description: "Host an amazing event with your speaker. Share your experience to help others make informed decisions.",
    step: "04",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container-tight">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-foreground mb-4">How BookMyGuest Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Book your perfect speaker in 4 simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="relative group">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-border" />
                )}

                <div className="relative bg-card rounded-2xl p-6 border border-border hover:border-primary/50 hover:shadow-card-hover transition-all duration-300">
                  {/* Step Number */}
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
