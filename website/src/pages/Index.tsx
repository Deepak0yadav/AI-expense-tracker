import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Features from "@/components/Features";
import Download from "@/components/Download";
import Contact from "@/components/Contact";
// import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      <Navbar />
      <Hero />
      <About />
      <Features />
      <Download />
      <Contact />
      {/* <Footer /> */}
    </div>
  );
};

export default Index;
