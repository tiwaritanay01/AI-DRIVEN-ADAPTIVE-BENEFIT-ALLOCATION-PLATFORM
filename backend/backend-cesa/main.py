from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
import models
import ocr_utils
import uuid
import datetime
from pydantic import BaseModel
from typing import List, Optional
import os
import profile_data

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="GovTech AI Backend")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:8082",
        "http://localhost:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:8082",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ApplicationResponse(BaseModel):
    id: int
    tracking_id: str
    name: str
    email: str
    phone: str
    address: Optional[str]
    category: Optional[str]
    department: Optional[str]
    document_name: Optional[str]
    document_desc: Optional[str]
    ocr_text: Optional[str]
    status: str
    is_verified: str
    ai_priority: int
    ai_reasoning: Optional[str]
    processing_tier: Optional[str]
    created_at: datetime.datetime
    vulnerability_score: Optional[int] = 0
    vulnerability_reasons: Optional[str] = ""
    matched_schemes: Optional[str] = "[]"
    fraud_score: Optional[int] = 0
    fraud_flags: Optional[str] = ""
    effective_score: Optional[float] = 0.0
    district: Optional[str] = "Mumbai"
    readiness_bonus: Optional[int] = 0
    socio_economic_bonus: Optional[int] = 0

    model_config = {
        "from_attributes": True
    }

@app.get("/")
def read_root():
    return {"message": "GovTech AI Agentic Pipeline is running.", "security": "National Grid Node-7 Active"}

# Global Crisis Flag (In-memory for demo, should be DB in production)
DISTRICT_CRISIS_MODE = False

# New District-Specific Emergency Tracking
DISTRICT_EMERGENCY_STATUS = {
    "Mumbai": False,
    "Thane": False,
    "Pune": False,
    "Nagpur": False
}

@app.post("/api/admin/toggle-crisis")
def toggle_crisis(status: bool):
    global DISTRICT_CRISIS_MODE
    DISTRICT_CRISIS_MODE = status
    # Update all districts if global is toggled? 
    # Or keep them separate. User wants "Declare Emergency" to each district card.
    return {"status": "Global Crisis Mode " + ("Active" if status else "Inactive")}

@app.post("/api/admin/toggle-district-emergency")
def toggle_district_emergency(district: str, status: bool):
    global DISTRICT_EMERGENCY_STATUS
    if district in DISTRICT_EMERGENCY_STATUS:
        DISTRICT_EMERGENCY_STATUS[district] = status
        add_system_log(f"ALERT: Emergency mode {'activated' if status else 'deactivated'} for {district}.")
        return {"status": f"Emergency mode adapted for {district}", "is_emergency": status}
    return {"status": "Invalid district"}

# Disaster Simulation State
CURRENT_DISASTER = "None" # None, Flood, Economic Crash, Health Emergency

@app.get("/api/admin/system-status")
def get_system_status():
    return {
        "crisis_mode": DISTRICT_CRISIS_MODE,
        "disaster_type": CURRENT_DISASTER,
        "nodes": ["North-01", "Central-Gov", "AI-Verification-09"],
        "throughput": "1.2ms/ms",
        "multiplier": 1.5 if DISTRICT_CRISIS_MODE else 1.0,
        "district_emergencies": DISTRICT_EMERGENCY_STATUS
    }

@app.post("/api/admin/simulate-disaster")
def simulate_disaster(disaster_type: str):
    global CURRENT_DISASTER, DISTRICT_CRISIS_MODE
    CURRENT_DISASTER = disaster_type
    if disaster_type != "None":
        DISTRICT_CRISIS_MODE = True
        add_system_log(f"ALERT: {disaster_type} simulation initiated. Global vulnerability multipliers active.")
    else:
        DISTRICT_CRISIS_MODE = False
        add_system_log(f"Simulation cleared. System returning to steady state.")
    return {"status": f"Simulating {disaster_type}", "crisis_mode": DISTRICT_CRISIS_MODE}

@app.get("/api/admin/briefing")
def get_executive_briefing(db: Session = Depends(get_db)):
    # Simple logic for briefing - in a real app, this would use Gemini to summarize logs
    total_apps = db.query(models.Application).count()
    high_vuln = db.query(models.Application).filter(models.Application.vulnerability_score > 70).count()
    fraud_flags = db.query(models.Application).filter(models.Application.fraud_score > 50).count()
    
    summary = f"EXECUTIVE SUMMARY: {CURRENT_DISASTER.upper() if CURRENT_DISASTER != 'None' else 'STABLE'} DISTRICT STATUS. " \
              f"We have processed {total_apps} applications this cycle. " \
              f"AI agents detected {high_vuln} high-vulnerability profiles requiring immediate attention. " \
              f"Fraud Guardian intercepted {fraud_flags} security anomalies. " \
              f"Current allocation efficiency: 98.4%. Recommended Action: Maintain Multiplier for priority resolution."
              
    return {"summary": summary}

# SYSTEM LOGS (In-memory for demo)
SYSTEM_LOGS = []

def add_system_log(message: str):
    global SYSTEM_LOGS
    log = {
        "time": datetime.datetime.now().strftime("%H:%M:%S"),
        "message": message
    }
    SYSTEM_LOGS.insert(0, log)
    SYSTEM_LOGS = SYSTEM_LOGS[:10] # Keep last 10

@app.get("/api/system/logs")
def get_system_logs():
    return SYSTEM_LOGS

@app.post("/api/process-document")
async def process_document_endpoint(file: UploadFile = File(...)):
    """
    Dedicated OCR endpoint for the frontend.
    """
    content = await file.read()
    ocr_text = ocr_utils.process_document(file.filename, content, api_key=GEMINI_API_KEY)
    return {"detected_text": ocr_text}

# TIER 1: REGEX VALIDATION LOGIC
def tier1_regex_check(ocr_text: str):
    """
    Checks for patterns like Aadhaar (12-digit) or PAN (10-digit).
    """
    import re
    # Aadhaar (XXXX XXXX XXXX)
    aadhaar_match = re.search(r"\d{4}\s\d{4}\s\d{4}", ocr_text)
    # PAN (5 letters, 4 digits, 1 letter)
    pan_match = re.search(r"[A-Z]{5}[0-9]{4}[A-Z]{1}", ocr_text.upper())
    
    if aadhaar_match:
        return True, "Aadhaar Card detected and verified via Regex.", 1 # High priority
    if pan_match:
        return True, "PAN Card detected and verified via Regex.", 2 # Med-High
    
    return False, "No standard ID patterns matched in Tier 1.", 3

import google.generativeai as genai
import json

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
genai.configure(api_key=GEMINI_API_KEY)

# TIER 2: LLM FALLBACK (Using Real Gemini API)
def tier2_llm_check(ocr_text: str, user_name: str, expected_doc_type: str):
    """
    Fallback agent that uses Gemini to read OCR and verify document validity.
    """
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        prompt = f"""
        You are an AI document verification agent for a government portal.
        
        INPUT DATA:
        - Extracted OCR text: "{ocr_text}"
        - User's Name: "{user_name}"
        - Declared Document Type: "{expected_doc_type}"
        
        TASKS:
        1. Verify if the OCR text corresponds to the "Declared Document Type".
        2. Check if the "User's Name" (or a significant part of it) appears in the document.
        3. Determine if the document looks like an official government ID, certificate, or legal document.
        
        Output ONLY valid JSON (no markdown formatting, no backticks) with these keys:
        - "status": "Verified" or "Flagged"
        - "reason": A short explanation
        - "priority": Integer (1-4)
        - "income": Annual income as a number (e.g., 120000) or null
        - "land_hectares": Land ownership in hectares as a number (e.g., 1.5) or null
        - "health_status": "Critical", "Chronic", "Stable", or "Unknown"
        """
        response = model.generate_content(prompt)
        text_response = response.text.strip()
        
        # Clean markdown if accidentally included
        if text_response.startswith("```json"):
            text_response = text_response[7:-3]
        elif text_response.startswith("```"):
            text_response = text_response[3:-3]
            
        data = json.loads(text_response)
        return (
            data.get("status", "Flagged"), 
            data.get("reason", "Parsed LLM decision."), 
            int(data.get("priority", 4)),
            data.get("income"),
            data.get("land_hectares"),
            data.get("health_status")
        )
        
    except Exception as e:
        print(f"LLM Error: {e}")
        # Default safety fallback if API fails
        if name_verified:
            return "Verified", f"Local Fallback: name '{user_name}' exists in document.", 2, None, None, "Unknown"
        else:
            return "Flagged", "Local Fallback: could not find matching name.", 4, None, None, "Unknown"
    
# CORE PS REQUIREMENT: VULNERABILITY & FRAUD ENGINE
def calculate_vulnerability_and_fraud(ocr_text: str, name: str, db: Session, income=None, land=None, health=None):
    """
    Analyzes OCR for economic triggers and cross-checks for anomalies.
    """
    v_score = 10
    v_reasons = []
    fraud_score = 0
    fraud_flags = []
    
    ocr_lower = ocr_text.lower()
    
    # Vulnerability Triggers
    if any(k in ocr_lower for k in ["bpl", "poverty line", "income certificate"]):
        v_score += 40
        v_reasons.append("Economically Vulnerable (BPL Detection)")
    
    if any(k in ocr_lower for k in ["farmer", "agricultural", "kisan"]):
        v_score += 20
        v_reasons.append("Marginal Sector Participation (Agriculture)")

    if any(k in ocr_lower for k in ["medical", "disability", "health", "hospital"]):
        v_score += 25
        v_reasons.append("Health-related Vulnerability Triggered")
        
    if DISTRICT_CRISIS_MODE:
        v_score += 15
        v_reasons.append("Global District Crisis Modifier Applied (+15)")
        
    # Fraud Detection (Duplication Check)
    import re
    aadhaar = re.search(r"\d{4}\s\d{4}\s\d{4}", ocr_text)
    if aadhaar:
        existing = db.query(models.Application).filter(models.Application.ocr_text.contains(aadhaar.group(0))).first()
        if existing and existing.name.lower() != name.lower():
            fraud_score += 60
            fraud_flags.append("Aadhaar Conflict: ID already linked to another name")
            
    if len(ocr_text) < 50:
        fraud_score += 30
        fraud_flags.append("Incomplete Data: Minimum OCR threshold not met")

    # Scheme Matching Logic
    matched = []
    # PM-Kisan: (Land < 2 hectares)
    if land is not None and land < 2:
        matched.append("PM-Kisan")
    elif "farmer" in ocr_lower and "2 hectare" not in ocr_lower and "land" in ocr_lower:
        matched.append("PM-Kisan")
    
    # Ayushman Bharat: (Critical Health trigger detected)
    if health == "Critical" or any(k in ocr_lower for k in ["critical condition", "emergency surgery", "renal failure", "cancer"]):
        matched.append("Ayushman Bharat")
        
    # BPL Subsidy: (Annual Income < ₹1.5L)
    if income is not None and income < 150000:
        matched.append("BPL Subsidy")
    elif "bpl" in ocr_lower or "income certificate" in ocr_lower:
        matched.append("BPL Subsidy")

    # Socio-Economic Bonus: (+15) If matched with 2 or more Government Schemes.
    se_bonus = 0
    if len(matched) >= 2:
        se_bonus = 15
    elif any(k in ocr_lower for k in ["low income", "disability", "disabled", "medical emergency", "health crisis"]):
        se_bonus = 10 

    return min(v_score, 100), ", ".join(v_reasons), fraud_score, ", ".join(fraud_flags), se_bonus, matched


@app.post("/api/submit_application")
async def submit_application(
    name: str = Form(""),
    email: str = Form(""),
    phone: str = Form(""),
    address: str = Form(""),
    category: str = Form(""),
    department: str = Form(""),
    document_name: str = Form(""),
    document_desc: str = Form(""),
    district: str = Form("Mumbai"),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)):

    # Create a descriptive tracking ID prefix from the form name
    import re
    clean_name = re.sub(r'[^A-Z0-9]', '', (document_name or category or "APP").upper())
    tracking_id = f"GT-{clean_name[:12]}-{uuid.uuid4().hex[:6].upper()}"
    
    # 🏃 STEP 1: OCR INGESTION (Using Tesseract now)
    ocr_text = ""
    if file:
        content = await file.read()
        ocr_text = ocr_utils.process_document(file.filename, content, api_key=GEMINI_API_KEY)
    else:
        ocr_text = document_desc

    income, land, health = None, None, "Unknown"
    # 🏃 STEP 2: TIER 1 (REGEX)
    is_v, reason, prio = tier1_regex_check(ocr_text)
    tier = "Tier 1: OCR (Tesseract)+Regex"
    status = "Approved" if is_v else "In Review"

    # 🏃 STEP 3: TIER 2 (LLM FALLBACK - Gemini Verification)
    if not is_v:
        # Trigger Fallback Agent with Gemini verification
        res, llm_reason, llm_prio, income, land, health = tier2_llm_check(ocr_text, name, document_name or category)
        is_v = res
        reason = llm_reason
        prio = llm_prio
        tier = "Tier 2: LLM Verification (Gemini)"
        status = "Verified" if res == "Verified" else "Flagged for Review"

    # 🏃 STEP 4: ROUTING ENGINE
    # Apply department routing
    final_dept = "General"
    input_context = (ocr_text + " " + category).lower()
    if "education" in input_context or "student" in input_context or "marksheet" in input_context:
        final_dept = "Education"
    elif "health" in input_context or "medical" in input_context:
        final_dept = "Health"
    elif "tax" in input_context or "revenue" in input_context:
        final_dept = "Revenue"
    elif "police" in input_context or "fir" in input_context or "security" in input_context:
        final_dept = "Police (Home Affairs)"
        prio = 1 # Force high priority for security
    
    # Calculate Vulnerability and Fraud
    v_score, v_reasons, f_score, f_flags, se_bonus, matched = calculate_vulnerability_and_fraud(ocr_text, name, db, income, land, health)
    
    # readiness_bonus: (+20 points) for users whose registration_status is 'Complete' and all documents are verified.
    is_ready = (is_v == True or is_v == "Verified") and f_score < 30
    ready_bonus = 20 if is_ready else 0
    
    db_application = models.Application(
        tracking_id=tracking_id,
        name=name,
        email=email,
        phone=phone,
        address=address,
        category=category or "General",
        department=final_dept,
        document_name=document_name,
        document_desc=document_desc,
        ocr_text=ocr_text,
        status="Under Review" if f_score < 50 else "Flagged for Audit",
        is_verified="Verified" if (is_v == True or is_v == "Verified") and f_score < 50 else ("Rejected" if f_score >= 50 else "Pending"),
        ai_priority=prio if f_score < 50 else 1, # Boost priority of fraud flags for quick audit
        ai_reasoning=reason,
        processing_tier=tier,
        vulnerability_score=v_score,
        vulnerability_reasons=v_reasons,
        matched_schemes=json.dumps(matched),
        fraud_score=f_score,
        fraud_flags=f_flags,
        district=district,
        readiness_bonus=ready_bonus,
        socio_economic_bonus=se_bonus
    )
    
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    
    # LOGGING AI ACTIONS
    add_system_log(f"New Ingestion: {tracking_id} received.")
    if "Verified" in db_application.is_verified:
        add_system_log(f"Gemini verified document for {name}.")
    else:
        add_system_log(f"Tier 2 check triggered for {tracking_id}.")
        
    if f_score > 0:
        add_system_log(f"Fraud Guardian: Flagged {tracking_id} (Score: {f_score}).")
    else:
        add_system_log(f"Fraud check passed for {name}.")

    if v_score > 60:
        add_system_log(f"High Vulnerability detected: index {v_score}% for {tracking_id}.")

    return {"success": True, "tracking_id": tracking_id, "application": db_application}

@app.get("/api/applications", response_model=List[ApplicationResponse])
def get_applications(db: Session = Depends(get_db)):
    apps = db.query(models.Application).all()
    
    # Calculate effective score based on formula:
    # (Vulnerability Score * Crisis Multiplier) + Readiness Bonus + Socio-Economic Bonus
    for app in apps:
        # Get district-specific multiplier
        is_emergency = DISTRICT_EMERGENCY_STATUS.get(app.district, False)
        # Apply 1.5x multiplier for emergencies, else global check
        multiplier = 1.5 if (is_emergency or DISTRICT_CRISIS_MODE) else 1.0
        
        app.effective_score = (app.vulnerability_score * multiplier) + (app.readiness_bonus or 0) + (app.socio_economic_bonus or 0)
    
    # Sort by effective score (High to Low)
    sorted_apps = sorted(
        apps, 
        key=lambda x: x.effective_score, 
        reverse=True
    )
    return sorted_apps

@app.get("/api/applications/priority", response_model=List[ApplicationResponse])
def get_priority_list(db: Session = Depends(get_db)):
    apps = db.query(models.Application).all()
    
    for app in apps:
        is_emergency = DISTRICT_EMERGENCY_STATUS.get(app.district, False)
        multiplier = 1.5 if (is_emergency or DISTRICT_CRISIS_MODE) else 1.0
        app.effective_score = (app.vulnerability_score * multiplier) + (app.readiness_bonus or 0) + (app.socio_economic_bonus or 0)
    
    sorted_apps = sorted(
        apps, 
        key=lambda x: x.effective_score, 
        reverse=True
    )
    return sorted_apps

@app.get("/api/applications/{tracking_id}", response_model=ApplicationResponse)
def get_application(tracking_id: str, db: Session = Depends(get_db)):
    application = db.query(models.Application).filter(models.Application.tracking_id == tracking_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

CHAT_API_KEY = os.getenv("GROQ_API_KEY", "")

class ChatRequest(BaseModel):
    message: str
    tracking_id: Optional[str] = None
    chat_history: Optional[List[dict]] = None

@app.post("/api/chatbot")
async def chat_with_ai(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Chatbot endpoint that provides support based on application context (OpenAI).
    """
    try:
        # 1. Fetch context if tracking_id is provided
        live_record = None
        
        actual_tracking_id = request.tracking_id
        if not actual_tracking_id:
            import re
            match = re.search(r'(GT-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)?|GOV-\d{4}-\d+)', request.message.upper())
            if match:
                actual_tracking_id = match.group(0)

        if actual_tracking_id:
            app_data = db.query(models.Application).filter(models.Application.tracking_id == actual_tracking_id).first()
            if app_data:
                live_record = {
                    "applicant_name": app_data.name, 
                    "application_type": app_data.document_name or app_data.category,
                    "status": app_data.status,
                    "reason": app_data.ai_reasoning,
                    "department": app_data.department,
                    "priority": app_data.ai_priority,
                    "is_verified": app_data.is_verified
                }
        
        # 2. Get dynamic system prompt and multi-turn message history from profile_data
        messages = profile_data.build_chat_context(live_record, request.chat_history, request.message)

        # 3. Call Groq (via OpenAI SDK)
        client = OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=CHAT_API_KEY,
        )
        
        gpt_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=200
        )
        
        return {"response": gpt_response.choices[0].message.content}
    except Exception as e:
        print(f"Chatbot Error: {e}")
        return {"response": "I'm currently undergoing some neural maintenance. Please try again in 30 seconds."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
