import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {
	A4_HEIGHT,
	A4_WIDTH,
	CONTENT_WIDTH,
	generateHandoverPdf,
	wrapText
} from './generator.ts';
import {
	DEFAULT_ROOM_PRESETS,
	createDefaultRoom,
	createEmptyReport,
	type Condition,
	type LocalPhotoRecord
} from '../types/report.ts';

// Minimal valid 1x1 pixel PNG binary for testing photo embedding
const TINY_PNG_BYTES = Uint8Array.from(
	atob(
		'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
	),
	(c) => c.charCodeAt(0)
);

export interface StressTestSummary {
	status: 'PASS';
	testCaseA: {
		pages: number;
		byteLength: number;
		durationMs: number;
	};
	testCaseB: {
		pages: number;
		byteLength: number;
		durationMs: number;
	};
}

export async function runPdfPaginationStressTests(fontBytes?: {
	regularFontBytes: ArrayBuffer | Uint8Array;
	boldFontBytes: ArrayBuffer | Uint8Array;
}): Promise<StressTestSummary> {
	// Verify wrapText never exceeds CONTENT_WIDTH
	if (fontBytes) {
		const tempDoc = await PDFDocument.create();
		tempDoc.registerFontkit(fontkit);
		const fontRegular = await tempDoc.embedFont(fontBytes.regularFontBytes);

		const sampleNote =
			'კედელზე აღინიშნება მცირე ნაკაწრები ფანჯრის მარცხენა მხარეს და იატაკის პლინტუსთან. ' +
			'დამატებით შემოწმდა ელექტრო ჩამრთველები, როზეტები, განათების სანათები და გათბობის რადიატორები. ' +
			'ყველა დეტალი შეთანხმებულია გამქირავებელსა და დამქირავებელს შორის მიღება-ჩაბარების დროს. ' +
			'ეს ტექსტი სპეციალურად არის 400-ზე მეტი სიმბოლოს სიგრძის, რათა შემოწმდეს სტრიქონების გადატანა და გვერდების დაყოფა.';

		const wrappedLines = wrapText(sampleNote, fontRegular, 9.5, CONTENT_WIDTH - 20);
		for (const line of wrappedLines) {
			const w = fontRegular.widthOfTextAtSize(line, 9.5);
			if (w > CONTENT_WIDTH - 20 + 0.01) {
				throw new Error(`Wrapped line width ${w} exceeded maxWidth ${CONTENT_WIDTH - 20}`);
			}
		}
	}

	const longGeorgianNote =
		'კედელზე აღინიშნება მცირე ნაკაწრები ფანჯრის მარცხენა მხარეს და იატაკის პლინტუსთან. ' +
		'დამატებით შემოწმდა ელექტრო ჩამრთველები, როზეტები, განათების სანათები და გათბობის რადიატორები. ' +
		'ყველა დეტალი შეთანხმებულია გამქირავებელსა და დამქირავებელს შორის მიღება-ჩაბარების დროს. ' +
		'ეს ტექსტი სპეციალურად არის 400-ზე მეტი სიმბოლოს სიგრძის, რათა შემოწმდეს სტრიქონების გადატანა და გვერდების დაყოფა.';

	// =========================================================================
	// TEST CASE A: Maximum Content & Multi-Page Pagination
	// =========================================================================
	const maxReport = createEmptyReport();
	maxReport.type = 'MOVE_IN';
	maxReport.inspectionDate = '2026-10-18';
	maxReport.apartment = {
		address: 'თბილისი, საბურთალო, ალექსანდრე ყაზბეგის გამზირი №12, კორპუსი 3, სადარბაზო 2',
		apartmentNumber: '45',
		notes:
			'ბინა მდებარეობს მე-5 სართულზე. სადარბაზოში ფუნქციონირებს დომოფონი და სამგზავრო ლიფტი.'
	};
	maxReport.landlord = {
		fullName: 'გიორგი მაისურაძე',
		phone: '599 11 22 33'
	};
	maxReport.tenant = {
		fullName: 'ნიკა ბერიძე',
		phone: '555 44 55 66'
	};

	const sevenRoomNames = [...DEFAULT_ROOM_PRESETS, 'საძინებელი 2', 'კაბინეტი'];
	const conditionsCycle: Condition[] = ['GOOD', 'MINOR_DAMAGE', 'DAMAGED', 'NOT_INSPECTED'];

	maxReport.rooms = sevenRoomNames.map((roomName, idx) => {
		const r = createDefaultRoom(roomName);
		r.notes = `${longGeorgianNote} (ოთახი #${idx + 1})`;
		r.components.forEach((c, cIdx) => {
			c.condition = conditionsCycle[(idx + cIdx) % conditionsCycle.length];
		});
		return r;
	});

	// Attach 12 photos across the rooms
	const photos: LocalPhotoRecord[] = [];
	for (let pIdx = 0; pIdx < 12; pIdx++) {
		const targetRoom = maxReport.rooms[pIdx % maxReport.rooms.length];
		const photoId = `stress_photo_${pIdx + 1}`;
		targetRoom.photoIds.push(photoId);
		photos.push({
			id: photoId,
			reportId: maxReport.id,
			roomId: targetRoom.id,
			originalName: `photo_${pIdx + 1}.png`,
			mimeType: 'image/png',
			width: 800,
			height: 600,
			sizeBytes: TINY_PNG_BYTES.byteLength,
			blob: new Blob([TINY_PNG_BYTES], { type: 'image/png' }),
			createdAt: new Date().toISOString()
		});
	}

	// Add 20 inventory items with long notes
	maxReport.inventory = Array.from({ length: 20 }, (_, i) => ({
		id: `inv_${i + 1}`,
		name: `ინვენტარის ნივთი #${i + 1} (მაცივარი / სარეცხი მანქანა)`,
		quantity: (i % 4) + 1,
		condition: conditionsCycle[i % conditionsCycle.length],
		notes:
			'მოდელი: Samsung EcoBubble, სერიული ნომერი შემოწმებულია, მუშაობს გამართულად დამატებითი ხარვეზების გარეშე.'
	}));

	maxReport.utilities = {
		electricity: 15420.5,
		water: 250.75,
		gas: 8540.2
	};

	maxReport.keys = {
		apartmentKeys: 2,
		entranceKeys: 1,
		notes: 'პარკინგის პულტი — 1 ცალი, ლიფტის ჩიპი — 1 ცალი, საფოსტო ყუთის გასაღები — 1 ცალი'
	};

	const startTimeA = performance.now();
	const pdfBytesA = await generateHandoverPdf(maxReport, photos, fontBytes);
	const durationMsA = performance.now() - startTimeA;

	const parsedDocA = await PDFDocument.load(pdfBytesA);
	const pageCountA = parsedDocA.getPageCount();

	for (const p of parsedDocA.getPages()) {
		const { width, height } = p.getSize();
		if (Math.abs(width - A4_WIDTH) > 0.1 || Math.abs(height - A4_HEIGHT) > 0.1) {
			throw new Error(`Invalid page size: ${width}x${height}`);
		}
	}

	if (pageCountA < 3) {
		throw new Error(`Expected multi-page PDF (>= 3 pages) for Stress Test A, got ${pageCountA}`);
	}

	if (durationMsA > 10000) {
		throw new Error(`Stress Test A exceeded 10s NFR-001 limit: ${durationMsA}ms`);
	}

	// =========================================================================
	// TEST CASE B: Minimal Required Data (Empty Optionals)
	// =========================================================================
	const minReport = createEmptyReport();
	minReport.type = 'MOVE_OUT';
	minReport.inspectionDate = '2026-10-18';
	minReport.apartment = {
		address: 'თბილისი, ვაკე, ჭავჭავაძის 20',
		apartmentNumber: undefined,
		notes: undefined
	};
	minReport.landlord = {
		fullName: 'გიორგი მაისურაძე',
		phone: undefined
	};
	minReport.tenant = {
		fullName: 'ნიკა ბერიძე',
		phone: undefined
	};
	minReport.rooms = [];
	minReport.inventory = [];
	minReport.utilities = {
		electricity: undefined,
		water: undefined,
		gas: undefined
	};
	minReport.keys = {
		apartmentKeys: undefined,
		entranceKeys: undefined,
		notes: undefined
	};
	minReport.notes = undefined;

	const startTimeB = performance.now();
	const pdfBytesB = await generateHandoverPdf(minReport, [], fontBytes);
	const durationMsB = performance.now() - startTimeB;

	const parsedDocB = await PDFDocument.load(pdfBytesB);
	const pageCountB = parsedDocB.getPageCount();

	if (pageCountB !== 1) {
		throw new Error(`Expected 1 page for minimal report, got ${pageCountB}`);
	}

	return {
		status: 'PASS',
		testCaseA: {
			pages: pageCountA,
			byteLength: pdfBytesA.byteLength,
			durationMs: Math.round(durationMsA)
		},
		testCaseB: {
			pages: pageCountB,
			byteLength: pdfBytesB.byteLength,
			durationMs: Math.round(durationMsB)
		}
	};
}
