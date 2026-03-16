import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertCircle, CheckCircle, XCircle, Clock, Loader2, FileText, Sparkles, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import PageWrapper from "@/components/portal/PageWrapper";
import { useSearchParams } from "react-router-dom";
import { getApplicationByTrackingId, type Application } from "@/lib/api";

// Map backend ai_priority (int) to human-readable priority label
const priorityLabel: Record<number, string> = {
  1: "critical",
  2: "high",
  3: "medium",
  4: "low",
};

const priorityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300",
};

const verificationColors: Record<string, { cls: string; icon: React.ReactNode }> = {
  Verified: {
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  Rejected: {
    cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

const TrackApplication = () => {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get("id") || "");
  const [result, setResult] = useState<Application | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOcr, setShowOcr] = useState(false);

  const handleSearch = async () => {
    if (!trackingId.trim()) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);
    setError(null);
    setShowOcr(false);

    try {
      const app = await getApplicationByTrackingId(trackingId.trim());
      setResult(app);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "NOT_FOUND") {
        setNotFound(true);
      } else {
        setError("Could not connect to the server. Please ensure the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const pLabel = result ? (priorityLabel[result.ai_priority] ?? "medium") : "medium";
  const verification = result?.is_verified ?? "Pending";

  return (
    <>
      <PageWrapper label="Track Application Status">
        <main className="flex-1 container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-1 text-slate-900 dark:text-white">
              Track Your Application
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              Enter your tracking ID to get live AI verification status
            </p>
          </motion.div>

          {/* Search card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="max-w-xl mx-auto mb-8 rounded-xl glass-card border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Input
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="e.g., GT-ADHAAR-A1B2C3"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    aria-label="Enter tracking ID"
                    className="font-mono bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-gov"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={loading || !trackingId.trim()}
                    className="bg-indigo-gov hover:bg-blue-900 text-white shrink-0 font-bold"
                    aria-label="Search application status"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" aria-hidden="true" />
                        Track
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">
                  Your tracking ID was shown when you submitted the application.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Not found */}
          <AnimatePresence>
            {notFound && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-xl mx-auto"
              >
                <Card className="border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
                  <CardContent className="pt-6 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-rose-800 dark:text-rose-300">
                      No application found with tracking ID:{" "}
                      <span className="font-mono font-bold">{trackingId}</span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-xl mx-auto"
              >
                <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                  <CardContent className="pt-6 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{error}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto space-y-6"
              >
                {/* CORE PS REQUIREMENT: VULNERABILITY & SCHEMES MATCHING */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vulnerability Card */}
                  <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="pb-3 bg-indigo-50/50 dark:bg-indigo-950/20">
                      <CardTitle className="text-sm text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest font-black">
                        <TrendingUp className="h-4 w-4 text-indigo-gov" />
                        AI Decision Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">{result.vulnerability_score || 0}%</span>
                        <span className="text-xs font-bold text-slate-400 mb-1.5">PRIORITY INDEX</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.vulnerability_score || 0}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Calculated Economic Triggers</p>
                        <div className="flex flex-wrap gap-2">
                          {result.vulnerability_reasons?.split(',').map((reason, i) => (
                            <Badge key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] rounded-lg border border-indigo-100 dark:border-indigo-800 font-bold">
                               ✔ {reason.trim()}
                            </Badge>
                          )) || <span className="text-xs text-slate-400 italic">No specific triggers detected in standard documents.</span>}
                        </div>
                        <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400 italic leading-relaxed">
                          Priority Score of {result.vulnerability_score}% determined by real-time economic triggers and district crisis multipliers.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Schemes Card */}
                  <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="pb-3 bg-emerald-50/50 dark:bg-emerald-950/20">
                      <CardTitle className="text-sm text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest font-black">
                        <Sparkles className="h-4 w-4 text-emerald-500" />
                        AI-Matched Schemes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                       <div className="space-y-4">
                         {result.matched_schemes ? (
                           JSON.parse(result.matched_schemes).map((scheme: any, i: number) => (
                             <div key={i} className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 group hover:border-emerald-200 dark:hover:border-emerald-950 transition-all">
                               <div className="flex justify-between items-start mb-2">
                                 <span className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{scheme.title}</span>
                                 <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[9px] font-black border-none uppercase tracking-tighter">
                                   {scheme.confidence}% Match
                                 </Badge>
                               </div>
                               <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                 {scheme.justification}
                               </p>
                             </div>
                           ))
                         ) : (
                           <div className="text-center py-6">
                             <p className="text-xs text-slate-400 font-medium italic">Scanning eligibility library...</p>
                           </div>
                         )}
                       </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Verification Result Card */}
                <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                  <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 bg-slate-50 dark:bg-slate-800/50">
                    <CardTitle className="text-base text-slate-900 dark:text-white flex items-center gap-2">
                       <Shield className="h-4 w-4 text-indigo-gov" />
                      Authenticity Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <div
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-lg ${
                          verification === "Verified"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                        }`}
                      >
                        {verification === "Verified" ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <XCircle className="h-6 w-6" />
                        )}
                        {verification === "Verified" ? "SECURELY VERIFIED" : "UNDER AUDIT"}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Lifecycle State: <strong>{result.status}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Detection Engine:
                          </span>
                          <Badge className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800">
                            {result.processing_tier ?? "N/A"}
                          </Badge>
                        </div>
                        {result.ai_reasoning && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 mt-2 leading-relaxed">
                            <Sparkles className="h-3.5 w-3.5 inline-block mr-1 text-indigo-gov" />
                            <strong>Validation Hash:</strong> {result.ai_reasoning}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>


                {/* ── Application Details ─────────────────────────────── */}
                <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                  <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <CardTitle className="text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-gov dark:text-indigo-400">
                          description
                        </span>
                        Application Details
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={`${priorityColors[pLabel]} border-transparent font-bold capitalize`}>
                          {pLabel} Priority
                        </Badge>
                        {verificationColors[verification] && (
                          <Badge
                            className={`${verificationColors[verification].cls} font-bold flex items-center gap-1`}
                          >
                            {verificationColors[verification].icon}
                            {verification}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm pt-6">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                        Tracking ID
                      </p>
                      <p className="font-mono font-bold text-slate-900 dark:text-white">
                        {result.tracking_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                        Applicant Name
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">{result.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                        Assigned Category
                      </p>
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        {result.category ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                        Routing Department
                      </p>
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        {result.department ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                        Document Name
                      </p>
                      <p className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-indigo-gov" />
                        {result.document_name ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                        Submitted
                      </p>
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        {new Date(result.created_at).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* ── OCR Text Viewer ─────────────────────────────────── */}
                {result.ocr_text && (
                  <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-slate-900 dark:text-white flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-indigo-gov" />
                          OCR Extracted Text
                        </CardTitle>
                        <button
                          onClick={() => setShowOcr((p) => !p)}
                          className="text-xs text-indigo-gov dark:text-indigo-400 hover:underline"
                        >
                          {showOcr ? "Hide" : "Show"} text
                        </button>
                      </div>
                    </CardHeader>
                    <AnimatePresence>
                      {showOcr && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <CardContent className="pt-4">
                            <pre className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 overflow-y-auto max-h-64 whitespace-pre-wrap font-mono leading-relaxed">
                              {result.ocr_text}
                            </pre>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </PageWrapper>
    </>
  );
};

export default TrackApplication;
