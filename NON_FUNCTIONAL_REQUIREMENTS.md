5. Non-Functional Requirements

These describe how well the application should work.

NFR-001 — Performance

Our application must feel fast.

Requirement	Target

Main page loading	Under 3 seconds on a typical mobile connection

Form interactions	Immediate feedback

PDF generation	Under 10 seconds for a typical report

Photo processing	Without freezing the interface

These are initial performance targets, not guarantees across every device.

We should test them on ordinary mobile devices rather than only powerful developer laptops.

NFR-002 — Security

We should implement basic security even though the MVP has no accounts.

Requirements:

HTTPS only.

Validate form inputs.

Restrict accepted photo formats and sizes.

Avoid rendering user-entered HTML.

Never include property details in analytics events.

Never log uploaded photographs.

Do not use third-party photo-processing services.

Because report creation occurs locally in the browser, property photographs do not need to reach our backend.

NFR-003 — Privacy

Apartment photographs, names, and addresses are private information.

Our MVP should minimize collection.

Preferred approach:

Generate documents directly in the browser.

This means:

No server-side report database.

No photograph cloud storage.

No permanent storage of customer documents.

No document access links.

For a better user experience, we can temporarily save drafts in browser storage, without uploading them.

The interface must explain that drafts are stored only on the current device and may disappear when browser data is cleared.

NFR-004 — Mobile Responsiveness

Mobile support is essential.

Many people will inspect apartments using their phones.

The application must support:

Android Chrome.

iPhone Safari.

Desktop Chrome.

Desktop Safari.

Desktop Firefox.

Buttons should be comfortable to tap.

The photo interface should support opening the phone's camera or photo library where the browser permits it.

NFR-005 — Reliability

Requirements:

Clear validation messages.

No accidental deletion of completed sections.

PDF generation failures must display an error.

Users should be able to retry PDF generation.

Supported photographs must not silently disappear from reports.

We should also preserve form data if users accidentally refresh the page.

A small IndexedDB-based local draft is sufficient.

No backend database is required.

NFR-006 — Accessibility

Basic requirements:

Readable Georgian font.

Clearly labeled inputs.

Accessible form validation.

Sufficient text contrast.

Keyboard-accessible controls.

Touch-friendly buttons.

NFR-007 — Maintainability

We need to keep the codebase understandable.

Requirements:

TypeScript.

Reusable UI components.

Input validation schemas.

Separated PDF generation logic.

No unnecessary abstractions.

No microservices.

No distributed infrastructure.

This should be an application that one developer can understand and maintain.
