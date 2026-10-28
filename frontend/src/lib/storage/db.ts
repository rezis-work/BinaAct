import type { HandoverReport, LocalPhotoRecord } from '$lib/types/report';

export const DB_NAME = 'binaact_local_db';
export const DB_VERSION = 1;
export const DRAFTS_STORE = 'drafts';
export const PHOTOS_STORE = 'photos';
export const CURRENT_DRAFT_KEY = 'current_draft';

export interface StoredDraftRecord {
	id: string;
	report: HandoverReport;
	currentStep: number;
	updatedAt: string;
}

function isIndexedDbAvailable(): boolean {
	return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
}

function openBinaActDb(): Promise<IDBDatabase | null> {
	if (!isIndexedDbAvailable()) {
		return Promise.resolve(null);
	}

	return new Promise((resolve) => {
		try {
			const request = window.indexedDB.open(DB_NAME, DB_VERSION);

			request.onupgradeneeded = () => {
				const db = request.result;

				if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
					db.createObjectStore(DRAFTS_STORE, { keyPath: 'id' });
				}

				if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
					const photoStore = db.createObjectStore(PHOTOS_STORE, { keyPath: 'id' });
					photoStore.createIndex('by_reportId', 'reportId', { unique: false });
					photoStore.createIndex('by_roomId', 'roomId', { unique: false });
				}
			};

			request.onsuccess = () => {
				resolve(request.result);
			};

			request.onerror = () => {
				console.warn('IndexedDB open error:', request.error);
				resolve(null);
			};
		} catch (err) {
			console.warn('IndexedDB unavailable:', err);
			resolve(null);
		}
	});
}

export async function saveDraftToDb(report: HandoverReport, currentStep: number): Promise<void> {
	const db = await openBinaActDb();
	if (!db) return;

	return new Promise((resolve) => {
		try {
			const tx = db.transaction(DRAFTS_STORE, 'readwrite');
			const store = tx.objectStore(DRAFTS_STORE);

			const record: StoredDraftRecord = {
				id: CURRENT_DRAFT_KEY,
				report,
				currentStep,
				updatedAt: new Date().toISOString()
			};

			store.put(record);

			tx.oncomplete = () => {
				db.close();
				resolve();
			};

			tx.onerror = () => {
				console.warn('Failed to save draft to IndexedDB:', tx.error);
				db.close();
				resolve();
			};
		} catch (err) {
			console.warn('Exception saving draft to IndexedDB:', err);
			db.close();
			resolve();
		}
	});
}

export async function loadDraftFromDb(): Promise<{
	report: HandoverReport;
	currentStep: number;
} | null> {
	const db = await openBinaActDb();
	if (!db) return null;

	return new Promise((resolve) => {
		try {
			const tx = db.transaction(DRAFTS_STORE, 'readonly');
			const store = tx.objectStore(DRAFTS_STORE);
			const request = store.get(CURRENT_DRAFT_KEY);

			request.onsuccess = () => {
				const result = request.result as StoredDraftRecord | undefined;
				db.close();
				if (result && result.report) {
					resolve({
						report: result.report,
						currentStep: typeof result.currentStep === 'number' ? result.currentStep : 1
					});
				} else {
					resolve(null);
				}
			};

			request.onerror = () => {
				console.warn('Failed to load draft from IndexedDB:', request.error);
				db.close();
				resolve(null);
			};
		} catch (err) {
			console.warn('Exception loading draft from IndexedDB:', err);
			db.close();
			resolve(null);
		}
	});
}

export async function savePhotoToDb(photo: LocalPhotoRecord): Promise<void> {
	const db = await openBinaActDb();
	if (!db) return;

	return new Promise((resolve) => {
		try {
			const tx = db.transaction(PHOTOS_STORE, 'readwrite');
			const store = tx.objectStore(PHOTOS_STORE);
			store.put(photo);

			tx.oncomplete = () => {
				db.close();
				resolve();
			};

			tx.onerror = () => {
				console.warn('Failed to save photo to IndexedDB:', tx.error);
				db.close();
				resolve();
			};
		} catch (err) {
			console.warn('Exception saving photo to IndexedDB:', err);
			db.close();
			resolve();
		}
	});
}

export async function getPhotosByReportId(reportId: string): Promise<LocalPhotoRecord[]> {
	const db = await openBinaActDb();
	if (!db) return [];

	return new Promise((resolve) => {
		try {
			const tx = db.transaction(PHOTOS_STORE, 'readonly');
			const store = tx.objectStore(PHOTOS_STORE);
			const index = store.index('by_reportId');
			const request = index.getAll(reportId);

			request.onsuccess = () => {
				const records = (request.result as LocalPhotoRecord[]) ?? [];
				db.close();
				resolve(records);
			};

			request.onerror = () => {
				console.warn('Failed to load photos from IndexedDB:', request.error);
				db.close();
				resolve([]);
			};
		} catch (err) {
			console.warn('Exception loading photos from IndexedDB:', err);
			db.close();
			resolve([]);
		}
	});
}

export async function deletePhotoFromDb(photoId: string): Promise<void> {
	const db = await openBinaActDb();
	if (!db) return;

	return new Promise((resolve) => {
		try {
			const tx = db.transaction(PHOTOS_STORE, 'readwrite');
			const store = tx.objectStore(PHOTOS_STORE);
			store.delete(photoId);

			tx.oncomplete = () => {
				db.close();
				resolve();
			};

			tx.onerror = () => {
				console.warn('Failed to delete photo from IndexedDB:', tx.error);
				db.close();
				resolve();
			};
		} catch (err) {
			console.warn('Exception deleting photo from IndexedDB:', err);
			db.close();
			resolve();
		}
	});
}

export async function clearAllLocalData(): Promise<void> {
	const db = await openBinaActDb();
	if (!db) return;

	return new Promise((resolve) => {
		try {
			const tx = db.transaction([DRAFTS_STORE, PHOTOS_STORE], 'readwrite');
			tx.objectStore(DRAFTS_STORE).clear();
			tx.objectStore(PHOTOS_STORE).clear();

			tx.oncomplete = () => {
				db.close();
				resolve();
			};

			tx.onerror = () => {
				console.warn('Failed to clear IndexedDB stores:', tx.error);
				db.close();
				resolve();
			};
		} catch (err) {
			console.warn('Exception clearing IndexedDB stores:', err);
			db.close();
			resolve();
		}
	});
}
