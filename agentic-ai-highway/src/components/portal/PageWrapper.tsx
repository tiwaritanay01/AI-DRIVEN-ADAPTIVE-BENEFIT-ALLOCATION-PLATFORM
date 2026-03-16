import { motion } from "framer-motion";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

const PageWrapper = ({ children, className = "", label }: PageWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`grid-bg min-h-screen ${className}`}
      role="main"
      aria-label={label || "Page content"}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
