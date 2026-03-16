# AI-Driven Adaptive Benefit Allocation Platform (GovTech CESA)

## 📌 Project Overview
The **AI-Driven Adaptive Benefit Allocation Platform** is a state-of-the-art governance system designed to solve the problem of static, outdated welfare distribution. It uses real-time data integration, Multi-Modal AI (Gemini & Groq), and a dynamic vulnerability index to ensure government resources reach citizens based on immediate need.

---

## 🏗️ System Architecture

### 1. Frontend: Agentic AI Highway
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS & Framer Motion (Glassmorphism & Micro-animations)
- **UI Components**: Shadcn UI & Lucide Icons
- **State Management**: React Query (TanStack)
- **Key Features**:
  - **Citizen Portal**: Multi-step document ingestion with real-time OCR status.
  - **Admin Command Center**: Pulse-animated priority queues and district heatmaps.
  - **AI Decision Profiles**: High-fidelity cards explaining "Why" a citizen matched a scheme.

### 2. Backend: FastAPI Logic Engine
- **Framework**: FastAPI (Python)
- **AI Integration**: 
  - **Gemini Pro**: Multi-modal verification and context-aware vulnerability analysis.
  - **Groq**: High-speed schema matching and fraud detection.
- **Database**: SQLAlchemy with SQLite (Local persistence for demo).
- **OCR Engine**: Multi-modal vision analysis from submitted Aadhaar/Identity documents.

---

## 🚀 Key Innovation: The Priority Queue Multiplier
The system uses a mathematical model for crisis-aware resource allocation:

V_final = V_base * (C_multiplier)

- **V_base**: AI-calculated vulnerability score (0-100) based on economic indicators.
- **C_multiplier**: Dynamic multiplier (e.g., 1.5x) triggered by administrators during district-wide crises (floods, health outbreaks).
- **Result**: Automated re-支援 ranking of the application queue to surface critical cases instantly.

---

## 🤖 AI & Fraud Protection
- **Vulnerability Profile**: AI extracts "Economic Triggers" (e.g., job loss, disaster impact) from unstructured uploaded text.
- **Matched Schemes**: Intelligent lookup returns schemes with **Confidence Scores** and **Justifications**.
- **Fraud Guardian (Trust Score)**: AI analyzes document authenticity, flagging suspicious patterns and assigning a 0-100% Trust Meter.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- API Keys: `GEMINI_API_KEY`, `GROQ_API_KEY`

### Backend Setup
```bash
cd backend/backend-cesa
pip install -r requirements.txt
# Set Environment Variables
$env:GEMINI_API_KEY="your_key"
$env:GROQ_API_KEY="your_key"
py main.py
```

### Frontend Setup
```bash
cd agentic-ai-highway
npm install
npm run dev
```

---

## 📂 Repository Structure
- `agentic-ai-highway/`: Main React source code.
- `backend/backend-cesa/`: FastAPI application, models, and AI prompts.
- `stitch/`: UI Screen designs and design system specs.
- `project_planning_overview.md`: High-level milestone tracking.

---

## 🛡️ Security & Compliance
- **OCR Masking**: Sensitive data is processed in-memory for verification.
- **Audit Logs**: Every AI decision is logged in the `SystemLogs` database for administrative transparency.
- **Zero-Trust Logic**: Multi-department verification ensures no single point of failure.

---
**Developed for Advanced Agentic Coding - GovTech CESA Project**
