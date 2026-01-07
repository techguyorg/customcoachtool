import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Dumbbell, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-up">
            <Dumbbell className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Your Complete Fitness Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Your Fitness Journey,{" "}
            <span className="text-gradient-primary">Simplified</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Whether you're tracking your own progress, following a coach, or 
            building a coaching business — CustomCoachPro has everything you need 
            to achieve your fitness goals.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/signup">
              <Button variant="hero" size="xl">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="heroOutline" size="xl">
              <Play className="w-5 h-5" />
              See How It Works
            </Button>
          </div>

          {/* Use Cases */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Track Your Progress</h3>
              <p className="text-sm text-muted-foreground">
                Log workouts, monitor stats, and visualize your fitness journey over time.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="inline-flex p-3 rounded-xl bg-info/10 mb-4">
                <Users className="w-6 h-6 text-info" />
              </div>
              <h3 className="font-semibold mb-2">Work With a Coach</h3>
              <p className="text-sm text-muted-foreground">
                Get personalized plans, check-ins, and guidance from certified professionals.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="inline-flex p-3 rounded-xl bg-success/10 mb-4">
                <Dumbbell className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Build Your Business</h3>
              <p className="text-sm text-muted-foreground">
                Coaches: manage clients, create plans, and grow your fitness business.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 max-w-4xl mx-auto animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
            {[
              { value: "500K+", label: "Active Users" },
              { value: "10K+", label: "Fitness Coaches" },
              { value: "5M+", label: "Workouts Logged" },
              { value: "98%", label: "Goal Achievement" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
