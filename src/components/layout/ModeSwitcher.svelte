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
			class="glass-tab px-3 py-2 rounded text-sm transition-all {i === activeIndex ? 'glass-tab-active' : 'glass-tab-inactive'}"
			onclick={() => setMode(mode)}
			onfocus={() => (activeIndex = i)}
		>
			{mode}
		</button>
	{/each}
</div>

<style>
	.glass-tab {
		border: 1px solid rgba(137, 180, 250, 0.1);
		font-weight: 500;
		transition: all 0.15s ease-out;
		position: relative;
		overflow: hidden;
	}

	.glass-tab-inactive {
		background: rgba(30, 30, 46, 0.15);
		color: rgb(186, 194, 222);
		border-color: rgba(137, 180, 250, 0.08);
	}

	.glass-tab-inactive:hover {
		background: rgba(30, 30, 46, 0.3);
		color: rgb(205, 214, 244);
		border-color: rgba(137, 180, 250, 0.2);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(137, 180, 250, 0.1);
		transition: none;
	}

	.glass-tab-active {
		background: linear-gradient(135deg, 
			rgba(137, 180, 250, 0.6) 0%, 
			rgba(116, 199, 236, 0.7) 100%
		);
		color: rgb(30, 30, 46);
		border-color: rgba(137, 180, 250, 0.4);
		box-shadow: 
			0 4px 12px rgba(137, 180, 250, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		transform: translateY(-1px);
	}

</style>