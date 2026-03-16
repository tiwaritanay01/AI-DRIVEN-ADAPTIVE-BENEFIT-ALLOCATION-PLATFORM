import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Home, LayoutDashboard, FileText, Search, Activity, LogOut, X, Landmark, ShieldCheck, Map, History } from "lucide-react";

export type UserRole = "admin" | "citizen" | null;

export const adminItems = [
  { label: "ADMIN DASHBOARD", path: "/admin", icon: LayoutDashboard },
  { label: "SERVICES MANAGEMENT", path: "/services", icon: FileText },
  { label: "AUDIT LOGS", path: "/audit-logs", icon: ShieldCheck },
  { label: "SYSTEM ANALYTICS", path: "/admin", icon: History },
];

export const citizenItems = [
  { label: "PORTAL HOME", path: "/dashboard", icon: Home },
  { label: "SUBMIT REQUEST", path: "/submit", icon: Activity },
  { label: "TRACK APPLICATION", path: "/track", icon: Search },
  { label: "SERVICES MAP", path: "/services", icon: Map },
];

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

const Sidebar = ({ mobileOpen, setMobileOpen }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = (localStorage.getItem("userRole") as UserRole) || "citizen";

  const navItems = role === "admin" ? adminItems : citizenItems;

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    toast.info("Logged out successfully");
    navigate("/login");
  };

  const SidebarContent = (
    <>
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen?.(false)}>
          <div className="w-8 h-8 rounded bg-gov-navy flex items-center justify-center">
            <Landmark className="text-white h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-black text-gov-navy dark:text-white tracking-tight leading-tight uppercase">India Benefit</h1>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium tracking-widest uppercase">Government Portal</p>
          </div>
        </Link>
        {/* Mobile Close Button */}
        <button 
          className="md:hidden text-slate-500 hover:text-gov-navy dark:text-slate-400 dark:hover:text-white"
          onClick={() => setMobileOpen?.(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== "/");
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen?.(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 relative hover:translate-x-1 ${
                isActive
                  ? "bg-gov-saffron/10 text-gov-saffron font-bold dark:bg-india-saffron/20 dark:text-india-saffron"
                  : "text-slate-600 hover:bg-slate-100 font-medium hover:text-gov-navy dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-gov-saffron dark:text-india-saffron" : "text-slate-400 dark:text-slate-500"}`} />
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute right-3 w-1.5 h-1.5 rounded-full bg-gov-saffron hidden md:block"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Status & Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="bg-slate-100 dark:bg-slate-800/80 rounded-lg p-3 mb-4 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase mb-2">SYSTEM INTEGRITY</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Secure Gov Node</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-200/50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md transition-colors uppercase tracking-wider"
        >
          <LogOut className="h-3.5 w-3.5" />
          EXIT ACCOUNT
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col h-screen fixed top-0 left-0 z-40 transition-colors">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen?.(false)}
              className="fixed inset-0 bg-gov-navy/60 backdrop-blur-sm z-40 md:hidden"
            />
            {/* Mobile Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 w-64 h-screen bg-slate-50 dark:bg-slate-900 z-50 flex flex-col md:hidden shadow-2xl"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
