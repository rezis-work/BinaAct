4. Functional Requirements

These are the exact capabilities our MVP must provide.

FR-001 — Homepage

Description

The application must provide a simple landing page explaining what BinaAct does.

Requirements

The homepage must display:

Application name and logo.

Short product explanation.

Main CTA: „აქტის შექმნა“.

Three-step explanation of how BinaAct works.

Basic privacy information.

Acceptance Criteria

✅ Users can access the homepage without authentication.

✅ Clicking „აქტის შექმნა“ opens the document creation form.

✅ The website works on mobile and desktop.

---

FR-002 — Apartment Information

Description

Users must provide basic apartment information before creating a report.

Fields

Field	Required	Example

Full apartment address	Yes	თბილისი, საბურთალო, ყაზბეგის 12

Apartment number	No	45

Inspection date	Yes	18/10/2026

Inspection type	Yes	Move-in

Additional notes	No	ბინა მე-5 სართულზე

Inspection Types

We support two options.

Option 1: ბინის გადაცემა

Used when a tenant moves into an apartment.

Option 2: ბინის დაბრუნება

Used when a tenant moves out.

Both use the same form in MVP.

We are not building a historical comparison system.

Acceptance Criteria

✅ Users can enter apartment information.

✅ Required fields are validated.

✅ Users can choose an inspection type.

✅ Information appears correctly in the PDF.

---

FR-003 — Landlord and Tenant Information

Description

The generated document must identify the parties involved.

Fields

Landlord — გამქირავებელი

Field	Required

Full name	Yes

Phone number	No

Tenant — დამქირავებელი

Field	Required

Full name	Yes

Phone number	No

Example

გამქირავებელი: გიორგი მაისურაძე

დამქირავებელი: ნიკა ბერიძე

Users should not need to upload ID cards or enter personal identification numbers.

We should avoid collecting unnecessary sensitive information.

Acceptance Criteria

✅ Both names appear in the generated document.

✅ Phone numbers are optional.

✅ The user can edit this information before downloading.

---

FR-004 — Room Condition Checklist

Description

This is one of BinaAct's most important features.

Users must be able to document the condition of individual rooms.

Default Room Types

When creating a report, users can add predefined rooms:

1. მისაღები ოთახი — Living room

2. საძინებელი — Bedroom

3. სამზარეულო — Kitchen

4. სააბაზანო — Bathroom

5. აივანი — Balcony

Users can also add a custom room.

For example:

საძინებელი 2

Room Inspection Fields

Each room contains a simple checklist.

Example: Living Room

Component	Condition

Walls	Good

Floor	Minor damage

Windows	Good

Doors	Good

Ceiling	Good

Condition Options

Only four options:

✅ კარგი — Good

⚠️ მცირე დაზიანება — Minor damage

❌ დაზიანებული — Damaged

➖ არ შემოწმებულა — Not inspected

Each room can include an optional description.

Example:

> კედელზე არის მცირე ნაკაწრები ფანჯრის მარცხენა მხარეს.

Important UX Requirement

Users should not need to manually create every checklist field.

When they select a room, we automatically show the default checklist.

They only select the condition.

This is important because it makes document creation much faster.

Acceptance Criteria

✅ Users can add rooms.

✅ Users can remove rooms.

✅ Users can select condition values.

✅ Users can enter additional notes.

✅ Each room is displayed separately in the PDF.

---

FR-005 — Photo Attachments

Description

Users must be able to attach photographs documenting apartment conditions.

Example:

A bedroom has a scratched wall.

The user selects:

მცირე დაზიანება

They upload a photograph showing the scratch.

The PDF includes both the description and photograph.

Functional Requirements

Upload photos from mobile or desktop.

Attach photos to a specific room.

Preview uploaded photos.

Remove photos before generating the report.

Include photographs in the final PDF.

MVP Limits

Constraint	Value

Maximum photos	12 per report

Maximum uploaded file size	10 MB per photo

Supported formats	JPG, PNG, WebP

Photo storage	Local browser only

Compression	Automatic before PDF generation

We don't need Amazon S3 or Cloudflare R2 yet.

The browser can process photographs locally.

Photos will not be uploaded to our servers.

Acceptance Criteria

✅ Users can upload photographs.

✅ Photos can be previewed.

✅ Unsupported files display an error.

✅ Photos appear under the correct rooms in the PDF.

✅ Image orientation is preserved.

✅ The document remains readable after image compression.

---

FR-006 — Furniture & Appliance Inventory

Description

Users must be able to record furniture and appliances included in an apartment.

This is especially important for furnished rentals in Tbilisi.

Example Inventory

Item	Quantity	Condition

Washing machine	1	Good

Refrigerator	1	Good

Television	1	Damaged

Sofa	1	Good

Bed	2	Good

Functionality

The application must allow users to:

Add an inventory item.

Enter the item name.

Enter quantity.

Select condition.

Add an optional note.

Remove an inventory item.

We can provide a few suggested items to make entry easier.

For example:

სარეცხი მანქანა

მაცივარი

ტელევიზორი

საწოლი

დივანი

მაგიდა

Acceptance Criteria

✅ Users can create an inventory list.

✅ Users can remove inventory items.

✅ Every inventory item can have a condition.

✅ The inventory appears as a table inside the PDF.

---

FR-007 — Utility Meter Readings

Description

An apartment handover document should include utility meter readings.

This helps avoid disputes about consumption before and after a tenancy.

Supported Utilities

Utility	Georgian	Example

Electricity	ელექტროენერგია	15,420 kWh

Water	წყალი	250 m³

Gas	ბუნებრივი აირი	8,540 m³

All fields are optional because not every apartment has a separate meter for every utility.

Acceptance Criteria

✅ Users can enter numeric meter readings.

✅ Values are validated.

✅ Users can leave unavailable utilities empty.

✅ Recorded values appear in the PDF.

---

FR-008 — Key Handover Information

Description

Users must be able to record the number of keys provided to the tenant.

Fields

Field	Example

Apartment keys	2

Building entrance keys/chips	1

Additional notes	პარკინგის პულტი — 1 ცალი

Acceptance Criteria

✅ Users can record key quantities.

✅ Users can enter additional information.

✅ Key handover information appears in the document.

---

FR-009 — Report Review

Description

Before generating the PDF, users must be able to review their information.

The review page displays:

Apartment address.

Inspection date and type.

Landlord information.

Tenant information.

Room checklist.

Photos.

Inventory.

Utility readings.

Keys.

Users should be able to return to a section and correct mistakes.

Acceptance Criteria

✅ Users can review the complete document.

✅ Users can edit information before PDF generation.

✅ The final document uses the latest information.

---

FR-010 — PDF Generation

Description

This is our core feature.

The application must generate a professional Georgian PDF containing all inspection information.

PDF Structure

Page 1: Document Header

ბინის მიღება-ჩაბარების აქტი

თარიღი: 18.10.2026

ბინის მისამართი:

თბილისი, საბურთალო, ყაზბეგის 12

გამქირავებელი:

გიორგი მაისურაძე

დამქირავებელი:

ნიკა ბერიძე

1. ბინის მდგომარეობა

მისაღები ოთახი

კედლები: კარგი

იატაკი: მცირე დაზიანება

ფანჯრები: კარგი

კარი: კარგი

შენიშვნა:

იატაკზე არის მცირე ნაკაწრები.

2. ავეჯი და ტექნიკა

სარეცხი მანქანა — 1 — კარგი

მაცივარი — 1 — კარგი

3. კომუნალური მრიცხველები

ელექტროენერგია: 15420 kWh

წყალი: 250 m³

ბუნებრივი აირი: 8540 m³

4. გასაღებები

ბინის გასაღები: 2

სადარბაზოს ჩიპი: 1

5. მხარეთა ხელმოწერები

გამქირავებელი: _________________

დამქირავებელი: _________________

Photographs should appear in an additional section, grouped by room.

PDF Requirements

A4 document format.

Fully supported Georgian characters.

Clean typography.

Correctly formatted tables.

Images embedded in the document.

Print-friendly layout.

Spaces for handwritten signatures.

Automatically generated filename.

Example filename:

BinaAct_2026-10-18.pdf

Important Legal Consideration

For the MVP, we are generating an inspection document that parties can print and sign manually.

We are not providing legally verified electronic signatures.

Georgia's legislation distinguishes electronic signatures and qualified electronic signatures, so we should not imply that an unsigned generated PDF is automatically equivalent to a fully executed, signed agreement.

The PDF should also explain that the information was supplied by the user and has not been independently verified.

Acceptance Criteria

✅ PDF downloads successfully.

✅ Georgian text displays correctly.

✅ Photographs appear correctly.

✅ Long tables and notes do not overlap.

✅ Users can print and manually sign the document.

✅ PDF generation works on Android, iPhone, and desktop browsers.
