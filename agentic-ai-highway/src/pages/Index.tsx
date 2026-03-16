import { motion } from "framer-motion";
import { ArrowRight, FileText, Search, Clock, Shield, Users, Activity, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

import PipelineVisual from "@/components/portal/PipelineVisual";
import PageWrapper from "@/components/portal/PageWrapper";
import { departments } from "@/data/mockData";

const quickServices = [
  { label: "Certificates", icon: FileText, color: "from-blue-500 to-blue-600", desc: "Birth, Death, Income, Caste" },
  { label: "Tax & Revenue", icon: Shield, color: "from-amber-500 to-amber-600", desc: "Income Tax, GST, Property" },
  { label: "Track Application", icon: Search, color: "from-emerald-500 to-emerald-600", desc: "Check your application status" },
  { label: "Grievance", icon: Clock, color: "from-rose-500 to-rose-600", desc: "File and track complaints" },
];

const transparencyMetrics = [
  { label: "Funds Distributed", value: "₹12.4M", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Households Supported", value: "45,000+", icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Targeting Accuracy", value: "98.5%", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Fraud Attempts Blocked", value: "1,240", icon: Shield, color: "text-accent-cyan", bg: "bg-cyan-500/10" },
];

const Index = () => {
  return (
    <>
      <PageWrapper label="Citizen Transparency Portal">
        <main className="flex-1">
          {/* Welcome Header & Hero */}
          <section className="bg-background relative overflow-hidden pt-8 pb-12">
            <div className="container mx-auto px-6 lg:px-20 relative z-10">
              <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-3xl">
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl md:text-4xl font-black tracking-tight text-slate-900"
                  >
                    Adaptive Benefit Allocation Portal
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="text-slate-600 mt-2 text-lg"
                  >
                    Proactive detection of socio-economic shifts to ensure targeted welfare distribution via <span className="text-gov-navy font-bold">Agentic AI</span>.
                  </motion.p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white px-4 py-2.5 rounded-lg shadow-sm border border-slate-200">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse md:shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  Live Vulnerability Index: ACTIVE
                </div>
              </div>

              {/* Main Call to Action Box - Stitch Style */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gov-saffron/5 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="p-1.5 bg-gov-saffron/10 text-gov-saffron rounded-lg"><Activity className="h-5 w-5" /></span>
                      <h3 className="text-xl font-bold text-slate-900">Automated Benefit Matching</h3>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-2xl">
                      Our dynamic eligibility engine analyzes your updated profile and active economic triggers to automatically suggest the most relevant government subsidies you qualify for right now.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button asChild size="lg" className="bg-gov-saffron hover:bg-gov-saffron/90 text-white font-bold px-8 shadow-md">
                        <Link to="/submit">View My Eligibility Matches</Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                        <Link to="/track">Track Aid Disbursement</Link>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Decorative AI visual element */}
                  <div className="hidden md:flex relative w-48 h-48 items-center justify-center">
                     <svg className="w-full h-full -rotate-90">
                       <circle className="text-slate-100" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12" />
                       <circle className="text-gov-saffron" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeDasharray="502" strokeDashoffset="150" strokeWidth="12" strokeLinecap="round" />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-4xl font-black text-indigo-gov">90%</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Approval Range</span>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Transparency Dashboard */}
          <section className="py-8 bg-background border-t border-slate-200">
            <div className="container mx-auto px-6 lg:px-20">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Transparency Dashboard</h3>
                  <p className="text-slate-500 text-sm">Real-time statistics on fund distribution across your district.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {transparencyMetrics.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                          <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                          <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Quick Access Services */}
          <section className="py-10 bg-background">
            <div className="container mx-auto px-4">
              <h3 className="text-2xl font-bold text-center mb-2 text-foreground">Quick Access Services</h3>
              <p className="text-center text-muted-foreground text-sm mb-8">Access government services instantly through our digital platform</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickServices.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <Link to="/services">
                      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-0 overflow-hidden rounded-xl">
                        <CardContent className={`p-0`}>
                          <div className={`bg-gradient-to-br ${s.color} p-4 md:p-5 text-white`}>
                            <s.icon className="h-7 w-7 md:h-8 md:w-8 mb-2 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-sm">{s.label}</h4>
                          </div>
                          <p className="px-4 py-3 text-xs text-muted-foreground">{s.desc}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>


        </main>
      </PageWrapper>
    </>
  );
};

export default Index;
