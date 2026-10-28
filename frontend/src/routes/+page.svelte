<script lang="ts">
	import logo from '#lib/assets/logo.png';
	import FileText from 'lucide-svelte/icons/file-text';
	import Camera from 'lucide-svelte/icons/camera';
	import Download from 'lucide-svelte/icons/download';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import { trackEvent } from '$lib/analytics';
	import { i18n } from '$lib/i18n/index.svelte';
</script>

<div class="space-y-10 py-4 sm:py-8">
	<!-- Hero Section -->
	<section class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs text-center space-y-6">
		<div class="flex justify-center">
			<img
				src={logo}
				alt={i18n.isEn
					? 'BinaAct — Apartment Handover Report'
					: 'BinaAct (ბინააქტი) — ბინის მიღება-ჩაბარების აქტი'}
				class="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-2xl shadow-xs border border-slate-100"
			/>
		</div>

		<h1 class="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-snug">
			{i18n.isEn
				? 'Apartment Handover Report — Simple & Fast'
				: 'ბინის მიღება-ჩაბარების აქტი — მარტივად და სწრაფად'}
		</h1>

		<p class="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
			{i18n.isEn
				? 'Create an apartment move-in or move-out handover act, document room conditions, attach photos, and download a ready-to-sign PDF.'
				: 'შექმენით ბინის მიღება-ჩაბარების აქტი, აღწერეთ ბინის მდგომარეობა, დაამატეთ ფოტოები და ჩამოტვირთეთ PDF დოკუმენტი.'}
		</p>

		<div class="pt-2">
			<a
				href="/create"
				onclick={() => trackEvent('report_started')}
				class="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto min-h-12 px-8 py-3.5 rounded-xl bg-[#1E3A5F] hover:bg-[#162c49] active:bg-[#102036] text-white font-bold text-base shadow-sm transition-colors"
			>
				<span>{i18n.isEn ? 'Create Report' : 'აქტის შექმნა'}</span>
				<ArrowRight class="w-5 h-5" />
			</a>
		</div>

		<p class="text-xs text-slate-500">
			{i18n.isEn
				? 'Free • No registration required • Takes ~5–10 minutes'
				: 'უფასოა • რეგისტრაციის გარეშე • დასრულებას სჭირდება ~5–10 წუთი'}
		</p>
	</section>

	<!-- Three-Step Explanation -->
	<section aria-labelledby="how-it-works-heading" class="space-y-4">
		<h2 id="how-it-works-heading" class="text-lg sm:text-xl font-bold text-slate-900 text-center">
			{i18n.isEn ? 'How BinaAct Works' : 'როგორ მუშაობს ბინააქტი'}
		</h2>

		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<div class="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
				<div class="flex items-center gap-3">
					<span class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 text-[#1E3A5F] font-bold text-sm">
						1
					</span>
					<FileText class="w-5 h-5 text-[#149E8B]" />
				</div>
				<h3 class="font-bold text-slate-900 text-base">
					{i18n.isEn
						? 'Enter apartment & party details'
						: 'შეიყვანეთ ბინის და მხარეების მონაცემები'}
				</h3>
				<p class="text-sm text-slate-600 leading-relaxed">
					{i18n.isEn
						? 'Specify the apartment address, landlord, tenant, utility meter readings, and number of keys handed over.'
						: 'მიუთითეთ ბინის მისამართი, გამქირავებელი, დამქირავებელი, კომუნალური მრიცხველები და გასაღებების რაოდენობა.'}
				</p>
			</div>

			<div class="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
				<div class="flex items-center gap-3">
					<span class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 text-[#1E3A5F] font-bold text-sm">
						2
					</span>
					<Camera class="w-5 h-5 text-[#149E8B]" />
				</div>
				<h3 class="font-bold text-slate-900 text-base">
					{i18n.isEn
						? 'Inspect rooms & attach photos'
						: 'შეაფასეთ ოთახები და დაურთეთ ფოტოები'}
				</h3>
				<p class="text-sm text-slate-600 leading-relaxed">
					{i18n.isEn
						? 'Rate each room with a ready-made checklist, list furniture & appliances, and snap photos of any existing damage.'
						: 'მონიშნეთ თითოეული ოთახის მდგომარეობა მზა კითხვარით, აღწერეთ ავეჯი და გადაუღეთ ფოტოები დაზიანებებს.'}
				</p>
			</div>

			<div class="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
				<div class="flex items-center gap-3">
					<span class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 text-[#1E3A5F] font-bold text-sm">
						3
					</span>
					<Download class="w-5 h-5 text-[#149E8B]" />
				</div>
				<h3 class="font-bold text-slate-900 text-base">
					{i18n.isEn ? 'Review & download PDF' : 'გადახედეთ და ჩამოტვირთეთ PDF'}
				</h3>
				<p class="text-sm text-slate-600 leading-relaxed">
					{i18n.isEn
						? 'Review the completed handover report and immediately download a clean A4 PDF document for printing and signing.'
						: 'გადაამოწმეთ შევსებული აქტი და მომენტალურად ჩამოტვირთეთ მზა ქართული PDF დოკუმენტი ამოსაბეჭდად და ხელმოსაწერად.'}
				</p>
			</div>
		</div>
	</section>

	<section aria-labelledby="what-is-act-heading" class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
		<h2 id="what-is-act-heading" class="text-lg sm:text-xl font-bold text-[#1E3A5F]">
			{i18n.isEn
				? 'What is an apartment handover report?'
				: 'რა არის ბინის მიღება-ჩაბარების აქტი?'}
		</h2>
		<p class="text-sm sm:text-base text-slate-700 leading-relaxed">
			{i18n.isEn
				? 'An apartment handover report is the document a landlord and a tenant fill in when the apartment is handed over or returned. It records the condition of each room, existing damage, furniture and appliances, utility meter readings, and how many keys were exchanged.'
				: 'ბინის მიღება-ჩაბარების აქტი არის დოკუმენტი, რომელსაც გამქირავებელი და დამქირავებელი ავსებენ ბინის გადაცემის ან დაბრუნების დროს. აქტში ფიქსირდება თითოეული ოთახის მდგომარეობა, არსებული დაზიანებები, ავეჯი და ტექნიკა, კომუნალური მრიცხველების ჩვენებები და გადაცემული გასაღებების რაოდენობა.'}
		</p>
		<h3 class="font-bold text-slate-900 text-base">
			{i18n.isEn ? 'When you need it' : 'როდის გჭირდებათ აქტი'}
		</h3>
		<ul class="list-disc pl-5 space-y-1.5 text-sm sm:text-base text-slate-700 leading-relaxed">
			<li>
				{i18n.isEn
					? 'Moving into a rented apartment, so the starting condition is written down.'
					: 'ბინაში შესვლისას, რომ საწყისი მდგომარეობა წერილობით იყოს დაფიქსირებული.'}
			</li>
			<li>
				{i18n.isEn
					? 'Moving out, before the deposit is returned.'
					: 'ბინის დაბრუნებისას, დეპოზიტის დაბრუნებამდე.'}
			</li>
			<li>
				{i18n.isEn
					? 'When you want photos of damage and a printable PDF both parties can sign.'
					: 'როცა გინდათ დაზიანებების ფოტოები და ამოსაბეჭდი PDF, რომელსაც ორივე მხარე მოაწერს ხელს.'}
			</li>
		</ul>
		<p class="text-sm sm:text-base text-slate-700 leading-relaxed">
			{i18n.isEn
				? 'BinaAct is free and does not require an account. The report and photos stay on your phone or computer, and the PDF is created in the browser.'
				: 'ბინააქტი უფასოა და ანგარიში არ სჭირდება. აქტი და ფოტოები რჩება თქვენს ტელეფონში ან კომპიუტერში, PDF კი იქმნება პირდაპირ ბრაუზერში.'}
		</p>
	</section>

	<!-- Basic Privacy Information -->
	<section aria-labelledby="privacy-summary-heading" class="bg-emerald-50/70 rounded-xl border border-emerald-200 p-5 sm:p-6">
		<div class="flex items-start gap-3.5">
			<div class="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
				<ShieldCheck class="w-5 h-5" />
			</div>
			<div class="space-y-1.5">
				<h2 id="privacy-summary-heading" class="font-bold text-slate-900 text-sm sm:text-base">
					{i18n.isEn ? 'Your data is 100% private' : 'თქვენი მონაცემები სრულად დაცულია'}
				</h2>
				<p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
					{i18n.isEn
						? 'No account required. Your photos, address, and personal details are never uploaded to our servers — the PDF document is generated directly in your browser.'
						: 'რეგისტრაცია არ არის საჭირო. თქვენი ფოტოები, მისამართი და პერსონალური მონაცემები არ იტვირთება ჩვენს სერვერზე — დოკუმენტი იქმნება პირდაპირ თქვენს ბრაუზერში.'}
					<a href="/privacy" class="font-semibold text-emerald-800 underline hover:text-emerald-950 ml-1">
						{i18n.isEn ? 'Learn more about privacy' : 'გაიგეთ მეტი კონფიდენციალურობის შესახებ'}
					</a>
				</p>
			</div>
		</div>
	</section>
</div>
