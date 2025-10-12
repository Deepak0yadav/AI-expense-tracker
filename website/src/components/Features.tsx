import { Sparkles, BarChart3, Mic, Cloud } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Smart AI Categorization",
      description: "Automatically categorize your expenses with machine learning. No manual tagging required.",
      color: "from-primary to-accent"
    },
    {
      icon: BarChart3,
      title: "Daily/Monthly Analytics",
      description: "Beautiful charts and insights that help you understand your spending patterns at a glance.",
      color: "from-secondary to-primary"
    },
    {
      icon: Mic,
      title: "Voice Input",
      description: "Add expenses hands-free with voice commands. Quick, easy, and on-the-go friendly.",
      color: "from-accent to-secondary"
    },
    {
      icon: Cloud,
      title: "Secure Cloud Sync",
      description: "Your data syncs seamlessly across all devices with bank-grade encryption.",
      color: "from-primary to-secondary"
    }
  ];

  return (
    <section id="features" className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful Features
            <br />
            <span className="text-gradient">Built for You</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to take control of your finances, all in one beautiful app.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card p-6 rounded-2xl hover:border-primary/40 transition-all group cursor-pointer hover:scale-105"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`mb-6 inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} bg-opacity-10`}>
                <feature.icon className="w-8 h-8 text-foreground group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Feature highlight grid */}
        <div className="mt-20 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex px-4 py-2 rounded-full glass-card border border-accent/20">
              <span className="text-sm text-accent">Why Choose FinGenius?</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold">
              Your Personal
              <br />
              <span className="text-gradient">Finance Assistant</span>
            </h3>
            <p className="text-muted-foreground text-lg">
              FinGenius doesn't just track your expenses—it understands them. With powerful AI 
              and intuitive design, managing your money has never been easier or more insightful.
            </p>
            <ul className="space-y-4">
              {[
                "Zero manual data entry required",
                "Real-time expense tracking",
                "Smart budget recommendations",
                "Multi-currency support"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent glow-accent" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
            <div className="relative glass-card p-8 rounded-3xl">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <Sparkles className="w-24 h-24 text-primary animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
