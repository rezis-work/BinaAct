<script lang="ts">
	import { onMount } from 'svelte';
	import logo from '#lib/assets/logo.png';
	import { i18n } from '$lib/i18n/index.svelte';
	import Smartphone from 'lucide-svelte/icons/smartphone';
	import Download from 'lucide-svelte/icons/download';
	import WifiOff from 'lucide-svelte/icons/wifi-off';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';
	import Zap from 'lucide-svelte/icons/zap';
	import Share from 'lucide-svelte/icons/share';
	import PlusSquare from 'lucide-svelte/icons/plus-square';
	import X from 'lucide-svelte/icons/x';
	import CheckCircle2 from 'lucide-svelte/icons/check-circle-2';

	interface BeforeInstallPromptEvent extends Event {
		readonly platforms: string[];
		readonly userChoice: Promise<{
			outcome: 'accepted' | 'dismissed';
			platform: string;
		}>;
		prompt(): Promise<void>;
	}

	const STORAGE_KEY = 'binaact_pwa_prompt_dismissed_v1';

	let {
		isOpen = $bindable(false),
		isStandalone = $bindable(false)
	}: {
		isOpen?: boolean;
		isStandalone?: boolean;
	} = $props();

	let deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
	let showManualGuide = $state(false);
	let isIos = $state(false);
	let isInstalled = $state(false);

	onMount(() => {
		// Detect if already running as installed standalone PWA
		const standaloneMatch =
			window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as Navigator & { standalone?: boolean }).standalone === true;

		isStandalone = standaloneMatch;
		if (standaloneMatch) {
			return;
		}

		// Detect iOS device for tailored Add-to-Home-Screen guide
		const ua = window.navigator.userAgent.toLowerCase();
		isIos = /iphone|ipad|ipod/.test(ua);

		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			deferredPrompt = e as BeforeInstallPromptEvent;
		};

		const handleAppInstalled = () => {
			isInstalled = true;
			isStandalone = true;
			deferredPrompt = null;
			try {
				window.localStorage.setItem(STORAGE_KEY, 'true');
			} catch {
				// Ignore storage errors
			}
			setTimeout(() => {
				isOpen = false;
			}, 1600);
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		window.addEventListener('appinstalled', handleAppInstalled);

		// Show popup automatically on first visit
		let alreadyDismissed = false;
		try {
			alreadyDismissed = window.localStorage.getItem(STORAGE_KEY) === 'true';
		} catch {
			alreadyDismissed = false;
		}

		if (!alreadyDismissed) {
			const timer = setTimeout(() => {
				if (!isStandalone) {
					isOpen = true;
				}
			}, 500);

			return () => {
				clearTimeout(timer);
				window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
				window.removeEventListener('appinstalled', handleAppInstalled);
			};
		}

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
			window.removeEventListener('appinstalled', handleAppInstalled);
		};
	});

	function dismissPrompt() {
		isOpen = false;
		showManualGuide = false;
		try {
			window.localStorage.setItem(STORAGE_KEY, 'true');
		} catch {
			// Ignore storage errors
		}
	}

	async function handleInstallClick() {
		if (deferredPrompt) {
			try {
				await deferredPrompt.prompt();
				const choice = await deferredPrompt.userChoice;
				if (choice.outcome === 'accepted') {
					isInstalled = true;
					deferredPrompt = null;
					try {
						window.localStorage.setItem(STORAGE_KEY, 'true');
					} catch {
						// Ignore
					}
					setTimeout(() => {
						isOpen = false;
					}, 1400);
				}
			} catch {
				showManualGuide = true;
			}
		} else {
			showManualGuide = !showManualGuide;
		}
	}
</script>

{#if isOpen}
	<!-- Backdrop & Modal / Bottom-Sheet Dialog -->
	<div
		class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/55 backdrop-blur-xs animate-in fade-in duration-200"
		role="dialog"
		aria-modal="true"
		aria-labelledby="pwa-dialog-title"
	>
		<!-- Dialog Card -->
		<div
			class="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden"
		>
			<!-- Decorative Gradient Header -->
			<div
				class="relative bg-gradient-to-br from-[#1E3A5F] via-[#1B4965] to-[#149E8B] px-6 pt-6 pb-12 text-white overflow-hidden"
			>
				<!-- Subtle Decorative Circles -->
				<div
					class="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl"
				></div>
				<div
					class="pointer-events-none absolute left-10 -bottom-10 h-28 w-28 rounded-full bg-[#149E8B]/30 blur-lg"
				></div>

				<div class="relative flex items-center justify-between">
					<span
						class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-xs border border-white/20 text-white"
					>
						<Smartphone class="w-3.5 h-3.5 text-teal-200" />
						{i18n.isEn ? 'Mobile & Offline App (PWA)' : 'მობილური აპლიკაცია (PWA)'}
					</span>

					<button
						type="button"
						onclick={dismissPrompt}
						aria-label={i18n.isEn ? 'Close install dialog' : 'დახურვა'}
						class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
					>
						<X class="w-4 h-4" />
					</button>
				</div>

				<div class="relative mt-3">
					<h2 id="pwa-dialog-title" class="text-xl font-extrabold tracking-tight">
						{i18n.isEn
							? 'Use BinaAct Like a Mobile App'
							: 'გამოიყენეთ ბინააქტი როგორც მობილური აპი'}
					</h2>
					<p class="mt-1 text-xs sm:text-sm text-slate-100/90 leading-relaxed">
						{i18n.isEn
							? 'Install BinaAct on your phone or device for instant one-tap access and full offline apartment inspections.'
							: 'დააყენეთ ბინააქტი თქვენს ტელეფონში ან კომპიუტერში სწრაფი წვდომისთვის და ინტერნეტის გარეშე მუშაობისთვის.'}
					</p>
				</div>
			</div>

			<!-- Floating App Icon Badge overlapping header & body -->
			<div class="px-6 -mt-8 relative z-10 flex items-end justify-between">
				<div
					class="h-16 w-16 rounded-2xl bg-white p-1.5 shadow-lg border border-slate-100 flex items-center justify-center"
				>
					<img
						src={logo}
						alt="BinaAct App Icon"
						class="h-full w-full object-contain rounded-xl"
					/>
				</div>
				<div class="pb-1 text-right">
					<span class="text-xs font-bold text-[#1E3A5F]">Bina</span><span
						class="text-xs font-bold text-[#149E8B]">Act</span
					>
					<span class="block text-[11px] text-slate-400">
						{i18n.isEn ? 'Free • No App Store Needed' : 'უფასო • App Store-ის გარეშე'}
					</span>
				</div>
			</div>

			<!-- Dialog Content Body -->
			<div class="px-6 pt-4 pb-6 space-y-4">
				{#if isInstalled}
					<div
						class="rounded-2xl bg-teal-50 border border-teal-200 p-4 flex items-center gap-3 text-teal-900"
					>
						<CheckCircle2 class="w-6 h-6 text-[#149E8B] shrink-0" />
						<div class="text-sm font-medium">
							{i18n.isEn
								? 'BinaAct has been installed on your device!'
								: 'ბინააქტი წარმატებით დაყენდა თქვენს მოწყობილობაზე!'}
						</div>
					</div>
				{:else}
					<!-- 3 Feature Highlights -->
					<div class="grid grid-cols-1 gap-2.5">
						<div
							class="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100"
						>
							<div
								class="w-9 h-9 rounded-xl bg-[#149E8B]/10 text-[#149E8B] flex items-center justify-center shrink-0"
							>
								<WifiOff class="w-4 h-4" />
							</div>
							<div>
								<p class="text-xs font-bold text-slate-800">
									{i18n.isEn ? 'Works 100% Offline' : 'მუშაობს ინტერნეტის გარეშე'}
								</p>
								<p class="text-[11px] text-slate-500">
									{i18n.isEn
										? 'Inspect apartments and generate PDFs even with zero signal.'
										: 'შეავსეთ აქტი და ჩამოტვირთეთ PDF ნებისმიერ ბინაში, ინტერნეტის გარეშეც.'}
								</p>
							</div>
						</div>

						<div
							class="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100"
						>
							<div
								class="w-9 h-9 rounded-xl bg-[#1E3A5F]/10 text-[#1E3A5F] flex items-center justify-center shrink-0"
							>
								<Zap class="w-4 h-4" />
							</div>
							<div>
								<p class="text-xs font-bold text-slate-800">
									{i18n.isEn ? 'Full-Screen Mobile Experience' : 'სწრაფი გახსნა მთავარი ეკრანიდან'}
								</p>
								<p class="text-[11px] text-slate-500">
									{i18n.isEn
										? 'Launches directly from your home screen like a native app.'
										: 'იხსნება პირდაპირ ტელეფონის ეკრანიდან როგორც სრულფასოვანი აპლიკაცია.'}
								</p>
							</div>
						</div>

						<div
							class="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100"
						>
							<div
								class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0"
							>
								<ShieldCheck class="w-4 h-4" />
							</div>
							<div>
								<p class="text-xs font-bold text-slate-800">
									{i18n.isEn ? 'Private & Auto-Saved Locally' : 'უსაფრთხო და ავტომატურად შენახული'}
								</p>
								<p class="text-[11px] text-slate-500">
									{i18n.isEn
										? 'Photos and drafts stay safely on your device.'
										: 'ფოტოები და მონაცემები ინახება მხოლოდ თქვენს მოწყობილობაში.'}
								</p>
							</div>
						</div>
					</div>

					<!-- Expandable Manual Install Guide (for iOS Safari / browsers without direct prompt) -->
					{#if showManualGuide}
						<div
							class="rounded-2xl bg-slate-900 text-white p-4 space-y-2.5 text-xs border border-slate-800"
						>
							<p class="font-bold text-teal-300 flex items-center gap-1.5">
								<Smartphone class="w-4 h-4" />
								{i18n.isEn
									? 'How to add BinaAct to your Home Screen:'
									: 'როგორ დავამატოთ ბინააქტი მთავარ ეკრანზე:'}
							</p>
							{#if isIos}
								<ol class="space-y-2 text-slate-200 list-decimal list-inside">
									<li class="flex items-center gap-2">
										<Share class="w-4 h-4 text-teal-400 shrink-0" />
										<span>
											{i18n.isEn
												? 'Tap the Share button in Safari’s bottom bar.'
												: 'დააჭირეთ ბრაუზერის გაზიარების (Share) ღილაკს.'}
										</span>
									</li>
									<li class="flex items-center gap-2">
										<PlusSquare class="w-4 h-4 text-teal-400 shrink-0" />
										<span>
											{i18n.isEn
												? 'Select "Add to Home Screen" and tap Add.'
												: 'აირჩიეთ „Add to Home Screen“ (მთავარ ეკრანზე დამატება).'}
										</span>
									</li>
								</ol>
							{:else}
								<ol class="space-y-1.5 text-slate-200 list-decimal list-inside">
									<li>
										{i18n.isEn
											? 'Click the Install icon in your browser address bar or open the browser menu (⋮).'
											: 'დააჭირეთ ბრაუზერის მისამართის ზოლში ჩამოტვირთვის ხატულას ან მენიუს (⋮).'}
									</li>
									<li>
										{i18n.isEn
											? 'Choose "Install App" or "Add to Home Screen".'
											: 'აირჩიეთ „Install App“ (აპლიკაციის დაყენება) ან „Add to Home Screen“.'}
									</li>
								</ol>
							{/if}
						</div>
					{/if}

					<!-- Action Buttons -->
					<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
						<button
							type="button"
							onclick={handleInstallClick}
							class="flex-1 inline-flex items-center justify-center gap-2 min-h-12 px-5 py-3 rounded-xl font-bold text-sm text-white bg-[#149E8B] hover:bg-[#118676] active:scale-[0.99] shadow-md shadow-[#149E8B]/20 transition-all cursor-pointer"
						>
							<Download class="w-4 h-4" />
							{i18n.isEn ? 'Download / Install App' : 'აპლიკაციის ჩამოტვირთვა'}
						</button>

						<button
							type="button"
							onclick={dismissPrompt}
							class="inline-flex items-center justify-center min-h-12 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200/80 hover:text-slate-900 transition-colors cursor-pointer"
						>
							{i18n.isEn ? 'Maybe Later' : 'მოგვიანებით'}
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
