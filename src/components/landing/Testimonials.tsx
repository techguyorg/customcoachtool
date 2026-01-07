import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Online Fitness Coach",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    content: "CustomCoachPro transformed my coaching business. I went from managing 15 clients in spreadsheets to 80+ with less admin work. The check-in automation alone saves me 10 hours a week.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Strength & Conditioning Coach",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    content: "The workout builder is incredible. I can create complex periodized programs in minutes and my clients love the exercise video demonstrations. Best investment for my coaching career.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Nutrition Coach",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    content: "Finally, a platform that takes nutrition seriously! The meal planning tools and macro tracking help me deliver results my clients can see. My retention rate has doubled since switching.",
    rating: 5,
  },
  {
    name: "James Chen",
    role: "Gym Owner",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    content: "We have 8 coaches using CustomCoachPro and the admin dashboard gives me complete visibility. The analytics help us identify which programs are most effective for our members.",
    rating: 5,
  },
  {
    name: "Lisa Thompson",
    role: "Wellness Coach",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    content: "The client communication features are seamless. In-app messaging with progress photo sharing makes it easy to stay connected and keep my clients motivated throughout their journey.",
    rating: 5,
  },
  {
    name: "David Park",
    role: "CrossFit Coach",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    content: "I was skeptical about switching platforms, but CustomCoachPro exceeded expectations. The exercise database has everything I need and the support team is incredibly responsive.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-card/30" id="testimonials">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Loved by{" "}
            <span className="text-gradient-primary">Coaches Worldwide</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of fitness professionals who trust CustomCoachPro 
            to grow their coaching business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-6 relative z-10">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
