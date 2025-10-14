import React from "react";
import { Mail } from "lucide-react";

const Contact = () => {
  return (
    <section
      id="contact"
      className="py-24 px-4 relative bg-gradient-to-b from-background via-background to-card"
    >
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Get in Touch
            <br />
            <span className="text-gradient">We'd Love to Hear From You</span>
          </h2>
          <p className="text-lg text-foreground/90 max-w-2xl mx-auto">
            Have questions, feedback, or suggestions? Fill out the form below or reach us via email.
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl max-w-2xl mx-auto shadow-lg border border-border/20 bg-background/80 backdrop-blur-lg">
          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your Name"
              className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background/90 text-black"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background/90 text-foreground"
            />
            <textarea
              placeholder="Your Message"
              className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-background/90 text-foreground"
              rows={5}
            />
            <button
              type="submit"
              className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-secondary text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg"
            >
              <Mail className="w-5 h-5" />
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Background Gradient Blur */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-3xl" />
      </div>
    </section>
  );
};

export default Contact;
