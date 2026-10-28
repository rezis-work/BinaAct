import { SITE_ORIGIN } from '$lib/seo';
import type { RequestHandler } from './$types';

export const prerender = true;

const PUBLIC_PATHS = ['/', '/privacy'] as const;

export const GET: RequestHandler = () => {
	const origin = SITE_ORIGIN;
	const urls = origin
		? PUBLIC_PATHS.map(
				(path) => `  <url>\n    <loc>${origin}${path === '/' ? '/' : path}</loc>\n  </url>`
			).join('\n')
		: '';

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'max-age=3600'
		}
	});
};
