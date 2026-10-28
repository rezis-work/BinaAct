<script lang="ts">
	import { reportStore } from '$lib/state/report.svelte';
	import {
		CONDITION_LIST,
		CONDITION_OPTIONS,
		SUGGESTED_INVENTORY_ITEMS,
		type Condition,
		type InventoryItem
	} from '$lib/types/report';
	import Plus from 'lucide-svelte/icons/plus';
	import Minus from 'lucide-svelte/icons/minus';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import Sofa from 'lucide-svelte/icons/sofa';
	import Gauge from 'lucide-svelte/icons/gauge';
	import Zap from 'lucide-svelte/icons/zap';
	import Droplets from 'lucide-svelte/icons/droplets';
	import Flame from 'lucide-svelte/icons/flame';
	import KeyRound from 'lucide-svelte/icons/key-round';
	import { i18n } from '$lib/i18n/index.svelte';

	let customItemName = $state('');

	function handleAddSuggestedItem(name: string) {
		const display = i18n.inventoryName(name);
		const existing = reportStore.report.inventory.find(
			(item) =>
				item.name.trim().toLowerCase() === name.trim().toLowerCase() ||
				item.name.trim().toLowerCase() === display.trim().toLowerCase()
		);
		if (existing) {
			existing.quantity += 1;
		} else {
			reportStore.addInventoryItem(display, 1, 'GOOD', '');
		}
	}

	function handleAddCustomItem(e?: Event) {
		e?.preventDefault();
		const trimmed = customItemName.trim();
		if (!trimmed) return;
		reportStore.addInventoryItem(trimmed, 1, 'GOOD', '');
		customItemName = '';
	}

	function decrementQuantity(item: InventoryItem) {
		if (item.quantity > 1) {
			item.quantity -= 1;
		}
	}

	function incrementQuantity(item: InventoryItem) {
		item.quantity += 1;
	}

	function handleQuantityInput(item: InventoryItem, event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		const parsed = parseInt(target.value, 10);
		if (!Number.isNaN(parsed) && parsed >= 1) {
			item.quantity = parsed;
		} else {
			item.quantity = 1;
		}
	}

	function handleUtilityInput(field: 'electricity' | 'water' | 'gas', event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		const raw = target.value.trim();
		if (raw === '') {
			reportStore.report.utilities[field] = undefined;
			return;
		}
		const parsed = Number(raw);
		if (!Number.isNaN(parsed) && parsed >= 0) {
			reportStore.report.utilities[field] = parsed;
		} else {
			reportStore.report.utilities[field] = undefined;
		}
	}

	function adjustKeyCount(field: 'apartmentKeys' | 'entranceKeys', delta: number) {
		const current = reportStore.report.keys[field] ?? 0;
		const next = Math.max(0, current + delta);
		reportStore.report.keys[field] = next;
	}

	function handleKeyInput(field: 'apartmentKeys' | 'entranceKeys', event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		const raw = target.value.trim();
		if (raw === '') {
			reportStore.report.keys[field] = undefined;
			return;
		}
		const parsed = parseInt(raw, 10);
		if (!Number.isNaN(parsed) && parsed >= 0) {
			reportStore.report.keys[field] = parsed;
		} else {
			reportStore.report.keys[field] = undefined;
		}
	}

	function getConditionButtonClasses(condition: Condition, isSelected: boolean): string {
		if (!isSelected) {
			return 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50';
		}

		switch (condition) {
			case 'GOOD':
				return 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-bold';
			case 'MINOR_DAMAGE':
				return 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20 font-bold';
			case 'DAMAGED':
				return 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-500/20 font-bold';
			case 'NOT_INSPECTED':
				return 'border-slate-600 bg-slate-100 text-slate-900 ring-2 ring-slate-500/20 font-bold';
		}
	}
</script>

<div class="space-y-8">
	<!-- Section 3A: Furniture & Appliance Inventory (FR-006) -->
	<section class="space-y-5">
		<div class="flex items-start gap-2.5">
			<span
				class="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 text-[#1E3A5F] shrink-0 mt-0.5"
			>
				<Sofa class="w-4 h-4" />
			</span>
			<div>
				<h2 class="text-base sm:text-lg font-bold text-slate-900">
					{i18n.isEn ? 'Furniture & Appliances' : 'ავეჯი და ტექნიკა'}
					<span class="text-xs font-normal text-slate-500">
						{i18n.isEn ? '(optional)' : '(არასავალდებულო)'}
					</span>
				</h2>
				<p class="text-xs text-slate-500 mt-0.5">
					{i18n.isEn
						? 'Add furniture or appliances included in the apartment, along with their quantity and condition.'
						: 'დაამატეთ ბინაში არსებული ავეჯი ან ტექნიკა, მიუთითეთ რაოდენობა და მდგომარეობა.'}
				</p>
			</div>
		</div>

		<!-- Quick-Add Suggestion Chips + Custom Adder -->
		<div class="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-4">
			<div class="space-y-2">
				<span class="block text-sm font-bold text-slate-900">
					{i18n.isEn ? 'Quick Add (select an item):' : 'სწრაფი დამატება (აირჩიეთ ნივთი):'}
				</span>
				<div class="flex flex-wrap gap-2">
					{#each SUGGESTED_INVENTORY_ITEMS as suggested (suggested)}
						<button
							type="button"
							onclick={() => handleAddSuggestedItem(suggested)}
							class="inline-flex items-center gap-1.5 min-h-11 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:border-[#1E3A5F] hover:text-[#1E3A5F] active:bg-blue-50 text-sm font-semibold text-slate-700 shadow-2xs transition-colors"
						>
							<Plus class="w-4 h-4 text-[#149E8B]" />
							<span>{i18n.inventoryName(suggested)}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Custom Inventory Item Input -->
			<form onsubmit={handleAddCustomItem} class="pt-2 border-t border-slate-200/80">
				<label for="custom-inventory-name" class="block text-xs font-bold text-slate-700 mb-1.5">
					{i18n.isEn ? 'Or enter another item name:' : 'ან ჩაწერეთ სხვა ნივთის დასახელება:'}
				</label>
				<div class="flex flex-col sm:flex-row gap-2.5">
					<input
						id="custom-inventory-name"
						type="text"
						bind:value={customItemName}
						placeholder={i18n.isEn
							? 'e.g. Air Conditioner, Microwave, Wardrobe'
							: 'მაგ: კონდიციონერი, მიკროტალღური ღუმელი, კარადა'}
						class="flex-1 h-12 px-4 rounded-xl border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 transition-all"
					/>
					<button
						type="submit"
						disabled={!customItemName.trim()}
						class="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-[#1E3A5F] hover:bg-[#162c49] disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-sm sm:text-base transition-colors shrink-0"
					>
						<Plus class="w-4 h-4" />
						<span>{i18n.isEn ? 'Add Item' : 'ნივთის დამატება'}</span>
					</button>
				</div>
			</form>
		</div>

		<!-- Inventory Items List -->
		{#if reportStore.report.inventory.length === 0}
			<div class="p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-1">
				<p class="text-sm font-semibold text-slate-700">
					{i18n.isEn
						? 'No furniture or appliances added yet'
						: 'ავეჯი და ტექნიკა ჯერ არ არის დამატებული'}
				</p>
				<p class="text-xs text-slate-500">
					{i18n.isEn
						? 'Click the quick-add buttons above (e.g. + Washing Machine, + Refrigerator) to add items.'
						: 'დააჭირეთ ზემოთ მოცემულ ღილაკებს (მაგ: + სარეცხი მანქანა, + მაცივარი) სწრაფი დამატებისთვის.'}
				</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each reportStore.report.inventory as item, index (item.id)}
					<div class="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
						<!-- Top Row: Item Name, Quantity Stepper, Remove Button -->
						<div class="flex flex-col sm:flex-row sm:items-end gap-3">
							<div class="flex-1 space-y-1.5">
								<label for="inv-name-{item.id}" class="block text-xs font-bold text-slate-700">
									{i18n.isEn
										? `Item #${index + 1} — Name`
										: `ნივთი #${index + 1} — დასახელება`}
								</label>
								<input
									id="inv-name-{item.id}"
									type="text"
									bind:value={item.name}
									placeholder={i18n.isEn ? 'Item name' : 'ნივთის დასახელება'}
									class="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-base font-semibold text-slate-900 focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 transition-all"
								/>
							</div>

							<div class="flex items-end justify-between sm:justify-start gap-3">
								<!-- Quantity Stepper -->
								<div class="space-y-1.5">
									<label for="inv-qty-{item.id}" class="block text-xs font-bold text-slate-700">
										{i18n.isEn ? 'Quantity' : 'რაოდენობა'}
									</label>
									<div class="inline-flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden h-11">
										<button
											type="button"
											onclick={() => decrementQuantity(item)}
											disabled={item.quantity <= 1}
											aria-label={i18n.isEn ? 'Decrease quantity' : 'რაოდენობის შემცირება'}
											class="w-11 h-11 inline-flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
										>
											<Minus class="w-4 h-4" />
										</button>
										<input
											id="inv-qty-{item.id}"
											type="number"
											min="1"
											step="1"
											inputmode="numeric"
											value={item.quantity}
											onchange={(e) => handleQuantityInput(item, e)}
											class="w-14 h-11 text-center text-base font-bold text-slate-900 border-x border-slate-200 focus:outline-none"
										/>
										<button
											type="button"
											onclick={() => incrementQuantity(item)}
											aria-label={i18n.isEn ? 'Increase quantity' : 'რაოდენობის გაზრდა'}
											class="w-11 h-11 inline-flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
										>
											<Plus class="w-4 h-4" />
										</button>
									</div>
								</div>

								<!-- Remove Item Button -->
								<button
									type="button"
									onclick={() => reportStore.removeInventoryItem(item.id)}
									class="inline-flex items-center gap-1.5 h-11 px-3 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100 text-xs font-semibold text-red-600 transition-colors shrink-0"
								>
									<Trash2 class="w-4 h-4" />
									<span>{i18n.isEn ? 'Remove' : 'წაშლა'}</span>
								</button>
							</div>
						</div>

						<!-- Condition Selector (4 Options) -->
						<div class="space-y-2">
							<span class="block text-xs font-bold text-slate-700">
								{i18n.isEn ? 'Condition:' : 'მდგომარეობა:'}
							</span>
							<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
								{#each CONDITION_LIST as conditionKey (conditionKey)}
									{@const option = CONDITION_OPTIONS[conditionKey]}
									{@const isSelected = item.condition === conditionKey}
									<button
										type="button"
										role="radio"
										aria-checked={isSelected}
										onclick={() => (item.condition = conditionKey)}
										class="flex items-center justify-center gap-1.5 min-h-11 px-2.5 py-2 rounded-xl border text-xs sm:text-sm transition-all text-center {getConditionButtonClasses(
											conditionKey,
											isSelected
										)}"
									>
										<span aria-hidden="true">{option.icon}</span>
										<span>{i18n.conditionLabel(conditionKey)}</span>
									</button>
								{/each}
							</div>
						</div>

						<!-- Optional Note -->
						<div class="space-y-1.5">
							<label for="inv-note-{item.id}" class="block text-xs font-bold text-slate-700">
								{i18n.isEn ? 'Note' : 'შენიშვნა'}
								<span class="font-normal text-slate-500">
									{i18n.isEn ? '(optional)' : '(არასავალდებულო)'}
								</span>
							</label>
							<input
								id="inv-note-{item.id}"
								type="text"
								bind:value={item.notes}
								placeholder={i18n.isEn
									? 'e.g. Samsung, has a small line on the screen'
									: 'მაგ: Samsung, ეკრანზე აქვს ხაზი'}
								class="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 transition-all"
							/>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<!-- Section 3B: Utility Meter Readings (FR-007) -->
	<section class="pt-6 border-t border-slate-200 space-y-5">
		<div class="flex items-start gap-2.5">
			<span
				class="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-teal-50 text-[#149E8B] shrink-0 mt-0.5"
			>
				<Gauge class="w-4 h-4" />
			</span>
			<div>
				<h2 class="text-base sm:text-lg font-bold text-slate-900">
					{i18n.isEn ? 'Utility Meter Readings' : 'კომუნალური მრიცხველები'}
					<span class="text-xs font-normal text-slate-500">
						{i18n.isEn ? '(optional)' : '(არასავალდებულო)'}
					</span>
				</h2>
				<p class="text-xs text-slate-500 mt-0.5">
					{i18n.isEn
						? 'Record the current meter readings. You can leave any field blank.'
						: 'ჩაინიშნეთ მრიცხველების მიმდინარე ჩვენებები. შეგიძლიათ გამოტოვოთ ნებისმიერი ველი.'}
				</p>
			</div>
		</div>

		<div class="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70">
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<!-- Electricity -->
				<div class="space-y-1.5">
					<label
						for="utility-electricity"
						class="flex items-center gap-1.5 text-sm font-bold text-slate-900"
					>
						<Zap class="w-4 h-4 text-amber-500 shrink-0" />
						<span>{i18n.isEn ? 'Electricity' : 'ელექტროენერგია'}</span>
					</label>
					<div class="relative flex items-center">
						<input
							id="utility-electricity"
							type="number"
							step="any"
							min="0"
							inputmode="decimal"
							value={reportStore.report.utilities.electricity ?? ''}
							oninput={(e) => handleUtilityInput('electricity', e)}
							placeholder={i18n.isEn ? 'e.g. 15420' : 'მაგ: 15420'}
							class="w-full h-12 pl-4 pr-14 rounded-xl border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 transition-all"
						/>
						<span
							class="absolute right-3 px-2 py-0.5 rounded-md bg-slate-100 text-xs font-bold text-slate-600 pointer-events-none"
						>
							kWh
						</span>
					</div>
				</div>

				<!-- Water -->
				<div class="space-y-1.5">
					<label
						for="utility-water"
						class="flex items-center gap-1.5 text-sm font-bold text-slate-900"
					>
						<Droplets class="w-4 h-4 text-sky-500 shrink-0" />
						<span>{i18n.isEn ? 'Water' : 'წყალი'}</span>
					</label>
					<div class="relative flex items-center">
						<input
							id="utility-water"
							type="number"
							step="any"
							min="0"
							inputmode="decimal"
							value={reportStore.report.utilities.water ?? ''}
							oninput={(e) => handleUtilityInput('water', e)}
							placeholder={i18n.isEn ? 'e.g. 250' : 'მაგ: 250'}
							class="w-full h-12 pl-4 pr-12 rounded-xl border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 transition-all"
						/>
						<span
							class="absolute right-3 px-2 py-0.5 rounded-md bg-slate-100 text-xs font-bold text-slate-600 pointer-events-none"
						>
							m³
						</span>
					</div>
				</div>

				<!-- Gas -->
				<div class="space-y-1.5">
					<label
						for="utility-gas"
						class="flex items-center gap-1.5 text-sm font-bold text-slate-900"
					>
						<Flame class="w-4 h-4 text-orange-500 shrink-0" />
						<span>{i18n.isEn ? 'Natural Gas' : 'ბუნებრივი აირი'}</span>
					</label>
					<div class="relative flex items-center">
						<input
							id="utility-gas"
							type="number"
							step="any"
							min="0"
							inputmode="decimal"
							value={reportStore.report.utilities.gas ?? ''}
							oninput={(e) => handleUtilityInput('gas', e)}
							placeholder={i18n.isEn ? 'e.g. 8540' : 'მაგ: 8540'}
							class="w-full h-12 pl-4 pr-12 rounded-xl border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 transition-all"
						/>
						<span
							class="absolute right-3 px-2 py-0.5 rounded-md bg-slate-100 text-xs font-bold text-slate-600 pointer-events-none"
						>
							m³
						</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Section 3C: Key Handover Information (FR-008) -->
	<section class="pt-6 border-t border-slate-200 space-y-5">
		<div class="flex items-start gap-2.5">
			<span
				class="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-50 text-amber-600 shrink-0 mt-0.5"
			>
				<KeyRound class="w-4 h-4" />
			</span>
			<div>
				<h2 class="text-base sm:text-lg font-bold text-slate-900">
					{i18n.isEn ? 'Key Handover' : 'გასაღებების გადაცემა'}
					<span class="text-xs font-normal text-slate-500">
						{i18n.isEn ? '(optional)' : '(არასავალდებულო)'}
					</span>
				</h2>
				<p class="text-xs text-slate-500 mt-0.5">
					{i18n.isEn
						? 'Specify the number of apartment keys and building entrance keys/chips handed over.'
						: 'მიუთითეთ გადაცემული გასაღებებისა და სადარბაზოს ჩიპების რაოდენობა.'}
				</p>
			</div>
		</div>

		<div class="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<!-- Apartment Keys -->
				<div class="space-y-1.5">
					<label for="keys-apartment" class="block text-sm font-bold text-slate-900">
						{i18n.isEn ? 'Apartment Keys' : 'ბინის გასაღები'}
					</label>
					<div class="flex items-center gap-2">
						<div
							class="inline-flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden h-12"
						>
							<button
								type="button"
								onclick={() => adjustKeyCount('apartmentKeys', -1)}
								disabled={(reportStore.report.keys.apartmentKeys ?? 0) <= 0}
								aria-label={i18n.isEn
									? 'Decrease apartment keys count'
									: 'ბინის გასაღების რაოდენობის შემცირება'}
								class="w-12 h-12 inline-flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
							>
								<Minus class="w-4 h-4" />
							</button>
							<input
								id="keys-apartment"
								type="number"
								min="0"
								step="1"
								inputmode="numeric"
								placeholder="2"
								value={reportStore.report.keys.apartmentKeys ?? ''}
								oninput={(e) => handleKeyInput('apartmentKeys', e)}
								class="w-16 h-12 text-center text-base font-bold text-slate-900 border-x border-slate-200 focus:outline-none"
							/>
							<button
								type="button"
								onclick={() => adjustKeyCount('apartmentKeys', 1)}
								aria-label={i18n.isEn
									? 'Increase apartment keys count'
									: 'ბინის გასაღების რაოდენობის გაზრდა'}
								class="w-12 h-12 inline-flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
							>
								<Plus class="w-4 h-4" />
							</button>
						</div>
						<span class="text-xs font-medium text-slate-500">
							{i18n.isEn ? 'pcs' : 'ცალი'}
						</span>
					</div>
				</div>

				<!-- Entrance Keys / Chips -->
				<div class="space-y-1.5">
					<label for="keys-entrance" class="block text-sm font-bold text-slate-900">
						{i18n.isEn ? 'Building Entrance Key / Chip' : 'სადარბაზოს გასაღები / ჩიპი'}
					</label>
					<div class="flex items-center gap-2">
						<div
							class="inline-flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden h-12"
						>
							<button
								type="button"
								onclick={() => adjustKeyCount('entranceKeys', -1)}
								disabled={(reportStore.report.keys.entranceKeys ?? 0) <= 0}
								aria-label={i18n.isEn
									? 'Decrease entrance keys count'
									: 'სადარბაზოს გასაღების რაოდენობის შემცირება'}
								class="w-12 h-12 inline-flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
							>
								<Minus class="w-4 h-4" />
							</button>
							<input
								id="keys-entrance"
								type="number"
								min="0"
								step="1"
								inputmode="numeric"
								placeholder="1"
								value={reportStore.report.keys.entranceKeys ?? ''}
								oninput={(e) => handleKeyInput('entranceKeys', e)}
								class="w-16 h-12 text-center text-base font-bold text-slate-900 border-x border-slate-200 focus:outline-none"
							/>
							<button
								type="button"
								onclick={() => adjustKeyCount('entranceKeys', 1)}
								aria-label={i18n.isEn
									? 'Increase entrance keys count'
									: 'სადარბაზოს გასაღების რაოდენობის გაზრდა'}
								class="w-12 h-12 inline-flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
							>
								<Plus class="w-4 h-4" />
							</button>
						</div>
						<span class="text-xs font-medium text-slate-500">
							{i18n.isEn ? 'pcs' : 'ცალი'}
						</span>
					</div>
				</div>
			</div>

			<!-- Keys Additional Notes -->
			<div class="space-y-1.5">
				<label for="keys-notes" class="block text-sm font-bold text-slate-900">
					{i18n.isEn ? 'Additional Notes' : 'დამატებითი შენიშვნა'}
					<span class="text-xs font-normal text-slate-500">
						{i18n.isEn ? '(optional)' : '(არასავალდებულო)'}
					</span>
				</label>
				<input
					id="keys-notes"
					type="text"
					bind:value={reportStore.report.keys.notes}
					placeholder={i18n.isEn
						? 'e.g. Parking remote — 1 pc, elevator chip — 1 pc'
						: 'მაგ: პარკინგის პულტი — 1 ცალი, ლიფტის ჩიპი — 1 ცალი'}
					class="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 transition-all"
				/>
			</div>
		</div>
	</section>
</div>
