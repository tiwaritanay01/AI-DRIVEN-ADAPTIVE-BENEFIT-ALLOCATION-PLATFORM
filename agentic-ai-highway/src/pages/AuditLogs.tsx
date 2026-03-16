import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ListChecks, Zap, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import PageWrapper from "@/components/portal/PageWrapper";
import { getAllApplications, type Application, getSystemStatus, type SystemStatus } from "@/lib/api";

const AuditLogs = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apps, status] = await Promise.all([
        getAllApplications(),
        getSystemStatus()
      ]);
      setApplications(apps);
      setSystemStatus(status);
    } catch (error) {
      console.error("Failed to fetch audit data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <PageWrapper label="Priority Audit Engine">
      <main className="flex-1 w-full pb-6 container mx-auto px-4 mt-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <ListChecks className="text-indigo-600 h-8 w-8" />
              Multi-Department Audit Logs
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Transparent tracing of AI priority scoring and intra-district re-ranking.
            </p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh Data
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between p-6">
              <div>
                <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                  Priority Queue Rank Tracing Engine
                </CardTitle>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-full">
                    <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Live Audit Active</span>
                  </div>
                </div>
              </div>
              <Badge className="bg-indigo-600 text-white border-none text-[10px] px-3 py-1 font-black uppercase tracking-widest">
                Nodes: {systemStatus?.nodes.length || 0} Active
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent bg-slate-50/40 dark:bg-slate-800/20 h-14">
                      <TableHead className="text-[10px] font-black uppercase tracking-wider pl-6 w-24">Timestamp</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-wider">User Name/ID</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-wider text-center">District</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-wider">Matched Schemes</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-wider text-center">Base Score</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-wider text-center">Bonuses</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-wider text-right pr-6">Final Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && applications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-64 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                             <Loader2 className="h-8 w-8 animate-spin" />
                             <p className="text-sm font-medium uppercase font-black">Connecting to AI Audit Stream...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : applications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-64 text-center text-slate-400 font-bold uppercase tracking-tighter">
                          No audit entries found in current system state.
                        </TableCell>
                      </TableRow>
                    ) : (
                      applications.map((app) => {
                        const isEmergency = !!systemStatus?.district_emergencies?.[app.district || ""] || !!systemStatus?.crisis_mode;
                        const readyBonus = app.readiness_bonus || 0;
                        const seBonus = app.socio_economic_bonus || 0;
                        const timestamp = new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        
                        let schemes = [];
                        try {
                          schemes = JSON.parse(app.matched_schemes || "[]");
                        } catch (e) {
                          schemes = [];
                        }

                        return (
                          <TableRow key={app.id} className={`border-slate-100 dark:border-slate-800 transition-colors h-16 ${isEmergency ? 'bg-amber-50/20 dark:bg-amber-900/5' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'}`}>
                            <TableCell className="pl-6">
                              <span className="font-mono text-[10px] font-bold text-slate-400">
                                {timestamp}
                              </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{app.name}</span>
                                  <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 px-1 rounded w-fit">{app.tracking_id}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center text-xs font-black text-slate-700 dark:text-slate-300">
                              {app.district || "Mumbai"}
                              {isEmergency && <Zap className="h-3 w-3 inline ml-1 text-amber-500" />}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                  {schemes.length > 0 ? schemes.map((s, idx) => (
                                    <Badge key={idx} variant="outline" className="text-[8px] px-1 py-0 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50 uppercase font-black">
                                      {typeof s === 'object' ? s.title : s}
                                    </Badge>
                                  )) : <span className="text-[9px] text-slate-400 italic">No scheme matches</span>}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                               <div className="flex flex-col items-center justify-center">
                                 <span className="text-xs font-bold text-slate-600">{app.vulnerability_score}%</span>
                                 <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-slate-400" style={{ width: `${app.vulnerability_score}%` }} />
                                 </div>
                               </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center gap-0.5">
                                <div className="flex gap-2">
                                  <span className={`text-[10px] font-black ${seBonus > 0 ? 'text-indigo-600' : 'text-slate-300'}`}>SE: +{seBonus}</span>
                                  <span className={`text-[10px] font-black ${readyBonus > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>RD: +{readyBonus}</span>
                                </div>
                                {isEmergency && <span className="text-[8px] font-black text-amber-600 uppercase">1.5x Multiplier Applied</span>}
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-lg font-black ${ (app.effective_score || 0) > 80 ? 'text-rose-600' : 'text-indigo-600'}`}>
                                    {Math.round(app.effective_score || 0)}
                                  </span>
                                  <div className={`w-2 h-2 rounded-full ${ (app.effective_score || 0) > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                                </div>
                                {readyBonus > 0 && (app.effective_score || 0) > 80 && (
                                  <Badge className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-tighter px-2 rounded-full py-0">
                                    ✅ Ready for Disbursement
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </PageWrapper>
  );
};

export default AuditLogs;
