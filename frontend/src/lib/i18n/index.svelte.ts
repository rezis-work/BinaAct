import type { Condition, InspectionType } from '$lib/types/report';

export type Locale = 'ka' | 'en';

const STORAGE_KEY = 'binaact_locale';

const ROOM_NAME_TRANSLATIONS: Record<string, { ka: string; en: string }> = {
	'მისაღები ოთახი': { ka: 'მისაღები ოთახი', en: 'Living Room' },
	'Living Room': { ka: 'მისაღები ოთახი', en: 'Living Room' },
	საძინებელი: { ka: 'საძინებელი', en: 'Bedroom' },
	Bedroom: { ka: 'საძინებელი', en: 'Bedroom' },
	სამზარეულო: { ka: 'სამზარეულო', en: 'Kitchen' },
	Kitchen: { ka: 'სამზარეულო', en: 'Kitchen' },
	სააბაზანო: { ka: 'სააბაზანო', en: 'Bathroom' },
	Bathroom: { ka: 'სააბაზანო', en: 'Bathroom' },
	აივანი: { ka: 'აივანი', en: 'Balcony' },
	Balcony: { ka: 'აივანი', en: 'Balcony' }
};

const COMPONENT_TRANSLATIONS: Record<string, { ka: string; en: string }> = {
	კედლები: { ka: 'კედლები', en: 'Walls' },
	Walls: { ka: 'კედლები', en: 'Walls' },
	იატაკი: { ka: 'იატაკი', en: 'Floor' },
	Floor: { ka: 'იატაკი', en: 'Floor' },
	ფანჯრები: { ka: 'ფანჯრები', en: 'Windows' },
	Windows: { ka: 'ფანჯრები', en: 'Windows' },
	კარი: { ka: 'კარი', en: 'Doors' },
	Doors: { ka: 'კარი', en: 'Doors' },
	ჭერი: { ka: 'ჭერი', en: 'Ceiling' },
	Ceiling: { ka: 'ჭერი', en: 'Ceiling' }
};

const INVENTORY_TRANSLATIONS: Record<string, { ka: string; en: string }> = {
	'სარეცხი მანქანა': { ka: 'სარეცხი მანქანა', en: 'Washing Machine' },
	'Washing Machine': { ka: 'სარეცხი მანქანა', en: 'Washing Machine' },
	მაცივარი: { ka: 'მაცივარი', en: 'Refrigerator' },
	Refrigerator: { ka: 'მაცივარი', en: 'Refrigerator' },
	ტელევიზორი: { ka: 'ტელევიზორი', en: 'Television' },
	Television: { ka: 'ტელევიზორი', en: 'Television' },
	საწოლი: { ka: 'საწოლი', en: 'Bed' },
	Bed: { ka: 'საწოლი', en: 'Bed' },
	დივანი: { ka: 'დივანი', en: 'Sofa' },
	Sofa: { ka: 'დივანი', en: 'Sofa' },
	მაგიდა: { ka: 'მაგიდა', en: 'Table' },
	Table: { ka: 'მაგიდა', en: 'Table' }
};

class I18nStore {
	locale = $state<Locale>('ka');

	hydrateFromStorage() {
		if (typeof window !== 'undefined') {
			const saved = window.localStorage.getItem(STORAGE_KEY);
			if (saved === 'ka' || saved === 'en') {
				this.locale = saved;
			}
			document.documentElement.lang = this.locale;
		}
	}

	setLocale(next: Locale) {
		this.locale = next;
		if (typeof window !== 'undefined') {
			window.localStorage.setItem(STORAGE_KEY, next);
			document.documentElement.lang = next;
		}
	}

	toggleLocale() {
		this.setLocale(this.locale === 'ka' ? 'en' : 'ka');
	}

	get isEn(): boolean {
		return this.locale === 'en';
	}

	inspectionTypeLabel(type: InspectionType, lang: Locale = this.locale): string {
		if (lang === 'en') {
			return type === 'MOVE_IN' ? 'Move-in Handover' : 'Move-out Return';
		}
		return type === 'MOVE_IN' ? 'ბინის გადაცემა' : 'ბინის დაბრუნება';
	}

	conditionLabel(condition: Condition, lang: Locale = this.locale): string {
		if (lang === 'en') {
			switch (condition) {
				case 'GOOD':
					return 'Good';
				case 'MINOR_DAMAGE':
					return 'Minor damage';
				case 'DAMAGED':
					return 'Damaged';
				case 'NOT_INSPECTED':
					return 'Not inspected';
			}
		}
		switch (condition) {
			case 'GOOD':
				return 'კარგი';
			case 'MINOR_DAMAGE':
				return 'მცირე დაზიანება';
			case 'DAMAGED':
				return 'დაზიანებული';
			case 'NOT_INSPECTED':
				return 'არ შემოწმებულა';
		}
	}

	conditionBadge(condition: Condition, lang: Locale = this.locale): string {
		const icons: Record<Condition, string> = {
			GOOD: '✅',
			MINOR_DAMAGE: '⚠️',
			DAMAGED: '❌',
			NOT_INSPECTED: '➖'
		};
		return `${icons[condition]} ${this.conditionLabel(condition, lang)}`;
	}

	roomName(rawName: string, lang: Locale = this.locale): string {
		const trimmed = (rawName ?? '').trim();
		if (ROOM_NAME_TRANSLATIONS[trimmed]) {
			return ROOM_NAME_TRANSLATIONS[trimmed][lang];
		}
		// Handle numbered preset rooms like "მისაღები ოთახი 2" or "საძინებელი 2"
		const match = trimmed.match(/^(.+?)\s+(\d+)$/);
		if (match) {
			const base = match[1].trim();
			const num = match[2];
			if (ROOM_NAME_TRANSLATIONS[base]) {
				return `${ROOM_NAME_TRANSLATIONS[base][lang]} ${num}`;
			}
		}
		return rawName;
	}

	componentName(rawName: string, lang: Locale = this.locale): string {
		const trimmed = (rawName ?? '').trim();
		if (COMPONENT_TRANSLATIONS[trimmed]) {
			return COMPONENT_TRANSLATIONS[trimmed][lang];
		}
		return rawName;
	}

	inventoryName(rawName: string, lang: Locale = this.locale): string {
		const trimmed = (rawName ?? '').trim();
		if (INVENTORY_TRANSLATIONS[trimmed]) {
			return INVENTORY_TRANSLATIONS[trimmed][lang];
		}
		return rawName;
	}

	translateValidationError(msg: string | undefined, lang: Locale = this.locale): string | undefined {
		if (!msg) return undefined;
		if (lang === 'ka') return msg;

		const map: Record<string, string> = {
			'გთხოვთ მიუთითოთ ბინის სრული მისამართი': 'Please enter the full apartment address',
			'გთხოვთ მიუთითოთ სახელი და გვარი': 'Please enter the full name',
			'გთხოვთ მიუთითოთ შემოწმების თარიღი': 'Please select the inspection date',
			'გთხოვთ მიუთითოთ ოთახის დასახელება': 'Please enter the room name',
			'მაქსიმუმ 12 ფოტო არის დაშვებული': 'Maximum 12 photos allowed',
			'მაქსიმუმ 12 ფოტო არის დაშვებული მთლიან აქტში':
				'A maximum of 12 photos is allowed per report',
			'გთხოვთ მიუთითოთ ნივთის დასახელება': 'Please enter the item name',
			'რაოდენობა უნდა იყოს მთელი რიცხვი': 'Quantity must be a whole number',
			'რაოდენობა უნდა იყოს მინიმუმ 1': 'Quantity must be at least 1',
			'მნიშვნელობა არ შეიძლება იყოს უარყოფითი': 'Value cannot be negative',
			'რაოდენობა არ შეიძლება იყოს უარყოფითი': 'Quantity cannot be negative',
			'დაუშვებელი ფაილის ფორმატი. დაშვებულია მხოლოდ JPG, PNG და WebP ფოტოები.':
				'Unsupported file format. Only JPG, PNG, and WebP photos are allowed.',
			'ფოტოს ზომა აღემატება 10 MB-ს.': 'Photo size exceeds the 10 MB limit.',
			'ერთ აქტში დაშვებულია მაქსიმუმ 12 ფოტოს დამატება.':
				'A maximum of 12 photos can be attached to a single report.',
			'ფოტოს წაკითხვა ვერ მოხერხდა. სცადეთ სხვა ფაილი.':
				'Could not read the photo file. Please try another image.',
			'ფოტოს დამუშავება ვერ მოხერხდა (Canvas მიუწვდომელია).':
				'Could not process photo (Canvas is unavailable).',
			'ფოტოს შეკუმშვა ვერ მოხერხდა.': 'Could not compress the photo.'
		};

		return map[msg] ?? msg;
	}
}

export const i18n = new I18nStore();
