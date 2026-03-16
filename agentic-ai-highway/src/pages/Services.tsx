import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

import PageWrapper from "@/components/portal/PageWrapper";
import { services } from "@/data/mockData";

const categories = ["All", ...new Set(services.map(s => s.category))];

const Services = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = services.filter(s => {
    const matchCat = filter === "All" || s.category === filter;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <PageWrapper label="Government Services Directory">
        <main className="flex-1 container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-1 text-slate-900 dark:text-white">Government Services</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Browse and apply for government services online</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-6"
          >
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:max-w-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              aria-label="Search services"
            />
            <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by category">
              {categories.map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  variant={filter === cat ? "default" : "outline"}
                  onClick={() => setFilter(cat)}
                  className={filter === cat ? "bg-primary shadow-sm" : ""}
                  aria-pressed={filter === cat}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full hover:shadow-lg hover:shadow-indigo-gov/5 dark:hover:shadow-indigo-gov/20 transition-all duration-300 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-base text-slate-900 dark:text-white">{service.name}</CardTitle>
                      <Badge variant="secondary" className="text-[10px] shrink-0 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-100">{service.category}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{service.department}</p>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                      <Clock className="h-3.5 w-3.5 text-indigo-gov dark:text-indigo-400" aria-hidden="true" />
                      <span className="font-medium">Processing: {service.time}</span>
                    </div>
                    <div className="mb-6">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-300 mb-2 uppercase tracking-wider">Required Documents:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {service.docs.map(doc => (
                          <span key={doc} className="inline-flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 flex-1 sm:flex-none justify-center">
                            <FileText className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                            <span className="truncate max-w-[120px]" title={doc}>{doc}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button asChild size="sm" className="w-full bg-indigo-gov hover:bg-blue-900 text-white shadow-sm transition-transform hover:scale-[1.02]">
                      <Link to="/submit">
                        Apply Now <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <p className="text-muted-foreground">No services found matching your criteria.</p>
            </motion.div>
          )}
        </main>
      </PageWrapper>
    </>
  );
};

export default Services;
