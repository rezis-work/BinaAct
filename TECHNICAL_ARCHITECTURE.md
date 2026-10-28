6. High-Level Technical Architecture

This is where I would make an important engineering decision.

For BinaAct V1, we do not need a traditional backend.

We can create a fully functional MVP using only SvelteKit.

Why?

Because we are not currently implementing:

Accounts.

Server-side document storage.

Payments.

User dashboards.

Collaboration.

Third-party APIs.

Our core workflow is collecting information and generating a PDF.

That can happen directly in the user's browser.

Recommended Technology Stack

Layer	Technology

Frontend	SvelteKit

Language	TypeScript

UI	Tailwind CSS

Components	shadcn-svelte

Form Validation	Zod

Local Draft Storage	IndexedDB

PDF Generation	pdf-lib + fontkit

Image Processing	Browser Canvas API

Deployment	Vercel or Cloudflare Pages

Analytics	Lightweight anonymous event analytics

Backend API	Not required

Database Server	Not required

Authentication	Not required

For the PDF, we'll need to embed a font that properly supports Georgian characters.

We should test its rendering early because Georgian text support is a critical requirement.

---

6.1 Architecture Diagram

USER

|

▼

BinaAct Website

SvelteKit

|

┌───────────┴───────────┐

|                       |

▼                       ▼

Form Engine            Photo Engine

|                       |

▼                       ▼

Zod Validation         Photo Preview

|                       |

▼                       ▼

Local Draft Data       Image Compression

|                       |

└───────────┬───────────┘

|

▼

IndexedDB

(Current Device)

|

▼

PDF Generator

|

▼

Georgian PDF

|

▼

DOWNLOAD

All report data processing happens on the client.

Why This Architecture?

1. Cheaper

No database hosting.

No storage bucket.

No dedicated backend servers.

2. Faster to build

One developer builds one application.

3. Better initial privacy

Reports and photos do not need to leave the user's browser.

4. Easier maintenance

There are fewer moving parts.

5. Easier validation

We can launch quickly and focus on whether people actually want the product.

If customers later request cloud document storage, accounts, or electronic signatures, we can introduce a backend.

---

6.2 Detailed Module Breakdown (Mapped to FR & NFR)

1. Form Engine & Zod Schemas (`src/lib/schemas/`)
- Maps directly to FR-002 (Apartment Info), FR-003 (Landlord/Tenant), FR-004 (Room Checklist), FR-006 (Inventory), FR-007 (Utility Meters), and FR-008 (Keys).
- Enforces NFR-002 (input validation, no raw HTML rendering), NFR-005 (clear Georgian validation messages), and NFR-007 (strict TypeScript types inferred from Zod schemas).
- Inspection types: `ბინის გადაცემა` (Move-in) and `ბინის დაბრუნება` (Move-out).
- Room condition enum: `კარგი` (Good), `მცირე დაზიანება` (Minor damage), `დაზიანებული` (Damaged), `არ შემოწმებულა` (Not inspected).
- Default rooms (`მისაღები ოთახი`, `საძინებელი`, `სამზარეულო`, `სააბაზანო`, `აივანი`) auto-populate with default components (`კედლები`, `იატაკი`, `ფანჯრები`, `კარი`, `ჭერი`) set to `კარგი` for fast completion.

2. Photo Engine (`src/lib/photos/`)
- Maps to FR-005 (Photo Attachments) and NFR-001 / NFR-002 / NFR-003 / NFR-004.
- Enforces limits: max 12 photos per report, max 10 MB per uploaded file, accepted MIME types `image/jpeg`, `image/png`, `image/webp`.
- Uses Browser Canvas API / `createImageBitmap` to preserve EXIF orientation, resize/compress images asynchronously without freezing the UI (NFR-001), and store compressed blobs/data URLs locally linked to specific room IDs.
- Zero server uploads or third-party photo services (NFR-002, NFR-003).

3. Local Draft Persistence (`src/lib/storage/draft.ts`)
- Maps to NFR-003 (Privacy) and NFR-005 (Reliability).
- Stores current report state and compressed room photos in browser `IndexedDB` so page refreshes or accidental tab closures on mobile do not lose progress.
- Displays a clear notice in Georgian that drafts are saved only on the current device and may be cleared if browser data is wiped.
- Provides a "Clear / Reset Draft" action after PDF download or upon starting a fresh report.

4. Client-Side Georgian PDF Generator (`src/lib/pdf/`)
- Maps to FR-010 (PDF Generation), NFR-001 (<10s generation), and NFR-007 (separated PDF generation logic).
- Uses `pdf-lib` + `@pdf-lib/fontkit` with an embedded Unicode Georgian font (e.g., `Noto Sans Georgian` Regular & Bold bundled in `static/fonts/`).
- Renders A4 pages with automatic pagination so long notes, inventory tables, and room photo grids never overlap.
- Includes all required sections:
  - Header (`ბინის მიღება-ჩაბარების აქტი`, date, address, apartment number, inspection type, landlord & tenant info)
  - `1. ბინის მდგომარეობა` (room-by-room checklists & notes)
  - `2. ავეჯი და ტექნიკა` (tabular inventory)
  - `3. კომუნალური მრიცხველები` (electricity, water, gas)
  - `4. გასაღებები` (apartment keys, building entrance chips, notes)
  - Room photographs grouped by room
  - `5. მხარეთა ხელმოწერები` (handwritten signature lines for `გამქირავებელი` and `დამქირავებელი`)
  - Legal/verification disclaimer in Georgian explaining the document is user-supplied for physical printing/signing and is not a qualified electronic signature.
- Triggers browser download with filename `BinaAct_YYYY-MM-DD.pdf`.

5. UI, Routing & Accessibility (`src/routes/`, `src/lib/components/`)
- Maps to FR-001 (Homepage), FR-009 (Report Review), NFR-004 (Mobile Responsiveness), and NFR-006 (Accessibility).
- Built with Tailwind CSS + `shadcn-svelte` components, large touch targets for Android Chrome & iPhone Safari, high-contrast Georgian typography, and step-by-step navigation allowing instant jump-back from Review (`FR-009`) to any section.
