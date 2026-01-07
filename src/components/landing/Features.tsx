import { 
  Users, 
  Dumbbell, 
  Apple, 
  ClipboardCheck, 
  BarChart3, 
  Calendar,
  MessageSquare,
  Shield,
  Zap
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Client Management",
    description: "Manage unlimited clients with detailed profiles, progress tracking, and communication tools.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Dumbbell,
    title: "Workout Builder",
    description: "Create custom workout plans from our 1000+ exercise database with video demonstrations.",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    icon: Apple,
    title: "Nutrition Planning",
    description: "Design personalized meal plans with macro tracking and our comprehensive food database.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: ClipboardCheck,
    title: "Check-in System",
    description: "Automated check-ins with progress photos, measurements, and wellness questionnaires.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track adherence, progress metrics, and client engagement with beautiful dashboards.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Integrated calendar for sessions, automated reminders, and timezone-aware scheduling.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: MessageSquare,
    title: "In-App Messaging",
    description: "Real-time chat with clients, file sharing, and voice notes for seamless communication.",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Multi-level permissions for admins, coaches, and clients with secure data handling.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Zap,
    title: "Automation Tools",
    description: "Automate repetitive tasks, schedule reminders, and streamline your coaching workflow.",
    color: "text-accent",
    bgColor: "bg-accent/10",
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
            Everything You Need to{" "}
            <span className="text-gradient-primary">Scale Your Coaching</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Powerful features designed by coaches, for coaches. 
            Manage your entire business from one intuitive platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
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
