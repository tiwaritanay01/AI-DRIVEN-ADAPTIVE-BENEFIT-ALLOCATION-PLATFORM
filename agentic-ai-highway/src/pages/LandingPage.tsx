import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Activity, Users, Zap, Search, Brain, BarChart, Database, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "₹12.4M", label: "Welfare Distributed", suffix: "+" },
  { value: "45,000", label: "Households Supported", suffix: "+" },
  { value: "98.5", label: "Targeting Accuracy", suffix: "%" },
  { value: "1,240", label: "Fraud Attempts Blocked", suffix: "" }
];

const features = [
  { title: "Live Vulnerability Index", desc: "Real-time socio-economic health tracking at the district and ward level.", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
  { title: "Automated Scheme Matching", desc: "Agentic AI recommends precise benefits based on multi-source data points.", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
  { title: "Dynamic Eligibility Engine", desc: "Proactively identifies at-risk citizens before they fall through the cracks.", icon: Search, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { title: "Fraud Detection Engine", desc: "Pattern recognition algorithms block duplicate and anomalous claims instantly.", icon: Shield, color: "text-rose-500", bg: "bg-rose-500/10" },
  { title: "Transparency Dashboard", desc: "Publicly visible fund distribution metrics ensuring total accountability.", icon: BarChart, color: "text-indigo-gov", bg: "bg-indigo-gov/10" }
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 grid-bg-light dark:grid-bg-dark font-sans overflow-x-hidden selection:bg-indigo-gov selection:text-white">
      {/* Dynamic Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-gov text-white flex items-center justify-center font-bold shadow-md">IB</div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white uppercase">India Benefit</span>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="hidden sm:inline-flex font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">
              <Link to="/login">Admin Access</Link>
            </Button>
            <Button asChild className="bg-india-saffron hover:bg-orange-600 text-white font-bold shadow-md">
              <Link to="/login">Enter Portal</Link>
            </Button>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-india-saffron via-white to-india-green" />
      </header>

      <main className="pt-24 pb-20">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden px-6">
          <div className="container mx-auto relative z-10 text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-gov/10 text-indigo-gov dark:bg-indigo-gov/20 dark:text-indigo-400 font-bold text-sm mb-8 ring-1 ring-indigo-gov/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              V 2.0 Command Center Live
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-6 leading-tight"
            >
              AI Powered Adaptive <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-india-saffron to-orange-500">Welfare Distribution</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
            >
              A real-time governance intelligence platform that ensures government benefits reach the citizens who need them the most, without the red tape.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button asChild size="lg" className="bg-indigo-gov hover:bg-blue-900 text-white font-bold px-8 h-14 text-base shadow-lg w-full sm:w-auto">
                <Link to="/login">
                  Explore Citizen Platform <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold px-8 h-14 text-base bg-white/50 backdrop-blur-sm border-slate-300 dark:bg-slate-800/50 dark:border-slate-700 w-full sm:w-auto">
                <Link to="/login">View Admin Dashboard</Link>
              </Button>
            </motion.div>
          </div>

          {/* Background Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-gov/5 dark:bg-indigo-gov/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        </section>

        {/* IMPACT STATS */}
        <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 relative z-20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                    {stat.value}<span className="text-india-saffron">{stat.suffix}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WORKFLOW PIPELINE */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="container mx-auto">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">How The AI System Works</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">Seamless data integration flowing instantly into adaptive welfare allocation.</p>
            </div>
            
            <div className="relative max-w-5xl mx-auto">
              {/* Connecting Line */}
              <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-slate-200 via-indigo-gov to-emerald-500 -translate-y-1/2 z-0" />
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-4 relative z-10">
                {[
                  { title: "Data Sources", icon: Database, desc: "Multi-agency APIs" },
                  { title: "AI Indexing", icon: Brain, desc: "Vulnerability scoring" },
                  { title: "Eligibility Engine", icon: Search, desc: "Rule matching" },
                  { title: "Scheme Logic", icon: Server, desc: "Fund allocation" },
                  { title: "Distribution", icon: Zap, desc: "Direct benefit transfer" }
                ].map((step, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center shadow-lg hover:-translate-y-2 transition-transform duration-300"
                  >
                    <div className="w-16 h-16 mx-auto bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700 shadow-inner">
                      <step.icon className="h-8 w-8 text-indigo-gov" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CORE FEATURES */}
        <section className="py-24 bg-slate-100 dark:bg-slate-800/50 px-6 border-t border-slate-200 dark:border-slate-800">
          <div className="container mx-auto">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">Command Center Capabilities</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">Enterprise-grade tools for modern administrative governance.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.bg}`}>
                    <feature.icon className={`h-7 w-7 ${feature.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST SECTION & FINAL CTA */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <Shield className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-8" />
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6 leading-relaxed">
              Designed for modern governance systems to ensure fair, transparent, and efficient welfare distribution using AI-powered decision support.
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-india-saffron via-white to-india-green mx-auto mb-12 rounded-full shadow-sm" />
            
            <Button asChild size="lg" className="bg-indigo-gov hover:bg-blue-900 text-white font-bold px-10 h-16 text-lg shadow-xl shadow-indigo-gov/30 hover:scale-105 transition-transform">
              <Link to="/login">Enter the Welfare Command Center</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
