import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, SearchX, Frown } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden px-4">
      {/* Animated gradient background matching the app theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />
      
      {/* Glowing orbs for ambiance */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float [animation-delay:2s]" />
      
      <div className="relative z-10 text-center max-w-2xl mx-auto animate-fade-in">
        {/* Glass card container */}
        <div className="glass-card p-8 md:p-12 rounded-3xl space-y-6">
          {/* Sad illustration using icons */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl" />
              <div className="relative bg-card/50 p-8 rounded-full border-4 border-primary/20">
                <Frown className="w-20 h-20 md:w-24 md:h-24 text-accent animate-pulse" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* 404 heading */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold">
              <span className="text-gradient">404</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <SearchX className="w-5 h-5" />
              <span className="text-sm uppercase tracking-wider">Page Not Found</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto">
            Oops! The page you're looking for seems to have wandered off. 
            Let's get you back on track.
          </p>

          {/* Action button */}
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full glow-primary transition-all hover:scale-105"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;