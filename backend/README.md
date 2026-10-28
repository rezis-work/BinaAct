# BinaAct (ბინააქტი) — Backend (`backend/`)

**FastAPI Service for Apartment Move-In / Move-Out Handover Act Validation & Georgian PDF Generation**

- **Target Market:** Georgia (Initial Launch: Tbilisi)
- **Primary Language:** Georgian
- **Version:** 1.0 — Minimum Viable Product (MVP)
- **Monetization:** Free during validation
- **Development Priority:** Small, functional, testable (5–7 working days estimate)

---

## Overview

The BinaAct backend is a lightweight, stateless FastAPI service that validates apartment inspection data submitted from the SvelteKit frontend and generates a clean, printable **Georgian-language PDF handover act** (*ბინის მიღება-ჩაბარების აქტი*).

The goal is not to create a complete property management platform, but **one small tool that solves one specific problem** without persistent user accounts or cloud document storage.

---

## MVP Scope (Backend Responsibilities)

### Included in MVP

| Feature | Priority | Backend Implementation Details |
| :--- | :---: | :--- |
| **Apartment Information** | **P0** | Pydantic schema validation for apartment address, unit details, and metadata. |
| **Landlord & Tenant Information** | **P0** | Schema validation for landlord and tenant names, Georgian personal IDs (*პირადი ნომერი*), and contact info. |
| **Move-In / Move-Out Inspection Type** | **P0** | Enum/validation for inspection type (*შესვლა / Move-In* vs. *გასვლა / Move-Out*) and date/time. |
| **Room Condition Checklist** | **P0** | Structured schemas for rooms, checklist items, condition states, and Georgian comments. |
| **Photo Attachments** | **P0** | In-memory image processing/resizing and embedding directly into the generated PDF (no cloud storage). |
| **Furniture & Appliance Inventory** | **P0** | Validation and tabular PDF rendering for furniture/appliance items, quantities, and conditions. |
| **Utility Meter Readings** | **P0** | Validation and rendering for electricity, gas, water, and other utility meter values. |
| **Key Handover Information** | **P0** | Validation and rendering for key types and counts handed over between parties. |
| **Georgian PDF Generation** | **P0** | Full Unicode Georgian font support (`Sylfaen` / `Noto Sans Georgian` / `DejaVu`) to stream a formatted PDF document with physical signature lines. |
| **Mobile-Friendly Payload Handling** | **P0** | Fast multipart/JSON payload handling optimized for mobile uploads and immediate streaming response. |
| **Basic Anonymous Analytics** | **P1** | Optional lightweight endpoint or counter for anonymous usage metrics (e.g., PDF generation count) without storing PII. |

### Explicitly Excluded from v1 MVP

Do **not** implement any of the following until demand is validated:

- Authentication or user registration
- User profiles
- Subscription or payment processing
- AI features
- Electronic signatures
- Email or SMS notifications
- Landlord/tenant messaging
- Property management dashboards
- Apartment listings
- Document cloud storage (all PDF generation is done on-the-fly and streamed back to the client)
- Public document-sharing links
- Advanced document verification
- Move-in vs. move-out comparison

---

## Tech Stack

- **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **ASGI Server:** Uvicorn
- **Data Validation:** Pydantic v2 (`pydantic`, `pydantic-settings`)
- **Runtime:** Python 3.12+

---

## Local Development

### Prerequisites

- Python `3.12+`
- Virtual environment (`venv`) located in `backend/venv`

### 1. Activate Virtual Environment & Install Dependencies

**Windows (Bash / Git Bash):**
```bash
cd backend
source venv/Scripts/activate
pip install -r requirements.txt
```

**Windows (PowerShell):**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Run the Development Server

```bash
cd backend
./venv/Scripts/fastapi.exe dev main.py
```

Or with Uvicorn directly:

```bash
./venv/Scripts/uvicorn.exe main:app --reload --host 127.0.0.1 --port 8000
```

### 3. API Endpoints & Documentation

- **API Root:** `http://127.0.0.1:8000/`
- **Health Check:** `http://127.0.0.1:8000/api/health`
- **Interactive Swagger UI:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`
