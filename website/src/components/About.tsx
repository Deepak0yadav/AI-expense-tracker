import { Brain, TrendingUp, Shield } from "lucide-react";

const About = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Smart Finance Management
            <br />
            <span className="text-gradient">Powered by AI</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            FinGenius uses cutting-edge artificial intelligence to automatically categorize your expenses, 
            provide intelligent insights, and help you make smarter financial decisions. Say goodbye to 
            manual tracking and hello to effortless budgeting.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "AI-Powered Intelligence",
              description: "Our smart AI learns your spending patterns and automatically categorizes transactions with incredible accuracy."
            },
            {
              icon: TrendingUp,
              title: "Actionable Insights",
              description: "Get personalized recommendations and insights that help you save money and reach your financial goals faster."
            },
            {
              icon: Shield,
              title: "Secure & Private",
              description: "Your financial data is encrypted and protected with bank-level security. Your privacy is our priority."
            }
          ].map((item, index) => (
            <div 
              key={index} 
              className="glass-card p-8 rounded-2xl hover:border-primary/40 transition-all group hover:scale-105"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-6 inline-flex p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
