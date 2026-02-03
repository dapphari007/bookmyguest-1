import { Link } from "react-router-dom";
import { Mic2, Laugh, Briefcase, Cpu, GraduationCap, Music } from "lucide-react";

const categories = [
  {
    id: "motivational",
    name: "Motivation",
    description: "Inspirational speakers",
    icon: Mic2,
    color: "bg-primary/10 text-primary",
    count: 120,
  },
  {
    id: "comedy",
    name: "Comedy",
    description: "Stand-up comedians",
    icon: Laugh,
    color: "bg-accent/10 text-accent",
    count: 85,
  },
  {
    id: "business",
    name: "Business",
    description: "Corporate leaders",
    icon: Briefcase,
    color: "bg-success/10 text-success",
    count: 95,
  },
  {
    id: "technology",
    name: "Tech",
    description: "Technology experts",
    icon: Cpu,
    color: "bg-primary/10 text-primary",
    count: 78,
  },
  {
    id: "education",
    name: "Education",
    description: "Academic speakers",
    icon: GraduationCap,
    color: "bg-accent/10 text-accent",
    count: 65,
  },
  {
    id: "entertainment",
    name: "Entertain",
    description: "Artists & Performers",
    icon: Music,
    color: "bg-success/10 text-success",
    count: 110,
  },
];

const CategoriesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container-tight">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-foreground mb-4">Popular Categories</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover speakers across various categories for your next event
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                to={`/speakers?category=${category.id}`}
                className="group bg-card rounded-xl p-6 text-center hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-border"
              >
                <div
                  className={`w-14 h-14 rounded-xl ${category.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
                <div className="mt-3 text-xs text-primary font-medium">
                  {category.count} speakers
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
