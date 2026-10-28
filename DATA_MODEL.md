7. Data Model — High-Level

Even without a database server, we need clean application data structures.

Our document can be represented using a single TypeScript model.

Main Entity: HandoverReport

interface HandoverReport {

id: string;

type: "MOVE_IN" | "MOVE_OUT";

apartment: ApartmentDetails;

landlord: PersonDetails;

tenant: PersonDetails;

inspectionDate: string;

rooms: RoomInspection[];

inventory: InventoryItem[];

utilities: UtilityReadings;

keys: KeyHandover;

notes?: string;

}

ApartmentDetails

interface ApartmentDetails {

address: string;

apartmentNumber?: string;

notes?: string;

}

PersonDetails

interface PersonDetails {

fullName: string;

phone?: string;

}

RoomInspection

type Condition =

| "GOOD"

| "MINOR_DAMAGE"

| "DAMAGED"

| "NOT_INSPECTED";

interface RoomInspection {

id: string;

name: string;

components: {

name: string;

condition: Condition;

}[];

notes?: string;

photoIds: string[];

}

The photo IDs reference local image blobs stored in IndexedDB, rather than remote URLs.

InventoryItem

interface InventoryItem {

id: string;

name: string;

quantity: number;

condition: Condition;

notes?: string;

}

UtilityReadings

interface UtilityReadings {

electricity?: number;

water?: number;

gas?: number;

}

KeyHandover

interface KeyHandover {

apartmentKeys?: number;

entranceKeys?: number;

notes?: string;

}

This is sufficient for our first release.

We do not need 15 database entities or complicated relationships.

---

7.1 Detailed Data Model, Georgian Constants & Validation Specification

Below are the detailed TypeScript definitions, Georgian display constants, IndexedDB storage models, and Zod validation rules that implement `FR-002` through `FR-010` and `NFR-001` through `NFR-007`.

1. Inspection Type (`FR-002`)

```typescript
export type InspectionType = "MOVE_IN" | "MOVE_OUT";

export const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = {
	MOVE_IN: "ბინის გადაცემა",
	MOVE_OUT: "ბინის დაბრუნება"
};
```

2. Condition Enum & Labels (`FR-004`, `FR-006`)

```typescript
export type Condition =
	| "GOOD"
	| "MINOR_DAMAGE"
	| "DAMAGED"
	| "NOT_INSPECTED";

export const CONDITION_LABELS: Record<Condition, string> = {
	GOOD: "კარგი",
	MINOR_DAMAGE: "მცირე დაზიანება",
	DAMAGED: "დაზიანებული",
	NOT_INSPECTED: "არ შემოწმებულა"
};

export const CONDITION_BADGES: Record<Condition, { icon: string; label: string }> = {
	GOOD: { icon: "✅", label: "კარგი" },
	MINOR_DAMAGE: { icon: "⚠️", label: "მცირე დაზიანება" },
	DAMAGED: { icon: "❌", label: "დაზიანებული" },
	NOT_INSPECTED: { icon: "➖", label: "არ შემოწმებულა" }
};
```

3. Predefined Rooms & Default Checklist Components (`FR-004`)

When a user adds a room, it automatically initializes with the 5 default components set to `"GOOD"` (`კარგი`) so users only change exceptions.

```typescript
export const DEFAULT_ROOM_PRESETS: readonly string[] = [
	"მისაღები ოთახი", // Living room
	"საძინებელი",     // Bedroom
	"სამზარეულო",     // Kitchen
	"სააბაზანო",      // Bathroom
	"აივანი"          // Balcony
] as const;

export const DEFAULT_ROOM_COMPONENTS: readonly string[] = [
	"კედლები",  // Walls
	"იატაკი",   // Floor
	"ფანჯრები", // Windows
	"კარი",     // Doors
	"ჭერი"      // Ceiling
] as const;

export interface RoomComponentInspection {
	name: string;
	condition: Condition;
}
```

4. Suggested Inventory Presets (`FR-006`)

```typescript
export const SUGGESTED_INVENTORY_ITEMS: readonly string[] = [
	"სარეცხი მანქანა", // Washing machine
	"მაცივარი",        // Refrigerator
	"ტელევიზორი",      // Television
	"საწოლი",          // Bed
	"დივანი",          // Sofa
	"მაგიდა"           // Table
] as const;
```

5. Local Photo Attachment Model in IndexedDB (`FR-005`, `NFR-001`, `NFR-002`, `NFR-003`, `NFR-005`)

Photos are never uploaded to a server. Each `photoId` in `RoomInspection.photoIds` references a `LocalPhotoRecord` stored in IndexedDB (`binaact_db` -> `photos` object store).

```typescript
export const PHOTO_CONSTRAINTS = {
	MAX_PHOTOS_PER_REPORT: 12,
	MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB per uploaded file
	ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
	MAX_COMPRESSED_DIMENSION_PX: 1600,
	JPEG_COMPRESSION_QUALITY: 0.82
} as const;

export interface LocalPhotoRecord {
	id: string;              // UUID referenced by RoomInspection.photoIds
	reportId: string;        // Parent HandoverReport.id
	roomId: string;          // Parent RoomInspection.id
	originalName: string;    // Original filename
	mimeType: "image/jpeg" | "image/png"; // Normalized format for pdf-lib embedding
	width: number;           // Orientation-corrected width in px
	height: number;          // Orientation-corrected height in px
	sizeBytes: number;       // Compressed byte size
	blob: Blob;              // Compressed binary image stored in IndexedDB
	createdAt: string;       // ISO timestamp
}
```

6. IndexedDB Schema (`NFR-003`, `NFR-005`)

Database Name: `binaact_local_db` (Version `1`)
- Object Store 1: `drafts` (keyPath: `"id"`)
  - Stores the active `HandoverReport` draft (default key: `"current_draft"`) plus wizard `currentStep` metadata so page refreshes restore exact progress.
- Object Store 2: `photos` (keyPath: `"id"`, indexes: `by_reportId`, `by_roomId`)
  - Stores `LocalPhotoRecord` items with compressed `Blob` payloads.

7. Zod Validation Rules (`FR-002`–`FR-008`, `NFR-002`, `NFR-005`)

```typescript
import { z } from "zod";

export const ConditionSchema = z.enum([
	"GOOD",
	"MINOR_DAMAGE",
	"DAMAGED",
	"NOT_INSPECTED"
]);

export const InspectionTypeSchema = z.enum(["MOVE_IN", "MOVE_OUT"]);

export const ApartmentDetailsSchema = z.object({
	address: z
		.string()
		.trim()
		.min(3, "გთხოვთ მიუთითოთ ბინის სრული მისამართი"),
	apartmentNumber: z.string().trim().optional(),
	notes: z.string().trim().optional()
});

export const PersonDetailsSchema = z.object({
	fullName: z
		.string()
		.trim()
		.min(2, "გთხოვთ მიუთითოთ სახელი და გვარი"),
	phone: z.string().trim().optional()
});

export const RoomComponentSchema = z.object({
	name: z.string().trim().min(1),
	condition: ConditionSchema
});

export const RoomInspectionSchema = z.object({
	id: z.string().min(1),
	name: z.string().trim().min(1, "გთხოვთ მიუთითოთ ოთახის დასახელება"),
	components: z.array(RoomComponentSchema).min(1),
	notes: z.string().trim().optional(),
	photoIds: z.array(z.string()).max(12)
});

export const InventoryItemSchema = z.object({
	id: z.string().min(1),
	name: z.string().trim().min(1, "გთხოვთ მიუთითოთ ნივთის დასახელება"),
	quantity: z
		.number({ invalid_type_error: "რაოდენობა უნდა იყოს რიცხვი" })
		.int()
		.min(1, "რაოდენობა უნდა იყოს მინიმუმ 1"),
	condition: ConditionSchema,
	notes: z.string().trim().optional()
});

export const UtilityReadingsSchema = z.object({
	electricity: z.number().nonnegative("მნიშვნელობა არ შეიძლება იყოს უარყოფითი").optional(),
	water: z.number().nonnegative("მნიშვნელობა არ შეიძლება იყოს უარყოფითი").optional(),
	gas: z.number().nonnegative("მნიშვნელობა არ შეიძლება იყოს უარყოფითი").optional()
});

export const KeyHandoverSchema = z.object({
	apartmentKeys: z.number().int().nonnegative().optional(),
	entranceKeys: z.number().int().nonnegative().optional(),
	notes: z.string().trim().optional()
});

export const HandoverReportSchema = z.object({
	id: z.string().min(1),
	type: InspectionTypeSchema,
	apartment: ApartmentDetailsSchema,
	landlord: PersonDetailsSchema,
	tenant: PersonDetailsSchema,
	inspectionDate: z.string().min(1, "გთხოვთ მიუთითოთ შემოწმების თარიღი"),
	rooms: z.array(RoomInspectionSchema),
	inventory: z.array(InventoryItemSchema),
	utilities: UtilityReadingsSchema,
	keys: KeyHandoverSchema,
	notes: z.string().trim().optional()
});
```

8. Default Initial State Factory

When a user clicks `„აქტის შექმნა“` (`FR-001`), a new `HandoverReport` draft is initialized (if no existing draft is in IndexedDB):
- `id`: `crypto.randomUUID()`
- `type`: `"MOVE_IN"`
- `inspectionDate`: Today's date (`YYYY-MM-DD`, formatted as `DD.MM.YYYY` in the PDF header and `BinaAct_YYYY-MM-DD.pdf` for the file name)
- `apartment`: `{ address: "", apartmentNumber: "", notes: "" }`
- `landlord`: `{ fullName: "", phone: "" }`
- `tenant`: `{ fullName: "", phone: "" }`
- `rooms`: Pre-seeded with standard rooms (or ready for one-tap addition from `DEFAULT_ROOM_PRESETS`), each containing the 5 `DEFAULT_ROOM_COMPONENTS` defaulted to `"GOOD"`.
- `inventory`: `[]`
- `utilities`: `{}`
- `keys`: `{ apartmentKeys: 1, entranceKeys: 1, notes: "" }`
