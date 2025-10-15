import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Features from "@/components/Features";
import Comparison from "@/components/Comparison";
import Download from "@/components/Download";
import Contact from "@/components/Contact";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
// import Footer from "@/components/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // When arriving at /#section from another route, scroll to the element
    const handle = () => {
      const hash = location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    // Delay to ensure sections are mounted
    const raf = requestAnimationFrame(handle);
    return () => cancelAnimationFrame(raf);
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      <Navbar />
      <Hero />
      <About />
  <Features />
  <Comparison />
      <Download />
      <Contact />
      {/* <Footer /> */}
    </div>
  );
};

export default Index;
