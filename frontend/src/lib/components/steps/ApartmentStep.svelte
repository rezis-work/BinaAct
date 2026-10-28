<script lang="ts">
	import { reportStore } from '$lib/state/report.svelte';
	import type { InspectionType } from '$lib/types/report';
	import PartiesSection from '$lib/components/steps/PartiesSection.svelte';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
	import { i18n } from '$lib/i18n/index.svelte';

	const inspectionOptions: readonly {
		value: InspectionType;
		titleKa: string;
		descriptionKa: string;
		titleEn: string;
		descriptionEn: string;
	}[] = [
		{
			value: 'MOVE_IN',
			titleKa: 'ბინის გადაცემა',
			descriptionKa: 'როდესაც დამქირავებელი შედის ბინაში',
			titleEn: 'Move-in Handover',
			descriptionEn: 'When the tenant moves into the apartment'
		},
		{
			value: 'MOVE_OUT',
			titleKa: 'ბინის დაბრუნება',
			descriptionKa: 'როდესაც დამქირავებელი ტოვებს ბინას',
			titleEn: 'Move-out Return',
			descriptionEn: 'When the tenant moves out of the apartment'
		}
	];

	function handleAddressInput() {
		if (reportStore.report.apartment.address.trim().length >= 3) {
			reportStore.clearStep1FieldError('address');
		}
	}

	function handleDateInput() {
		if (reportStore.report.inspectionDate.trim().length > 0) {
			reportStore.clearStep1FieldError('inspectionDate');
		}
	}
</script>

<div class="space-y-6">
	<!-- Validation Error Banner -->
	{#if reportStore.showStep1ErrorBanner && Object.keys(reportStore.step1Errors).length > 0}
		<div
			role="alert"
			class="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-red-900"
		>
			<AlertCircle class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
			<div class="space-y-1">
				<p class="text-sm font-bold">
					{i18n.isEn
						? 'Please fill in all required fields'
						: 'გთხოვთ შეავსოთ სავალდებულო ველები'}
				</p>
				<p class="text-xs text-red-700">
					{i18n.isEn
						? 'Fields marked with (*) are required before proceeding to the next step.'
						: 'შემდეგ ნაბიჯზე გადასასვლელად აუცილებელია მონიშნული (*) ველების შევსება.'}
				</p>
			</div>
		</div>
	{/if}

	<!-- Inspection Type Selector (FR-002) -->
	<fieldset class="space-y-3">
		<legend class="block text-sm font-bold text-slate-900">
			{i18n.isEn ? 'Inspection Type' : 'აქტის ტიპი'}
			<span class="text-red-600" aria-hidden="true">*</span>
		</legend>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			{#each inspectionOptions as option (option.value)}
				{@const isSelected = reportStore.report.type === option.value}
				<button
					type="button"
					role="radio"
					aria-checked={isSelected}
					onclick={() => {
						reportStore.report.type = option.value;
						reportStore.clearStep1FieldError('type');
					}}
					class="flex items-start gap-3.5 p-4 rounded-xl border-2 text-left transition-all min-h-14 {isSelected
						? 'border-[#1E3A5F] bg-blue-50/50 ring-2 ring-[#1E3A5F]/15'
						: 'border-slate-200 bg-white hover:border-slate-300'}"
				>
					<span
						class="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 {isSelected
							? 'border-[#1E3A5F] bg-[#1E3A5F]'
							: 'border-slate-300 bg-white'}"
					>
						{#if isSelected}
							<span class="w-2 h-2 rounded-full bg-white"></span>
						{/if}
					</span>
					<div class="space-y-0.5">
						<div class="font-bold text-base text-slate-900 flex items-center gap-1.5">
							<span>{i18n.isEn ? option.titleEn : option.titleKa}</span>
						</div>
						<p class="text-xs text-slate-600 leading-relaxed">
							{i18n.isEn ? option.descriptionEn : option.descriptionKa}
						</p>
					</div>
				</button>
			{/each}
		</div>
	</fieldset>

	<!-- Apartment Address & Number -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="sm:col-span-2 space-y-1.5">
			<label for="apartment-address" class="block text-sm font-bold text-slate-900">
				{i18n.isEn ? 'Full Apartment Address' : 'ბინის სრული მისამართი'}
				<span class="text-red-600" aria-hidden="true">*</span>
			</label>
			<div class="relative">
				<input
					id="apartment-address"
					type="text"
					required
					aria-invalid={Boolean(reportStore.step1Errors.address)}
					aria-describedby={reportStore.step1Errors.address ? 'apartment-address-error' : undefined}
					bind:value={reportStore.report.apartment.address}
					oninput={handleAddressInput}
					placeholder={i18n.isEn
						? 'e.g. Tbilisi, Saburtalo, 12 Kazbegi Ave'
						: 'მაგ: თბილისი, საბურთალო, ყაზბეგის 12'}
					class="w-full h-12 px-4 rounded-xl border bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all {reportStore
						.step1Errors.address
						? 'border-red-500 focus:border-red-600 focus:ring-red-500/20'
						: 'border-slate-300 focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/20'}"
				/>
			</div>
			{#if reportStore.step1Errors.address}
				<p id="apartment-address-error" class="text-red-600 text-sm font-medium">
					{i18n.translateValidationError(reportStore.step1Errors.address)}
				</p>
			{/if}
		</div>

		<div class="space-y-1.5">
			<label for="apartment-number" class="block text-sm font-bold text-slate-900">
				{i18n.isEn ? 'Apartment No.' : 'ბინის ნომერი'}
				<span class="text-xs font-normal text-slate-500">
					{i18n.isEn ? '(optional)' : '(არასავალდებულო)'}
				</span>
			</label>
			<input
				id="apartment-number"
				type="text"
				bind:value={reportStore.report.apartment.apartmentNumber}
				placeholder={i18n.isEn ? 'e.g. 45' : 'მაგ: 45'}
				class="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 transition-all"
			/>
		</div>
	</div>

	<!-- Inspection Date -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<div class="space-y-1.5">
			<label for="inspection-date" class="block text-sm font-bold text-slate-900">
				{i18n.isEn ? 'Inspection Date' : 'შემოწმების თარიღი'}
				<span class="text-red-600" aria-hidden="true">*</span>
			</label>
			<div class="relative">
				<input
					id="inspection-date"
					type="date"
					required
					aria-invalid={Boolean(reportStore.step1Errors.inspectionDate)}
					aria-describedby={reportStore.step1Errors.inspectionDate
						? 'inspection-date-error'
						: undefined}
					bind:value={reportStore.report.inspectionDate}
					oninput={handleDateInput}
					class="w-full h-12 px-4 rounded-xl border bg-white text-base text-slate-900 focus:outline-none focus:ring-2 transition-all {reportStore
						.step1Errors.inspectionDate
						? 'border-red-500 focus:border-red-600 focus:ring-red-500/20'
						: 'border-slate-300 focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/20'}"
				/>
			</div>
			{#if reportStore.step1Errors.inspectionDate}
				<p id="inspection-date-error" class="text-red-600 text-sm font-medium">
					{i18n.translateValidationError(reportStore.step1Errors.inspectionDate)}
				</p>
			{/if}
		</div>
	</div>

	<!-- Additional Notes -->
	<div class="space-y-1.5">
		<label for="apartment-notes" class="block text-sm font-bold text-slate-900">
			{i18n.isEn ? 'Additional Notes' : 'დამატებითი შენიშვნა'}
			<span class="text-xs font-normal text-slate-500">
				{i18n.isEn ? '(optional)' : '(არასავალდებულო)'}
			</span>
		</label>
		<textarea
			id="apartment-notes"
			rows="2"
			bind:value={reportStore.report.apartment.notes}
			placeholder={i18n.isEn ? 'e.g. Apartment on the 5th floor' : 'მაგ: ბინა მე-5 სართულზე'}
			class="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 transition-all resize-y"
		></textarea>
	</div>

	<!-- Landlord & Tenant Section (FR-003) -->
	<PartiesSection />
</div>
