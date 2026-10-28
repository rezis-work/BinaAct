<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { reportStore, type WizardStepNumber } from '$lib/state/report.svelte';
	import { saveDraftToDb } from '$lib/storage/db';
	import ApartmentStep from '$lib/components/steps/ApartmentStep.svelte';
	import RoomsStep from '$lib/components/steps/RoomsStep.svelte';
	import AdditionalInfoStep from '$lib/components/steps/AdditionalInfoStep.svelte';
	import ReviewStep from '$lib/components/steps/ReviewStep.svelte';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Check from 'lucide-svelte/icons/check';
	import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
	import ShieldAlert from 'lucide-svelte/icons/shield-alert';
	import { trackEvent } from '$lib/analytics';
	import { i18n } from '$lib/i18n/index.svelte';

	interface WizardStepDef {
		number: WizardStepNumber;
		titleKa: string;
		subtitleKa: string;
		titleEn: string;
		subtitleEn: string;
	}

	const WIZARD_STEPS: readonly WizardStepDef[] = [
		{
			number: 1,
			titleKa: 'ბინის ინფორმაცია',
			subtitleKa: 'მისამართი, თარიღი და მხარეები',
			titleEn: 'Apartment Info',
			subtitleEn: 'Address, date, and parties'
		},
		{
			number: 2,
			titleKa: 'ბინის მდგომარეობა',
			subtitleKa: 'ოთახების შეფასება და ფოტოები',
			titleEn: 'Room Condition',
			subtitleEn: 'Room checklists and photos'
		},
		{
			number: 3,
			titleKa: 'დამატებითი ინფორმაცია',
			subtitleKa: 'ავეჯი, მრიცხველები და გასაღებები',
			titleEn: 'Additional Info',
			subtitleEn: 'Inventory, meters, and keys'
		},
		{
			number: 4,
			titleKa: 'აქტის გადახედვა',
			subtitleKa: 'შემოწმება და PDF-ის ჩამოტვირთვა',
			titleEn: 'Review Report',
			subtitleEn: 'Verify details and download PDF'
		}
	];

	let confirmingReset = $state(false);
	let lastSavedTime = $state<string | null>(null);

	function parseStepParam(param: string | null): WizardStepNumber | undefined {
		if (param === '1' || param === '2' || param === '3' || param === '4') {
			return Number(param) as WizardStepNumber;
		}
		return undefined;
	}

	onMount(() => {
		const preferredStep = parseStepParam(page.url.searchParams.get('step'));
		void reportStore.hydrateFromDb(preferredStep);

		const handlePageHide = () => {
			void reportStore.flushDraftToDb();
		};
		window.addEventListener('pagehide', handlePageHide);
		return () => {
			window.removeEventListener('pagehide', handlePageHide);
		};
	});

	$effect(() => {
		const stepParam = parseStepParam(page.url.searchParams.get('step'));
		if (stepParam && reportStore.isHydrated) {
			reportStore.currentStep = stepParam;
		}
	});

	// Debounced 250ms auto-save to IndexedDB (NFR-001, NFR-003, NFR-005)
	$effect(() => {
		if (!reportStore.isHydrated) return;

		const reportSnapshot = $state.snapshot(reportStore.report);
		const stepSnapshot = reportStore.currentStep;

		const timer = setTimeout(() => {
			void saveDraftToDb(reportSnapshot, stepSnapshot).then(() => {
				const now = new Date();
				lastSavedTime = now.toLocaleTimeString(i18n.isEn ? 'en-GB' : 'ka-GE', {
					hour: '2-digit',
					minute: '2-digit'
				});
			});
		}, 250);

		return () => clearTimeout(timer);
	});

	const activeStepMeta = $derived(
		WIZARD_STEPS.find((s) => s.number === reportStore.currentStep) ?? WIZARD_STEPS[0]
	);

	function focusFirstInvalidStep1Field() {
		if (typeof document === 'undefined') return;
		const fieldOrder: Array<{ key: keyof typeof reportStore.step1Errors; id: string }> = [
			{ key: 'address', id: 'apartment-address' },
			{ key: 'inspectionDate', id: 'inspection-date' },
			{ key: 'landlordFullName', id: 'landlord-full-name' },
			{ key: 'tenantFullName', id: 'tenant-full-name' }
		];

		for (const item of fieldOrder) {
			if (reportStore.step1Errors[item.key]) {
				const el = document.getElementById(item.id) as HTMLElement | null;
				if (el) {
					el.scrollIntoView({ behavior: 'smooth', block: 'center' });
					el.focus();
				}
				break;
			}
		}
	}

	function goToStep(step: WizardStepNumber) {
		const previousStep = reportStore.currentStep;
		if (step > 1 && previousStep === 1) {
			const isValid = reportStore.validateCurrentStep1();
			if (!isValid) {
				focusFirstInvalidStep1Field();
				return;
			}
		}

		if (step > previousStep) {
			trackEvent('step_completed', { step: previousStep });
		}

		reportStore.currentStep = step;
		if (typeof window !== 'undefined') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function goNext() {
		if (reportStore.currentStep < 4) {
			goToStep((reportStore.currentStep + 1) as WizardStepNumber);
		}
	}

	function goPrev() {
		if (reportStore.currentStep > 1) {
			goToStep((reportStore.currentStep - 1) as WizardStepNumber);
		}
	}

	async function handleConfirmReset() {
		await reportStore.resetDraft();
		trackEvent('draft_cleared');
		confirmingReset = false;
		lastSavedTime = null;
		if (typeof window !== 'undefined') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}
</script>

<div class="space-y-6">
	<!-- 4-Step Progress Header -->
	<nav
		aria-label={i18n.isEn ? 'Report creation steps' : 'აქტის შექმნის ნაბიჯები'}
		class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4"
	>
		<div class="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-500">
			<span>
				{i18n.isEn
					? `Step ${reportStore.currentStep} of 4`
					: `ნაბიჯი ${reportStore.currentStep} / 4`}
			</span>
			<div class="flex items-center gap-3">
				{#if lastSavedTime}
					<span class="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
						{i18n.isEn
							? `Auto-saved (${lastSavedTime})`
							: `ავტომატურად შენახულია (${lastSavedTime})`}
					</span>
				{/if}
				<span class="font-semibold text-[#1E3A5F]">
					{i18n.isEn ? activeStepMeta.titleEn : activeStepMeta.titleKa}
				</span>
			</div>
		</div>

		<!-- Step Indicators -->
		<ol class="grid grid-cols-4 gap-2">
			{#each WIZARD_STEPS as step (step.number)}
				{@const isActive = step.number === reportStore.currentStep}
				{@const isCompleted = step.number < reportStore.currentStep}
				<li>
					<button
						type="button"
						onclick={() => goToStep(step.number)}
						aria-current={isActive ? 'step' : undefined}
						class="w-full min-h-11 py-1 text-left group focus:outline-none"
					>
						<div class="flex items-center gap-2">
							<span
								class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors shrink-0 {isActive
									? 'bg-[#1E3A5F] text-white ring-4 ring-blue-100'
									: isCompleted
										? 'bg-[#149E8B] text-white'
										: 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'}"
							>
								{#if isCompleted}
									<Check class="w-3.5 h-3.5" />
								{:else}
									{step.number}
								{/if}
							</span>
							<span
								class="hidden sm:inline text-xs font-semibold truncate {isActive
									? 'text-slate-900'
									: isCompleted
										? 'text-[#149E8B]'
										: 'text-slate-500'}"
							>
								{i18n.isEn ? step.titleEn : step.titleKa}
							</span>
						</div>
						<div
							class="mt-2 h-1.5 w-full rounded-full transition-colors {isActive
								? 'bg-[#1E3A5F]'
								: isCompleted
									? 'bg-[#149E8B]'
									: 'bg-slate-100'}"
						></div>
					</button>
				</li>
			{/each}
		</ol>
	</nav>

	<!-- Active Step Container -->
	<section class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
		<header class="border-b border-slate-100 pb-4">
			<h1 class="text-xl sm:text-2xl font-bold text-slate-900">
				{i18n.isEn
					? `Step ${activeStepMeta.number}: ${activeStepMeta.titleEn}`
					: `ნაბიჯი ${activeStepMeta.number}: ${activeStepMeta.titleKa}`}
			</h1>
			<p class="text-sm text-slate-500 mt-1">
				{i18n.isEn ? activeStepMeta.subtitleEn : activeStepMeta.subtitleKa}
			</p>
		</header>

		<div class="py-2 text-sm text-slate-600">
			{#if reportStore.currentStep === 1}
				<ApartmentStep />
			{:else if reportStore.currentStep === 2}
				<RoomsStep />
			{:else if reportStore.currentStep === 3}
				<AdditionalInfoStep />
			{:else}
				<ReviewStep onEditStep={goToStep} />
			{/if}
		</div>
	</section>

	<!-- Bottom Touch-Friendly Navigation Bar -->
	<div class="flex items-center justify-between gap-3 pt-2">
		{#if reportStore.currentStep > 1}
			<button
				type="button"
				onclick={goPrev}
				class="inline-flex items-center justify-center gap-2 min-h-12 px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-sm sm:text-base transition-colors"
			>
				<ArrowLeft class="w-4 h-4" />
				<span>{i18n.isEn ? 'Back' : 'უკან'}</span>
			</button>
		{:else}
			<a
				href="/"
				class="inline-flex items-center justify-center gap-2 min-h-12 px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium text-sm sm:text-base transition-colors"
			>
				<ArrowLeft class="w-4 h-4" />
				<span>{i18n.isEn ? 'Home' : 'მთავარი'}</span>
			</a>
		{/if}

		{#if reportStore.currentStep < 4}
			<button
				type="button"
				onclick={goNext}
				class="inline-flex items-center justify-center gap-2 min-h-12 px-6 py-3 rounded-xl bg-[#1E3A5F] hover:bg-[#162c49] active:bg-[#102036] text-white font-bold text-sm sm:text-base shadow-xs transition-colors ml-auto"
			>
				<span>{i18n.isEn ? 'Next' : 'შემდეგი'}</span>
				<ArrowRight class="w-4 h-4" />
			</button>
		{/if}
	</div>

	<!-- Local Draft Privacy Notice & Reset Control (NFR-003, NFR-005) -->
	<div class="p-4 rounded-2xl border border-slate-200 bg-slate-100/80 space-y-3">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
			<div class="flex items-start gap-2.5 text-xs text-slate-600">
				<ShieldAlert class="w-4 h-4 text-[#149E8B] shrink-0 mt-0.5" />
				<p class="leading-relaxed">
					{i18n.isEn
						? 'Drafts are stored temporarily on this device only and may be cleared when browser data is wiped.'
						: 'მონაცემები დროებით ინახება მხოლოდ ამ მოწყობილობაზე და შეიძლება წაიშალოს ბრაუზერის გასუფთავებისას.'}
				</p>
			</div>

			{#if !confirmingReset}
				<button
					type="button"
					onclick={() => (confirmingReset = true)}
					class="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-xs font-semibold text-slate-700 transition-colors shrink-0"
				>
					<RotateCcw class="w-3.5 h-3.5" />
					<span>{i18n.isEn ? 'Start Over / Clear' : 'ახლიდან დაწყება / გასუფთავება'}</span>
				</button>
			{/if}
		</div>

		{#if confirmingReset}
			<div
				class="p-3.5 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
			>
				<p class="text-xs sm:text-sm font-semibold text-red-900">
					{i18n.isEn
						? 'Are you sure you want to clear all entered data and attached photos?'
						: 'ნამდვილად გსურთ ყველა შეყვანილი მონაცემისა და ფოტოს გასუფთავება?'}
				</p>
				<div class="flex items-center gap-2 self-end sm:self-auto">
					<button
						type="button"
						onclick={() => (confirmingReset = false)}
						class="min-h-11 px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
					>
						{i18n.isEn ? 'Cancel' : 'გაუქმება'}
					</button>
					<button
						type="button"
						onclick={handleConfirmReset}
						class="min-h-11 px-4 py-2 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700"
					>
						{i18n.isEn ? 'Yes, clear all' : 'დიახ, გასუფთავება'}
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
