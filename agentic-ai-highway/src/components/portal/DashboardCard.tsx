import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title?: string;
  icon?: LucideIcon;
  headerAction?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
  noPadding?: boolean;
}

const DashboardCard = ({
  title,
  icon: Icon,
  headerAction,
  className,
  contentClassName,
  children,
  noPadding,
}: DashboardCardProps) => {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card
        className={cn(
          "rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-border/50 overflow-hidden",
          className
        )}
      >
        {title && (
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                {Icon && (
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                )}
                {title}
              </CardTitle>
              {headerAction}
            </div>
          </CardHeader>
        )}
        <CardContent className={cn(noPadding ? "p-0" : "", contentClassName)}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardCard;
