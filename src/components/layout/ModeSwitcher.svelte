<script lang="ts">
	/**
	 * ModeSwitcher (runes mode adjustments)
	 * - Removes legacy $store sugar
	 * - Uses event attributes (onkeydown / onclick / onfocus)
	 * - Manual subscription to projectEditingStage store
	 */
	import { projectEditingStage } from "$utils";
	import { onMount } from "svelte";
	import Button from "$ui/Button.svelte";

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
			class="button-base button-{i === activeIndex ? 'style2' : 'style1'} button-small px-3 py-2 rounded text-sm transition-all"
			onclick={() => setMode(mode)}
			onfocus={() => (activeIndex = i)}
		>
			{mode}
		</button>
	{/each}
</div>

<style>
	/* Import Button component styles */
	.button-base {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease-out;
		outline: none;
		position: relative;
		overflow: hidden;
		text-decoration: none;
		user-select: none;
	}

	.button-base:focus-visible {
		outline: 2px solid rgba(203, 166, 247, 0.7);
		outline-offset: 2px;
	}

	.button-base:disabled {
		cursor: not-allowed;
		opacity: 0.6;
		transform: none !important;
		box-shadow: none !important;
	}

	/* Style1 - Dark button with purple accent */
	.button-style1 {
		background: rgba(30, 30, 46, 0.4);
		border: 1px solid rgba(203, 166, 247, 0.2);
		color: rgb(205, 214, 244);
	}

	.button-style1:hover:not(:disabled) {
		background: rgba(30, 30, 46, 0.6);
		border-color: rgba(203, 166, 247, 0.4);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(203, 166, 247, 0.15);
		transition: none;
	}

	/* Style2 - Purple gradient button */
	.button-style2 {
		background: linear-gradient(135deg, 
			rgba(203, 166, 247, 0.85) 0%, 
			rgba(137, 180, 250, 0.9) 30%,
			rgba(180, 190, 254, 0.88) 70%,
			rgba(203, 166, 247, 0.9) 100%
		);
		border: 1px solid rgba(203, 166, 247, 0.5);
		color: rgb(17, 17, 27);
		font-weight: 600;
		box-shadow: 0 2px 6px rgba(203, 166, 247, 0.2);
	}

	.button-style2:hover:not(:disabled) {
		background: linear-gradient(135deg, 
			rgba(203, 166, 247, 0.95) 0%, 
			rgba(137, 180, 250, 1) 30%,
			rgba(180, 190, 254, 0.98) 70%,
			rgba(203, 166, 247, 1) 100%
		);
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(203, 166, 247, 0.35);
		transition: none;
	}

	/* Small size */
	.button-small {
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		min-height: 1.75rem;
	}
</style>