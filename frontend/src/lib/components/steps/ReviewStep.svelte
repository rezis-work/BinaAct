<script lang="ts">
	import { goto } from '$app/navigation';
	import { reportStore, type WizardStepNumber } from '$lib/state/report.svelte';
	import { formatGeorgianDate, type Condition } from '$lib/types/report';
	import { validateFullReport, validateStep1 } from '$lib/schemas/report';
	import {
		downloadPdfBytes,
		generateHandoverPdf,
		getReportPdfFilename
	} from '$lib/pdf/generator';
	import Building2 from 'lucide-svelte/icons/building-2';
	import Users from 'lucide-svelte/icons/users';
	import Home from 'lucide-svelte/icons/home';
	import Sofa from 'lucide-svelte/icons/sofa';
	import Gauge from 'lucide-svelte/icons/gauge';
	import KeyRound from 'lucide-svelte/icons/key-round';
	import Pencil from 'lucide-svelte/icons/pencil';
	import Camera from 'lucide-svelte/icons/camera';
	import Download from 'lucide-svelte/icons/download';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
	import CheckCircle2 from 'lucide-svelte/icons/check-circle-2';
	import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
	import FilePlus2 from 'lucide-svelte/icons/file-plus-2';
	import { trackEvent } from '$lib/analytics';
	import { i18n } from '$lib/i18n/index.svelte';

	let {
		onEditStep
	}: {
		onEditStep?: (step: WizardStepNumber) => void;
	} = $props();

	let isGenerating = $state(false);
	let pdfError = $state<string | null>(null);
	let validationErrors = $state<string[]>([]);
	let isCompleted = $state(false);
	let generatedFilename = $state('');

	const totalPhotos = $derived(
		reportStore.report.rooms.reduce((sum, room) => sum + room.photoIds.length, 0)
	);

	function handleEditStep(step: WizardStepNumber) {
		if (onEditStep) {
			onEditStep(step);
		} else {
			reportStore.currentStep = step;
			void goto(`/create?step=${step}`);
		}
	}

	async function handleDownloadPdf() {
		pdfError = null;
		validationErrors = [];

		const step1Check = validateStep1(reportStore.report);
		const fullCheck = validateFullReport(reportStore.report);

		if (!step1Check.success || !fullCheck.success) {
			reportStore.validateCurrentStep1();
			const messages = new Set<string>();
			for (const msg of Object.values(step1Check.errors)) {
				if (msg) messages.add(i18n.translateValidationError(msg) ?? msg);
			}
			for (const msg of Object.values(fullCheck.errors)) {
				if (msg) messages.add(i18n.translateValidationError(msg) ?? msg);
			}
			validationErrors = Array.from(messages);
			return;
		}

		isGenerating = true;

		try {
			const bytes = await generateHandoverPdf(reportStore.report, reportStore.photos, {
				locale: i18n.locale
			});
			const filename = getReportPdfFilename(reportStore.report.inspectionDate);
			downloadPdfBytes(bytes, filename);
			generatedFilename = filename;
			isCompleted = true;
			trackEvent('pdf_generated', {
				inspectionType: reportStore.report.type,
				roomCount: reportStore.report.rooms.length,
				photoCount: totalPhotos
			});
		} catch (err) {
			console.error('PDF generation failed:', err);
			pdfError = i18n.isEn
				? 'Could not generate the PDF document. Please try again.'
				: 'PDF დოკუმენტის შექმნა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.';
		} finally {
			isGenerating = false;
		}
	}

	async function handleStartNewAct() {
		await reportStore.resetDraft();
		isCompleted = false;
		pdfError = null;
		validationErrors = [];
		if (onEditStep) {
			onEditStep(1);
		} else {
			void goto('/create?step=1');
		}
	}

	function getConditionBadgeClasses(condition: Condition): string {
		switch (condition) {
			case 'GOOD':
				return 'bg-emerald-50 text-emerald-900 border-emerald-200';
			case 'MINOR_DAMAGE':
				return 'bg-amber-50 text-amber-950 border-amber-200';
			case 'DAMAGED':
				return 'bg-red-50 text-red-900 border-red-200';
			case 'NOT_INSPECTED':
				return 'bg-slate-100 text-slate-700 border-slate-200';
		}
	}
</script>

<div class="space-y-6">
	<!-- 1. Apartment & Inspection Info Card (FR-009) -->
	<article class="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
		<div
			class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-slate-50 border-b border-slate-200"
		>
			<div class="flex items-center gap-2.5">
				<Building2 class="w-4 h-4 text-[#1E3A5F] shrink-0" />
				<h2 class="text-sm sm:text-base font-bold text-slate-900">
					{i18n.isEn ? 'Apartment Information' : 'ბინის ინფორმაცია'}
				</h2>
			</div>
			<button
				type="button"
				onclick={() => handleEditStep(1)}
				class="inline-flex items-center gap-1.5 min-h-11 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1E3A5F] transition-colors shrink-0"
			>
				<Pencil class="w-3.5 h-3.5" />
				<span>{i18n.isEn ? 'Edit' : 'შეცვლა'}</span>
			</button>
		</div>

		<div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
			<div class="space-y-1">
				<span class="block text-xs font-medium text-slate-500">
					{i18n.isEn ? 'Inspection Type' : 'აქტის ტიპი'}
				</span>
				<span
					class="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-[#1E3A5F] font-bold text-xs sm:text-sm"
				>
					{i18n.inspectionTypeLabel(reportStore.report.type)}
				</span>
			</div>

			<div class="space-y-1">
				<span class="block text-xs font-medium text-slate-500">
					{i18n.isEn ? 'Inspection Date' : 'შემოწმების თარიღი'}
				</span>
				<p class="font-bold text-slate-900">
					{formatGeorgianDate(reportStore.report.inspectionDate) || '—'}
				</p>
			</div>

			<div class="sm:col-span-2 space-y-1">
				<span class="block text-xs font-medium text-slate-500">
					{i18n.isEn ? 'Full Apartment Address' : 'ბინის სრული მისამართი'}
				</span>
				<p class="font-bold text-slate-900">
					{#if reportStore.report.apartment.address.trim()}
						{reportStore.report.apartment.address}
						{#if reportStore.report.apartment.apartmentNumber?.trim()}
							<span class="text-slate-600 font-semibold">
								({i18n.isEn ? 'Apt #' : 'ბინა №'}{reportStore.report.apartment.apartmentNumber.trim()})
							</span>
						{/if}
					{:else}
						<span class="text-red-600 font-semibold">
							{i18n.isEn ? 'Not specified' : 'არ არის მითითებული'}
						</span>
					{/if}
				</p>
			</div>

			{#if reportStore.report.apartment.notes?.trim()}
				<div class="sm:col-span-2 space-y-1 pt-1 border-t border-slate-100">
					<span class="block text-xs font-medium text-slate-500">
						{i18n.isEn ? 'Additional Notes' : 'დამატებითი შენიშვნა'}
					</span>
					<p class="text-slate-700 leading-relaxed">{reportStore.report.apartment.notes}</p>
				</div>
			{/if}
		</div>
	</article>

	<!-- 2. Parties Card (FR-009) -->
	<article class="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
		<div
			class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-slate-50 border-b border-slate-200"
		>
			<div class="flex items-center gap-2.5">
				<Users class="w-4 h-4 text-[#149E8B] shrink-0" />
				<h2 class="text-sm sm:text-base font-bold text-slate-900">
					{i18n.isEn ? 'Parties' : 'მხარეები'}
				</h2>
			</div>
			<button
				type="button"
				onclick={() => handleEditStep(1)}
				class="inline-flex items-center gap-1.5 min-h-11 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1E3A5F] transition-colors shrink-0"
			>
				<Pencil class="w-3.5 h-3.5" />
				<span>{i18n.isEn ? 'Edit' : 'შეცვლა'}</span>
			</button>
		</div>

		<div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
			<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
				<span class="block text-xs font-bold text-[#1E3A5F]">
					{i18n.isEn ? 'Landlord:' : 'გამქირავებელი:'}
				</span>
				<p class="font-bold text-slate-900">
					{#if reportStore.report.landlord.fullName.trim()}
						{reportStore.report.landlord.fullName}
					{:else}
						<span class="text-red-600 font-semibold">
							{i18n.isEn ? 'Not specified' : 'არ არის მითითებული'}
						</span>
					{/if}
				</p>
				{#if reportStore.report.landlord.phone?.trim()}
					<p class="text-xs text-slate-600">
						{i18n.isEn ? 'Tel:' : 'ტელ:'} {reportStore.report.landlord.phone}
					</p>
				{/if}
			</div>

			<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
				<span class="block text-xs font-bold text-[#149E8B]">
					{i18n.isEn ? 'Tenant:' : 'დამქირავებელი:'}
				</span>
				<p class="font-bold text-slate-900">
					{#if reportStore.report.tenant.fullName.trim()}
						{reportStore.report.tenant.fullName}
					{:else}
						<span class="text-red-600 font-semibold">
							{i18n.isEn ? 'Not specified' : 'არ არის მითითებული'}
						</span>
					{/if}
				</p>
				{#if reportStore.report.tenant.phone?.trim()}
					<p class="text-xs text-slate-600">
						{i18n.isEn ? 'Tel:' : 'ტელ:'} {reportStore.report.tenant.phone}
					</p>
				{/if}
			</div>
		</div>
	</article>

	<!-- 3. Room Condition & Photos Card (1. ბინის მდგომარეობა — FR-009) -->
	<article class="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
		<div
			class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-slate-50 border-b border-slate-200"
		>
			<div class="flex items-center gap-2.5">
				<Home class="w-4 h-4 text-[#1E3A5F] shrink-0" />
				<h2 class="text-sm sm:text-base font-bold text-slate-900">
					{i18n.isEn
						? `1. Room Condition (${reportStore.report.rooms.length} rooms, ${totalPhotos} photos)`
						: `1. ბინის მდგომარეობა (${reportStore.report.rooms.length} ოთახი, ${totalPhotos} ფოტო)`}
				</h2>
			</div>
			<button
				type="button"
				onclick={() => handleEditStep(2)}
				class="inline-flex items-center gap-1.5 min-h-11 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1E3A5F] transition-colors shrink-0"
			>
				<Pencil class="w-3.5 h-3.5" />
				<span>{i18n.isEn ? 'Edit' : 'შეცვლა'}</span>
			</button>
		</div>

		<div class="p-4 sm:p-5 space-y-4">
			{#if reportStore.report.rooms.length === 0}
				<p class="text-sm text-slate-500">
					{i18n.isEn ? 'No rooms specified.' : 'ოთახები არ არის მითითებული.'}
				</p>
			{:else}
				{#each reportStore.report.rooms as room, idx (room.id)}
					<div class="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
						<div class="flex items-center justify-between gap-2">
							<h3 class="text-sm sm:text-base font-bold text-slate-900">
								{idx + 1}. {i18n.roomName(room.name)}
							</h3>
							{#if room.photoIds.length > 0}
								<span
									class="inline-flex items-center gap-1 text-xs font-semibold text-[#149E8B] bg-teal-50 px-2.5 py-0.5 rounded-full"
								>
									<Camera class="w-3.5 h-3.5" />
									<span>
										{room.photoIds.length}
										{i18n.isEn ? 'photos' : 'ფოტო'}
									</span>
								</span>
							{/if}
						</div>

						<!-- Component Badges -->
						<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
							{#each room.components as comp (comp.name)}
								<div
									class="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border bg-white text-xs"
								>
									<span class="font-semibold text-slate-700">
										{i18n.componentName(comp.name)}:
									</span>
									<span
										class="px-2 py-0.5 rounded-md border font-bold {getConditionBadgeClasses(
											comp.condition
										)}"
									>
										{i18n.conditionBadge(comp.condition)}
									</span>
								</div>
							{/each}
						</div>

						<!-- Room Notes -->
						{#if room.notes?.trim()}
							<div class="text-xs sm:text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
								<span class="font-bold text-slate-900">
									{i18n.isEn ? 'Note:' : 'შენიშვნა:'}
								</span>
								{room.notes}
							</div>
						{/if}

						<!-- Room Photo Thumbnails -->
						{#if room.photoIds.length > 0}
							<div class="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
								{#each room.photoIds as photoId, pIdx (photoId)}
									{@const previewUrl = reportStore.photoPreviewUrls[photoId]}
									<div
										class="rounded-lg border border-slate-200 bg-slate-100 overflow-hidden aspect-4/3"
									>
										{#if previewUrl}
											<img
												src={previewUrl}
												alt="{i18n.roomName(room.name)} — {i18n.isEn ? 'Photo' : 'ფოტო'} {pIdx + 1}"
												class="w-full h-full object-cover"
											/>
										{:else}
											<div
												class="w-full h-full flex items-center justify-center text-xs text-slate-400"
											>
												{i18n.isEn ? `Photo #${pIdx + 1}` : `ფოტო #${pIdx + 1}`}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	</article>

	<!-- 4. Inventory Card (2. ავეჯი და ტექნიკა — FR-009) -->
	<article class="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
		<div
			class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-slate-50 border-b border-slate-200"
		>
			<div class="flex items-center gap-2.5">
				<Sofa class="w-4 h-4 text-[#1E3A5F] shrink-0" />
				<h2 class="text-sm sm:text-base font-bold text-slate-900">
					{i18n.isEn
						? `2. Furniture & Appliances (${reportStore.report.inventory.length})`
						: `2. ავეჯი და ტექნიკა (${reportStore.report.inventory.length})`}
				</h2>
			</div>
			<button
				type="button"
				onclick={() => handleEditStep(3)}
				class="inline-flex items-center gap-1.5 min-h-11 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1E3A5F] transition-colors shrink-0"
			>
				<Pencil class="w-3.5 h-3.5" />
				<span>{i18n.isEn ? 'Edit' : 'შეცვლა'}</span>
			</button>
		</div>

		<div class="p-4 sm:p-5">
			{#if reportStore.report.inventory.length === 0}
				<p class="text-sm text-slate-500">
					{i18n.isEn ? 'Not specified' : 'არ არის მითითებული'}
				</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full text-left border-collapse text-xs sm:text-sm">
						<thead>
							<tr class="border-b border-slate-200 text-slate-500">
								<th class="py-2 pr-3 font-bold">{i18n.isEn ? 'Item' : 'დასახელება'}</th>
								<th class="py-2 px-3 font-bold text-center">
									{i18n.isEn ? 'Qty' : 'რაოდენობა'}
								</th>
								<th class="py-2 px-3 font-bold">{i18n.isEn ? 'Condition' : 'მდგომარეობა'}</th>
								<th class="py-2 pl-3 font-bold">{i18n.isEn ? 'Note' : 'შენიშვნა'}</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each reportStore.report.inventory as item (item.id)}
								<tr>
									<td class="py-2.5 pr-3 font-bold text-slate-900">
										{i18n.inventoryName(item.name)}
									</td>
									<td class="py-2.5 px-3 text-center font-semibold text-slate-700">
										{item.quantity}
									</td>
									<td class="py-2.5 px-3">
										<span
											class="inline-block px-2 py-0.5 rounded-md border text-xs font-bold {getConditionBadgeClasses(
												item.condition
											)}"
										>
											{i18n.conditionBadge(item.condition)}
										</span>
									</td>
									<td class="py-2.5 pl-3 text-slate-600">
										{item.notes?.trim() ? item.notes : '—'}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</article>

	<!-- 5. Utilities & Keys Card (3. კომუნალური მრიცხველები & 4. გასაღებები — FR-009) -->
	<article class="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
		<div
			class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-slate-50 border-b border-slate-200"
		>
			<div class="flex items-center gap-2.5">
				<Gauge class="w-4 h-4 text-[#149E8B] shrink-0" />
				<h2 class="text-sm sm:text-base font-bold text-slate-900">
					{i18n.isEn
						? '3. Utility Meter Readings & 4. Keys'
						: '3. კომუნალური მრიცხველები და 4. გასაღებები'}
				</h2>
			</div>
			<button
				type="button"
				onclick={() => handleEditStep(3)}
				class="inline-flex items-center gap-1.5 min-h-11 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1E3A5F] transition-colors shrink-0"
			>
				<Pencil class="w-3.5 h-3.5" />
				<span>{i18n.isEn ? 'Edit' : 'შეცვლა'}</span>
			</button>
		</div>

		<div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
			<!-- Utilities Summary -->
			<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
				<h3 class="text-xs font-bold text-slate-700 uppercase tracking-wide">
					{i18n.isEn ? '3. Utility Meter Readings' : '3. კომუნალური მრიცხველები'}
				</h3>
				<dl class="space-y-1.5 text-xs sm:text-sm">
					<div class="flex justify-between">
						<dt class="text-slate-600">{i18n.isEn ? 'Electricity:' : 'ელექტროენერგია:'}</dt>
						<dd class="font-bold text-slate-900">
							{reportStore.report.utilities.electricity !== undefined
								? `${reportStore.report.utilities.electricity} kWh`
								: '—'}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-slate-600">{i18n.isEn ? 'Water:' : 'წყალი:'}</dt>
						<dd class="font-bold text-slate-900">
							{reportStore.report.utilities.water !== undefined
								? `${reportStore.report.utilities.water} m³`
								: '—'}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-slate-600">{i18n.isEn ? 'Natural Gas:' : 'ბუნებრივი აირი:'}</dt>
						<dd class="font-bold text-slate-900">
							{reportStore.report.utilities.gas !== undefined
								? `${reportStore.report.utilities.gas} m³`
								: '—'}
						</dd>
					</div>
				</dl>
			</div>

			<!-- Keys Summary -->
			<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
				<h3 class="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
					<KeyRound class="w-3.5 h-3.5 text-amber-600" />
					<span>{i18n.isEn ? '4. Keys' : '4. გასაღებები'}</span>
				</h3>
				<dl class="space-y-1.5 text-xs sm:text-sm">
					<div class="flex justify-between">
						<dt class="text-slate-600">{i18n.isEn ? 'Apartment Keys:' : 'ბინის გასაღები:'}</dt>
						<dd class="font-bold text-slate-900">
							{reportStore.report.keys.apartmentKeys !== undefined
								? `${reportStore.report.keys.apartmentKeys} ${i18n.isEn ? 'pcs' : 'ცალი'}`
								: '—'}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-slate-600">{i18n.isEn ? 'Entrance Chip:' : 'სადარბაზოს ჩიპი:'}</dt>
						<dd class="font-bold text-slate-900">
							{reportStore.report.keys.entranceKeys !== undefined
								? `${reportStore.report.keys.entranceKeys} ${i18n.isEn ? 'pcs' : 'ცალი'}`
								: '—'}
						</dd>
					</div>
					{#if reportStore.report.keys.notes?.trim()}
						<div class="pt-1 border-t border-slate-200/70">
							<dt class="text-xs text-slate-500">{i18n.isEn ? 'Note:' : 'შენიშვნა:'}</dt>
							<dd class="font-medium text-slate-800 mt-0.5">{reportStore.report.keys.notes}</dd>
						</div>
					{/if}
				</dl>
			</div>
		</div>
	</article>

	<!-- Validation Errors Banner (if required fields are missing) -->
	{#if validationErrors.length > 0}
		<div
			role="alert"
			class="p-4 sm:p-5 rounded-2xl border border-red-200 bg-red-50 text-red-900 space-y-3"
		>
			<div class="flex items-start gap-2.5">
				<AlertCircle class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
				<div class="space-y-1">
					<p class="text-sm font-bold">
						{i18n.isEn
							? 'Please complete the required fields before generating the PDF:'
							: 'PDF-ის შესაქმნელად გთხოვთ შეავსოთ სავალდებულო ველები:'}
					</p>
					<ul class="list-disc list-inside text-xs sm:text-sm text-red-800 space-y-0.5">
						{#each validationErrors as errMsg (errMsg)}
							<li>{errMsg}</li>
						{/each}
					</ul>
				</div>
			</div>

			<button
				type="button"
				onclick={() => handleEditStep(1)}
				class="inline-flex items-center gap-1.5 min-h-11 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs sm:text-sm font-bold text-white transition-colors"
			>
				<Pencil class="w-3.5 h-3.5" />
				<span>
					{i18n.isEn ? 'Go to Step 1 & Fill Required Fields' : 'ნაბიჯი 1-ზე გადასვლა და შევსება'}
				</span>
			</button>
		</div>
	{/if}

	<!-- PDF Generation Error & Retry Card (NFR-005) -->
	{#if pdfError}
		<div
			role="alert"
			class="p-4 sm:p-5 rounded-2xl border border-red-200 bg-red-50 text-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
		>
			<div class="flex items-start gap-2.5">
				<AlertCircle class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
				<div>
					<p class="text-sm font-bold">{pdfError}</p>
					<p class="text-xs text-red-700 mt-0.5">
						{i18n.isEn
							? 'Your entered data is safely saved and has not been lost.'
							: 'თქვენი შეყვანილი მონაცემები შენახულია და არ დაკარგულა.'}
					</p>
				</div>
			</div>

			<button
				type="button"
				onclick={handleDownloadPdf}
				disabled={isGenerating}
				class="inline-flex items-center justify-center gap-2 min-h-11 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs sm:text-sm font-bold text-white transition-colors shrink-0"
			>
				<RotateCcw class="w-4 h-4" />
				<span>{i18n.isEn ? 'Retry' : 'ხელახლა ცდა'}</span>
			</button>
		</div>
	{/if}

	<!-- Post-Download Completion Card -->
	{#if isCompleted}
		<div
			class="p-5 sm:p-6 rounded-2xl border-2 border-emerald-300 bg-emerald-50/80 text-emerald-950 space-y-4"
		>
			<div class="flex items-start gap-3">
				<CheckCircle2 class="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
				<div class="space-y-1">
					<h3 class="text-base sm:text-lg font-bold">
						{i18n.isEn
							? 'Document downloaded successfully!'
							: 'დოკუმენტი წარმატებით ჩამოიტვირთა!'}
					</h3>
					<p class="text-xs sm:text-sm text-emerald-800">
						{#if i18n.isEn}
							File <strong class="font-bold">{generatedFilename}</strong> has been saved to your
							device. You can now print it or share it with the other party.
						{:else}
							ფაილი <strong class="font-bold">{generatedFilename}</strong> შენახულია თქვენს მოწყობილობაზე.
							შეგიძლიათ ამობეჭდოთ ან გაუზიაროთ მეორე მხარეს.
						{/if}
					</p>
				</div>
			</div>

			<div class="flex flex-wrap items-center gap-3 pt-1">
				<button
					type="button"
					onclick={handleDownloadPdf}
					disabled={isGenerating}
					class="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-2.5 rounded-xl border border-emerald-600 bg-white hover:bg-emerald-50 text-xs sm:text-sm font-bold text-emerald-900 transition-colors"
				>
					<Download class="w-4 h-4" />
					<span>{i18n.isEn ? 'Download PDF Again' : 'PDF-ის ხელახლა ჩამოტვირთვა'}</span>
				</button>

				<button
					type="button"
					onclick={handleStartNewAct}
					class="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#162c49] text-xs sm:text-sm font-bold text-white transition-colors"
				>
					<FilePlus2 class="w-4 h-4" />
					<span>{i18n.isEn ? 'Create New Report' : 'ახალი აქტის შექმნა'}</span>
				</button>
			</div>
		</div>
	{/if}

	<!-- Primary PDF Download Action Card (FR-010, NFR-004) -->
	<div
		class="p-5 sm:p-6 rounded-2xl border-2 border-[#149E8B]/40 bg-gradient-to-br from-teal-50/70 to-blue-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
	>
		<div class="space-y-1">
			<h3 class="text-base sm:text-lg font-bold text-slate-900">
				{i18n.isEn ? 'Ready to generate PDF document' : 'მზად არის PDF დოკუმენტის შესაქმნელად'}
			</h3>
			<p class="text-xs sm:text-sm text-slate-600">
				{i18n.isEn ? 'Filename:' : 'ფაილის სახელი:'}
				<span class="font-mono font-semibold text-slate-800"
					>{getReportPdfFilename(reportStore.report.inspectionDate)}</span
				>
			</p>
		</div>

		<button
			type="button"
			onclick={handleDownloadPdf}
			disabled={isGenerating}
			class="inline-flex items-center justify-center gap-2.5 min-h-13 px-6 py-3.5 rounded-xl bg-[#149E8B] hover:bg-[#108575] active:bg-[#0d6e61] disabled:opacity-60 disabled:pointer-events-none text-white font-bold text-base shadow-sm transition-all shrink-0"
		>
			{#if isGenerating}
				<LoaderCircle class="w-5 h-5 animate-spin" />
				<span>{i18n.isEn ? 'Generating PDF...' : 'მზადდება PDF...'}</span>
			{:else}
				<Download class="w-5 h-5" />
				<span>{i18n.isEn ? 'Download PDF' : 'PDF-ის ჩამოტვირთვა'}</span>
			{/if}
		</button>
	</div>
</div>
