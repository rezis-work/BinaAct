/**
 * Public origin used for canonical URLs, Open Graph, and the sitemap.
 * PUBLIC_SITE_URL overrides this when set.
 */
const DEFAULT_SITE_ORIGIN = 'https://bina-act.vercel.app';

export const SITE_ORIGIN = (import.meta.env.PUBLIC_SITE_URL || DEFAULT_SITE_ORIGIN).replace(
	/\/$/,
	''
);

export interface PageSeo {
	title: string;
	description: string;
	/** index,follow for public pages; noindex,nofollow for the in-app wizard. */
	robots: 'index, follow' | 'noindex, nofollow';
}

export function pageSeo(pathname: string, isEn: boolean): PageSeo {
	if (pathname === '/create' || pathname.startsWith('/create/')) {
		return {
			title: isEn ? 'Create Report — BinaAct' : 'აქტის შექმნა — BinaAct (ბინააქტი)',
			description: isEn
				? 'Fill in the apartment handover report on this device.'
				: 'შეავსეთ ბინის მიღება-ჩაბარების აქტი ამ მოწყობილობაზე.',
			robots: 'noindex, nofollow'
		};
	}

	if (pathname === '/review' || pathname.startsWith('/review/')) {
		return {
			title: isEn ? 'Review Report — BinaAct' : 'აქტის გადახედვა — BinaAct (ბინააქტი)',
			description: isEn
				? 'Review the handover report and download the PDF.'
				: 'გადაამოწმეთ აქტი და ჩამოტვირთეთ PDF დოკუმენტი.',
			robots: 'noindex, nofollow'
		};
	}

	if (pathname === '/privacy' || pathname.startsWith('/privacy/')) {
		return {
			title: isEn
				? 'Privacy Policy — BinaAct'
				: 'კონფიდენციალურობის პოლიტიკა — BinaAct (ბინააქტი)',
			description: isEn
				? 'BinaAct processes apartment details, photos, and the PDF only in your browser. Nothing is uploaded to a server.'
				: 'ბინააქტი ბინის მონაცემებს, ფოტოებს და PDF დოკუმენტს ამუშავებს მხოლოდ თქვენს ბრაუზერში. სერვერზე არაფერი იტვირთება.',
			robots: 'index, follow'
		};
	}

	return {
		title: isEn
			? 'BinaAct — Apartment Handover Report'
			: 'ბინააქტი (BinaAct) — ბინის მიღება-ჩაბარების აქტი',
		description: isEn
			? 'Free apartment move-in and move-out handover report. Document room condition, photos, meters, and keys, then download a printable PDF. No account required.'
			: 'უფასო ბინის მიღება-ჩაბარების აქტი. აღწერეთ ოთახების მდგომარეობა, ფოტოები, მრიცხველები და გასაღებები, შემდეგ ჩამოტვირთეთ PDF. რეგისტრაცია არ არის საჭირო.',
		robots: 'index, follow'
	};
}

export function canonicalUrl(pathname: string): string | null {
	if (!SITE_ORIGIN) return null;
	if (pathname === '/') return `${SITE_ORIGIN}/`;
	return `${SITE_ORIGIN}${pathname}`;
}
