# BinaAct (ბინააქტი) — Frontend (`frontend/`)

**Mobile-First SvelteKit Web Application for Apartment Move-In / Move-Out Handover Acts in Georgia**

- **Target Market:** Georgia (Initial Launch: Tbilisi)
- **Primary Language:** Georgian
- **Version:** 1.0 — Minimum Viable Product (MVP)
- **Monetization:** Free during validation
- **Development Priority:** Small, functional, testable (5–7 working days estimate)

---

## Overview

The BinaAct frontend is a stateless, mobile-first SvelteKit application designed for landlords and tenants in Georgia to fill out an apartment inspection and handover act (*ბინის მიღება-ჩაბარების აქტი*) directly on their phone during move-in or move-out and generate a downloadable Georgian PDF document.

The goal is not to build a full property management platform, but **one small tool that solves one specific problem**.

---

## MVP Scope (Frontend Responsibilities)

### Included in MVP

| Feature | Priority | Frontend Implementation Details |
| :--- | :---: | :--- |
| **Apartment Information** | **P0** | Form inputs for address (city, district/street, building, apartment number, cadastral code/notes). |
| **Landlord & Tenant Information** | **P0** | Inputs for full names, personal ID numbers (*პირადი ნომერი*), phone numbers, and optional emails. |
| **Move-In / Move-Out Inspection Type** | **P0** | Selector for handover type (*შესვლა / Move-In* or *გასვლა / Move-Out*) and inspection date. |
| **Room Condition Checklist** | **P0** | Structured room-by-room condition ratings and defect notes (walls, floors, windows, doors, plumbing, etc.). |
| **Photo Attachments** | **P0** | Mobile camera / gallery photo selection, client-side preview & compression, attached to rooms/items/meters. |
| **Furniture & Appliance Inventory** | **P0** | Dynamic list of furniture and appliances with quantity, brand/description, and working condition. |
| **Utility Meter Readings** | **P0** | Inputs for electricity, gas, water, and heating/building service meter readings. |
| **Key Handover Information** | **P0** | Inputs for number and types of keys/fobs/cards handed over (main door, building entrance, elevator, mailbox). |
| **Georgian PDF Generation** | **P0** | Submission of validated handover payload + photos to the FastAPI backend and immediate download of the Georgian PDF. |
| **Mobile-Friendly Interface** | **P0** | Touch-friendly, responsive step-by-step wizard usable on smartphones during an on-site apartment walkthrough. |
| **Basic Anonymous Analytics** | **P1** | Lightweight, privacy-friendly event tracking (e.g., form started, step completed, PDF generated) with no PII. |

### Explicitly Excluded from v1 MVP

Do **not** implement any of the following until demand is validated:

- Authentication or user registration
- User profiles
- Subscription or payment flows
- AI features
- Electronic signatures
- Email or SMS notifications
- Landlord/tenant messaging
- Property management dashboards
- Apartment listings
- Document cloud storage
- Public document-sharing links
- Advanced document verification
- Move-in vs. move-out comparison

---

## Tech Stack

- **Framework:** [SvelteKit](https://svelte.dev/docs/kit) (Svelte 5 with Runes)
- **Language:** TypeScript
- **Bundler / Dev Server:** Vite (configured with `/api` proxy to FastAPI on `http://127.0.0.1:8000`)

---

## Local Development

### Prerequisites

- Node.js `v20+` (or `v22+`)
- npm `v10+`

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`. API requests to `/api/*` are automatically proxied to the FastAPI backend at `http://127.0.0.1:8000`.

### 3. Typechecking & Production Build

```bash
# Run Svelte & TypeScript checks
npm run check

# Build for production
npm run build

# Preview production build
npm run preview
```
