import { Button } from "@/components/ui/button";
import { Download as DownloadIcon, Smartphone } from "lucide-react";
import screenshot1 from "@/assets/app-screenshot-1.png";
import screenshot2 from "@/assets/app-screenshot-2.png";

const Download = () => {
  return (
    <section id="download" className="py-24 px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
            <br />
            <span className="text-gradient">Download FinGenius Today</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Available for Android devices. Start tracking smarter in minutes.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Screenshots */}
          <div className="relative flex justify-center gap-4 lg:gap-8">
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl blur-2xl" />
              <img 
                src={screenshot1} 
                alt="FinGenius App Dashboard" 
                className="relative w-48 md:w-56 rounded-2xl shadow-2xl glass-card"
              />
            </div>
            <div className="relative animate-float" style={{ animationDelay: '1s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-primary/30 rounded-3xl blur-2xl" />
              <img 
                src={screenshot2} 
                alt="FinGenius Analytics" 
                className="relative w-48 md:w-56 rounded-2xl shadow-2xl glass-card mt-12"
              />
            </div>
          </div>

          {/* Download buttons */}
          <div className="space-y-8">
            <div className="glass-card p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Download Options</h3>
                  <p className="text-muted-foreground">Choose your preferred method</p>
                </div>
              </div>

              {/* Google Play Button */}
              <Button 
                className="w-full h-auto py-4 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl glow-primary transition-all hover:scale-105 group"
                size="lg"
              >
                <div className="flex items-center gap-4 w-full">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs opacity-90">GET IT ON</div>
                    <div className="text-lg font-bold">Google Play</div>
                  </div>
                </div>
              </Button>

              {/* Direct APK Download */}
              <Button 
                variant="outline"
                className="w-full h-auto py-4 px-6 glass-card border-primary/30 hover:border-primary/50 rounded-xl transition-all hover:scale-105 group"
                size="lg"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <DownloadIcon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-muted-foreground">DIRECT DOWNLOAD</div>
                    <div className="text-lg font-bold">Download APK</div>
                  </div>
                </div>
              </Button>

              <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Latest version: 2.1.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Size: 45 MB</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Requires Android 8.0 or higher</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Download;
