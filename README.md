# India Benefit: AI-Driven Adaptive Benefit Allocation Platform

## 📌 Project Overview
**India Benefit** is an Intelligent Government Governance (GovTech) solution designed to modernize the distribution of welfare benefits. Traditionally, benefit allocation is plagued by manual verification delays, fraud (duplicate applications), and a lack of real-time adaptation to regional crises.

Our platform leverages an **Agentic AI Pipeline** to automate document verification, assess applicant vulnerability in real-time, and dynamically re-rank allocation priority based on regional emergencies (e.g., floods, economic crashes).

---

## 🚀 How to Run the Project

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **npm** or **bun**
- **Tesseract OCR**: Installed at `C:\Program Files\Tesseract-OCR\tesseract.exe` (or update path in `backend/backend-cesa/ocr_utils.py`)


### Step 1: Start the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend/backend-cesa
   ```
2. Set your API keys (PowerShell syntax):
   ```powershell
   $env:GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   $env:GROQ_API_KEY="YOUR_GROQ_API_KEY"
   ```
3. Run the FastAPI server:
   ```bash
   py main.py
   ```
   *The backend will be live at `http://localhost:8001`.*

### Step 2: Start the Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd agentic-ai-highway
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The frontend will be live at `http://localhost:8080`.*

---

## 🔐 Login Credentials
For demonstration purposes, the authentication system is currently simulated:

- **Citizen Portal**: Enter any 10-digit number (e.g., `9876543210`) to enter the dashboard.
- **Admin Command Center**: Enter any email and passcode (e.g., `admin@gov.in` / `admin123`) to access district-level controls.

---

## system Flow

Judges should follow this flow to verify the system's core capabilities:

### 1. Agentic OCR & Verification Pipeline
- **Action**: Go to **Submit Request** as a Citizen.
- **Verification**: Upload a document (Aadhaar or PAN). Observe the **Live OCR Sync** extracting text.
- **Logic**: The system uses **Tier-1 (Regex)** for standard IDs and falls back to **Tier-2 (Gemini LLM)** for complex or unformatted documents.

### 2. Adaptive Allocation Engine (The Multiplier)
- **Action**: Log in as **Admin** and open the **Command Center**.
- **Verification**: Observe the "Vulnerability Heatmap". Toggle **Crisis Mode** or simulate a "Flood".
- **Logic**: Observe the **Priority Score** of applicants in that district increase by **1.5x**. The system dynamically re-ranks the queue based on the formula: `(Vbase × Multiplier) + Bonuses`.

### 3. Fraud Guardian
- **Action**: Try submitting the same Aadhaar document with a different name.
- **Verification**: Check the **Audit Logs** in the Admin panel.
- **Logic**: The AI detect pattern duplicates and assigns a **Fraud Score**. High-risk applications are automatically "Flagged for Audit" instead of being approved.

### 4. AI Support Multi-Turn Chatbot
- **Action**: Go to the Citizen Dashboard and use the Chatbot.
- **Verification**: Ask about your application status (e.g., *"What is the status of my application GT-XXXX?"*).
- **Logic**: The bot fetches real-time data from the SQL database and provides context-aware support using **Llama 3.3 (via Groq)**.

---

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Shadcn UI.
- **Backend**: FastAPI (Python), SQLAlchemy (SQLite).
- **AI Models**: Google Gemini 2.0 Flash (OCR/Verification)
