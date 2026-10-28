import type { LocalPhotoRecord } from '$lib/types/report';

export const MAX_PHOTOS_PER_REPORT = 12;
export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_DIMENSION_PX = 1600;
export const JPEG_QUALITY = 0.82;

export class PhotoValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'PhotoValidationError';
	}
}

function generatePhotoId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `photo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function validatePhotoFile(file: File, currentTotalPhotos: number): void {
	if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
		throw new PhotoValidationError(
			'დაუშვებელი ფაილის ფორმატი. დაშვებულია მხოლოდ JPG, PNG და WebP ფოტოები.'
		);
	}

	if (file.size > MAX_PHOTO_SIZE_BYTES) {
		throw new PhotoValidationError('ფოტოს ზომა აღემატება 10 MB-ს.');
	}

	if (currentTotalPhotos >= MAX_PHOTOS_PER_REPORT) {
		throw new PhotoValidationError('ერთ აქტში დაშვებულია მაქსიმუმ 12 ფოტოს დამატება.');
	}
}

export function computeScaledDimensions(
	width: number,
	height: number,
	maxDimension = MAX_DIMENSION_PX
): { width: number; height: number } {
	if (width <= 0 || height <= 0) {
		return { width: 1, height: 1 };
	}

	const largestSide = Math.max(width, height);
	if (largestSide <= maxDimension) {
		return { width: Math.round(width), height: Math.round(height) };
	}

	const scale = maxDimension / largestSide;
	return {
		width: Math.max(1, Math.round(width * scale)),
		height: Math.max(1, Math.round(height * scale))
	};
}

interface DecodedImageSource {
	source: CanvasImageSource;
	width: number;
	height: number;
	cleanup: () => void;
}

async function decodeImageWithExifOrientation(file: File): Promise<DecodedImageSource> {
	if (typeof createImageBitmap === 'function') {
		try {
			const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
			return {
				source: bitmap,
				width: bitmap.width,
				height: bitmap.height,
				cleanup: () => bitmap.close()
			};
		} catch {
			// Fall back to HTMLImageElement if createImageBitmap fails on a specific browser/format
		}
	}

	return new Promise((resolve, reject) => {
		const objectUrl = URL.createObjectURL(file);
		const img = new Image();

		img.onload = () => {
			resolve({
				source: img,
				width: img.naturalWidth || img.width,
				height: img.naturalHeight || img.height,
				cleanup: () => URL.revokeObjectURL(objectUrl)
			});
		};

		img.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new PhotoValidationError('ფოტოს წაკითხვა ვერ მოხერხდა. სცადეთ სხვა ფაილი.'));
		};

		img.src = objectUrl;
	});
}

export async function processPhotoFile(
	file: File,
	options: {
		reportId: string;
		roomId: string;
		currentTotalPhotos: number;
	}
): Promise<LocalPhotoRecord> {
	validatePhotoFile(file, options.currentTotalPhotos);

	const decoded = await decodeImageWithExifOrientation(file);

	try {
		const target = computeScaledDimensions(decoded.width, decoded.height, MAX_DIMENSION_PX);

		const canvas = document.createElement('canvas');
		canvas.width = target.width;
		canvas.height = target.height;

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			throw new PhotoValidationError('ფოტოს დამუშავება ვერ მოხერხდა (Canvas მიუწვდომელია).');
		}

		// Fill white background so transparent PNG/WebP images convert cleanly to JPEG
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, target.width, target.height);
		ctx.drawImage(decoded.source, 0, 0, target.width, target.height);

		const compressedBlob = await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob(
				(blob) => {
					if (blob) {
						resolve(blob);
					} else {
						reject(new PhotoValidationError('ფოტოს შეკუმშვა ვერ მოხერხდა.'));
					}
				},
				'image/jpeg',
				JPEG_QUALITY
			);
		});

		// Help GC release canvas backing store immediately on mobile devices
		canvas.width = 0;
		canvas.height = 0;

		return {
			id: generatePhotoId(),
			reportId: options.reportId,
			roomId: options.roomId,
			originalName: file.name,
			mimeType: 'image/jpeg',
			width: target.width,
			height: target.height,
			sizeBytes: compressedBlob.size,
			blob: compressedBlob,
			createdAt: new Date().toISOString()
		};
	} finally {
		decoded.cleanup();
	}
}
