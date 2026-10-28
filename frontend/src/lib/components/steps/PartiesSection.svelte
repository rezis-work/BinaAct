<script lang="ts">
	import { reportStore } from '$lib/state/report.svelte';
	import User from 'lucide-svelte/icons/user';
	import UserCheck from 'lucide-svelte/icons/user-check';
	import { i18n } from '$lib/i18n/index.svelte';

	function handleLandlordNameInput() {
		if (reportStore.report.landlord.fullName.trim().length >= 2) {
			reportStore.clearStep1FieldError('landlordFullName');
		}
	}

	function handleTenantNameInput() {
		if (reportStore.report.tenant.fullName.trim().length >= 2) {
			reportStore.clearStep1FieldError('tenantFullName');
		}
	}
</script>

<div class="pt-6 border-t border-slate-200 space-y-5">
	<div>
		<h2 class="text-base font-bold text-slate-900">
			{i18n.isEn ? 'Parties Information' : 'მხარეების მონაცემები'}
		</h2>
		<p class="text-xs text-slate-500 mt-0.5">
			{i18n.isEn
				? 'Enter the full names of the landlord and tenant (personal ID numbers are not required).'
				: 'მიუთითეთ გამქირავებლისა და დამქირავებლის სახელი და გვარი (პირადი ნომერი არ მოითხოვება).'}
		</p>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<!-- Landlord Card (გამქირავებელი) -->
		<div class="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
			<div class="flex items-center gap-2 text-sm font-bold text-[#1E3A5F]">
				<User class="w-4 h-4 shrink-0" />
				<span>{i18n.isEn ? 'Landlord' : 'გამქირავებელი'}</span>
			</div>

			<div class="space-y-1.5">
				<label for="landlord-full-name" class="block text-sm font-bold text-slate-900">
					{i18n.isEn ? 'Full Name' : 'სახელი და გვარი'}
					<span class="text-red-600" aria-hidden="true">*</span>
				</label>
				<input
					id="landlord-full-name"
					type="text"
					required
					aria-invalid={Boolean(reportStore.step1Errors.landlordFullName)}
					aria-describedby={reportStore.step1Errors.landlordFullName
						? 'landlord-full-name-error'
						: undefined}
					bind:value={reportStore.report.landlord.fullName}
					oninput={handleLandlordNameInput}
					placeholder={i18n.isEn ? 'e.g. Giorgi Maisuradze' : 'მაგ: გიორგი მაისურაძე'}
					class="w-full h-12 px-4 rounded-xl border bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all {reportStore
						.step1Errors.landlordFullName
						? 'border-red-500 focus:border-red-600 focus:ring-red-500/20'
						: 'border-slate-300 focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/20'}"
				/>
				{#if reportStore.step1Errors.landlordFullName}
					<p id="landlord-full-name-error" class="text-red-600 text-sm font-medium">
						{i18n.translateValidationError(reportStore.step1Errors.landlordFullName)}
					</p>
				{/if}
			</div>

			<div class="space-y-1.5">
				<label for="landlord-phone" class="block text-sm font-bold text-slate-900">
					{i18n.isEn ? 'Phone Number' : 'ტელეფონის ნომერი'}
					<span class="text-xs font-normal text-slate-500">
						{i18n.isEn ? '(optional)' : '(არასავალდებულო)'}
					</span>
				</label>
				<input
					id="landlord-phone"
					type="tel"
					inputmode="tel"
					bind:value={reportStore.report.landlord.phone}
					placeholder={i18n.isEn ? 'e.g. 599 00 00 00 (optional)' : 'მაგ: 599 00 00 00 (არასავალდებულო)'}
					class="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 transition-all"
				/>
			</div>
		</div>

		<!-- Tenant Card (დამქირავებელი) -->
		<div class="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
			<div class="flex items-center gap-2 text-sm font-bold text-[#149E8B]">
				<UserCheck class="w-4 h-4 shrink-0" />
				<span>{i18n.isEn ? 'Tenant' : 'დამქირავებელი'}</span>
			</div>

			<div class="space-y-1.5">
				<label for="tenant-full-name" class="block text-sm font-bold text-slate-900">
					{i18n.isEn ? 'Full Name' : 'სახელი და გვარი'}
					<span class="text-red-600" aria-hidden="true">*</span>
				</label>
				<input
					id="tenant-full-name"
					type="text"
					required
					aria-invalid={Boolean(reportStore.step1Errors.tenantFullName)}
					aria-describedby={reportStore.step1Errors.tenantFullName
						? 'tenant-full-name-error'
						: undefined}
					bind:value={reportStore.report.tenant.fullName}
					oninput={handleTenantNameInput}
					placeholder={i18n.isEn ? 'e.g. Nika Beridze' : 'მაგ: ნიკა ბერიძე'}
					class="w-full h-12 px-4 rounded-xl border bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all {reportStore
						.step1Errors.tenantFullName
						? 'border-red-500 focus:border-red-600 focus:ring-red-500/20'
						: 'border-slate-300 focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/20'}"
				/>
				{#if reportStore.step1Errors.tenantFullName}
					<p id="tenant-full-name-error" class="text-red-600 text-sm font-medium">
						{i18n.translateValidationError(reportStore.step1Errors.tenantFullName)}
					</p>
				{/if}
			</div>

			<div class="space-y-1.5">
				<label for="tenant-phone" class="block text-sm font-bold text-slate-900">
					{i18n.isEn ? 'Phone Number' : 'ტელეფონის ნომერი'}
					<span class="text-xs font-normal text-slate-500">
						{i18n.isEn ? '(optional)' : '(არასავალდებულო)'}
					</span>
				</label>
				<input
					id="tenant-phone"
					type="tel"
					inputmode="tel"
					bind:value={reportStore.report.tenant.phone}
					placeholder={i18n.isEn ? 'e.g. 555 00 00 00 (optional)' : 'მაგ: 555 00 00 00 (არასავალდებულო)'}
					class="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 transition-all"
				/>
			</div>
		</div>
	</div>
</div>
