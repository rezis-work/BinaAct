8. Application Pages

Our MVP only needs a small number of pages.

Route	Page	Purpose

/	Homepage	Explain the product

/create	Create Report	Complete inspection

/review	Review Report	Check collected information

/privacy	Privacy Policy	Explain local storage and privacy

We can make the creation form a single guided page.

For example:

Step 1: ბინის ინფორმაცია

Step 2: ბინის მდგომარეობა

Step 3: დამატებითი ინფორმაცია

Step 4: აქტის გადახედვა

There's no need to create a separate route for every individual field.

---

8.1 Detailed Route & Guided Wizard Specification

1. `/` — Homepage (`src/routes/+page.svelte`)
- **Maps to:** `FR-001`, `NFR-001`, `NFR-004`, `NFR-006`
- **Content & Elements:**
  - Application name & logo (`BinaAct / ბინააქტი`).
  - Headline: `ბინის მიღება-ჩაბარების აქტი — მარტივად და სწრაფად`
  - Description: `შექმენით ბინის მიღება-ჩაბარების აქტი, აღწერეთ ბინის მდგომარეობა, დაამატეთ ფოტოები და ჩამოტვირთეთ PDF დოკუმენტი.`
  - Primary CTA button: `აქტის შექმნა` (navigates to `/create`).
  - If a local draft already exists in IndexedDB, optionally show a secondary action to continue the saved draft or start fresh.
  - Three-step visual explanation of how BinaAct works.
  - Basic privacy summary with a link to `/privacy`.

2. `/create` — Guided Inspection Wizard (`src/routes/create/+page.svelte`)
- **Maps to:** `FR-002` through `FR-008`, `NFR-003`, `NFR-004`, `NFR-005`
- **Structure:** Single guided page with a 4-step progress indicator and automatic IndexedDB draft persistence on every change:
  - **Step 1: ბინის ინფორმაცია** (`FR-002`, `FR-003`)
    - Inspection type (`ბინის გადაცემა` / `ბინის დაბრუნება`), inspection date, full apartment address, optional apartment number, optional notes.
    - Landlord (`გამქირავებელი`) full name & optional phone.
    - Tenant (`დამქირავებელი`) full name & optional phone.
  - **Step 2: ბინის მდგომარეობა** (`FR-004`, `FR-005`)
    - Add predefined rooms (`მისაღები ოთახი`, `საძინებელი`, `სამზარეულო`, `სააბაზანო`, `აივანი`) or custom room names.
    - Auto-populated component checklist (`კედლები`, `იატაკი`, `ფანჯრები`, `კარი`, `ჭერი`) with 4 condition options (`კარგი`, `მცირე დაზიანება`, `დაზიანებული`, `არ შემოწმებულა`).
    - Optional room notes.
    - Per-room photo attachments (camera/gallery upload, client-side Canvas compression, preview & delete, up to 12 photos total across the report).
  - **Step 3: დამატებითი ინფორმაცია** (`FR-006`, `FR-007`, `FR-008`)
    - **Furniture & Appliance Inventory (`FR-006`):** Quick-add suggested chips (`სარეცხი მანქანა`, `მაცივარი`, `ტელევიზორი`, `საწოლი`, `დივანი`, `მაგიდა`) + custom items with quantity, condition, and optional note.
    - **Utility Meter Readings (`FR-007`):** Optional numeric inputs for `ელექტროენერგია` (kWh), `წყალი` (m³), and `ბუნებრივი აირი` (m³).
    - **Key Handover (`FR-008`):** Apartment keys count, building entrance keys/chips count, and additional notes.
  - **Step 4: აქტის გადახედვა** (`FR-009`, `FR-010`)
    - Can either render inline as Step 4 of `/create` or navigate directly to `/review` (both routes share the same review & PDF generation component so `/review` works as a direct route and as Step 4).

3. `/review` — Review Report & Generate PDF (`src/routes/review/+page.svelte`)
- **Maps to:** `FR-009`, `FR-010`, `NFR-001`, `NFR-005`
- **Content & Elements:**
  - Complete read-only summary of all collected sections: Apartment info, Landlord & Tenant details, Room checklists & attached photo thumbnails, Furniture inventory table, Utility meter readings, and Keys.
  - "Edit" (`რედაქტირება`) buttons on each section that jump directly back to `/create?step=1|2|3` so the user can fix any detail without losing data.
  - Legal/verification notice explaining the PDF is generated for printing and physical signing.
  - Primary button: `PDF-ის გენერაცია და ჩამოტვირთვა` (triggers client-side `pdf-lib` + `fontkit` generation of `BinaAct_YYYY-MM-DD.pdf`, with retry support if an error occurs).

4. `/privacy` — Privacy Policy (`src/routes/privacy/+page.svelte`)
- **Maps to:** `FR-001`, `NFR-002`, `NFR-003`
- **Content & Elements:**
  - Clear explanation in Georgian that BinaAct processes all apartment data, personal names, and photographs **exclusively inside the user's browser**.
  - Explanation that no photos or reports are uploaded to any server or cloud storage.
  - Explanation of local draft storage (`IndexedDB`) on the current device, how it disappears when browser data is cleared, and a button to manually clear saved local data immediately.
