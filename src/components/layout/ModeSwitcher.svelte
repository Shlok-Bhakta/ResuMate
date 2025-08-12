<script lang="ts">
	/**
	 * ModeSwitcher (runes mode adjustments)
	 * - Removes legacy $store sugar
	 * - Uses event attributes (onkeydown / onclick / onfocus)
	 * - Manual subscription to projectEditingStage store
	 */
	import { projectEditingStage } from "$utils";
	import { onMount } from "svelte";

	const modes = ["Content", "Tuning", "Preview"] as const;
	type Mode = typeof modes[number];

	let current = $state("Content" as Mode);
	let tabButtons: HTMLButtonElement[] = [];
	let activeIndex = $state(0);

	// Subscribe to store (no $projectEditingStage sugar)
	projectEditingStage.subscribe((v) => {
		current = v as Mode;
		const idx = modes.indexOf(current);
		if (idx !== -1) activeIndex = idx;
	});

	function setMode(mode: Mode) {
		projectEditingStage.set(mode);
		current = mode;
		activeIndex = modes.indexOf(mode);
		queueMicrotask(() => {
			const btn = tabButtons[activeIndex];
			btn?.focus();
		});
	}

	function onKeyDown(e: KeyboardEvent) {
		const total = modes.length;
		let next = activeIndex;
		switch (e.key) {
			case "ArrowRight":
			case "ArrowDown":
				e.preventDefault();
				next = (activeIndex + 1) % total;
				break;
			case "ArrowLeft":
			case "ArrowUp":
				e.preventDefault();
				next = (activeIndex - 1 + total) % total;
				break;
			case "Home":
				e.preventDefault();
				next = 0;
				break;
			case "End":
				e.preventDefault();
				next = total - 1;
				break;
			case "Enter":
			case " ":
				e.preventDefault();
				setMode(modes[activeIndex]);
				return;
			default:
				return;
		}
		activeIndex = next;
		tabButtons[activeIndex]?.focus();
	}

	function register(node: HTMLButtonElement, index: number) {
		tabButtons[index] = node;
		return {
			destroy() {
				tabButtons[index] = undefined as unknown as HTMLButtonElement;
			}
		};
	}

	onMount(() => {
		// Ensure initial index matches store value
		projectEditingStage.subscribe((v) => {
			const idx = modes.indexOf(v as Mode);
			if (idx !== -1) activeIndex = idx;
		});
	});
</script>

<div
	role="tablist"
	aria-label="Editor modes"
	class="flex flex-row gap-1"
	onkeydown={onKeyDown}
>
	{#each modes as mode, i}
		<button
			use:register={i}
			role="tab"
			type="button"
			tabindex={i === activeIndex ? 0 : -1}
			aria-selected={i === activeIndex}
			class="px-2 py-1 rounded text-sm transition-colors {i === activeIndex ? 'bg-blue text-mantle' : 'bg-mantle text-text hover:bg-overlay0'}"
			onclick={() => setMode(mode)}
			onfocus={() => (activeIndex = i)}
		>
			{mode}
		</button>
	{/each}
</div>

<style>
	/* Minimal styling; further theming deferred */
</style>