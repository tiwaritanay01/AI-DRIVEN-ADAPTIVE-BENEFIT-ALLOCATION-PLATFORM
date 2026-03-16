import { motion } from "framer-motion";
import { FileInput, Brain, Bot, MessageSquare, Zap } from "lucide-react";
import { phaseNames, phaseDescriptions, type PipelinePhase } from "@/data/mockData";

const phaseIcons: Record<PipelinePhase, React.ElementType> = {
  1: FileInput,
  2: Brain,
  3: Bot,
  4: MessageSquare,
  5: Zap,
};

const phaseColorClasses: Record<PipelinePhase, string> = {
  1: "from-blue-500 to-blue-600",
  2: "from-purple-500 to-purple-600",
  3: "from-amber-500 to-amber-600",
  4: "from-rose-500 to-rose-600",
  5: "from-emerald-500 to-emerald-600",
};

interface PipelineVisualProps {
  activePhase?: PipelinePhase;
  counts?: Record<PipelinePhase, number>;
  compact?: boolean;
}

const PipelineVisual = ({ activePhase, counts, compact }: PipelineVisualProps) => {
  const phases: PipelinePhase[] = [1, 2, 3, 4, 5];

  return (
    <div className="w-full">
      <div className={`flex ${compact ? "gap-1" : "gap-2 md:gap-4"} items-center flex-wrap md:flex-nowrap justify-center`}>
        {phases.map((phase, idx) => {
          const Icon = phaseIcons[phase];
          const isActive = activePhase === phase;
          return (
            <div key={phase} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative flex flex-col items-center ${compact ? "p-2" : "p-3 md:p-4"} rounded-xl bg-gradient-to-br ${phaseColorClasses[phase]} text-white shadow-lg ${
                  isActive ? "ring-4 ring-white/50 scale-105" : ""
                } ${compact ? "min-w-[80px]" : "min-w-[120px] md:min-w-[140px]"}`}
              >
                <Icon className={compact ? "h-5 w-5 mb-1" : "h-6 w-6 md:h-8 md:w-8 mb-2"} />
                <span className={`font-bold ${compact ? "text-[10px]" : "text-xs md:text-sm"} text-center leading-tight`}>
                  Phase {phase}
                </span>
                {!compact && (
                  <span className="text-[10px] md:text-xs text-white/80 text-center mt-1 leading-tight">
                    {phaseNames[phase]}
                  </span>
                )}
                {counts && (
                  <span className={`mt-1 ${compact ? "text-xs" : "text-sm"} font-bold bg-white/20 rounded-full px-2`}>
                    {counts[phase]}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute -bottom-1 w-3 h-3 bg-white rounded-full shadow"
                  />
                )}
              </motion.div>
              {idx < phases.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: idx * 0.1 + 0.05 }}
                  className={`${compact ? "w-4 md:w-6" : "w-6 md:w-12"} h-1 bg-gradient-to-r from-white/40 to-white/20 rounded mx-1`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineVisual;
