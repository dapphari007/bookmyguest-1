import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    content:
      "BookMyGuest made finding the perfect speaker for our annual fest incredibly easy. The booking process was seamless, and the speaker exceeded our expectations!",
    author: "Ananya Reddy",
    role: "Event Coordinator, IIT Delhi",
    rating: 5,
  },
  {
    id: 2,
    content:
      "As a corporate L&D manager, I've booked multiple speakers through BookMyGuest. The quality of speakers and the platform's reliability are unmatched.",
    author: "Rahul Kapoor",
    role: "L&D Manager, Infosys",
    rating: 5,
  },
  {
    id: 3,
    content:
      "Joining BookMyGuest as a speaker has transformed my career. I've received quality bookings and the payment process is smooth and secure.",
    author: "Dr. Kavitha Menon",
    role: "Motivational Speaker",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container-tight">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-foreground mb-4">What Our Users Say</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Trusted by thousands of event organizers and speakers across India
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-2xl p-8 border border-border hover:shadow-card-hover transition-all duration-300"
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-primary/20 mb-4" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-accent text-accent"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div>
                <div className="font-semibold text-foreground">
                  {testimonial.author}
                </div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
