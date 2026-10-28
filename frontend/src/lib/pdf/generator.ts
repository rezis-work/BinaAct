import { PDFDocument, type PDFFont, type PDFImage, type PDFPage, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {
	CONDITION_LABELS,
	INSPECTION_TYPE_LABELS,
	formatGeorgianDate,
	getTodayIsoDate,
	type Condition,
	type HandoverReport,
	type InspectionType,
	type LocalPhotoRecord
} from '../types/report.ts';
import { i18n, type Locale } from '../i18n/index.svelte.ts';

export const A4_WIDTH = 595.28;
export const A4_HEIGHT = 841.89;
export const PAGE_MARGIN = 45;
export const CONTENT_WIDTH = A4_WIDTH - PAGE_MARGIN * 2; // 505.28
export const FOOTER_RESERVE = 30;

const COLOR_PRIMARY = rgb(0.118, 0.227, 0.373); // #1E3A5F
const COLOR_TEAL = rgb(0.078, 0.62, 0.545); // #149E8B
const COLOR_TEXT = rgb(0.08, 0.1, 0.14);
const COLOR_MUTED = rgb(0.38, 0.42, 0.48);
const COLOR_BORDER = rgb(0.84, 0.87, 0.91);
const COLOR_BG_LIGHT = rgb(0.965, 0.973, 0.984);

let cachedFontBytes: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

async function loadFontBytes(options?: {
	regularFontBytes?: ArrayBuffer | Uint8Array;
	boldFontBytes?: ArrayBuffer | Uint8Array;
}): Promise<{ regular: ArrayBuffer | Uint8Array; bold: ArrayBuffer | Uint8Array }> {
	if (options?.regularFontBytes && options?.boldFontBytes) {
		return {
			regular: options.regularFontBytes,
			bold: options.boldFontBytes
		};
	}

	if (cachedFontBytes) {
		return cachedFontBytes;
	}

	const [regular, bold] = await Promise.all([
		fetch('/fonts/NotoSansGeorgian-Regular.ttf').then((r) => {
			if (!r.ok) throw new Error('Failed to load NotoSansGeorgian-Regular.ttf');
			return r.arrayBuffer();
		}),
		fetch('/fonts/NotoSansGeorgian-Bold.ttf').then((r) => {
			if (!r.ok) throw new Error('Failed to load NotoSansGeorgian-Bold.ttf');
			return r.arrayBuffer();
		})
	]);

	cachedFontBytes = { regular, bold };
	return cachedFontBytes;
}

/**
 * Wraps text (including Georgian Unicode and long unbroken tokens) to fit within maxWidth.
 */
export function wrapText(
	text: string,
	font: PDFFont,
	fontSize: number,
	maxWidth: number
): string[] {
	const cleaned = (text ?? '').replace(/\r\n/g, '\n').trim();
	if (!cleaned) return [];

	const paragraphs = cleaned.split('\n');
	const lines: string[] = [];

	for (const paragraph of paragraphs) {
		const trimmedPara = paragraph.trim();
		if (!trimmedPara) {
			continue;
		}

		const words = trimmedPara.split(/\s+/);
		let currentLine = '';

		for (const word of words) {
			// Check if single word itself exceeds maxWidth
			if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
				if (currentLine) {
					lines.push(currentLine);
					currentLine = '';
				}
				let chunk = '';
				for (const char of Array.from(word)) {
					const candidate = chunk + char;
					if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth && chunk) {
						lines.push(chunk);
						chunk = char;
					} else {
						chunk = candidate;
					}
				}
				currentLine = chunk;
				continue;
			}

			const testLine = currentLine ? `${currentLine} ${word}` : word;
			if (font.widthOfTextAtSize(testLine, fontSize) <= maxWidth) {
				currentLine = testLine;
			} else {
				if (currentLine) {
					lines.push(currentLine);
				}
				currentLine = word;
			}
		}

		if (currentLine) {
			lines.push(currentLine);
		}
	}

	return lines;
}

export function getReportPdfFilename(inspectionDate: string): string {
	const cleanDate = (inspectionDate ?? '').trim() || getTodayIsoDate();
	return `BinaAct_${cleanDate}.pdf`;
}

export function downloadPdfBytes(bytes: Uint8Array, filename: string): void {
	if (typeof window === 'undefined' || typeof document === 'undefined') return;

	const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.style.display = 'none';
	document.body.appendChild(link);
	link.click();
	link.remove();

	setTimeout(() => {
		URL.revokeObjectURL(url);
	}, 10000);
}

function normalizePhotoMap(
	photos?: LocalPhotoRecord[] | Record<string, LocalPhotoRecord>
): Record<string, LocalPhotoRecord> {
	if (!photos) return {};
	if (Array.isArray(photos)) {
		const map: Record<string, LocalPhotoRecord> = {};
		for (const p of photos) {
			map[p.id] = p;
		}
		return map;
	}
	return photos;
}

export async function generateHandoverPdf(
	report: HandoverReport,
	photos?: LocalPhotoRecord[] | Record<string, LocalPhotoRecord>,
	options?: {
		regularFontBytes?: ArrayBuffer | Uint8Array;
		boldFontBytes?: ArrayBuffer | Uint8Array;
		locale?: Locale;
	}
): Promise<Uint8Array> {
	const lang: Locale = options?.locale ?? 'ka';
	const isEn = lang === 'en';

	const pdfDoc = await PDFDocument.create();
	pdfDoc.registerFontkit(fontkit);

	const fontBytes = await loadFontBytes(options);
	const fontRegular = await pdfDoc.embedFont(fontBytes.regular);
	const fontBold = await pdfDoc.embedFont(fontBytes.bold);

	const photoMap = normalizePhotoMap(photos);

	let page: PDFPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
	let y = A4_HEIGHT - PAGE_MARGIN;

	function addNewPage(): void {
		page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
		y = A4_HEIGHT - PAGE_MARGIN;
	}

	function ensureSpace(neededHeight: number): boolean {
		if (y - neededHeight < PAGE_MARGIN + FOOTER_RESERVE) {
			addNewPage();
			return true;
		}
		return false;
	}

	function drawSectionHeading(title: string): void {
		ensureSpace(40);
		y -= 6;
		page.drawRectangle({
			x: PAGE_MARGIN,
			y: y - 22,
			width: CONTENT_WIDTH,
			height: 24,
			color: COLOR_BG_LIGHT,
			borderColor: COLOR_BORDER,
			borderWidth: 0.75
		});
		page.drawRectangle({
			x: PAGE_MARGIN,
			y: y - 22,
			width: 4,
			height: 24,
			color: COLOR_PRIMARY
		});
		page.drawText(title, {
			x: PAGE_MARGIN + 12,
			y: y - 15,
			size: 12,
			font: fontBold,
			color: COLOR_PRIMARY
		});
		y -= 34;
	}

	function getTypeLabel(type: InspectionType): string {
		return isEn ? i18n.inspectionTypeLabel(type, 'en') : (INSPECTION_TYPE_LABELS[type] ?? 'ბინის გადაცემა');
	}

	function getCondLabel(cond: Condition): string {
		return isEn ? i18n.conditionLabel(cond, 'en') : (CONDITION_LABELS[cond] ?? cond);
	}

	const notSpecifiedText = isEn ? 'Not specified' : 'არ არის მითითებული';
	const notePrefix = isEn ? 'Note' : 'შენიშვნა';

	// =========================================================================
	// 1. DOCUMENT HEADER (FR-010)
	// =========================================================================
	page.drawText(isEn ? 'Apartment Handover Report' : 'ბინის მიღება-ჩაბარების აქტი', {
		x: PAGE_MARGIN,
		y: y - 16,
		size: 18,
		font: fontBold,
		color: COLOR_PRIMARY
	});

	const typeLabel = getTypeLabel(report.type);
	const typeWidth = fontBold.widthOfTextAtSize(typeLabel, 11) + 18;
	page.drawRectangle({
		x: A4_WIDTH - PAGE_MARGIN - typeWidth,
		y: y - 20,
		width: typeWidth,
		height: 22,
		color: COLOR_BG_LIGHT,
		borderColor: COLOR_TEAL,
		borderWidth: 1
	});
	page.drawText(typeLabel, {
		x: A4_WIDTH - PAGE_MARGIN - typeWidth + 9,
		y: y - 13,
		size: 11,
		font: fontBold,
		color: COLOR_TEAL
	});

	y -= 32;

	// Divider line under title
	page.drawLine({
		start: { x: PAGE_MARGIN, y },
		end: { x: A4_WIDTH - PAGE_MARGIN, y },
		thickness: 1,
		color: COLOR_BORDER
	});
	y -= 18;

	// Date
	const formattedDate = formatGeorgianDate(report.inspectionDate) || '—';
	page.drawText(`${isEn ? 'Date' : 'თარიღი'}: ${formattedDate}`, {
		x: PAGE_MARGIN,
		y,
		size: 10.5,
		font: fontBold,
		color: COLOR_TEXT
	});
	y -= 18;

	// Apartment Address & Number
	const rawAddress = (report.apartment.address ?? '').trim() || notSpecifiedText;
	const aptNum = (report.apartment.apartmentNumber ?? '').trim();
	const fullAddressStr = aptNum
		? isEn
			? `Apartment Address: ${rawAddress}, Apt ${aptNum}`
			: `ბინის მისამართი: ${rawAddress}, ბინა ${aptNum}`
		: isEn
			? `Apartment Address: ${rawAddress}`
			: `ბინის მისამართი: ${rawAddress}`;

	const addressLines = wrapText(fullAddressStr, fontRegular, 10.5, CONTENT_WIDTH);
	for (const line of addressLines) {
		ensureSpace(16);
		page.drawText(line, {
			x: PAGE_MARGIN,
			y,
			size: 10.5,
			font: fontRegular,
			color: COLOR_TEXT
		});
		y -= 15;
	}

	// Optional Apartment Notes
	const aptNotes = (report.apartment.notes ?? '').trim();
	if (aptNotes) {
		const aptNoteLines = wrapText(`${notePrefix}: ${aptNotes}`, fontRegular, 9.5, CONTENT_WIDTH);
		for (const line of aptNoteLines) {
			ensureSpace(15);
			page.drawText(line, {
				x: PAGE_MARGIN,
				y,
				size: 9.5,
				font: fontRegular,
				color: COLOR_MUTED
			});
			y -= 14;
		}
	}

	y -= 6;

	// Parties Box
	const landlordName = (report.landlord.fullName ?? '').trim() || notSpecifiedText;
	const landlordPhone = (report.landlord.phone ?? '').trim();
	const landlordLine = landlordPhone
		? isEn
			? `Landlord: ${landlordName} (Tel: ${landlordPhone})`
			: `გამქირავებელი: ${landlordName} (ტელ: ${landlordPhone})`
		: isEn
			? `Landlord: ${landlordName}`
			: `გამქირავებელი: ${landlordName}`;

	const tenantName = (report.tenant.fullName ?? '').trim() || notSpecifiedText;
	const tenantPhone = (report.tenant.phone ?? '').trim();
	const tenantLine = tenantPhone
		? isEn
			? `Tenant: ${tenantName} (Tel: ${tenantPhone})`
			: `დამქირავებელი: ${tenantName} (ტელ: ${tenantPhone})`
		: isEn
			? `Tenant: ${tenantName}`
			: `დამქირავებელი: ${tenantName}`;

	const landlordWrapped = wrapText(landlordLine, fontRegular, 10, CONTENT_WIDTH - 20);
	const tenantWrapped = wrapText(tenantLine, fontRegular, 10, CONTENT_WIDTH - 20);
	const partiesBoxHeight = (landlordWrapped.length + tenantWrapped.length) * 15 + 16;

	ensureSpace(partiesBoxHeight + 10);
	page.drawRectangle({
		x: PAGE_MARGIN,
		y: y - partiesBoxHeight,
		width: CONTENT_WIDTH,
		height: partiesBoxHeight,
		color: COLOR_BG_LIGHT,
		borderColor: COLOR_BORDER,
		borderWidth: 0.75
	});

	let partyY = y - 14;
	for (const line of landlordWrapped) {
		page.drawText(line, {
			x: PAGE_MARGIN + 10,
			y: partyY,
			size: 10,
			font: fontRegular,
			color: COLOR_TEXT
		});
		partyY -= 15;
	}
	for (const line of tenantWrapped) {
		page.drawText(line, {
			x: PAGE_MARGIN + 10,
			y: partyY,
			size: 10,
			font: fontRegular,
			color: COLOR_TEXT
		});
		partyY -= 15;
	}

	y -= partiesBoxHeight + 14;

	// =========================================================================
	// 2. SECTION 1: 1. ბინის მდგომარეობა
	// =========================================================================
	drawSectionHeading(isEn ? '1. Room Condition' : '1. ბინის მდგომარეობა');

	if (report.rooms.length === 0) {
		ensureSpace(20);
		page.drawText(notSpecifiedText, {
			x: PAGE_MARGIN + 4,
			y,
			size: 10,
			font: fontRegular,
			color: COLOR_MUTED
		});
		y -= 20;
	} else {
		for (let i = 0; i < report.rooms.length; i++) {
			const room = report.rooms[i];
			const localizedRoomName = i18n.roomName((room.name ?? '').trim(), lang) || (isEn ? 'Room' : 'ოთახი');
			const roomTitle = `${i + 1}. ${localizedRoomName}`;
			const noteText = (room.notes ?? '').trim();
			const noteLines = noteText
				? wrapText(`${notePrefix}: ${noteText}`, fontRegular, 9.5, CONTENT_WIDTH - 20)
				: [];

			const estimatedRoomHeight =
				22 + room.components.length * 15 + (noteLines.length > 0 ? noteLines.length * 14 + 8 : 0);

			ensureSpace(Math.min(estimatedRoomHeight, 120));

			// Room Header
			page.drawText(roomTitle, {
				x: PAGE_MARGIN + 4,
				y,
				size: 11.5,
				font: fontBold,
				color: COLOR_PRIMARY
			});
			y -= 17;

			// Room Components
			for (const comp of room.components) {
				ensureSpace(16);
				const condLabel = getCondLabel(comp.condition);
				const compLabel = i18n.componentName(comp.name, lang);
				page.drawText(`• ${compLabel}:`, {
					x: PAGE_MARGIN + 12,
					y,
					size: 10,
					font: fontRegular,
					color: COLOR_TEXT
				});
				page.drawText(condLabel, {
					x: PAGE_MARGIN + 110,
					y,
					size: 10,
					font: fontBold,
					color: COLOR_TEXT
				});
				y -= 15;
			}

			// Optional Room Notes
			if (noteLines.length > 0) {
				y -= 2;
				for (const line of noteLines) {
					ensureSpace(15);
					page.drawText(line, {
						x: PAGE_MARGIN + 12,
						y,
						size: 9.5,
						font: fontRegular,
						color: COLOR_MUTED
					});
					y -= 14;
				}
			}

			y -= 10;
		}
	}

	// =========================================================================
	// 3. SECTION 2: 2. ავეჯი და ტექნიკა
	// =========================================================================
	drawSectionHeading(isEn ? '2. Furniture & Appliances' : '2. ავეჯი და ტექნიკა');

	if (report.inventory.length === 0) {
		ensureSpace(20);
		page.drawText(notSpecifiedText, {
			x: PAGE_MARGIN + 4,
			y,
			size: 10,
			font: fontRegular,
			color: COLOR_MUTED
		});
		y -= 20;
	} else {
		const colNameX = PAGE_MARGIN + 8;
		const colQtyX = PAGE_MARGIN + 175;
		const colCondX = PAGE_MARGIN + 245;
		const colNoteX = PAGE_MARGIN + 355;
		const noteColMaxWidth = PAGE_MARGIN + CONTENT_WIDTH - colNoteX - 6;

		function drawInventoryTableHeader(): void {
			ensureSpace(26);
			page.drawRectangle({
				x: PAGE_MARGIN,
				y: y - 16,
				width: CONTENT_WIDTH,
				height: 20,
				color: COLOR_BG_LIGHT,
				borderColor: COLOR_BORDER,
				borderWidth: 0.5
			});
			page.drawText(isEn ? 'Item' : 'ნივთი', {
				x: colNameX,
				y: y - 10,
				size: 9.5,
				font: fontBold,
				color: COLOR_TEXT
			});
			page.drawText(isEn ? 'Qty' : 'რაოდენობა', {
				x: colQtyX,
				y: y - 10,
				size: 9.5,
				font: fontBold,
				color: COLOR_TEXT
			});
			page.drawText(isEn ? 'Condition' : 'მდგომარეობა', {
				x: colCondX,
				y: y - 10,
				size: 9.5,
				font: fontBold,
				color: COLOR_TEXT
			});
			page.drawText(notePrefix, {
				x: colNoteX,
				y: y - 10,
				size: 9.5,
				font: fontBold,
				color: COLOR_TEXT
			});
			y -= 24;
		}

		drawInventoryTableHeader();

		for (const item of report.inventory) {
			const localizedItemName = i18n.inventoryName(item.name || '—', lang);
			const nameLines = wrapText(localizedItemName, fontRegular, 9.5, 160);
			const noteStr = (item.notes ?? '').trim() || '—';
			const noteLines = wrapText(noteStr, fontRegular, 9, noteColMaxWidth);
			const rowLineCount = Math.max(nameLines.length, noteLines.length, 1);
			const rowHeight = rowLineCount * 13 + 8;

			if (ensureSpace(rowHeight + 6)) {
				drawInventoryTableHeader();
			}

			const topRowY = y;
			for (let idx = 0; idx < nameLines.length; idx++) {
				page.drawText(nameLines[idx], {
					x: colNameX,
					y: topRowY - idx * 13,
					size: 9.5,
					font: fontRegular,
					color: COLOR_TEXT
				});
			}

			page.drawText(String(item.quantity ?? 1), {
				x: colQtyX + 18,
				y: topRowY,
				size: 9.5,
				font: fontRegular,
				color: COLOR_TEXT
			});

			const condLabel = getCondLabel(item.condition);
			page.drawText(condLabel, {
				x: colCondX,
				y: topRowY,
				size: 9.5,
				font: fontBold,
				color: COLOR_TEXT
			});

			for (let idx = 0; idx < noteLines.length; idx++) {
				page.drawText(noteLines[idx], {
					x: colNoteX,
					y: topRowY - idx * 13,
					size: 9,
					font: fontRegular,
					color: COLOR_MUTED
				});
			}

			y -= rowHeight;
			page.drawLine({
				start: { x: PAGE_MARGIN, y: y + 4 },
				end: { x: A4_WIDTH - PAGE_MARGIN, y: y + 4 },
				thickness: 0.4,
				color: COLOR_BORDER
			});
			y -= 4;
		}
		y -= 8;
	}

	// =========================================================================
	// 4. SECTION 3: 3. კომუნალური მრიცხველები
	// =========================================================================
	drawSectionHeading(isEn ? '3. Utility Meter Readings' : '3. კომუნალური მრიცხველები');

	ensureSpace(55);
	const elecStr =
		report.utilities.electricity !== undefined && !Number.isNaN(report.utilities.electricity)
			? `${report.utilities.electricity} kWh`
			: '—';
	const waterStr =
		report.utilities.water !== undefined && !Number.isNaN(report.utilities.water)
			? `${report.utilities.water} m³`
			: '—';
	const gasStr =
		report.utilities.gas !== undefined && !Number.isNaN(report.utilities.gas)
			? `${report.utilities.gas} m³`
			: '—';

	page.drawText(`${isEn ? 'Electricity' : 'ელექტროენერგია'}: ${elecStr}`, {
		x: PAGE_MARGIN + 8,
		y,
		size: 10,
		font: fontRegular,
		color: COLOR_TEXT
	});
	y -= 16;

	page.drawText(`${isEn ? 'Water' : 'წყალი'}: ${waterStr}`, {
		x: PAGE_MARGIN + 8,
		y,
		size: 10,
		font: fontRegular,
		color: COLOR_TEXT
	});
	y -= 16;

	page.drawText(`${isEn ? 'Natural Gas' : 'ბუნებრივი აირი'}: ${gasStr}`, {
		x: PAGE_MARGIN + 8,
		y,
		size: 10,
		font: fontRegular,
		color: COLOR_TEXT
	});
	y -= 20;

	// =========================================================================
	// 5. SECTION 4: 4. გასაღებები
	// =========================================================================
	drawSectionHeading(isEn ? '4. Keys' : '4. გასაღებები');

	ensureSpace(50);
	const aptKeysStr =
		report.keys.apartmentKeys !== undefined && !Number.isNaN(report.keys.apartmentKeys)
			? String(report.keys.apartmentKeys)
			: '—';
	const entKeysStr =
		report.keys.entranceKeys !== undefined && !Number.isNaN(report.keys.entranceKeys)
			? String(report.keys.entranceKeys)
			: '—';

	page.drawText(`${isEn ? 'Apartment Keys' : 'ბინის გასაღები'}: ${aptKeysStr}`, {
		x: PAGE_MARGIN + 8,
		y,
		size: 10,
		font: fontRegular,
		color: COLOR_TEXT
	});
	y -= 16;

	page.drawText(`${isEn ? 'Building Entrance Key / Chip' : 'სადარბაზოს ჩიპი'}: ${entKeysStr}`, {
		x: PAGE_MARGIN + 8,
		y,
		size: 10,
		font: fontRegular,
		color: COLOR_TEXT
	});
	y -= 16;

	const keyNotes = (report.keys.notes ?? '').trim();
	if (keyNotes) {
		const keyNoteLines = wrapText(`${notePrefix}: ${keyNotes}`, fontRegular, 9.5, CONTENT_WIDTH - 16);
		for (const line of keyNoteLines) {
			ensureSpace(15);
			page.drawText(line, {
				x: PAGE_MARGIN + 8,
				y,
				size: 9.5,
				font: fontRegular,
				color: COLOR_MUTED
			});
			y -= 14;
		}
	}
	y -= 10;

	// =========================================================================
	// 6. PHOTOGRAPHS SECTION (GROUPED BY ROOM)
	// =========================================================================
	const roomsWithPhotos = report.rooms
		.map((room) => ({
			room,
			records: room.photoIds
				.map((id) => photoMap[id])
				.filter((rec): rec is LocalPhotoRecord => Boolean(rec && rec.blob))
		}))
		.filter((entry) => entry.records.length > 0);

	if (roomsWithPhotos.length > 0) {
		drawSectionHeading(isEn ? 'Appendix: Photographs' : 'დანართი: ფოტომასალა');

		const boxWidth = 240;
		const boxHeight = 180;
		const colGap = CONTENT_WIDTH - boxWidth * 2; // 25.28

		for (const { room, records } of roomsWithPhotos) {
			ensureSpace(boxHeight + 45);
			page.drawText(i18n.roomName(room.name, lang) || (isEn ? 'Room' : 'ოთახი'), {
				x: PAGE_MARGIN + 4,
				y,
				size: 11,
				font: fontBold,
				color: COLOR_PRIMARY
			});
			y -= 14;

			for (let i = 0; i < records.length; i += 2) {
				ensureSpace(boxHeight + 24);
				const pair = records.slice(i, i + 2);

				for (let col = 0; col < pair.length; col++) {
					const record = pair[col];
					const boxX = PAGE_MARGIN + col * (boxWidth + colGap);
					const boxY = y - boxHeight;

					page.drawRectangle({
						x: boxX,
						y: boxY,
						width: boxWidth,
						height: boxHeight,
						color: COLOR_BG_LIGHT,
						borderColor: COLOR_BORDER,
						borderWidth: 0.5
					});

					try {
						const imgBuffer = await record.blob.arrayBuffer();
						let embeddedImage: PDFImage;
						if (record.mimeType === 'image/png') {
							embeddedImage = await pdfDoc.embedPng(imgBuffer);
						} else {
							embeddedImage = await pdfDoc.embedJpg(imgBuffer);
						}

						const imgDims = embeddedImage.scaleToFit(boxWidth - 8, boxHeight - 8);
						const drawX = boxX + (boxWidth - imgDims.width) / 2;
						const drawY = boxY + (boxHeight - imgDims.height) / 2;

						page.drawImage(embeddedImage, {
							x: drawX,
							y: drawY,
							width: imgDims.width,
							height: imgDims.height
						});
					} catch (err) {
						console.warn('Could not embed photo into PDF:', err);
						page.drawText(isEn ? 'Failed to load photo' : 'ფოტო ვერ ჩაიტვირთა', {
							x: boxX + 20,
							y: boxY + boxHeight / 2,
							size: 9,
							font: fontRegular,
							color: COLOR_MUTED
						});
					}
				}

				y -= boxHeight + 16;
			}
			y -= 6;
		}
	}

	// =========================================================================
	// 7. SECTION 5: 5. მხარეთა ხელმოწერები & 8. LEGAL DISCLAIMER (FR-010)
	// =========================================================================
	ensureSpace(140);
	drawSectionHeading(isEn ? '5. Signatures of the Parties' : '5. მხარეთა ხელმოწერები');

	y -= 10;
	page.drawText(
		isEn
			? 'Landlord: _________________________'
			: 'გამქირავებელი: _________________________',
		{
			x: PAGE_MARGIN + 4,
			y,
			size: 10.5,
			font: fontBold,
			color: COLOR_TEXT
		}
	);

	page.drawText(
		isEn
			? 'Tenant: _________________________'
			: 'დამქირავებელი: _________________________',
		{
			x: PAGE_MARGIN + 265,
			y,
			size: 10.5,
			font: fontBold,
			color: COLOR_TEXT
		}
	);

	y -= 15;
	page.drawText(`(${landlordName})`, {
		x: PAGE_MARGIN + 95,
		y,
		size: 8.5,
		font: fontRegular,
		color: COLOR_MUTED
	});

	page.drawText(`(${tenantName})`, {
		x: PAGE_MARGIN + 355,
		y,
		size: 8.5,
		font: fontRegular,
		color: COLOR_MUTED
	});

	y -= 32;

	// Legal & Verification Disclaimer (FR-010)
	const disclaimerText = isEn
		? 'Note: This document has been prepared based on information provided by the user and has not been independently verified by BinaAct. The document is intended for printing and physical signing by the parties.'
		: 'შენიშვნა: წინამდებარე დოკუმენტი შედგენილია მომხმარებლის მიერ მოწოდებული ინფორმაციის საფუძველზე და არ არის დამოუკიდებლად გადამოწმებული BinaAct-ის მიერ. დოკუმენტი განკუთვნილია ამოსაბეჭდად და მხარეთა მიერ ფიზიკური ხელმოწერისთვის.';

	const disclaimerLines = wrapText(disclaimerText, fontRegular, 8.5, CONTENT_WIDTH);
	for (const line of disclaimerLines) {
		ensureSpace(13);
		page.drawText(line, {
			x: PAGE_MARGIN,
			y,
			size: 8.5,
			font: fontRegular,
			color: COLOR_MUTED
		});
		y -= 12;
	}

	// =========================================================================
	// PAGE NUMBERS FOOTER ON ALL PAGES
	// =========================================================================
	const pages = pdfDoc.getPages();
	const totalPages = pages.length;
	for (let idx = 0; idx < totalPages; idx++) {
		const p = pages[idx];
		const footerText = isEn
			? `BinaAct (ბინააქტი) — Page ${idx + 1} of ${totalPages}`
			: `BinaAct (ბინააქტი) — გვერდი ${idx + 1} / ${totalPages}`;
		const textWidth = fontRegular.widthOfTextAtSize(footerText, 8);
		p.drawText(footerText, {
			x: (A4_WIDTH - textWidth) / 2,
			y: 22,
			size: 8,
			font: fontRegular,
			color: COLOR_MUTED
		});
	}

	return pdfDoc.save();
}
