# Project Planning Overview: AI-Driven Adaptive Benefit Allocation Platform

This document serves as a comprehensive map of the current state of the platform, detailing the integrated modules, active logic, and architectural components.

---

## 🏗️ System Architecture

### 1. Frontend (React + Vite + Tailwind)
- **Framework**: React 18 with TypeScript.
- **Styling**: Vanilla CSS + Tailwind CSS (Shadcn UI components).
- **State Management**: React Query (TanStack) for API fetching.
- **Key Modules**:
  - `AdminDashboard.tsx`: Crisis command center and pipeline monitoring.
  - `TrackApplication.tsx`: AI reasoning visibility for citizens.
  - `SubmitApplication.tsx`: Multi-step document ingestion flow.
  - `api.ts`: Centralized Axios client for backend communication.

### 2. Backend (FastAPI + SQLAlchemy)
- **Engine**: Python 3.10+ FastAPI.
- **Database**: SQLite (`gov_tech.db`) with SQLAlchemy ORM.
- **AI Integration**: 
  - **Gemini API**: Used for OCR verification and structured reasoning.
  - **Groq API**: Powering the background chatbot and text processing.

---

## ✅ Active & Working Features

### 📡 Core Logic (Backend)
- **[WORKING] Live Vulnerability Indexing**:
  - Algorithm scans document text for "triggers" (e.g., income level, disaster impact, health records).
  - Assigns a dynamic score (0-100) based on detected urgency.
- **[WORKING] Automated Scheme Matching**:
  - Cross-references citizen profile keywords against a library of welfare programs.
  - Returns recommended schemes (e.g., *PM Kisan*, *BPL Subsidy*) via JSON response.
- **[WORKING] District Crisis Multiplier**:
  - Global toggle in memory that applies a **1.5x multiplier** to vulnerability scores.
  - Endpoint: `/api/admin/toggle-crisis`.
- **[WORKING] Fraud Detection (Pattern Guardian)**:
  - Detects duplicate Aadhaar IDs and anomalous submission patterns (e.g., IP clusters).
  - Assigns a **Fraud Score** and flags applications for human audit.

### 🖥️ Admin Dashboard
- **[WORKING] Emergency Multiplier Center**: 
  - Real-time toggle for Crisis Mode.
  - KPI cards showing System Integrity, Vulnerability Accuracy, and Active Nodes.
- **[WORKING] Pipeline Monitoring**: 
  - Dynamic table in Phase 1 showing **Vulnerability Index %** and **Fraud Flags**.
- **[WORKING] System Status Awareness**:
  - Persistent connection bar indicating if the FastAPI backend is online/offline.

### 🙋 Citizen Portal
- **[WORKING] Document Ingestion (OCR Integration)**:
  - Users can upload images; backend performs real-time text extraction via Gemini.
- **[WORKING] Intelligent Tracking**:
  - Citizens can see their **Vulnerability Profile** (Global Index + Triggers).
  - Shows **AI-Matched Schemes** tailored to their specific needs.
- **[WORKING] Protected Access**:
  - Role-based login (Citizen vs. Admin) with `ProtectedRoute` guards.

---

## 📊 Data Models (SQLAlchemy)

### Application Table
| Field | Purpose |
| :--- | :--- |
| `vulnerability_score` | AI-calculated priority index. |
| `vulnerability_reasons` | CSV list of detected economic triggers. |
| `matched_schemes` | JSON list of recommended government programs. |
| `fraud_score` | Confidence score for authenticity. |
| `fraud_flags` | Specific reasons for audit (e.g., "Duplicate ID"). |
| `is_active` | Soft delete/archive status. |

---

## 🗺️ Roadmap & Planning Items

### Immediate Priorities
1. **Scheme Database Expansion**: Populate the `Scheme` table with actual eligibility rules for deeper matching.
2. **Persistence**: Move `DISTRICT_CRISIS_MODE` from in-memory to the DB.
3. **Analytics**: Implement the heatmap visualization using the `vulnerability_score` data across districts.

### Future Scope
- **Direct Benefit Transfer (DBT)**: Integrate mock payment gateway for fund disbursement.
- **SMS/WhatsApp Alerts**: Automatic notification when a high-priority scheme matches a profile.
- **Mobile App**: React Native port for field agents.
