<script lang="ts">
	import { onMount } from 'svelte';
	import { reportStore } from '$lib/state/report.svelte';
	import ReviewStep from '$lib/components/steps/ReviewStep.svelte';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import { i18n } from '$lib/i18n/index.svelte';

	onMount(() => {
		void reportStore.hydrateFromDb(4);
	});
</script>

<svelte:head>
	<title>
		{i18n.isEn ? 'Review Report — BinaAct' : 'აქტის გადახედვა — BinaAct (ბინააქტი)'}
	</title>
</svelte:head>

<div class="space-y-6">
	<section class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
		<header class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
			<div>
				<h1 class="text-xl sm:text-2xl font-bold text-slate-900">
					{i18n.isEn ? 'Review Report' : 'აქტის გადახედვა'}
				</h1>
				<p class="text-sm text-slate-500 mt-1">
					{i18n.isEn
						? 'Verify all entered information before downloading the PDF document.'
						: 'გადაამოწმეთ შეყვანილი ინფორმაცია PDF დოკუმენტის ჩამოტვირთვამდე.'}
				</p>
			</div>
			<a
				href="/create?step=3"
				class="inline-flex items-center gap-2 min-h-11 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 transition-colors"
			>
				<ArrowLeft class="w-4 h-4" />
				<span>{i18n.isEn ? 'Back to Editing' : 'რედაქტირებაზე დაბრუნება'}</span>
			</a>
		</header>

		<ReviewStep />
	</section>
</div>
