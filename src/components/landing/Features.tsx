import { 
  TrendingUp, 
  Dumbbell, 
  Apple, 
  ClipboardCheck, 
  BarChart3, 
  Users,
  Target,
  Camera,
  Search
} from "lucide-react";

const features = [
  {
    icon: Dumbbell,
    title: "Exercise Library",
    description: "Access 1000+ exercises with video demonstrations. Search, filter, and learn proper form.",
    color: "text-primary",
    bgColor: "bg-primary/10",
    forWho: "Everyone",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Log workouts, track weight, measurements, and see your progress visualized over time.",
    color: "text-info",
    bgColor: "bg-info/10",
    forWho: "Everyone",
  },
  {
    icon: Apple,
    title: "Nutrition Plans",
    description: "Browse meal plans, track macros, and access our comprehensive food database.",
    color: "text-success",
    bgColor: "bg-success/10",
    forWho: "Everyone",
  },
  {
    icon: Search,
    title: "Discover Plans",
    description: "Explore free workout and diet plans created by the community and certified coaches.",
    color: "text-accent",
    bgColor: "bg-accent/10",
    forWho: "Everyone",
  },
  {
    icon: Target,
    title: "Goal Setting",
    description: "Set fitness goals, track milestones, and celebrate achievements along your journey.",
    color: "text-warning",
    bgColor: "bg-warning/10",
    forWho: "Everyone",
  },
  {
    icon: Camera,
    title: "Progress Photos",
    description: "Document your transformation with secure progress photo uploads and comparisons.",
    color: "text-primary",
    bgColor: "bg-primary/10",
    forWho: "Everyone",
  },
  {
    icon: Users,
    title: "Client Management",
    description: "Coaches: Manage unlimited clients with detailed profiles and progress tracking.",
    color: "text-info",
    bgColor: "bg-info/10",
    forWho: "Coaches",
  },
  {
    icon: ClipboardCheck,
    title: "Smart Check-ins",
    description: "Automated client check-ins with progress photos, measurements, and wellness questionnaires.",
    color: "text-success",
    bgColor: "bg-success/10",
    forWho: "Coaches & Clients",
  },
  {
    icon: BarChart3,
    title: "Business Analytics",
    description: "Track client adherence, retention, revenue, and grow your coaching business.",
    color: "text-accent",
    bgColor: "bg-accent/10",
    forWho: "Coaches",
  },
];

const Features = () => {
  return (
    <section className="py-24 relative overflow-hidden" id="features">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
      
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Built for{" "}
            <span className="text-gradient-primary">Your Fitness Journey</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Whether you're tracking solo, training with a coach, or running a coaching business — 
            we've got the tools you need.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* For Who Badge */}
              <div className="absolute top-4 right-4">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  feature.forWho === "Everyone" 
                    ? "bg-primary/10 text-primary" 
                    : feature.forWho === "Coaches"
                    ? "bg-info/10 text-info"
                    : "bg-success/10 text-success"
                }`}>
                  {feature.forWho}
                </span>
              </div>

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>

              {/* Hover gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
