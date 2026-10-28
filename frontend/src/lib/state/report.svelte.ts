import {
	type Condition,
	type HandoverReport,
	type InventoryItem,
	type LocalPhotoRecord,
	type RoomInspection,
	createDefaultRoom,
	createEmptyReport
} from '$lib/types/report';
import { type Step1ValidationErrors, validateStep1 } from '$lib/schemas/report';
import {
	clearAllLocalData,
	deletePhotoFromDb,
	getPhotosByReportId,
	loadDraftFromDb,
	saveDraftToDb,
	savePhotoToDb
} from '$lib/storage/db';

export type WizardStepNumber = 1 | 2 | 3 | 4;

function generateId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

class ReportDraftStore {
	report = $state<HandoverReport>(createEmptyReport());
	currentStep = $state<WizardStepNumber>(1);
	isHydrated = $state(false);
	step1Errors = $state<Step1ValidationErrors>({});
	showStep1ErrorBanner = $state(false);
	photos = $state<Record<string, LocalPhotoRecord>>({});
	photoPreviewUrls = $state<Record<string, string>>({});

	async hydrateFromDb(preferredStep?: WizardStepNumber): Promise<void> {
		if (this.isHydrated) {
			if (preferredStep) {
				this.currentStep = preferredStep;
			}
			return;
		}

		try {
			const saved = await loadDraftFromDb();
			if (saved && saved.report) {
				this.report = saved.report;
				const step = saved.currentStep;
				if (preferredStep) {
					this.currentStep = preferredStep;
				} else if (step === 1 || step === 2 || step === 3 || step === 4) {
					this.currentStep = step;
				}

				const savedPhotos = await getPhotosByReportId(saved.report.id);
				const nextPhotos: Record<string, LocalPhotoRecord> = {};
				const nextUrls: Record<string, string> = {};

				for (const photo of savedPhotos) {
					nextPhotos[photo.id] = photo;
					if (typeof URL !== 'undefined' && photo.blob instanceof Blob) {
						nextUrls[photo.id] = URL.createObjectURL(photo.blob);
					}
				}

				this.photos = nextPhotos;
				this.photoPreviewUrls = nextUrls;
			} else if (preferredStep) {
				this.currentStep = preferredStep;
			}
		} catch (err) {
			console.warn('Failed to hydrate draft from IndexedDB:', err);
		} finally {
			this.isHydrated = true;
		}
	}

	validateCurrentStep1(): boolean {
		const result = validateStep1(this.report);
		this.step1Errors = result.errors;
		this.showStep1ErrorBanner = !result.success;
		return result.success;
	}

	clearStep1FieldError(field: keyof Step1ValidationErrors) {
		if (this.step1Errors[field]) {
			delete this.step1Errors[field];
			this.step1Errors = { ...this.step1Errors };
		}
		if (Object.keys(this.step1Errors).length === 0) {
			this.showStep1ErrorBanner = false;
		}
	}

	addRoom(name: string): RoomInspection | null {
		const trimmed = name.trim();
		if (!trimmed) return null;

		let finalName = trimmed;
		const existingExact = this.report.rooms.some((r) => r.name === finalName);
		if (existingExact) {
			let counter = 2;
			while (this.report.rooms.some((r) => r.name === `${trimmed} ${counter}`)) {
				counter += 1;
			}
			finalName = `${trimmed} ${counter}`;
		}

		const newRoom = createDefaultRoom(finalName);
		this.report.rooms.push(newRoom);
		return newRoom;
	}

	removeRoom(roomId: string) {
		const room = this.report.rooms.find((r) => r.id === roomId);
		if (room && room.photoIds.length > 0) {
			for (const photoId of [...room.photoIds]) {
				void this.removePhoto(roomId, photoId);
			}
		}
		this.report.rooms = this.report.rooms.filter((r) => r.id !== roomId);
	}

	setRoomComponentCondition(roomId: string, componentName: string, condition: Condition) {
		const room = this.report.rooms.find((r) => r.id === roomId);
		if (!room) return;
		const comp = room.components.find((c) => c.name === componentName);
		if (comp) {
			comp.condition = condition;
		}
	}

	async flushDraftToDb(): Promise<void> {
		await saveDraftToDb($state.snapshot(this.report), this.currentStep);
	}

	async addPhotoToRoom(roomId: string, photo: LocalPhotoRecord): Promise<void> {
		const room = this.report.rooms.find((r) => r.id === roomId);
		if (!room) return;

		await savePhotoToDb(photo);
		this.photos[photo.id] = photo;
		if (typeof URL !== 'undefined' && photo.blob instanceof Blob) {
			this.photoPreviewUrls[photo.id] = URL.createObjectURL(photo.blob);
		}
		if (!room.photoIds.includes(photo.id)) {
			room.photoIds.push(photo.id);
		}
		await this.flushDraftToDb();
	}

	async removePhoto(roomId: string, photoId: string): Promise<void> {
		const room = this.report.rooms.find((r) => r.id === roomId);
		if (room) {
			room.photoIds = room.photoIds.filter((id) => id !== photoId);
		}

		const existingUrl = this.photoPreviewUrls[photoId];
		if (existingUrl && typeof URL !== 'undefined') {
			URL.revokeObjectURL(existingUrl);
		}

		delete this.photoPreviewUrls[photoId];
		this.photoPreviewUrls = { ...this.photoPreviewUrls };

		delete this.photos[photoId];
		this.photos = { ...this.photos };

		await deletePhotoFromDb(photoId);
		await this.flushDraftToDb();
	}

	addInventoryItem(
		name: string,
		quantity = 1,
		condition: Condition = 'GOOD',
		notes = ''
	): InventoryItem | null {
		const trimmed = name.trim();
		if (!trimmed) return null;
		const item: InventoryItem = {
			id: generateId(),
			name: trimmed,
			quantity: Math.max(1, Math.floor(quantity)),
			condition,
			notes: notes.trim()
		};
		this.report.inventory.push(item);
		return item;
	}

	removeInventoryItem(itemId: string) {
		this.report.inventory = this.report.inventory.filter((i) => i.id !== itemId);
	}

	async resetDraft(): Promise<void> {
		if (typeof URL !== 'undefined') {
			for (const url of Object.values(this.photoPreviewUrls)) {
				URL.revokeObjectURL(url);
			}
		}
		this.photos = {};
		this.photoPreviewUrls = {};
		this.report = createEmptyReport();
		this.currentStep = 1;
		this.step1Errors = {};
		this.showStep1ErrorBanner = false;
		await clearAllLocalData();
	}
}

export const reportStore = new ReportDraftStore();
