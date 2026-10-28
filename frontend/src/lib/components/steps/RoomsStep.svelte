<script lang="ts">
	import { reportStore } from '$lib/state/report.svelte';
	import {
		CONDITION_LIST,
		CONDITION_OPTIONS,
		DEFAULT_ROOM_PRESETS,
		type Condition,
		type RoomInspection
	} from '$lib/types/report';
	import { MAX_PHOTOS_PER_REPORT, processPhotoFile } from '$lib/photos/processor';
	import Plus from 'lucide-svelte/icons/plus';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import Home from 'lucide-svelte/icons/home';
	import Camera from 'lucide-svelte/icons/camera';
	import X from 'lucide-svelte/icons/x';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
	import { i18n } from '$lib/i18n/index.svelte';

	let customRoomName = $state('');
	let confirmingDeleteRoomId = $state<string | null>(null);
	let processingRoomIds = $state<Record<string, boolean>>({});
	let roomPhotoErrors = $state<Record<string, string>>({});

	const totalPhotos = $derived(
		reportStore.report.rooms.reduce((sum, room) => sum + room.photoIds.length, 0)
	);

	function handleAddPresetRoom(presetName: string) {
		reportStore.addRoom(presetName);
	}

	function handleAddCustomRoom(e?: Event) {
		e?.preventDefault();
		const trimmed = customRoomName.trim();
		if (!trimmed) return;
		reportStore.addRoom(trimmed);
		customRoomName = '';
	}

	function isRoomModified(room: RoomInspection): boolean {
		const hasNonDefaultCondition = room.components.some((c) => c.condition !== 'GOOD');
		const hasNotes = Boolean(room.notes && room.notes.trim().length > 0);
		const hasPhotos = room.photoIds.length > 0;
		return hasNonDefaultCondition || hasNotes || hasPhotos;
	}

	function requestRemoveRoom(room: RoomInspection) {
		if (isRoomModified(room)) {
			confirmingDeleteRoomId = room.id;
		} else {
			reportStore.removeRoom(room.id);
		}
	}

	function confirmRemoveRoom(roomId: string) {
		reportStore.removeRoom(roomId);
		if (confirmingDeleteRoomId === roomId) {
			confirmingDeleteRoomId = null;
		}
	}

	function clearRoomPhotoError(roomId: string) {
		if (roomPhotoErrors[roomId]) {
			delete roomPhotoErrors[roomId];
			roomPhotoErrors = { ...roomPhotoErrors };
		}
	}

	async function handleRoomFileSelect(roomId: string, event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const files = input.files ? Array.from(input.files) : [];
		if (files.length === 0) return;

		clearRoomPhotoError(roomId);
		processingRoomIds[roomId] = true;

		let runningCount = totalPhotos;

		try {
			for (const file of files) {
				const photoRecord = await processPhotoFile(file, {
					reportId: reportStore.report.id,
					roomId,
					currentTotalPhotos: runningCount
				});
				await reportStore.addPhotoToRoom(roomId, photoRecord);
				runningCount += 1;
			}
		} catch (err) {
			const message =
				err instanceof Error ? err.message : 'ფოტოს ატვირთვა ვერ მოხერხდა. სცადეთ თავიდან.';
			roomPhotoErrors[roomId] = message;
		} finally {
			processingRoomIds[roomId] = false;
			input.value = '';
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

<div class="space-y-6">
	<!-- Global Photo Counter Banner (FR-005) -->
	<div
		class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 rounded-xl border {totalPhotos >=
		MAX_PHOTOS_PER_REPORT
			? 'border-amber-300 bg-amber-50 text-amber-900'
			: 'border-slate-200 bg-slate-50 text-slate-700'}"
	>
		<div class="flex items-center gap-2 text-sm font-bold">
			<Camera class="w-4 h-4 text-[#149E8B] shrink-0" />
			<span>
				{i18n.isEn
					? `Uploaded photos: ${totalPhotos} / ${MAX_PHOTOS_PER_REPORT}`
					: `ატვირთული ფოტოები: ${totalPhotos} / ${MAX_PHOTOS_PER_REPORT}`}
			</span>
		</div>
		<span class="text-xs text-slate-500">
			{i18n.isEn ? 'JPG, PNG, WebP (max 10 MB per photo)' : 'JPG, PNG, WebP (მაქს. 10 MB თითო ფოტო)'}
		</span>
	</div>

	<!-- Room Adder Panel (FR-004) -->
	<div class="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-4">
		<div class="space-y-2">
			<span class="block text-sm font-bold text-slate-900">
				{i18n.isEn ? 'Quick Add (select a room):' : 'სწრაფი დამატება (აირჩიეთ ოთახი):'}
			</span>
			<div class="flex flex-wrap gap-2">
				{#each DEFAULT_ROOM_PRESETS as preset (preset)}
					<button
						type="button"
						onclick={() => handleAddPresetRoom(preset)}
						class="inline-flex items-center gap-1.5 min-h-11 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:border-[#1E3A5F] hover:text-[#1E3A5F] active:bg-blue-50 text-sm font-semibold text-slate-700 shadow-2xs transition-colors"
					>
						<Plus class="w-4 h-4 text-[#149E8B]" />
						<span>{i18n.roomName(preset)}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Custom Room Name Input -->
		<form onsubmit={handleAddCustomRoom} class="pt-2 border-t border-slate-200/80">
			<label for="custom-room-name" class="block text-xs font-bold text-slate-700 mb-1.5">
				{i18n.isEn ? 'Or enter a custom room name:' : 'ან ჩაწერეთ სხვა ოთახის სახელი:'}
			</label>
			<div class="flex flex-col sm:flex-row gap-2.5">
				<input
					id="custom-room-name"
					type="text"
					bind:value={customRoomName}
					placeholder={i18n.isEn
						? 'e.g. Bedroom 2, Office, Hallway'
						: 'მაგ: საძინებელი 2, კაბინეტი, შემოსასვლელი'}
					class="flex-1 h-12 px-4 rounded-xl border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 transition-all"
				/>
				<button
					type="submit"
					disabled={!customRoomName.trim()}
					class="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-[#1E3A5F] hover:bg-[#162c49] disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-sm sm:text-base transition-colors shrink-0"
				>
					<Plus class="w-4 h-4" />
					<span>{i18n.isEn ? 'Add Room' : 'ოთახის დამატება'}</span>
				</button>
			</div>
		</form>
	</div>

	<!-- Rooms List -->
	{#if reportStore.report.rooms.length === 0}
		<div class="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-2">
			<p class="text-base font-bold text-slate-700">
				{i18n.isEn ? 'No rooms added yet' : 'ოთახები ჯერ არ არის დამატებული'}
			</p>
			<p class="text-xs text-slate-500">
				{i18n.isEn
					? 'Select a room from the buttons above (e.g. + Living Room).'
					: 'აირჩიეთ ოთახი ზემოთ მოცემული ღილაკებიდან (მაგ: + მისაღები ოთახი).'}
			</p>
		</div>
	{:else}
		<div class="space-y-5">
			{#each reportStore.report.rooms as room, roomIndex (room.id)}
				{@const isProcessingPhotos = Boolean(processingRoomIds[room.id])}
				{@const photoError = roomPhotoErrors[room.id]}
				<article
					class="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden transition-all"
				>
					<!-- Room Header -->
					<div
						class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-slate-50 border-b border-slate-200"
					>
						<div class="flex items-center gap-2.5 min-w-0">
							<span
								class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#1E3A5F] text-white text-xs font-bold shrink-0"
							>
								{roomIndex + 1}
							</span>
							<Home class="w-4 h-4 text-[#149E8B] shrink-0 hidden sm:inline" />
							<h2 class="text-base sm:text-lg font-bold text-slate-900 truncate">
								{i18n.roomName(room.name)}
							</h2>
						</div>

						<button
							type="button"
							onclick={() => requestRemoveRoom(room)}
							class="inline-flex items-center gap-1.5 min-h-11 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors shrink-0"
						>
							<Trash2 class="w-4 h-4" />
							<span>{i18n.isEn ? 'Remove Room' : 'ოთახის წაშლა'}</span>
						</button>
					</div>

					<!-- Safe Deletion Confirmation Banner (NFR-005) -->
					{#if confirmingDeleteRoomId === room.id}
						<div
							class="px-4 sm:px-5 py-3 bg-red-50 border-b border-red-200 flex flex-wrap items-center justify-between gap-3"
						>
							<p class="text-xs sm:text-sm font-semibold text-red-900">
								{i18n.isEn
									? `Are you sure you want to remove "${i18n.roomName(room.name)}"? Entered details will be deleted.`
									: `ნამდვილად გსურთ „${room.name}“-ს წაშლა? შეყვანილი მონაცემები წაიშლება.`}
							</p>
							<div class="flex items-center gap-2">
								<button
									type="button"
									onclick={() => (confirmingDeleteRoomId = null)}
									class="min-h-11 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
								>
									{i18n.isEn ? 'Cancel' : 'გაუქმება'}
								</button>
								<button
									type="button"
									onclick={() => confirmRemoveRoom(room.id)}
									class="min-h-11 px-3.5 py-2 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700"
								>
									{i18n.isEn ? 'Yes, remove' : 'დიახ, წაშლა'}
								</button>
							</div>
						</div>
					{/if}

					<!-- Room Body -->
					<div class="p-4 sm:p-5 space-y-5">
						<!-- 5 Standard Components Checklist -->
						<div class="space-y-3.5">
							{#each room.components as component (component.name)}
								<div
									class="p-3 sm:p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2.5"
								>
									<div class="flex items-center justify-between">
										<span class="text-sm font-bold text-slate-900">
											{i18n.componentName(component.name)}
										</span>
										<span class="text-xs font-medium text-slate-500">
											{i18n.conditionBadge(component.condition)}
										</span>
									</div>

									<!-- 2x2 Mobile Grid / 4-Pill Desktop Row -->
									<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
										{#each CONDITION_LIST as conditionKey (conditionKey)}
											{@const option = CONDITION_OPTIONS[conditionKey]}
											{@const isSelected = component.condition === conditionKey}
											<button
												type="button"
												role="radio"
												aria-checked={isSelected}
												onclick={() =>
													reportStore.setRoomComponentCondition(
														room.id,
														component.name,
														conditionKey
													)}
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
							{/each}
						</div>

						<!-- Room Notes (FR-004) -->
						<div class="space-y-1.5 pt-1">
							<label for="room-notes-{room.id}" class="block text-sm font-bold text-slate-900">
								{i18n.isEn ? 'Notes / Description' : 'შენიშვნა / აღწერა'}
								<span class="text-xs font-normal text-slate-500">
									{i18n.isEn ? '(optional)' : '(არასავალდებულო)'}
								</span>
							</label>
							<textarea
								id="room-notes-{room.id}"
								rows="2"
								bind:value={room.notes}
								placeholder={i18n.isEn
									? 'e.g. Small scratches on the wall to the left of the window.'
									: 'მაგ: კედელზე არის მცირე ნაკაწრები ფანჯრის მარცხენა მხარეს.'}
								class="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 transition-all resize-y"
							></textarea>
						</div>

						<!-- Room Photos Section (FR-005, NFR-004) -->
						<div class="pt-2 border-t border-slate-100 space-y-3">
							<div class="flex flex-wrap items-center justify-between gap-2">
								<div>
									<span class="block text-sm font-bold text-slate-900">
										{i18n.isEn
											? `Photos (${room.photoIds.length})`
											: `ფოტოები (${room.photoIds.length})`}
									</span>
									<span class="text-xs text-slate-500">
										{i18n.isEn
											? 'Take a photo with your camera or choose from gallery'
											: 'გადაიღეთ კამერით ან აირჩიეთ გალერეიდან'}
									</span>
								</div>

								<label
									class="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-2 rounded-xl border border-[#149E8B] bg-teal-50/60 hover:bg-teal-100/70 text-[#0f7668] font-bold text-xs sm:text-sm cursor-pointer transition-colors {totalPhotos >=
										MAX_PHOTOS_PER_REPORT || isProcessingPhotos
										? 'opacity-50 pointer-events-none'
										: ''}"
								>
									{#if isProcessingPhotos}
										<LoaderCircle class="w-4 h-4 animate-spin" />
										<span>{i18n.isEn ? 'Processing photo...' : 'მუშავდება ფოტო...'}</span>
									{:else}
										<span aria-hidden="true">📷</span>
										<span>{i18n.isEn ? 'Add Photo' : 'ფოტოს დამატება'}</span>
									{/if}
									<input
										type="file"
										accept="image/jpeg,image/png,image/webp"
										multiple
										disabled={totalPhotos >= MAX_PHOTOS_PER_REPORT || isProcessingPhotos}
										onchange={(e) => handleRoomFileSelect(room.id, e)}
										class="sr-only"
									/>
								</label>
							</div>

							<!-- Dismissible Photo Validation Error Alert -->
							{#if photoError}
								<div
									role="alert"
									class="flex items-start justify-between gap-2.5 p-3 rounded-xl border border-red-200 bg-red-50 text-red-900 text-xs sm:text-sm font-medium"
								>
									<div class="flex items-start gap-2">
										<AlertCircle class="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
										<span>{i18n.translateValidationError(photoError)}</span>
									</div>
									<button
										type="button"
										onclick={() => clearRoomPhotoError(room.id)}
										aria-label={i18n.isEn ? 'Dismiss error' : 'შეცდომის დახურვა'}
										class="p-1 rounded-lg hover:bg-red-100 text-red-700 shrink-0"
									>
										<X class="w-4 h-4" />
									</button>
								</div>
							{/if}

							<!-- Thumbnail Previews Grid -->
							{#if room.photoIds.length > 0}
								<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
									{#each room.photoIds as photoId, photoIdx (photoId)}
										{@const previewUrl = reportStore.photoPreviewUrls[photoId]}
										<div
											class="relative group rounded-xl border border-slate-200 bg-slate-100 overflow-hidden aspect-4/3"
										>
											{#if previewUrl}
												<img
													src={previewUrl}
													alt="{i18n.roomName(room.name)} — {i18n.isEn
														? 'Photo'
														: 'ფოტო'} {photoIdx + 1}"
													class="w-full h-full object-cover"
												/>
											{:else}
												<div
													class="w-full h-full flex items-center justify-center text-xs text-slate-400"
												>
													{i18n.isEn ? `Photo #${photoIdx + 1}` : `ფოტო #${photoIdx + 1}`}
												</div>
											{/if}

											<button
												type="button"
												onclick={() => reportStore.removePhoto(room.id, photoId)}
												aria-label={i18n.isEn ? 'Remove photo' : 'ფოტოს წაშლა'}
												title={i18n.isEn ? 'Remove photo' : 'ფოტოს წაშლა'}
												class="absolute top-1.5 right-1.5 w-11 h-11 rounded-full bg-slate-900/75 hover:bg-red-600 text-white inline-flex items-center justify-center shadow-sm transition-colors"
											>
												<X class="w-4 h-4" />
											</button>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>
