import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Upload, Tag, CheckCircle, ArrowRight, ArrowLeft,
  FileText, Loader2, Eye, AlertCircle, X, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import PageWrapper from "@/components/portal/PageWrapper";
import { departments } from "@/data/mockData";
import { submitApplication, processDocument } from "@/lib/api";

const steps = [
  { label: "Personal Details", icon: User },
  { label: "Document Upload", icon: Upload },
  { label: "Category Selection", icon: Tag },
  { label: "Review & Submit", icon: CheckCircle },
];

const ACCEPTED_TYPES = ".pdf,.jpg,.jpeg,.png,.bmp,.tiff";

const SubmitApplication = () => {
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // File + OCR state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [showOcrPreview, setShowOcrPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "",
    documentName: "", documentDesc: "",
    category: "", department: "",
    district: "Mumbai",
  });

  const update = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  // ── OCR preview ──────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setOcrText("");
    setOcrError(null);
    setShowOcrPreview(false);

    if (!file) return;

    // Auto-fill document name from filename
    if (!form.documentName) {
      update("documentName", file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
    }

    // Trigger OCR preview
    setOcrLoading(true);
    try {
      const result = await processDocument(file);
      setOcrText(result.detected_text || "");
      setShowOcrPreview(true);
      // Auto-fill doc description if empty
      if (!form.documentDesc && result.detected_text) {
        update("documentDesc", result.detected_text.slice(0, 300));
      }
      toast({
        title: "OCR Complete ✅",
        description: "Text extracted successfully from your document.",
      });
    } catch {
      setOcrError("OCR extraction failed. You can still submit manually.");
      toast({
        title: "OCR Warning",
        description: "Could not auto-extract text. Please describe your document manually.",
        variant: "destructive",
      });
    } finally {
      setOcrLoading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setOcrText("");
    setOcrError(null);
    setShowOcrPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Final submission ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const response = await submitApplication({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        category: form.category,
        department: form.department,
        document_name: form.documentName,
        document_desc: form.documentDesc,
        district: form.district,
        file: selectedFile,
      });
      setTrackingId(response.tracking_id);
      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setSubmissionError(message);
      toast({
        title: "Submission Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <PageWrapper label="Application submitted successfully">
          <main className="flex-1 container mx-auto px-4 py-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Application Submitted!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Your document has been processed by the AI pipeline. OCR
                extraction and verification are complete.
              </p>
              <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 mb-6 rounded-xl">
                <CardContent className="p-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Tracking ID
                  </p>
                  <p className="text-2xl font-mono font-bold text-indigo-gov dark:text-indigo-400">
                    {trackingId}
                  </p>
                </CardContent>
              </Card>
              <Button
                asChild
                className="bg-indigo-gov hover:bg-blue-900 text-white font-bold"
              >
                <a href={`/track?id=${trackingId}`}>
                  Track Your Application{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          </main>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <PageWrapper label="Submit Application Form">
        <main className="flex-1 container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white">
              Submit Application
            </h2>
          </motion.div>

          {/* Step indicator */}
          <div
            className="flex items-center justify-center gap-1 sm:gap-2 mb-8 flex-wrap"
            role="navigation"
            aria-label="Application steps"
          >
            {steps.map((s, i) => (
              <div key={i} className="flex items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                    i === step
                      ? "bg-indigo-gov text-white shadow-md shadow-indigo-gov/20"
                      : i < step
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                  aria-current={i === step ? "step" : undefined}
                >
                  <s.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span className="hidden xs:inline">{s.label}</span>
                  <span className="xs:hidden">{i + 1}</span>
                </motion.div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-4 sm:w-6 md:w-8 h-0.5 mx-0.5 sm:mx-1 rounded-full transition-colors ${
                      i < step ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <Card className="max-w-2xl mx-auto rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mb-12">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-gov dark:text-indigo-400">
                  description
                </span>
                {steps[step].label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* ── Step 0: Personal Details ────────────────────────── */}
                  {step === 0 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="Enter your full name"
                          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-gov text-slate-900 dark:text-white mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          placeholder="email@example.com"
                          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-gov text-slate-900 dark:text-white mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300">
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          placeholder="+91 9876543210"
                          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-gov text-slate-900 dark:text-white mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address" className="text-slate-700 dark:text-slate-300">
                          Address
                        </Label>
                        <Textarea
                          id="address"
                          value={form.address}
                          onChange={(e) => update("address", e.target.value)}
                          placeholder="Enter your address"
                          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-gov text-slate-900 dark:text-white mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="district" className="text-slate-700 dark:text-slate-300">
                          Select District
                        </Label>
                        <Select
                          value={form.district}
                          onValueChange={(v) => update("district", v)}
                        >
                          <SelectTrigger 
                            id="district" 
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-indigo-gov text-slate-900 dark:text-white mt-1.5"
                          >
                            <SelectValue placeholder="Select your district" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                            {["Mumbai", "Thane", "Pune", "Nagpur"].map((d) => (
                              <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* ── Step 1: Document Upload + Real OCR ─────────────── */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="docName" className="text-slate-700 dark:text-slate-300">
                          Document Name
                        </Label>
                        <Input
                          id="docName"
                          value={form.documentName}
                          onChange={(e) => update("documentName", e.target.value)}
                          placeholder="e.g., Birth Certificate Application"
                          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-gov text-slate-900 dark:text-white mt-1.5"
                        />
                      </div>

                      {/* File Upload Zone */}
                      <div>
                        <Label className="text-slate-700 dark:text-slate-300 mb-1.5 block">
                          Upload Document
                          <span className="ml-2 text-xs text-slate-400 font-normal">
                            (PDF, JPG, PNG supported)
                          </span>
                        </Label>

                        {!selectedFile ? (
                          <label
                            htmlFor="fileUpload"
                            className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors cursor-pointer flex flex-col items-center gap-2 mt-1"
                          >
                            <Upload className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Drag & drop or click to browse
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              PDF · JPG · PNG · BMP · TIFF
                            </p>
                            <input
                              id="fileUpload"
                              ref={fileInputRef}
                              type="file"
                              accept={ACCEPTED_TYPES}
                              className="hidden"
                              onChange={handleFileChange}
                              aria-label="Upload document file"
                            />
                          </label>
                        ) : (
                          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50 mt-1">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                                  <FileText className="h-5 w-5 text-indigo-gov dark:text-indigo-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                                    {selectedFile.name}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={removeFile}
                                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                aria-label="Remove file"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            {/* OCR Status */}
                            {ocrLoading && (
                              <div className="flex items-center gap-2 text-sm text-indigo-gov dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-3 py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="font-medium">
                                  Running AI OCR extraction…
                                </span>
                              </div>
                            )}
                            {ocrError && (
                              <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{ocrError}</span>
                              </div>
                            )}
                            {ocrText && !ocrLoading && (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 text-[10px]">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    OCR Complete
                                  </Badge>
                                  <button
                                    onClick={() => setShowOcrPreview((p) => !p)}
                                    className="flex items-center gap-1 text-xs text-indigo-gov dark:text-indigo-400 hover:underline"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    {showOcrPreview ? "Hide" : "Preview"} extracted text
                                  </button>
                                </div>
                                <AnimatePresence>
                                  {showOcrPreview && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <pre className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 max-h-36 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed">
                                        {ocrText}
                                      </pre>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Manual description (always shown, auto-filled if OCR succeeded) */}
                      <div>
                        <Label htmlFor="docDesc" className="text-slate-700 dark:text-slate-300">
                          Document Description
                          {ocrText && (
                            <span className="ml-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                              (auto-filled from OCR)
                            </span>
                          )}
                        </Label>
                        <Textarea
                          id="docDesc"
                          value={form.documentDesc}
                          onChange={(e) => update("documentDesc", e.target.value)}
                          placeholder="Describe the document or paste its contents…"
                          rows={4}
                          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-gov text-slate-900 dark:text-white mt-1.5"
                        />
                      </div>
                    </div>
                  )}

                  {/* ── Step 2: Category & Department ──────────────────── */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="category" className="text-slate-700 dark:text-slate-300">
                          Category
                        </Label>
                        <Select
                          value={form.category}
                          onValueChange={(v) => update("category", v)}
                        >
                          <SelectTrigger
                            id="category"
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-indigo-gov text-slate-900 dark:text-white mt-1.5"
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                            {[
                              "Certificates",
                              "Finance",
                              "Welfare",
                              "Transport",
                              "Documentation",
                              "Revenue",
                              "Health",
                              "Education",
                              "Environment",
                            ].map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="department" className="text-slate-700 dark:text-slate-300">
                          Department
                        </Label>
                        <Select
                          value={form.department}
                          onValueChange={(v) => update("department", v)}
                        >
                          <SelectTrigger
                            id="department"
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-indigo-gov text-slate-900 dark:text-white mt-1.5"
                          >
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                            {departments.map((d) => (
                              <SelectItem key={d.name} value={d.name}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30 flex items-start gap-2 mt-4">
                        <span className="text-base leading-none">💡</span>
                        <span className="leading-relaxed">
                          The AI pipeline will auto-route your application based on
                          OCR-extracted content and Gemini LLM verification (Tier 2
                          fallback). Your manual selection helps as a hint.
                        </span>
                      </p>
                    </div>
                  )}

                  {/* ── Step 3: Review & Submit ─────────────────────────── */}
                  {step === 3 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        Review Your Application
                      </h4>
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 space-y-3 text-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        <div className="grid grid-cols-2 gap-y-3 border-b border-slate-200 dark:border-slate-700 pb-3 mb-1">
                          <p>
                            <strong className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                              Name
                            </strong>
                            {form.name || "—"}
                          </p>
                          <p>
                            <strong className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                              Email
                            </strong>
                            {form.email || "—"}
                          </p>
                          <p>
                            <strong className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                              Phone
                            </strong>
                            {form.phone || "—"}
                          </p>
                          <p>
                            <strong className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                              District
                            </strong>
                            {form.district || "—"}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-y-3">
                          <p className="col-span-2">
                            <strong className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                              Document
                            </strong>
                            {form.documentName || "—"}
                          </p>
                          {selectedFile && (
                            <p className="col-span-2">
                              <strong className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                                Uploaded File
                              </strong>
                              <span className="flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-indigo-gov" />
                                {selectedFile.name}
                                {ocrText && (
                                  <Badge className="ml-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 text-[9px]">
                                    OCR ✓
                                  </Badge>
                                )}
                              </span>
                            </p>
                          )}
                          <p>
                            <strong className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                              Category
                            </strong>
                            {form.category || "—"}
                          </p>
                          <p>
                            <strong className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">
                              Department
                            </strong>
                            {form.department || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Info box */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                        <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>
                          On submit, the backend will run <strong>OCR</strong> on your
                          uploaded file (Tesseract + Gemini fallback), then apply a{" "}
                          <strong>Tier-1 regex check</strong> (Aadhaar / PAN patterns).
                          If that fails, <strong>Tier-2 Gemini AI</strong> will verify
                          and classify the document.
                        </span>
                      </div>

                      {submissionError && (
                        <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 border border-red-200 dark:border-red-800">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          {submissionError}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                  disabled={step === 0}
                  aria-label="Go to previous step"
                  className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                {step < 3 ? (
                  <Button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={step === 1 && ocrLoading}
                    className="bg-indigo-gov hover:bg-blue-900 text-white font-bold px-6 shadow-sm"
                    aria-label="Go to next step"
                  >
                    {step === 1 && ocrLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        Submit Application{" "}
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </PageWrapper>
    </>
  );
};

export default SubmitApplication;
