<script lang="ts">
	import ShieldCheck from 'lucide-svelte/icons/shield-check';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import CheckCircle2 from 'lucide-svelte/icons/check-circle-2';
	import Database from 'lucide-svelte/icons/database';
	import Scale from 'lucide-svelte/icons/scale';
	import Lock from 'lucide-svelte/icons/lock';
	import { clearAllLocalData } from '$lib/storage/db';
	import { reportStore } from '$lib/state/report.svelte';
	import { trackEvent } from '$lib/analytics';
	import { i18n } from '$lib/i18n/index.svelte';

	let isClearing = $state(false);
	let clearedMessage = $state<string | null>(null);

	async function handleClearLocalData() {
		const confirmed = window.confirm(
			i18n.isEn
				? 'Are you sure you want to delete all saved draft data and photos on this device?'
				: 'ნამდვილად გსურთ ამ მოწყობილობაზე შენახული ყველა მონაცემისა და ფოტოს წაშლა?'
		);
		if (!confirmed) return;

		isClearing = true;
		clearedMessage = null;
		try {
			await reportStore.resetDraft();
			await clearAllLocalData();
			trackEvent('draft_cleared');
			clearedMessage = i18n.isEn
				? 'All saved draft data and photos on this device have been permanently erased.'
				: 'ამ მოწყობილობაზე შენახული მონაცემები და ფოტოები სრულად წაიშალა.';
		} finally {
			isClearing = false;
		}
	}
</script>

<div class="space-y-6 pb-8">
	<div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
		<!-- Header -->
		<div class="flex items-center gap-3.5 border-b border-slate-100 pb-5">
			<div class="p-3 rounded-xl bg-[#149E8B]/10 text-[#149E8B] shrink-0">
				<ShieldCheck class="w-7 h-7" />
			</div>
			<div>
				<h1 class="text-xl sm:text-2xl font-bold text-[#1E3A5F]">
					{i18n.isEn ? 'Privacy Policy' : 'კონფიდენციალურობის პოლიტიკა'}
				</h1>
				<p class="text-xs sm:text-sm text-slate-500 mt-0.5">
					{i18n.isEn
						? 'How your data is processed and stored in BinaAct'
						: 'როგორ მუშავდება და ინახება თქვენი მონაცემები BinaAct-ში'}
				</p>
			</div>
		</div>

		<!-- Section 1: Local-Only Processing -->
		<section class="space-y-2.5">
			<div class="flex items-center gap-2 text-[#1E3A5F] font-bold text-base sm:text-lg">
				<Lock class="w-5 h-5 text-[#149E8B] shrink-0" />
				<h2>
					{i18n.isEn
						? '1. Everything Is Processed in Your Browser'
						: '1. ყველაფერი მუშავდება თქვენს ბრაუზერში'}
				</h2>
			</div>
			<div class="space-y-2 text-sm sm:text-base text-slate-700 leading-relaxed pl-7">
				{#if i18n.isEn}
					<p>
						<strong>BinaAct (ბინააქტი)</strong> is built with privacy by design: apartment addresses,
						landlord and tenant names, phone numbers, room checklists, and attached photographs are
						processed <strong>exclusively on your device (inside your browser)</strong>.
					</p>
					<p>
						None of your entered data, photographs, or generated PDF documents are ever uploaded to
						or stored on our servers or any third-party cloud storage.
					</p>
				{:else}
					<p>
						<strong>BinaAct (ბინააქტი)</strong> შექმნილია კონფიდენციალურობის მაქსიმალური დაცვით: ბინის
						მისამართი, გამქირავებლისა და დამქირავებლის სახელები, საკონტაქტო ნომრები, ოთახების შეფასება
						და მიმაგრებული ფოტოები მუშავდება <strong>მხოლოდ თქვენს მოწყობილობაზე (ბრაუზერში)</strong>.
					</p>
					<p>
						არცერთი შეყვანილი მონაცემი, ფოტოსურათი ან გენერირებული PDF დოკუმენტი არ იგზავნება და არ
						ინახება ჩვენს სერვერზე ან გარე ღრუბლოვან საცავში.
					</p>
				{/if}
			</div>
		</section>

		<!-- Section 2: IndexedDB Local Drafts (NFR-003) -->
		<section class="space-y-2.5">
			<div class="flex items-center gap-2 text-[#1E3A5F] font-bold text-base sm:text-lg">
				<Database class="w-5 h-5 text-[#149E8B] shrink-0" />
				<h2>
					{i18n.isEn
						? '2. Temporary Local Storage on Your Device (IndexedDB)'
						: '2. დროებითი შენახვა მოწყობილობაზე (IndexedDB)'}
				</h2>
			</div>
			<div class="space-y-3 text-sm sm:text-base text-slate-700 leading-relaxed pl-7">
				{#if i18n.isEn}
					<p>
						So you do not lose your progress if you accidentally refresh the page or close your
						browser mid-inspection, the app automatically saves a working draft in your browser's
						local storage (<code
							class="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800"
							>IndexedDB</code
						>).
					</p>
					<div
						class="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs sm:text-sm text-amber-900 font-medium"
					>
						Saved data is stored only on the current device and may be deleted when browser site
						data is cleared.
					</div>
				{:else}
					<p>
						იმისათვის, რომ ბინის დათვალიერების დროს გვერდის შემთხვევით განახლების ან ბრაუზერის
						დახურვისას არ დაგეკარგოთ უკვე შევსებული ინფორმაცია და დამატებული ფოტოები, აპლიკაცია
						ავტომატურად ინახავს სამუშაო ვერსიას თქვენი ბრაუზერის ლოკალურ მეხსიერებაში (<code
							class="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800"
							>IndexedDB</code
						>).
					</p>
					<div
						class="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs sm:text-sm text-amber-900 font-medium"
					>
						შენახული მონაცემები ინახება მხოლოდ მიმდინარე მოწყობილობაზე და შეიძლება წაიშალოს ბრაუზერის მონაცემების გასუფთავებისას.
					</div>
				{/if}
			</div>
		</section>

		<!-- Section 3: Legal & Signature Disclaimer (FR-010) -->
		<section class="space-y-2.5">
			<div class="flex items-center gap-2 text-[#1E3A5F] font-bold text-base sm:text-lg">
				<Scale class="w-5 h-5 text-[#149E8B] shrink-0" />
				<h2>{i18n.isEn ? '3. Legal Notice' : '3. სამართლებრივი შენიშვნა'}</h2>
			</div>
			<div class="space-y-2 text-sm sm:text-base text-slate-700 leading-relaxed pl-7">
				{#if i18n.isEn}
					<p>
						BinaAct is a technical tool designed to simplify the structured preparation of an
						apartment handover report and generate a printable PDF document for physical signing by
						the parties.
					</p>
					<p>
						The application does not provide qualified electronic signatures and does not
						independently verify the factual accuracy of the entered information or property
						condition.
					</p>
				{:else}
					<p>
						BinaAct წარმოადგენს ტექნიკურ ხელსაწყოს, რომელიც ამარტივებს ბინის მიღება-ჩაბარების აქტის
						სტრუქტურირებულ შედგენასა და საბეჭდი PDF დოკუმენტის მომზადებას მხარეთა მიერ ფიზიკური
						ხელმოწერისთვის.
					</p>
					<p>
						აპლიკაცია არ ახორციელებს კვალიფიციურ ელექტრონულ ხელმოწერას და დამოუკიდებლად არ ამოწმებს
						დოკუმენტში შეტანილი ფაქტობრივი მონაცემების ან ქონების მდგომარეობის სიზუსტეს.
					</p>
				{/if}
			</div>
		</section>

		<!-- Section 4: Immediate Local Data Wipe -->
		<section class="pt-2 border-t border-slate-200 space-y-4">
			<div class="space-y-1.5">
				<h2 class="text-base sm:text-lg font-bold text-[#1E3A5F]">
					{i18n.isEn
						? '4. Clear Saved Data from This Device'
						: '4. მონაცემების წაშლა მოწყობილობიდან'}
				</h2>
				<p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
					{i18n.isEn
						? 'If you are using a shared device or have finished creating your report, you can erase all locally saved draft data and photos at any time with one click.'
						: 'თუ იყენებთ სხვის ან საზიარო მოწყობილობას, ან დაასრულეთ აქტის შექმნა, შეგიძლიათ ნებისმიერ დროს ერთი ღილაკით სრულად წაშალოთ ბრაუზერში დროებით შენახული მონაცემები და ფოტოები.'}
				</p>
			</div>

			{#if clearedMessage}
				<div
					role="status"
					class="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900 font-medium"
				>
					<CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
					<span>{clearedMessage}</span>
				</div>
			{/if}

			<div class="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
				<button
					type="button"
					onclick={handleClearLocalData}
					disabled={isClearing}
					class="inline-flex items-center justify-center gap-2 min-h-11 px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
				>
					<Trash2 class="w-4 h-4 shrink-0" />
					<span>
						{i18n.isEn
							? 'Clear Saved Data from This Device'
							: 'შენახული მონაცემების წაშლა ამ მოწყობილობიდან'}
					</span>
				</button>

				<a
					href="/"
					class="inline-flex items-center justify-center gap-2 min-h-11 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
				>
					<ArrowLeft class="w-4 h-4 shrink-0" />
					<span>{i18n.isEn ? 'Back to Homepage' : 'მთავარ გვერდზე დაბრუნება'}</span>
				</a>
			</div>
		</section>
	</div>
</div>
