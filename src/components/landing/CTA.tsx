import { Button } from "@/components/ui/button";
import { ArrowRight, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Dumbbell className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Start your fitness journey today</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ready to{" "}
            <span className="text-gradient-primary">Transform Your Fitness?</span>
          </h2>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join 500,000+ users who track their progress, follow personalized plans, 
            and achieve their fitness goals with CustomCoachPro.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button variant="hero" size="xl">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="heroOutline" size="xl">
                Sign In
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Free forever • No credit card required • Upgrade anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
