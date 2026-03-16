import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Landmark, Shield, User, ArrowRight, Lock, Key } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (role: "admin" | "citizen") => {
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      localStorage.setItem("userRole", role);
      setIsLoading(false);
      toast.success(`Logged in as ${role === "admin" ? "Administrator" : "Citizen"}`);
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Decorative glass elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gov-navy/5 dark:bg-gov-navy/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gov-saffron/5 dark:bg-gov-saffron/20 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gov-navy shadow-lg mb-4">
            <Landmark className="text-white h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-gov-navy dark:text-white tracking-tight uppercase">India Benefit</h1>
          <p className="text-sm text-slate-500 font-bold tracking-widest uppercase mt-1">Government Access Gateway</p>
        </motion.div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <Tabs defaultValue="citizen" className="w-full">
            <TabsList className="grid grid-cols-2 w-full h-14 bg-slate-100 dark:bg-slate-800 p-1 rounded-none border-b border-slate-200 dark:border-slate-700">
              <TabsTrigger 
                value="citizen" 
                className="rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-none font-bold text-xs tracking-wider uppercase flex gap-2"
              >
                <User className="h-4 w-4" /> Citizen
              </TabsTrigger>
              <TabsTrigger 
                value="admin" 
                className="rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-none font-bold text-xs tracking-wider uppercase flex gap-2"
              >
                <Shield className="h-4 w-4" /> Admin
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="citizen" className="space-y-6 mt-0">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Citizen Portal</h2>
                  <p className="text-sm text-slate-500 font-medium italic">Access your benefits, track applications, and request services.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact Number / Aadhaar</Label>
                    <div className="relative">
                      <Input placeholder="Enter registered number" className="h-12 pl-10 bg-slate-50/50 border-slate-200 dark:bg-slate-950/50 dark:border-slate-800" />
                      <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                  <Button 
                    className="w-full h-14 bg-gov-navy hover:bg-slate-800 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-gov-navy/20 transition-all active:scale-[0.98]"
                    onClick={() => handleLogin("citizen")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Continue to Portal"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="admin" className="space-y-6 mt-0">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Administration Gateway</h2>
                  <p className="text-sm text-slate-500 font-medium">Restricted access for district officers and authorized personnel only.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Officer ID / Email</Label>
                    <div className="relative">
                      <Input placeholder="admin@gov.in" className="h-12 pl-10 bg-slate-50/50 border-slate-200 dark:bg-slate-950/50 dark:border-slate-800" />
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Passcode</Label>
                    <div className="relative">
                      <Input type="password" placeholder="••••••••" className="h-12 pl-10 bg-slate-50/50 border-slate-200 dark:bg-slate-950/50 dark:border-slate-800" />
                      <Key className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                  <Button 
                    className="w-full h-14 bg-indigo-gov hover:bg-blue-900 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-gov/20 transition-all active:scale-[0.98]"
                    onClick={() => handleLogin("admin")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Authenticating..." : "Login to Command Center"}
                    {!isLoading && <Shield className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <CardFooter className="flex flex-col gap-4 pb-8 pt-2">
            <div className="w-16 h-1 bg-gradient-to-r from-gov-saffron via-white to-india-green rounded-full opacity-50" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] text-center px-8 leading-relaxed">
              Secured by National Intelligence Grid <br/> Department of Administrative Governance
            </p>
          </CardFooter>
        </Card>

        <p className="text-center mt-8 text-slate-500 dark:text-slate-400 text-xs font-medium">
          Need help accessing your account? <button className="text-gov-navy dark:text-gov-saffron font-bold hover:underline">Contact Support</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
