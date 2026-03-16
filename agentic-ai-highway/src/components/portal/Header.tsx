import { Search, Globe, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
    __googleTranslateLoaded?: boolean;
  }
}

const Header = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Services", path: "/services" },
    { label: "Submit Application", path: "/submit" },
    { label: "Track Application", path: "/track" },
    { label: "Admin Dashboard", path: "/admin" },
  ];

  useEffect(() => {
    const runInit = () => {
      if (window.google && window.google.translate && !window.__googleTranslateLoaded) {
        try {
          if (document.getElementById("google_translate_element")) {
            new window.google.translate.TranslateElement(
              { pageLanguage: "en", includedLanguages: "en,hi,mr", autoDisplay: false },
              "google_translate_element"
            );
            window.__googleTranslateLoaded = true;
          }
        } catch (e) {
          console.error("Translate init failed", e);
        }
      }
    };

    window.googleTranslateElementInit = runInit;
    
    // Check if script already loaded but Header wasn't mount
    if (window.google && window.google.translate) {
      runInit();
    }
  }, []);

  return (
    <>
      <header className="w-full sticky top-0 z-50">
        {/* Top saffron band */}
        <div className="h-1 saffron-gradient" />

        {/* Main header */}
        <div className="gov-gradient text-primary-foreground">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo & Title */}
              <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="Go to homepage">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center border-2 border-gov-saffron">
                  <span className="text-xl md:text-2xl">🏛️</span>
                </div>
                <div>
                  <h1 className="text-base md:text-xl font-bold leading-tight">
                    Government of India
                  </h1>
                  <p className="text-[10px] md:text-xs text-white/70">National Portal • AI-Powered Services</p>
                </div>
              </Link>

              {/* Search */}
              <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" aria-hidden="true" />
                  <Input
                    placeholder="Search services..."
                    className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-gov-saffron"
                    aria-label="Search services"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-2 py-1 bg-white/10 rounded-lg border border-white/20">
                  <Globe className="h-3 w-3 text-gov-saffron" />
                  <div id="google_translate_element" className="google-translate-container" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileOpen}
                >
                  {mobileOpen ? <X /> : <Menu />}
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Navigation bar */}
          <nav className="hidden md:block border-t border-white/10 bg-white/5 backdrop-blur-xl" role="navigation" aria-label="Main navigation">
            <div className="container mx-auto px-4">
              <ul className="flex flex-row items-center gap-0">
                {navItems.map((item) => (
                  <li key={item.path} className="relative">
                    <Link
                      to={item.path}
                      className={`block px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 ${
                        location.pathname === item.path
                          ? "text-gov-saffron"
                          : "text-white/90"
                      }`}
                      aria-current={location.pathname === item.path ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                    {location.pathname === item.path && (
                      <motion.div
                        layoutId="nav-active-indicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-gov-saffron rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        {/* Green bottom band */}
        <div className="h-0.5 bg-gov-green" />
      </header>

      {/* Mobile slide-in drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.nav
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 w-[280px] h-full bg-gov-navy z-50 shadow-2xl md:hidden overflow-y-auto"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏛️</span>
                    <span className="text-white font-bold text-sm">Gov Portal</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/80 hover:text-white hover:bg-white/10"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Mobile search */}
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" aria-hidden="true" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm"
                    aria-label="Search services"
                  />
                </div>
              </div>

              <ul className="py-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                        location.pathname === item.path
                          ? "bg-white/10 text-gov-saffron border-l-2 border-gov-saffron"
                          : "text-white/80 hover:bg-white/5 hover:text-white"
                      }`}
                      aria-current={location.pathname === item.path ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                <div className="px-4 py-2">
                  <div id="google_translate_element_mobile" />
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
