<script lang="ts">
	/**
	 * Accessible Project List (runes mode)
	 * - Uses $state for local reactive state
	 * - Callback props via $props()
	 * - Replaces store $ prefix sugar with manual subscription
	 * - Replaces on:click / on:keydown with event attributes (onclick / onkeydown)
	 * - Simplifies listing (no erroneous {#await} on a plain store)
	 */
	import {
		availableProjects,
		getProjectNames,
		loadProject,
		modalState,
		projectId
	} from "$utils";
	import { onMount } from "svelte";

	// Callback props
	const {
		onSelect = () => {},
		onNewproject = () => {},
		onEditProject = () => {}
	} = $props<{
		onSelect?: (detail: { name: string; id: number }) => void;
		onNewproject?: () => void;
		onEditProject?: (detail: { name: string; id: number }) => void;
	}>();

	// Projects array (mirrors store)
	let projects = $state<[string, number][]>([]);
	availableProjects.subscribe((v) => (projects = v as [string, number][]));

	// Roving focus management over the primary "open" buttons only
	let itemButtons: HTMLButtonElement[] = [];
	let focusedIndex = $state(-1);

	onMount(() => {
		getProjectNames();
	});

	function focusItem(index: number) {
		if (index < 0) return;
		const btn = itemButtons[index];
		if (btn) {
			btn.focus();
			focusedIndex = index;
		}
	}

	function activateProject(proj: [string, number]) {
		loadProject(proj[1]);
		onSelect({ name: proj[0], id: proj[1] });
	}

	function editProject(proj: [string, number]) {
		projectId.set(proj[1]);
		loadProject(proj[1]);
		modalState.set("Project Options");
		onEditProject({ name: proj[0], id: proj[1] });
	}

	/**
	 * Handle arrow/home/end keys on each interactive button.
	 */
	function onItemKeyDown(e: KeyboardEvent, index: number, total: number) {
		switch (e.key) {
			case "ArrowDown":
			case "ArrowRight":
				e.preventDefault();
				focusItem((index + 1) % total);
				break;
			case "ArrowUp":
			case "ArrowLeft":
				e.preventDefault();
				focusItem((index - 1 + total) % total);
				break;
			case "Home":
				e.preventDefault();
				focusItem(0);
				break;
			case "End":
				e.preventDefault();
				focusItem(total - 1);
				break;
			case "Enter":
			case " ":
				// Let the button's click handler run
				break;
			default:
				break;
		}
	}

	/**
	 * Svelte action to register each primary button ref.
	 */
	function register(node: HTMLButtonElement, index: number) {
		itemButtons[index] = node;
		return {
			destroy() {
				itemButtons[index] = undefined as unknown as HTMLButtonElement;
			}
		};
	}
</script>

<nav aria-label="Projects" class="flex flex-col gap-2">
	{#if projects.length === 0}
		<p class="text-xs px-2 py-1">No projects yet. Create one to begin.</p>
	{:else}
		<ul role="list" class="flex flex-col gap-1 max-h-[40vh] overflow-y-auto overflow-x-hidden pr-1">
			{#each projects as proj, i}
				<li class="list-none">
					<div class="flex items-center gap-2 min-w-0">
						<!-- Primary: Open project -->
						<button
							use:register={i}
							type="button"
							onfocus={() => (focusedIndex = i)}
							onkeydown={(e) => onItemKeyDown(e, i, projects.length)}
							class="flex-1 min-w-0 text-left text-sm px-2 py-1 rounded outline-hidden focus:outline-hidden focus:ring-2 focus:ring-blue/70 focus:ring-offset-1 transition-colors {focusedIndex === i ? 'bg-overlay0' : 'bg-mantle hover:bg-surface0'}"
							data-index={i}
							onclick={() => activateProject(proj)}
							aria-label={`Load project ${proj[0]}`}
							title={`Open ${proj[0]}`}
						>
							<span class="truncate block">{proj[0]}</span>
						</button>

						<!-- Secondary: Edit (project options) -->
						<button
							type="button"
							class="px-2 py-1 rounded text-xs bg-mantle hover:bg-overlay0 focus:ring-2 focus:ring-blue/70 focus:ring-offset-1"
							aria-label={`Edit project ${proj[0]}`}
							title="Project options"
							onclick={() => editProject(proj)}
						>
							⋮
						</button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</nav>

<style>
	/* Minimal overrides: rely on existing Tailwind classes */
</style>