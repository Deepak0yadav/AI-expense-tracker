import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, X, Smartphone, Star, Download, Mail } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home", icon: null },
    { name: "Features", href: "#features", icon: Star },
    { name: "Download", href: "#download", icon: Smartphone },
    { name: "FAQ", href: "/faq", icon: null },
    { name: "Contact", href: "#contact", icon: Mail },
  ];

  const scrollToSection = (href: string) => {
    const sectionId = href.replace("#", "");
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else if (sectionId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => scrollToSection("#home")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">FG</span>
              </div>
              <span className="text-xl font-bold">
                <span className="text-gradient">FinGenius</span>
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() =>
                    link.href.startsWith("#")
                      ? scrollToSection(link.href)
                      : (window.location.href = link.href)
                  }
                  className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary/10"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:block">
            <Button
              onClick={() => scrollToSection("#download")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 glow-primary transition-all hover:scale-105"
            >
              <Download className="w-4 h-4 mr-2" />
              Get App
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">FG</span>
                      </div>
                      <span className="text-xl font-bold">
                        <span className="text-gradient">FinGenius</span>
                      </span>
                    </div>
                    <SheetClose asChild>
                      <Button variant="ghost" size="sm" className="p-2">
                        <X className="w-5 h-5" />
                      </Button>
                    </SheetClose>
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="flex-1 py-6">
                    <div className="space-y-2">
                      {navLinks.map((link) => (
                        <button
                          key={link.name}
                          onClick={() =>
                            link.href.startsWith("#")
                              ? scrollToSection(link.href)
                              : (window.location.href = link.href)
                          }
                          className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          {link.icon && <link.icon className="w-5 h-5" />}
                          <span className="font-medium">{link.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mobile CTA Button */}
                  <div className="pt-4 border-t border-border/50">
                    <Button
                      onClick={() => scrollToSection("#download")}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 glow-primary transition-all hover:scale-105"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download App
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;