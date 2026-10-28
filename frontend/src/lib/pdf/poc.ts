import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export async function generateGeorgianPocPdf(): Promise<void> {
	const pdfDoc = await PDFDocument.create();
	pdfDoc.registerFontkit(fontkit);

	const [regularBytes, boldBytes] = await Promise.all([
		fetch('/fonts/NotoSansGeorgian-Regular.ttf').then((r) => {
			if (!r.ok) throw new Error('Failed to load NotoSansGeorgian-Regular.ttf');
			return r.arrayBuffer();
		}),
		fetch('/fonts/NotoSansGeorgian-Bold.ttf').then((r) => {
			if (!r.ok) throw new Error('Failed to load NotoSansGeorgian-Bold.ttf');
			return r.arrayBuffer();
		})
	]);

	const fontRegular = await pdfDoc.embedFont(regularBytes);
	const fontBold = await pdfDoc.embedFont(boldBytes);

	// A4 dimensions in points: 595.28 x 841.89
	const page = pdfDoc.addPage([595.28, 841.89]);
	const { height } = page.getSize();

	page.drawText('ბინის მიღება-ჩაბარების აქტი (PoC)', {
		x: 50,
		y: height - 60,
		size: 18,
		font: fontBold,
		color: rgb(0.1, 0.1, 0.15)
	});

	page.drawText('მისამართი: თბილისი, საბურთალო, ყაზბეგის 12, ბინა 45', {
		x: 50,
		y: height - 95,
		size: 11,
		font: fontRegular
	});

	page.drawText('მისაღები ოთახი — იატაკი: მცირე დაზიანება | კედლები: კარგი', {
		x: 50,
		y: height - 120,
		size: 11,
		font: fontRegular
	});

	// Create a synthetic test photo via Browser Canvas API and embed as JPEG
	const canvas = document.createElement('canvas');
	canvas.width = 400;
	canvas.height = 250;
	const ctx = canvas.getContext('2d');
	if (ctx) {
		ctx.fillStyle = '#e2e8f0';
		ctx.fillRect(0, 0, 400, 250);
		ctx.fillStyle = '#1e293b';
		ctx.font = 'bold 20px sans-serif';
		ctx.fillText('BinaAct Test Photo (JPEG)', 60, 130);
	}

	const blob: Blob = await new Promise((resolve, reject) =>
		canvas.toBlob(
			(b) => (b ? resolve(b) : reject(new Error('Canvas blob failed'))),
			'image/jpeg',
			0.82
		)
	);
	const jpgBytes = await blob.arrayBuffer();
	const embeddedJpg = await pdfDoc.embedJpg(jpgBytes);

	page.drawImage(embeddedJpg, {
		x: 50,
		y: height - 340,
		width: 240,
		height: 150
	});

	const pdfBytes = await pdfDoc.save();
	const pdfBlob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
	const url = URL.createObjectURL(pdfBlob);

	const link = document.createElement('a');
	link.href = url;
	link.download = 'BinaAct_PoC.pdf';
	document.body.appendChild(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(url), 5000);
}
