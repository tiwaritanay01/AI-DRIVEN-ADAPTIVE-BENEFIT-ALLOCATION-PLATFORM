import { Bell, Moon, Sun, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { adminItems, citizenItems, type UserRole } from "./Sidebar";
import { useEffect, useState } from "react";

interface TopBarProps {
  onMenuClick?: () => void;
}

const TopBar = ({ onMenuClick }: TopBarProps) => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const role = (localStorage.getItem("userRole") as UserRole) || "citizen";
  const navItems = role === "admin" ? adminItems : citizenItems;
  const currentNav = navItems.find(i => location.pathname === i.path || (location.pathname.startsWith(i.path) && i.path !== "/")) || navItems[0];
  
  return (
    <div className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-slate-600 hover:text-indigo-gov hover:bg-slate-100"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest overflow-hidden whitespace-nowrap">
          <span className="text-slate-400 hidden sm:inline">⌂ PORTAL HOME</span>
          <span className="text-indigo-gov truncate">{currentNav.label}</span>
        </div>
      </div>

      {/* Utility Icons */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-slate-50 border-slate-200 text-slate-600 hover:text-indigo-gov hover:bg-slate-100"
          onClick={() => setIsDark(!isDark)}
        >
          {isDark ? <Sun className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <Moon className="h-3.5 w-3.5 md:h-4 md:w-4" />}
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-slate-50 border-slate-200 text-slate-600 hover:text-indigo-gov hover:bg-slate-100 relative">
          <Bell className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2.5 w-1.5 h-1.5 rounded-full bg-gov-saffron border border-white" />
        </Button>
        <Button variant="default" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-indigo-gov hover:bg-indigo-gov/90 text-white">
          <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TopBar;
