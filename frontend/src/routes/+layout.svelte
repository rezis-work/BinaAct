<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import favicon from '#lib/assets/favicon.svg';
	import logo from '#lib/assets/logo.png';
	import { page } from '$app/state';
	import { trackEvent } from '$lib/analytics';
	import { i18n } from '$lib/i18n/index.svelte';
	import { canonicalUrl, pageSeo } from '$lib/seo';
	import PwaInstallPrompt from '$lib/components/PwaInstallPrompt.svelte';
	import Globe from 'lucide-svelte/icons/globe';
	import Smartphone from 'lucide-svelte/icons/smartphone';

	let { children } = $props();

	let showPwaDialog = $state(false);
	let isPwaStandalone = $state(false);

	const seo = $derived(pageSeo(page.url.pathname, i18n.isEn));
	const canonical = $derived(canonicalUrl(page.url.pathname));

	onMount(() => {
		i18n.hydrateFromStorage();
	});
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={favicon} />
	<link rel="icon" type="image/png" href="/favicon.png" />
	<link rel="apple-touch-icon" href="/favicon.png" />
	<link rel="manifest" href="/manifest.webmanifest" />
	<meta name="theme-color" content="#1E3A5F" />
	<meta name="mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="default" />
	<meta name="apple-mobile-web-app-title" content="BinaAct" />
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<meta name="robots" content={seo.robots} />
	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="BinaAct" />
	<meta property="og:locale" content={i18n.isEn ? 'en_US' : 'ka_GE'} />
	{#if canonical}
		<link rel="canonical" href={canonical} />
		<meta property="og:url" content={canonical} />
	{/if}
</svelte:head>

<div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden">
	<header class="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200">
		<div class="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
			<a href="/" class="flex items-center gap-2 font-bold text-lg text-slate-900 shrink-0">
				<img
					src={logo}
					alt="BinaAct — ბინააქტი"
					class="h-10 w-10 rounded-lg object-contain border border-slate-100"
				/>
				<span class="tracking-tight">
					<span class="text-[#1E3A5F]">Bina</span><span class="text-[#149E8B]">Act</span>
				</span>
			</a>
			<nav class="flex items-center gap-1 sm:gap-2.5 text-xs sm:text-sm font-medium text-slate-600">
				<a
					href="/create"
					onclick={() => trackEvent('report_started')}
					class="inline-flex items-center min-h-11 px-2.5 sm:px-3 rounded-lg hover:text-[#149E8B] hover:bg-slate-50 transition-colors"
				>
					{i18n.isEn ? 'Create Report' : 'აქტის შექმნა'}
				</a>
				<a
					href="/privacy"
					class="inline-flex items-center min-h-11 px-2.5 sm:px-3 rounded-lg hover:text-[#149E8B] hover:bg-slate-50 transition-colors"
				>
					{i18n.isEn ? 'Privacy' : 'კონფიდენციალურობა'}
				</a>

				<!-- Header Language Switcher Pill -->
				<div
					role="group"
					aria-label={i18n.isEn ? 'Language switcher' : 'ენის გადამრთველი'}
					class="inline-flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200/80 ml-1"
				>
					<button
						type="button"
						onclick={() => i18n.setLocale('ka')}
						aria-pressed={!i18n.isEn}
						class="min-h-9 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer {!i18n.isEn
							? 'bg-[#1E3A5F] text-white shadow-2xs'
							: 'text-slate-600 hover:text-slate-900'}"
					>
						ქარ
					</button>
					<button
						type="button"
						onclick={() => i18n.setLocale('en')}
						aria-pressed={i18n.isEn}
						class="min-h-9 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer {i18n.isEn
							? 'bg-[#1E3A5F] text-white shadow-2xs'
							: 'text-slate-600 hover:text-slate-900'}"
					>
						ENG
					</button>
				</div>
			</nav>
		</div>
	</header>

	<main class="flex-1 w-full max-w-3xl mx-auto px-4 py-6">
		{@render children()}
	</main>

	<footer class="border-t border-slate-200 bg-white py-5 text-xs text-slate-500">
		<div class="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
			<p class="text-center sm:text-left">
				{i18n.isEn
					? `© ${new Date().getFullYear()} BinaAct (ბინააქტი). All data is processed locally in your browser.`
					: `© ${new Date().getFullYear()} BinaAct (ბინააქტი). ყველა მონაცემი მუშავდება თქვენს ბრაუზერში.`}
			</p>

			<div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
				{#if !isPwaStandalone}
					<button
						type="button"
						onclick={() => (showPwaDialog = true)}
						class="inline-flex items-center gap-1.5 min-h-8 px-3 py-1 rounded-xl bg-teal-50 hover:bg-teal-100/80 text-[#149E8B] font-semibold border border-teal-200/80 transition-colors cursor-pointer"
					>
						<Smartphone class="w-3.5 h-3.5 shrink-0" />
						{i18n.isEn ? 'Install App' : 'აპის ჩამოტვირთვა'}
					</button>
				{/if}

				<a href="/privacy" class="underline hover:text-slate-800">
					{i18n.isEn ? 'Privacy Policy' : 'კონფიდენციალურობის პოლიტიკა'}
				</a>

				<!-- Footer Cool Language Switcher -->
				<div
					role="group"
					aria-label={i18n.isEn ? 'Select language' : 'აირჩიეთ ენა'}
					class="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200"
				>
					<Globe class="w-3.5 h-3.5 text-[#149E8B] ml-1.5 mr-0.5 shrink-0" />
					<button
						type="button"
						onclick={() => i18n.setLocale('ka')}
						aria-pressed={!i18n.isEn}
						class="min-h-8 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer {!i18n.isEn
							? 'bg-white text-[#1E3A5F] font-bold shadow-2xs border border-slate-200/80'
							: 'text-slate-600 hover:text-slate-900'}"
					>
						🇬🇪 ქართული
					</button>
					<button
						type="button"
						onclick={() => i18n.setLocale('en')}
						aria-pressed={i18n.isEn}
						class="min-h-8 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer {i18n.isEn
							? 'bg-white text-[#1E3A5F] font-bold shadow-2xs border border-slate-200/80'
							: 'text-slate-600 hover:text-slate-900'}"
					>
						🇬🇧 English
					</button>
				</div>
			</div>
		</div>
	</footer>

	<!-- First-Time PWA Install Popup / Dialog -->
	<PwaInstallPrompt bind:isOpen={showPwaDialog} bind:isStandalone={isPwaStandalone} />
</div>
