import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Alex Rivera",
    role: "Fitness Enthusiast",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    content: "I just wanted to track my workouts and progress. CustomCoachPro makes it so easy to log everything and actually see my gains over time. The exercise library is amazing!",
    rating: 5,
  },
  {
    name: "Sarah Mitchell",
    role: "Online Fitness Coach",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    content: "Managing 80+ clients used to be a nightmare. Now I can create plans, track everyone's progress, and handle check-ins all in one place. Game changer for my business.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Client with Coach",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    content: "My coach assigns me workouts and meal plans through the app. I love seeing my progress charts and being able to easily check in with photos. Lost 30lbs so far!",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Nutrition Coach",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    content: "The nutrition planning tools are comprehensive. My clients love tracking their macros and seeing how their diet aligns with their goals. Retention rate doubled.",
    rating: 5,
  },
  {
    name: "James Chen",
    role: "Self-Coached Athlete",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    content: "I browse the free workout plans and use the exercise database to build my own routines. It's like having a coach in my pocket without the monthly fee.",
    rating: 5,
  },
  {
    name: "Lisa Thompson",
    role: "Gym Owner",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    content: "All 8 of our coaches use CustomCoachPro. The admin dashboard gives complete visibility into client progress and coach performance. Essential for scaling.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-card/30" id="testimonials">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Trusted by{" "}
            <span className="text-gradient-primary">Fitness Enthusiasts</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            From solo gym-goers to professional coaches — see how CustomCoachPro 
            helps everyone achieve their fitness goals.
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
