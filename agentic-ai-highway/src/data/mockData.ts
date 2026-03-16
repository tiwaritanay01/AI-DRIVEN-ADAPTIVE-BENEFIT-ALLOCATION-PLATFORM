import { FileText, Shield, Heart, GraduationCap, Landmark, Building2, Users, Truck, Leaf, Scale, Briefcase, Phone } from "lucide-react";

export type PipelinePhase = 1 | 2 | 3 | 4 | 5;

export interface Submission {
  id: string;
  trackingId: string;
  citizenName: string;
  category: string;
  department: string;
  priority: "low" | "medium" | "high" | "critical";
  currentPhase: PipelinePhase;
  status: string;
  submittedAt: string;
  documentName: string;
  extractedFields?: Record<string, string>;
  validationStatus?: "valid" | "invalid" | "pending";
  feedbackRequired?: boolean;
  feedbackMessage?: string;
  automationStatus?: "routed" | "processing" | "completed";
  ocrStatus?: "pending" | "processing" | "completed" | "failed";
}

export const phaseNames: Record<PipelinePhase, string> = {
  1: "Ingestion",
  2: "Context-Aware Extraction",
  3: "Agentic Processing",
  4: "Citizen Feedback",
  5: "Automation",
};

export const phaseDescriptions: Record<PipelinePhase, string> = {
  1: "Documents digitized through OCR",
  2: "AI organizes into structured data",
  3: "Classification, Prioritization & Validation",
  4: "Incomplete submission detection & communication",
  5: "Integration with departmental systems",
};

export const phaseColors: Record<PipelinePhase, string> = {
  1: "bg-blue-500",
  2: "bg-purple-500",
  3: "bg-amber-500",
  4: "bg-rose-500",
  5: "bg-emerald-500",
};

export const departments = [
  { name: "Revenue & Tax", icon: Landmark, count: 12 },
  { name: "Health & Family Welfare", icon: Heart, count: 8 },
  { name: "Education", icon: GraduationCap, count: 15 },
  { name: "Home Affairs", icon: Shield, count: 6 },
  { name: "Urban Development", icon: Building2, count: 10 },
  { name: "Social Justice", icon: Users, count: 9 },
  { name: "Transport", icon: Truck, count: 7 },
  { name: "Environment", icon: Leaf, count: 5 },
  { name: "Law & Justice", icon: Scale, count: 4 },
  { name: "Labour & Employment", icon: Briefcase, count: 11 },
  { name: "Telecommunications", icon: Phone, count: 3 },
  { name: "Documentation", icon: FileText, count: 14 },
];

export const services = [
  { name: "Birth Certificate", category: "Certificates", department: "Revenue & Tax", time: "3-5 days", docs: ["ID Proof", "Hospital Record"] },
  { name: "Income Tax Filing", category: "Finance", department: "Revenue & Tax", time: "1-2 days", docs: ["PAN Card", "Form 16"] },
  { name: "Ration Card Application", category: "Welfare", department: "Social Justice", time: "7-14 days", docs: ["ID Proof", "Address Proof", "Income Certificate"] },
  { name: "Driving License", category: "Transport", department: "Transport", time: "5-7 days", docs: ["ID Proof", "Address Proof", "Medical Certificate"] },
  { name: "Passport Application", category: "Documentation", department: "Home Affairs", time: "15-30 days", docs: ["ID Proof", "Address Proof", "Birth Certificate"] },
  { name: "Property Registration", category: "Revenue", department: "Revenue & Tax", time: "7-10 days", docs: ["Sale Deed", "ID Proof", "Tax Receipt"] },
  { name: "Senior Citizen Card", category: "Welfare", department: "Social Justice", time: "5-7 days", docs: ["ID Proof", "Age Proof"] },
  { name: "Environmental Clearance", category: "Environment", department: "Environment", time: "30-60 days", docs: ["Project Report", "EIA Report"] },
  { name: "School Admission", category: "Education", department: "Education", time: "Variable", docs: ["Birth Certificate", "Previous Marks", "Transfer Certificate"] },
  { name: "Health Insurance (PMJAY)", category: "Health", department: "Health & Family Welfare", time: "7-14 days", docs: ["ID Proof", "Income Certificate", "Family Card"] },
];

export const newsItems = [
  "Digital India Programme: 100 Crore Aadhaar milestone achieved",
  "New Online Portal for Pension Disbursement launched",
  "PM Vishwakarma Yojana applications now open for artisans",
  "Smart Cities Mission: Phase 3 approved for 50 cities",
  "National Education Policy 2024 implementation guidelines released",
];

const generateTrackingId = () => {
  const prefix = "GOV";
  const year = "2026";
  const num = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
  return `${prefix}-${year}-${num}`;
};

export const mockSubmissions: Submission[] = [
  {
    id: "1", trackingId: "GOV-2026-00142", citizenName: "Rajesh Kumar",
    category: "Certificates", department: "Revenue & Tax", priority: "medium",
    currentPhase: 3, status: "Under Classification", submittedAt: "2026-03-01T10:30:00",
    documentName: "birth_certificate_application.pdf",
    extractedFields: { "Name": "Rajesh Kumar", "DOB": "1990-05-15", "Father": "Suresh Kumar" },
    validationStatus: "valid", ocrStatus: "completed",
  },
  {
    id: "2", trackingId: "GOV-2026-00287", citizenName: "Priya Sharma",
    category: "Welfare", department: "Social Justice", priority: "high",
    currentPhase: 4, status: "Awaiting Documents", submittedAt: "2026-02-28T14:15:00",
    documentName: "ration_card_application.pdf",
    extractedFields: { "Name": "Priya Sharma", "Family Size": "5", "Income": "₹1,80,000" },
    validationStatus: "invalid", feedbackRequired: true,
    feedbackMessage: "Income certificate is missing. Please upload a valid income certificate.",
    ocrStatus: "completed",
  },
  {
    id: "3", trackingId: "GOV-2026-00391", citizenName: "Amit Patel",
    category: "Transport", department: "Transport", priority: "low",
    currentPhase: 5, status: "Routed to Department", submittedAt: "2026-02-25T09:00:00",
    documentName: "driving_license_renewal.pdf",
    extractedFields: { "Name": "Amit Patel", "License No": "DL-2020-98765", "Expiry": "2026-04-01" },
    validationStatus: "valid", automationStatus: "routed", ocrStatus: "completed",
  },
  {
    id: "4", trackingId: "GOV-2026-00456", citizenName: "Sunita Devi",
    category: "Health", department: "Health & Family Welfare", priority: "critical",
    currentPhase: 1, status: "Document Scanning", submittedAt: "2026-03-05T08:45:00",
    documentName: "pmjay_enrollment.pdf", ocrStatus: "processing",
  },
  {
    id: "5", trackingId: "GOV-2026-00512", citizenName: "Mohammed Ali",
    category: "Education", department: "Education", priority: "medium",
    currentPhase: 2, status: "Data Extraction", submittedAt: "2026-03-04T11:20:00",
    documentName: "school_transfer_certificate.pdf",
    extractedFields: { "Student": "Fatima Ali", "School": "KV Hyderabad", "Class": "VIII" },
    ocrStatus: "completed",
  },
  {
    id: "6", trackingId: "GOV-2026-00678", citizenName: "Lakshmi Iyer",
    category: "Revenue", department: "Revenue & Tax", priority: "high",
    currentPhase: 5, status: "Completed", submittedAt: "2026-02-20T16:00:00",
    documentName: "property_registration.pdf",
    extractedFields: { "Owner": "Lakshmi Iyer", "Property": "Plot 42, Anna Nagar", "Value": "₹85,00,000" },
    validationStatus: "valid", automationStatus: "completed", ocrStatus: "completed",
  },
];

export const generateNewTrackingId = generateTrackingId;
