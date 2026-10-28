export type AnalyticsEventName =
	| 'report_started'
	| 'step_completed'
	| 'pdf_generated'
	| 'draft_cleared';

export interface AnalyticsEventPayload {
	step?: 1 | 2 | 3 | 4;
	inspectionType?: 'MOVE_IN' | 'MOVE_OUT';
	roomCount?: number;
	photoCount?: number;
}

/**
 * NFR-002 Security Rule:
 * NEVER pass addresses, names, phone numbers, notes, or photo filenames/blobs here.
 */
export function trackEvent(name: AnalyticsEventName, payload?: AnalyticsEventPayload): void {
	if (typeof window === 'undefined') return;

	const win = window as Window & {
		gtag?: (command: 'event', eventName: string, eventParams?: AnalyticsEventPayload) => void;
	};
	if (typeof win.gtag === 'function') {
		win.gtag('event', name, payload);
	}

	if (import.meta.env.DEV) {
		console.debug('[BinaAct Analytics]', name, payload ?? {});
	}
}
