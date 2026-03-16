// ---------------------------------------------------------------------------
// API client for the GovTech backend (FastAPI running on port 8001)
// ---------------------------------------------------------------------------

export const API_BASE = "http://127.0.0.1:8001";

// ──────────────────────────────────────────────
// Types mirroring the backend ApplicationResponse
// ──────────────────────────────────────────────
export interface Application {
  id: number;
  tracking_id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  category: string | null;
  department: string | null;
  document_name: string | null;
  document_desc: string | null;
  ocr_text: string | null;
  status: string;
  is_verified: string;
  ai_priority: number;
  ai_reasoning: string | null;
  processing_tier: string | null;
  created_at: string;
  
  // PS CORE EXTENSIONS
  vulnerability_score?: number;
  vulnerability_reasons?: string;
  matched_schemes?: string; // JSON string
  fraud_score?: number;
  fraud_flags?: string;
  effective_score?: number;
  district?: string;
  readiness_bonus?: number;
  socio_economic_bonus?: number;
}

export interface LogEntry {
  time: string;
  message: string;
}

export interface SystemStatus {
  crisis_mode: boolean;
  disaster_type: string;
  nodes: string[];
  throughput: string;
  multiplier: number;
  district_emergencies: Record<string, boolean>;
}


export interface SubmitApplicationPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  department: string;
  document_name: string;
  document_desc: string;
  district: string;
  file?: File | null;
}

export interface SubmitApplicationResponse {
  success: boolean;
  tracking_id: string;
  application: Application;
}

export interface ProcessDocumentResponse {
  detected_text: string;
}

export interface ChatRequest {
  message: string;
  tracking_id?: string;
  chat_history?: { role: string; content: string }[];
}

export interface ChatResponse {
  response: string;
}

// ──────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────

/**
 * Submit a new citizen application (multipart form with optional file).
 */
export async function submitApplication(
  payload: SubmitApplicationPayload
): Promise<SubmitApplicationResponse> {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("phone", payload.phone);
  formData.append("address", payload.address);
  formData.append("category", payload.category);
  formData.append("department", payload.department);
  formData.append("document_name", payload.document_name);
  formData.append("document_desc", payload.document_desc);
  formData.append("district", payload.district);
  if (payload.file) {
    formData.append("file", payload.file);
  }

  const res = await fetch(`${API_BASE}/api/submit_application`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Submit failed: ${err}`);
  }

  return res.json();
}

/**
 * Dedicated OCR-only endpoint — sends a file and returns detected text.
 */
export async function processDocument(
  file: File
): Promise<ProcessDocumentResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/process-document`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OCR failed: ${err}`);
  }

  return res.json();
}

/**
 * Get all applications (for Admin Dashboard).
 */
export async function getAllApplications(): Promise<Application[]> {
  const res = await fetch(`${API_BASE}/api/applications`);
  if (!res.ok) throw new Error("Failed to fetch applications");
  return res.json();
}

/**
 * Get a single application by tracking ID (for Track Application page).
 */
export async function getApplicationByTrackingId(
  trackingId: string
): Promise<Application> {
  const res = await fetch(`${API_BASE}/api/applications/${trackingId}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("NOT_FOUND");
    throw new Error("Failed to fetch application");
  }
  return res.json();
}

/**
 * Chat with the AI support bot.
 */
export async function chatWithBot(request: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chatbot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error("Chatbot request failed");
  return res.json();
}

/**
 * Get current system status (including crisis mode).
 */
export async function getSystemStatus(): Promise<SystemStatus> {
  const res = await fetch(`${API_BASE}/api/admin/system-status`);
  if (!res.ok) throw new Error("Failed to fetch system status");
  return res.json();
}

/**
 * Toggle global district crisis mode.
 */
export async function toggleCrisis(status: boolean): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/api/admin/toggle-crisis?status=${status}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to toggle crisis mode");
  return res.json();
}

/**
 * Get prioritized applications.
 */
export async function getPriorityApplications(): Promise<Application[]> {
  const res = await fetch(`${API_BASE}/api/applications/priority`);
  if (!res.ok) throw new Error("Failed to fetch prioritized applications");
  return res.json();
}

/**
 * Get latest system processed logs.
 */
export async function getSystemLogs(): Promise<LogEntry[]> {
  const res = await fetch(`${API_BASE}/api/system/logs`);
  if (!res.ok) throw new Error("Failed to fetch system logs");
  return res.json();
}

/**
 * Simulate a disaster trigger.
 */
export async function simulateDisaster(disasterType: string): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/api/admin/simulate-disaster?disaster_type=${disasterType}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to simulate disaster");
  return res.json();
}

/**
 * Get executive AI summary briefing.
 */
export async function getExecutiveBriefing(): Promise<{ summary: string }> {
  const res = await fetch(`${API_BASE}/api/admin/briefing`);
  if (!res.ok) throw new Error("Failed to fetch executive briefing");
  return res.json();
}

/**
 * Toggle emergency mode for a specific district.
 */
export async function toggleDistrictEmergency(district: string, status: boolean): Promise<{ status: string, is_emergency: boolean }> {
  const res = await fetch(`${API_BASE}/api/admin/toggle-district-emergency?district=${district}&status=${status}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to toggle district emergency");
  return res.json();
}
