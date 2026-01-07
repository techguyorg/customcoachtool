import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    description: "For fitness enthusiasts tracking their journey",
    price: 0,
    features: [
      "Workout logging & history",
      "Progress tracking & stats",
      "Exercise library access",
      "Browse free workout plans",
      "Browse free nutrition plans",
      "Basic goal setting",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    description: "For serious athletes and coached clients",
    price: 9,
    features: [
      "Everything in Free",
      "Unlimited progress photos",
      "Advanced analytics",
      "Coach integration",
      "Custom plan creation",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Coach",
    description: "For fitness professionals",
    price: 49,
    features: [
      "Everything in Pro",
      "Manage unlimited clients",
      "Create & assign plans",
      "Automated check-ins",
      "Business analytics",
      "White-label options",
      "Dedicated support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section className="py-24 relative" id="pricing">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Plans for{" "}
            <span className="text-gradient-primary">Everyone</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Start free and upgrade as you grow. Whether you're tracking solo or 
            managing a coaching business, we have a plan for you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                plan.popular
                  ? "bg-gradient-to-b from-primary/10 to-card border-primary/50 shadow-lg shadow-primary/10"
                  : "bg-card border-border/50 hover:border-primary/30"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-primary rounded-full">
                  <span className="text-sm font-semibold text-primary-foreground flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/signup">
                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
