import { SITE_ORIGIN } from '$lib/seo';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () => {
	const lines = [
		'# Public pages only. The inspection wizard is an app, not a landing page.',
		'User-agent: *',
		'Allow: /',
		'Disallow: /create',
		'Disallow: /review',
		''
	];

	if (SITE_ORIGIN) {
		lines.push(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`, '');
	}

	return new Response(lines.join('\n'), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=3600'
		}
	});
};
