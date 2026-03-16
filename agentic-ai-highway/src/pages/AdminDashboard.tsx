import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Map, LucideIcon, CheckCircle, AlertTriangle, Clock, Shield, BarChart, Brain, Zap, TrendingUp, TrendingDown, Loader2, RefreshCw, Sparkles, FileText, Activity, ShieldAlert, Info, BarChart3, Presentation, ListChecks, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import PipelineVisual from "@/components/portal/PipelineVisual";
import PageWrapper from "@/components/portal/PageWrapper";
import SystemLogs from "@/components/portal/SystemLogs";
import { phaseNames, type PipelinePhase } from "@/data/mockData";
import { getAllApplications, type Application, getSystemStatus, toggleCrisis, type SystemStatus, getSystemLogs, type LogEntry, getPriorityApplications, simulateDisaster, getExecutiveBriefing, toggleDistrictEmergency } from "@/lib/api";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-800",
  processing: "bg-blue-100 text-blue-800",
  pending: "bg-gray-100 text-gray-800",
  failed: "bg-red-100 text-red-800",
};

const priorityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

// Map backend ai_priority to phase-like bucket (1=critical→phase1, etc.)
function appToPhase(app: Application): PipelinePhase {
  if (app.status.toLowerCase().includes("approved") || app.status.toLowerCase().includes("verified")) return 5;
  if (app.status.toLowerCase().includes("review") || app.status.toLowerCase().includes("flagged")) return 4;
  if (app.status.toLowerCase().includes("in review")) return 3;
  if (app.is_verified === "Verified") return 5;
  return 2;
}

const AdminDashboard = () => {
  const [classifyInput, setClassifyInput] = useState("");
  const [classifyResult, setClassifyResult] = useState<{ department: string; priority: string; reasoning: string } | null>(null);
  const [classifying, setClassifying] = useState(false);

  // ── Real data from backend ──────────────────────
  const [applications, setApplications] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appsError, setAppsError] = useState<string | null>(null);

  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [togglingCrisis, setTogglingCrisis] = useState(false);
  const [systemLogs, setSystemLogs] = useState<LogEntry[]>([]);
  
  const [disasterLoading, setDisasterLoading] = useState(false);
  const [briefingModalOpen, setBriefingModalOpen] = useState(false);
  const [briefingContent, setBriefingContent] = useState("");
  const [briefingLoading, setBriefingLoading] = useState(false);

  const fetchApps = async () => {
    setAppsLoading(true);
    setAppsError(null);
    try {
      const data = await getAllApplications();
      setApplications(data);
      const status = await getSystemStatus();
      setSystemStatus(status);
    } catch {
      setAppsError("Could not connect to backend. Start the FastAPI server on port 8001.");
    } finally {
      setAppsLoading(false);
    }
  };

  const handleToggleCrisis = async () => {
    if (!systemStatus) return;
    setTogglingCrisis(true);
    try {
      const newStatus = !systemStatus.crisis_mode;
      await toggleCrisis(newStatus);
      setSystemStatus({...systemStatus, crisis_mode: newStatus});
      toast.success(`District Crisis Mode: ${newStatus ? 'ENABLED' : 'DISABLED'}`);
      fetchApps(); // Refresh scores
    } catch {
      toast.error("Failed to update system state");
    } finally {
      setTogglingCrisis(false);
    }
  };

  const handleToggleDistrictEmergency = async (district: string) => {
    if (!systemStatus) return;
    const current = !!systemStatus?.district_emergencies?.[district];
    try {
      await toggleDistrictEmergency(district, !current);
      fetchApps();
      toast.success(`${district} emergency mode ${!current ? 'ENABLED' : 'DISABLED'}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update district state");
    }
  };

  useEffect(() => { 
    fetchApps(); 
    const interval = setInterval(async () => {
      try {
        const [logs, status, apps] = await Promise.all([
          getSystemLogs(),
          getSystemStatus(),
          getAllApplications()
        ]);
        setSystemLogs(logs);
        setSystemStatus(status);
        setApplications(apps);
      } catch (err) {
        console.error("Failed to sync dashboard", err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateDisaster = async (val: string) => {
    setDisasterLoading(true);
    try {
      await simulateDisaster(val);
      toast.success(`${val} simulation active. Initializing real-time re-ranking.`);
      fetchApps();
    } catch {
      toast.error("Disaster simulation failed");
    } finally {
      setDisasterLoading(false);
    }
  };

  const handleGenerateBriefing = async () => {
    setBriefingLoading(true);
    setBriefingModalOpen(true);
    try {
      const data = await getExecutiveBriefing();
      setBriefingContent(data.summary);
    } catch {
      toast.error("Failed to generate AI briefing");
    } finally {
      setBriefingLoading(false);
    }
  };

  const phaseCounts: Record<PipelinePhase, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  applications.forEach(a => { phaseCounts[appToPhase(a)]++; });

  const totalSubmissions = applications.length;
  const verified = applications.filter(a => a.is_verified === "Verified").length;
  const flagged = applications.filter(a => a.is_verified === "Rejected").length;

  const handleClassify = () => {
    setClassifying(true);
    // Simulated AI classification (will be replaced with real AI via edge function)
    setTimeout(() => {
      const input = classifyInput.toLowerCase();
      let action = "Standard Review";
      let priority = "medium";
      let reasoning = "";

      if (input.includes("duplicate") || input.includes("fraud") || input.includes("fake")) {
        action = "Block Application"; priority = "critical";
        reasoning = "Anomaly detected: Patterns match known fraudulent submission vectors. Application halted for manual investigation.";
      } else if (input.includes("lost job") || input.includes("unemployed") || input.includes("closure")) {
        action = "Fast-track Subsidy"; priority = "high";
        reasoning = "High vulnerability flag triggered by recent unemployment dataset. Automatically matched with emergency relief funds.";
      } else if (input.includes("health") || input.includes("medical") || input.includes("surgery")) {
        action = "Health Scheme Routing"; priority = "high";
        reasoning = "Medical urgency detected. Routing to health department with high priority allocation for treatment subsidy.";
      } else {
        action = "Standard Processing"; priority = "low";
        reasoning = "No immediate economic triggers or fraud anomalies detected. Routing to standard verification queue.";
      }

      setClassifyResult({ department: action, priority, reasoning });
      setClassifying(false);
    }, 1500);
  };

  const kpiCards = [
    { label: "Total Applications", value: appsLoading ? "…" : String(totalSubmissions), icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+Live", trendUp: true },
    { label: "Verified Documents", value: appsLoading ? "…" : String(verified), icon: Shield, color: "text-blue-500", bg: "bg-blue-500/10", trend: "Live", trendUp: true },
    { label: "Flagged / Rejected", value: appsLoading ? "…" : String(flagged), icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", trend: "Live", trendUp: false },
    { label: "OCR Processed", value: appsLoading ? "…" : String(applications.filter(a => a.ocr_text && a.ocr_text.length > 10).length), icon: Sparkles, color: "text-rose-500", bg: "bg-rose-500/10", trend: "Live", trendUp: true },
  ];

  return (
    <div className="flex flex-col min-h-full bg-transparent">
      <PageWrapper label="Admin Command Dashboard">
        <main className="flex-1 w-full pb-6 container mx-auto px-4 mt-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <ShieldCheck className="h-8 w-8 text-indigo-gov dark:text-indigo-400" />
                  District Administration
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Live Sync</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">AI-driven real-time OCR/verification pipeline monitoring dashboard.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={handleGenerateBriefing}
                className="bg-indigo-gov hover:bg-blue-900 text-white font-bold h-9 px-4 rounded-lg shadow-sm"
              >
                <Presentation className="h-4 w-4 mr-2" />
                AI Briefing
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchApps}
                disabled={appsLoading}
                className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              >
                {appsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-1.5">Refresh</span>
               </Button>
            </div>
          </div>
          {appsError && (
            <div className="mb-4 flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {appsError}
            </div>
          )}
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpiCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -2 }}
              >
                <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{card.label}</p>
                        <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                        <div className={`flex items-center gap-1 text-[10px] font-bold ${card.trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {card.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {card.trend} this week
                        </div>
                      </div>
                      <div className={`p-2.5 rounded-xl ${card.bg} dark:opacity-80`}>
                        <card.icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Crisis Command Center - CORE PS REQUIREMENT */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <Card className={`border-2 transition-all duration-700 mb-8 overflow-hidden rounded-2xl ${systemStatus?.crisis_mode ? 'border-red-500 bg-red-50/20 shadow-[0_0_40px_rgba(239,68,68,0.15)] dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-800'}`}>
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
                <div className="flex-1 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-2xl ${systemStatus?.crisis_mode ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      {systemStatus?.crisis_mode ? <Zap className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Emergency Multiplier Center</h3>
                      <p className="text-sm text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Global adaptive scoring for immediate disaster response.</p>
                      <div className="mt-1 font-mono text-[9px] text-indigo-gov dark:text-indigo-400 font-bold bg-indigo-gov/5 px-2 py-0.5 rounded inline-flex items-center gap-1">
                        Logic: <span>V<sub>final</sub> = V<sub>base</sub> × 1.5</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Simulate District Disaster Trigger</label>
                    <Select onValueChange={handleSimulateDisaster} defaultValue={systemStatus?.disaster_type || "None"}>
                      <SelectTrigger className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 h-11 rounded-xl font-bold text-slate-700 dark:text-slate-200">
                        <SelectValue placeholder="Select Disaster Event" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                        <SelectItem value="None">None (Steady State)</SelectItem>
                        <SelectItem value="Flood">🌊 Flash Flood Emergency</SelectItem>
                        <SelectItem value="Economic Crash">📉 Regional Economic Crash</SelectItem>
                        <SelectItem value="Health Emergency">🏥 Pandemic/Health Crisis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                      Activating Crisis Mode applies a <strong>1.5x Multiplier</strong> (V<sub>final</sub> = V<sub>base</sub> × 1.5) to the Vulnerability Index of all applications in this district.
                    </p>
                    <div className="flex items-center gap-3">
                      <Button 
                        onClick={handleToggleCrisis}
                        disabled={togglingCrisis}
                        variant={systemStatus?.crisis_mode ? "destructive" : "outline"}
                        className="font-black tracking-widest uppercase text-xs h-12 px-8 rounded-xl shadow-md transition-all active:scale-95"
                      >
                        {togglingCrisis && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        {systemStatus?.crisis_mode ? "Terminate Crisis Protocol" : "Initiate District Crisis Mode"}
                      </Button>
                      {systemStatus?.crisis_mode && (
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                          <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-tighter">Live Alert Active</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-80 p-6 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-center gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">Vulnerability Accuracy</label>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">98.4%</span>
                      <TrendingUp className="h-5 w-5 text-emerald-500 mb-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">Live Nodes Active</label>
                    <div className="flex gap-1">
                      {systemStatus?.nodes.map(n => (
                        <Badge key={n} variant="outline" className="text-[9px] bg-white dark:bg-slate-950 px-1.5 py-0 border-slate-200 dark:border-slate-800">{n}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>


          {/* Charts & Alerts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
              <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl h-full">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Map className="h-4 w-4 text-indigo-gov dark:text-indigo-400" /> District Vulnerability Heatmap
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    {[
                      { name: "Mumbai", score: 85, color: "bg-red-500" },
                      { name: "Thane", score: 45, color: "bg-orange-500" },
                      { name: "Pune", score: 65, color: "bg-rose-500" },
                      { name: "Nagpur", score: 30, color: "bg-emerald-500" }
                    ].map((d) => {
                      const isEmergency = !!systemStatus?.district_emergencies?.[d.name];
                      return (
                        <div key={d.name} className={`flex flex-col items-center gap-3 p-3 rounded-xl border transition-all ${isEmergency ? 'border-red-500 bg-red-50/30 animate-disaster-pulse' : 'border-slate-100 dark:border-slate-800'}`}>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden h-24">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${d.score}%` }}
                              className={`absolute bottom-0 w-full ${isEmergency ? 'bg-red-600' : d.color} transition-colors`}
                            />
                            <div className="absolute inset-x-0 bottom-1 text-center text-[10px] font-black text-white drop-shadow-md">
                              {d.score}%
                            </div>
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{d.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <SystemLogs logs={systemLogs} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl h-full">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <CardTitle className="text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-500" /> Active System Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 p-3 rounded-lg flex items-start gap-3">
                    <Shield className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-rose-800 dark:text-rose-400">Suspicious Batch Detected</p>
                      <p className="text-[10px] text-rose-600 dark:text-rose-300 mt-0.5">32 applications from similar IP blocked in Ward 4.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Pipeline visualization */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <CardContent className="pt-6 pb-6 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-center justify-between mb-4 px-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-gov dark:text-indigo-400">account_tree</span>
                    Live Pipeline Status
                  </h3>
                  <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">System Nominal</Badge>
                </div>
                <PipelineVisual counts={phaseCounts} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Real-time Audit Log Pipeline */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mb-8">
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden">
               <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                      <ListChecks className="h-4 w-4 text-indigo-600" /> Real-time Audit Log Pipeline
                    </CardTitle>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Live Transaction Stream • Priority Rank Sorting</p>
                  </div>
                  <Link to="/admin/audit">
                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700">View Full Audit</Button>
                  </Link>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="overflow-x-auto custom-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent bg-slate-50/40 dark:bg-slate-800/20">
                          <TableHead className="text-[10px] font-black uppercase text-center px-4 py-3">Timestamp</TableHead>
                          <TableHead className="text-[10px] font-black uppercase">User Name/ID</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-center">District</TableHead>
                          <TableHead className="text-[10px] font-black uppercase">Matched Schemes</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-right pr-6">Priority Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.length === 0 ? (
                          <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400 font-bold uppercase tracking-tighter">Waiting for live ingestion stream...</TableCell></TableRow>
                        ) : applications.slice(0, 5).map((app) => {
                          let schemes = [];
                          try {
                            schemes = JSON.parse(app.matched_schemes || "[]");
                          } catch (e) {
                            schemes = [];
                          }
                          const timestamp = new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                          return (
                            <TableRow key={app.id} className={`border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${Math.round(app.effective_score || 0) > 80 ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                              <TableCell className="text-center font-mono text-[9px] text-slate-400">{timestamp}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{app.name}</span>
                                  <span className="text-[9px] font-mono text-slate-400">{app.tracking_id}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center text-xs font-black text-slate-700 dark:text-slate-300">
                                {app.district || "Mumbai"}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {schemes.length > 0 ? schemes.map((s, idx) => (
                                    <Badge key={idx} variant="outline" className="text-[8px] px-1 py-0 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50 uppercase font-bold">
                                      {typeof s === 'object' ? s.title : s}
                                    </Badge>
                                  )) : <span className="text-[9px] text-slate-400 italic font-medium">No matches detected</span>}
                                </div>
                              </TableCell>
                              <TableCell className="text-right pr-6">
                                <div className="flex flex-col items-end">
                                  <span className={`text-sm font-black ${ (app.effective_score || 0) > 80 ? 'text-rose-600' : 'text-indigo-600'}`}>
                                    {Math.round(app.effective_score || 0)}
                                  </span>
                                  {app.readiness_bonus && app.readiness_bonus > 0 ? (
                                    <Badge className="bg-emerald-600 text-[8px] h-3 px-1 leading-none font-black text-white rounded-sm mt-0.5">✅ Ready for Disbursement</Badge>
                                  ) : null}
                                  {(app.effective_score || 0) > 80 && (
                                    <Badge className="bg-rose-600 text-[8px] h-3 px-1 leading-none font-black text-white rounded-sm mt-0.5">HIGH PRIO</Badge>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
               </CardContent>
            </Card>
          </motion.div>
          {/* Phase tabs */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Tabs defaultValue="phase1" className="mb-6">
              <div className="overflow-x-auto -mx-4 px-4 pb-2 custom-scrollbar">
                <TabsList className="grid grid-cols-5 w-full min-w-[500px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <TabsTrigger value="phase1" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white">P1: Ingestion</TabsTrigger>
                  <TabsTrigger value="phase2" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white">P2: Extraction</TabsTrigger>
                  <TabsTrigger value="phase3" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white">P3: Processing</TabsTrigger>
                  <TabsTrigger value="phase4" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white">P4: Feedback</TabsTrigger>
                  <TabsTrigger value="phase5" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white">P5: Automation</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="phase1">
                <Card className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900"><CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-3"><CardTitle className="text-base text-slate-800 dark:text-slate-200">Phase 1: Document Ingestion &amp; OCR (Live)</CardTitle></CardHeader>
                  <CardContent>
                    {appsLoading ? (
                      <div className="flex items-center justify-center py-12 gap-2 text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading applications…
                      </div>
                    ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                      <Table>
                        <TableHeader><TableRow className="border-slate-200 dark:border-slate-800">
                          <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase">Rank</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase">Tracking ID</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase">Document</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase text-center">Vulnerability</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase text-center">Trust Score</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase text-center">Decision Trace</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase">OCR</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase">Verified</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                          {applications.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">No applications yet.</TableCell></TableRow>
                          ) : applications.map((a, rank) => {
                            const isEmergency = !!systemStatus?.district_emergencies?.[a.district || ""] || !!systemStatus?.crisis_mode;
                            const finalScore = a.effective_score || a.vulnerability_score || 0;
                            
                            return (
                            <TableRow key={a.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-500 border-slate-200 dark:border-slate-800 ${a.fraud_score && a.fraud_score > 70 ? 'bg-red-50/50 dark:bg-red-950/10' : ''} ${isEmergency ? 'animate-disaster-pulse border-red-100 dark:border-red-900/50' : ''}`}>
                              <TableCell className="text-[10px] font-black text-slate-400">#{(rank + 1).toString().padStart(2, '0')}</TableCell>
                              <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">{a.tracking_id}</TableCell>
                              <TableCell className="text-sm font-bold text-slate-900 dark:text-white">
                                {a.document_name ?? "—"}
                                <div className="text-[10px] text-slate-400 font-medium">{a.district || "Mumbai"}</div>
                                {isEmergency && (
                                  <div className="text-[8px] text-rose-500 font-black uppercase mt-0.5 animate-pulse">Emergency Area</div>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex items-center gap-1">
                                    <span className={`text-sm font-black ${finalScore > 60 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                      {Math.round(finalScore)}%
                                    </span>
                                    {isEmergency && <Zap className="h-3 w-3 text-red-500 animate-bounce" />}
                                  </div>
                                  {finalScore > 80 && (
                                    <Badge className="text-[8px] bg-red-600 text-white animate-pulse h-4 px-1 leading-none border-none">Priority 1</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                     <div 
                                      className={`h-full ${a.fraud_score && a.fraud_score > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                      style={{ width: `${100 - (a.fraud_score || 0)}%` }} 
                                     />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500">{100 - (a.fraud_score || 0)}% Trust</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-indigo-gov">
                                        <Info className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="w-64 p-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-xl">
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-gov animate-pulse" />
                                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-gov">AI Decision Stream</p>
                                        </div>
                                        <div className="space-y-2 relative pl-3 border-l border-slate-100 dark:border-slate-800">
                                          <div className="relative">
                                            <span className="absolute -left-[15px] top-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                            <p className="text-[10px] text-slate-500 font-bold">DATA: Ingested Document Map</p>
                                          </div>
                                          <div className="relative">
                                            <span className="absolute -left-[15px] top-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                                            <p className="text-[10px] text-slate-800 dark:text-slate-200 font-bold">TRIGGER: {a.vulnerability_reasons?.split(",")[0] || "Standard Load"}</p>
                                          </div>
                                          {systemStatus?.crisis_mode && (
                                            <div className="relative">
                                              <span className="absolute -left-[15px] top-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                                              <p className="text-[10px] text-rose-600 dark:text-red-400 font-bold">MULTIPLIER: 1.5x Protocol Active</p>
                                            </div>
                                          )}
                                          <div className="relative">
                                            <span className="absolute -left-[15px] top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black">RANK: #{rank + 1} in District Queue</p>
                                          </div>
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                              <TableCell>
                                <Badge className={a.ocr_text && a.ocr_text.length > 10
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 border-transparent text-[10px]"
                                  : "bg-gray-100 text-gray-700 border-transparent dark:bg-gray-800 dark:text-gray-400 text-[10px]"
                                }>
                                  {a.ocr_text && a.ocr_text.length > 10 ? "COMPLETED" : "NO OCR"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={a.is_verified === "Verified"
                                  ? "bg-emerald-50 text-emerald-700 border-transparent text-[10px]"
                                  : "bg-red-50 text-red-700 border-transparent text-[10px]"
                                }>
                                  {a.is_verified.toUpperCase()}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                      </Table>
                    </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="phase2">
                <Card className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900"><CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-3"><CardTitle className="text-base text-slate-800 dark:text-slate-200">Phase 2: OCR Text Extraction (Live)</CardTitle></CardHeader>
                  <CardContent>
                    {appsLoading ? (
                      <div className="flex items-center justify-center py-12 gap-2 text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
                      </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {applications.filter(a => a.ocr_text && a.ocr_text.length > 10).length === 0 && (
                        <p className="col-span-2 text-center text-slate-400 py-8">No OCR data yet. Upload documents via Submit Application.</p>
                      )}
                      {applications.filter(a => a.ocr_text && a.ocr_text.length > 10).map(a => (
                        <Card key={a.id} className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700 rounded-xl shadow-none">
                          <CardContent className="pt-4">
                            <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mb-1">{a.tracking_id}</p>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-indigo-gov" /> {a.document_name ?? "Document"}
                            </p>
                            <pre className="text-[10px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 max-h-28 overflow-y-auto whitespace-pre-wrap font-mono">
                              {a.ocr_text}
                            </pre>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="phase3">
                <Card className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900"><CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-3"><CardTitle className="text-base text-slate-800 dark:text-slate-200">Phase 3: AI Verification &amp; Routing (Live)</CardTitle></CardHeader>
                  <CardContent>
                    {appsLoading ? (
                      <div className="flex items-center justify-center py-12 gap-2 text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
                      </div>
                    ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                      <Table>
                        <TableHeader><TableRow className="border-slate-200 dark:border-slate-800">
                          <TableHead className="text-slate-500 dark:text-slate-400">Tracking ID</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Category</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Department</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Priority</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Verified</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Tier</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                          {applications.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-8">No applications yet.</TableCell></TableRow>
                          ) : applications.map(a => {
                            const pNum = a.ai_priority;
                            const pStr = pNum === 1 ? "critical" : pNum === 2 ? "high" : pNum === 3 ? "medium" : "low";
                            const pCls = { critical: "bg-red-100 text-red-800", high: "bg-orange-100 text-orange-800", medium: "bg-yellow-100 text-yellow-800", low: "bg-blue-100 text-blue-800" }[pStr];
                            return (
                              <TableRow key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-slate-200 dark:border-slate-800">
                                <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">{a.tracking_id}</TableCell>
                                <TableCell className="text-sm font-medium text-slate-900 dark:text-white">{a.category ?? "—"}</TableCell>
                                <TableCell className="text-sm text-slate-600 dark:text-slate-300">{a.department ?? "—"}</TableCell>
                                <TableCell><Badge className={`${pCls} border-transparent capitalize`}>{pStr}</Badge></TableCell>
                                <TableCell><Badge className={a.is_verified === "Verified" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"}>{a.is_verified}</Badge></TableCell>
                                <TableCell className="text-xs text-slate-500 dark:text-slate-400">{a.processing_tier ?? "—"}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="phase4">
                <Card className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900"><CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-3"><CardTitle className="text-base text-slate-800 dark:text-slate-200">Phase 4: Flagged / Needs Review (Live)</CardTitle></CardHeader>
                  <CardContent>
                    {appsLoading ? (
                      <div className="flex items-center justify-center py-12 gap-2 text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
                      </div>
                    ) : (
                    <>
                    {applications.filter(a => a.is_verified === "Rejected").map(a => (
                      <Card key={a.id} className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 mb-3 rounded-xl">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-mono text-xs dark:text-slate-300">{a.tracking_id} — {a.name}</p>
                            </div>
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-transparent">Flagged</Badge>
                          </div>
                          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-sm border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">AI Reasoning:</p>
                            <p className="text-sm dark:text-slate-200">{a.ai_reasoning ?? "No reasoning provided."}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {applications.filter(a => a.is_verified === "Rejected").length === 0 && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No flagged applications 🎉</p>
                    )}
                    </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="phase5">
                <Card className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900"><CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-3"><CardTitle className="text-base text-slate-800 dark:text-slate-200">Phase 5: Routed &amp; Completed (Live)</CardTitle></CardHeader>
                  <CardContent>
                    {appsLoading ? (
                      <div className="flex items-center justify-center py-12 gap-2 text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
                      </div>
                    ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                      <Table>
                        <TableHeader><TableRow className="border-slate-200 dark:border-slate-800">
                          <TableHead className="text-slate-500 dark:text-slate-400">Tracking ID</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Applicant</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Department</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Status</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                          {applications.filter(a => a.is_verified === "Verified").length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-8">No verified applications yet.</TableCell></TableRow>
                          ) : applications.filter(a => a.is_verified === "Verified").map(a => (
                            <TableRow key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-slate-200 dark:border-slate-800">
                              <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">{a.tracking_id}</TableCell>
                              <TableCell className="text-sm font-medium text-slate-900 dark:text-white">{a.name}</TableCell>
                              <TableCell className="text-sm text-slate-600 dark:text-slate-300">{a.department ?? "—"}</TableCell>
                              <TableCell><Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">{a.status}</Badge></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </PageWrapper>

      {/* AI Executive Briefing Modal */}
      <Dialog open={briefingModalOpen} onOpenChange={setBriefingModalOpen}>
        <DialogContent className="sm:max-w-[600px] border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-0 overflow-hidden">
          <div className="bg-indigo-gov p-6 text-white relative h-32 flex flex-col justify-center">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Brain className="h-32 w-32" />
             </div>
             <DialogTitle className="text-2xl font-black tracking-tight uppercase flex items-center gap-2">
               <ShieldCheck className="h-6 w-6" /> Executive AI Briefing
             </DialogTitle>
             <p className="text-indigo-100 text-xs font-medium uppercase tracking-widest mt-1">Generated by GovTech Multi-Department LLM Cluster</p>
          </div>
          <div className="p-8 space-y-6">
            {briefingLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-indigo-gov animate-spin" />
                <p className="text-sm font-bold text-slate-500 animate-pulse">Synthesizing real-time district datasets...</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-xl relative">
                  <span className="absolute -top-3 left-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1 text-[10px] font-black uppercase tracking-tighter rounded-full">Automated Summary</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {briefingContent || "Analyzing current data stream. No briefing generated yet."}
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl text-center">
                    <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter">Allocated</p>
                    <p className="text-lg font-bold">₹2.4Cr</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl text-center">
                    <p className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-tighter">Verified</p>
                    <p className="text-lg font-bold">94%</p>
                  </div>
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-xl text-center">
                    <p className="text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-tighter">Risk Level</p>
                    <p className="text-lg font-bold">Low</p>
                  </div>
                </div>
              </motion.div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" className="rounded-xl font-bold border-slate-200 dark:border-slate-700" onClick={() => window.print()}>
                <FileText className="h-4 w-4 mr-2" /> Print Summary
              </Button>
              <Button className="bg-indigo-gov text-white rounded-xl font-bold px-6" onClick={() => setBriefingModalOpen(false)}>
                Dismiss
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
