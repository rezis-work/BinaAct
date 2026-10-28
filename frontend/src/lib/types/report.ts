export type InspectionType = 'MOVE_IN' | 'MOVE_OUT';

export type Condition = 'GOOD' | 'MINOR_DAMAGE' | 'DAMAGED' | 'NOT_INSPECTED';

export interface ApartmentDetails {
	address: string;
	apartmentNumber?: string;
	notes?: string;
}

export interface PersonDetails {
	fullName: string;
	phone?: string;
}

export interface RoomComponent {
	name: string;
	condition: Condition;
}

export interface RoomInspection {
	id: string;
	name: string;
	components: RoomComponent[];
	notes?: string;
	photoIds: string[];
}

export interface InventoryItem {
	id: string;
	name: string;
	quantity: number;
	condition: Condition;
	notes?: string;
}

export interface UtilityReadings {
	electricity?: number;
	water?: number;
	gas?: number;
}

export interface KeyHandover {
	apartmentKeys?: number;
	entranceKeys?: number;
	notes?: string;
}

export interface HandoverReport {
	id: string;
	type: InspectionType;
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

export interface LocalPhotoRecord {
	id: string;
	reportId: string;
	roomId: string;
	originalName: string;
	mimeType: 'image/jpeg' | 'image/png';
	width: number;
	height: number;
	sizeBytes: number;
	blob: Blob;
	createdAt: string;
}

export const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = {
	MOVE_IN: 'ბინის გადაცემა',
	MOVE_OUT: 'ბინის დაბრუნება'
};

export const CONDITION_LABELS: Record<Condition, string> = {
	GOOD: 'კარგი',
	MINOR_DAMAGE: 'მცირე დაზიანება',
	DAMAGED: 'დაზიანებული',
	NOT_INSPECTED: 'არ შემოწმებულა'
};

export const CONDITION_OPTIONS: Record<
	Condition,
	{ value: Condition; icon: string; label: string; badge: string }
> = {
	GOOD: {
		value: 'GOOD',
		icon: '✅',
		label: 'კარგი',
		badge: '✅ კარგი'
	},
	MINOR_DAMAGE: {
		value: 'MINOR_DAMAGE',
		icon: '⚠️',
		label: 'მცირე დაზიანება',
		badge: '⚠️ მცირე დაზიანება'
	},
	DAMAGED: {
		value: 'DAMAGED',
		icon: '❌',
		label: 'დაზიანებული',
		badge: '❌ დაზიანებული'
	},
	NOT_INSPECTED: {
		value: 'NOT_INSPECTED',
		icon: '➖',
		label: 'არ შემოწმებულა',
		badge: '➖ არ შემოწმებულა'
	}
};

export const CONDITION_LIST: readonly Condition[] = [
	'GOOD',
	'MINOR_DAMAGE',
	'DAMAGED',
	'NOT_INSPECTED'
] as const;

export const DEFAULT_ROOM_PRESETS: readonly string[] = [
	'მისაღები ოთახი',
	'საძინებელი',
	'სამზარეულო',
	'სააბაზანო',
	'აივანი'
] as const;

export const DEFAULT_ROOM_COMPONENTS: readonly string[] = [
	'კედლები',
	'იატაკი',
	'ფანჯრები',
	'კარი',
	'ჭერი'
] as const;

export const SUGGESTED_INVENTORY_ITEMS: readonly string[] = [
	'სარეცხი მანქანა',
	'მაცივარი',
	'ტელევიზორი',
	'საწოლი',
	'დივანი',
	'მაგიდა'
] as const;

export const PHOTO_CONSTRAINTS = {
	MAX_PHOTOS_PER_REPORT: 12,
	MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB
	ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
	MAX_COMPRESSED_DIMENSION_PX: 1600,
	JPEG_COMPRESSION_QUALITY: 0.82
} as const;

function createId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getTodayIsoDate(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function formatGeorgianDate(isoDate: string): string {
	if (!isoDate) return '';
	const parts = isoDate.split('-');
	if (parts.length === 3) {
		return `${parts[2]}.${parts[1]}.${parts[0]}`;
	}
	return isoDate;
}

export function createDefaultRoom(name: string): RoomInspection {
	return {
		id: createId(),
		name: name.trim(),
		components: DEFAULT_ROOM_COMPONENTS.map((componentName) => ({
			name: componentName,
			condition: 'GOOD' as Condition
		})),
		notes: '',
		photoIds: []
	};
}

export function createEmptyReport(): HandoverReport {
	return {
		id: createId(),
		type: 'MOVE_IN',
		apartment: {
			address: '',
			apartmentNumber: '',
			notes: ''
		},
		landlord: {
			fullName: '',
			phone: ''
		},
		tenant: {
			fullName: '',
			phone: ''
		},
		inspectionDate: getTodayIsoDate(),
		rooms: [createDefaultRoom('მისაღები ოთახი'), createDefaultRoom('სამზარეულო')],
		inventory: [],
		utilities: {
			electricity: undefined,
			water: undefined,
			gas: undefined
		},
		keys: {
			apartmentKeys: 2,
			entranceKeys: 1,
			notes: ''
		},
		notes: ''
	};
}
