import { Activity } from 'lucide-react';
import { LogEntry } from '@/lib/api';

interface SystemLogsProps {
  logs: LogEntry[];
}

const SystemLogs = ({ logs }: SystemLogsProps) => (
  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 font-mono text-xs h-full">
    <div className="flex items-center gap-2 mb-3 text-cyan-400">
      <Activity size={14} className="animate-pulse" strokeWidth={2.5} />
      <span className="uppercase tracking-widest font-black">Live AI Processing Feed</span>
    </div>
    <div className="space-y-3 overflow-y-auto custom-scrollbar max-h-[350px] pr-2">
      {logs.length === 0 ? (
        <div className="text-slate-600 italic py-4 text-center">Awaiting data highway stream...</div>
      ) : (
        logs.map((log, i) => (
          <div key={i} className="border-l-2 border-slate-700 pl-3 py-1 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-cyan-500/70 font-bold">[{log.time}]</span>
              <div className="h-1 w-1 bg-slate-600 rounded-full" />
              <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Event-0{i+1}</span>
            </div>
            <div className="text-slate-300 leading-relaxed font-medium">
              {log.message}
            </div>
          </div>
        ))
      )}
    </div>
    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
       <span>Status: Connected</span>
       <span>Node: India-West-09</span>
    </div>
  </div>
);

export default SystemLogs;
