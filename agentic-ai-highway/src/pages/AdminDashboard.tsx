import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Map, LucideIcon, CheckCircle, AlertTriangle, Clock, Shield, BarChart, Brain, Zap, TrendingUp, TrendingDown, Loader2, RefreshCw, Sparkles, FileText, Activity, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PipelineVisual from "@/components/portal/PipelineVisual";
import PageWrapper from "@/components/portal/PageWrapper";
import SystemLogs from "@/components/portal/SystemLogs";
import { phaseNames, type PipelinePhase } from "@/data/mockData";
import { getAllApplications, type Application, getSystemStatus, toggleCrisis, type SystemStatus, getSystemLogs, type LogEntry, getPriorityApplications } from "@/lib/api";
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

  useEffect(() => { 
    fetchApps(); 
    const interval = setInterval(async () => {
      try {
        const logs = await getSystemLogs();
        setSystemLogs(logs);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-gov dark:text-indigo-400">admin_panel_settings</span>
                District Administration
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">AI-driven real-time OCR/verification pipeline monitoring dashboard.</p>
            </div>
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
                      <p className="text-sm text-slate-500 font-medium">Global adaptive scoring for immediate disaster response.</p>
                      <div className="mt-1 font-mono text-[10px] text-indigo-gov dark:text-indigo-400 font-bold bg-indigo-gov/5 px-2 py-0.5 rounded inline-block">
                        Logic: {"$V_{final} = V_{base} × 1.5$"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Activating Crisis Mode automatically applies a <strong>1.5x Multiplier</strong> to the Vulnerability Index of all incoming applications in this district. Useful for flash floods, health outbreaks, or economic shocks.
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
                <CardContent className="pt-6 h-[250px]">
                  <div className="grid grid-cols-4 h-full gap-4 pt-4">
                    {[
                      { name: "Mumbai", score: 85, color: "bg-red-500" },
                      { name: "Thane", score: 45, color: "bg-orange-500" },
                      { name: "Pune", score: 65, color: "bg-rose-500" },
                      { name: "Nagpur", score: 30, color: "bg-emerald-500" }
                    ].map((d) => (
                      <div key={d.name} className="flex flex-col items-center justify-end gap-3 group">
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden flex-1">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${d.score}%` }}
                            className={`absolute bottom-0 w-full ${d.color} opacity-80 group-hover:opacity-100 transition-opacity`}
                          />
                          <div className="absolute inset-x-0 bottom-2 text-center text-[10px] font-black text-white drop-shadow-md">
                            {d.score}%
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{d.name}</span>
                      </div>
                    ))}
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
                          <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase">OCR</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase">Verified</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                          {applications.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">No applications yet.</TableCell></TableRow>
                          ) : applications.map((a, rank) => (
                            <TableRow key={a.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-slate-200 dark:border-slate-800 ${a.fraud_score && a.fraud_score > 70 ? 'bg-red-50/50 dark:bg-red-950/10' : ''}`}>
                              <TableCell className="text-[10px] font-black text-slate-400">#{(rank + 1).toString().padStart(2, '0')}</TableCell>
                              <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">{a.tracking_id}</TableCell>
                              <TableCell className="text-sm font-bold text-slate-900 dark:text-white">{a.document_name ?? "—"}</TableCell>
                              <TableCell className="text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span className={`text-sm font-black ${a.vulnerability_score && a.vulnerability_score > 60 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                    {a.vulnerability_score || 0}%
                                  </span>
                                  {a.vulnerability_score && a.vulnerability_score > 80 && (
                                    <Badge className="text-[8px] bg-red-600 text-white animate-pulse h-4 px-1 leading-none border-none">High Urgency</Badge>
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
                          ))}
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
    </div>
  );
};

export default AdminDashboard;
