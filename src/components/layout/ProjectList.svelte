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
	import Button from "$ui/Button.svelte";
	import GlassContainer from "$ui/GlassContainer.svelte";

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

	// Search / filtering
	let search = $state("");
	const filteredProjects: [string, number][] = $derived(
		search.trim()
			? projects.filter((p) => p[0].toLowerCase().includes(search.toLowerCase()))
			: projects
	);
	
	// Keep focus index in range when filtering
	$effect(() => {
		if (focusedIndex >= filteredProjects.length) {
			focusedIndex = filteredProjects.length - 1;
		}
		if (focusedIndex < -1) focusedIndex = -1;
	});

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

<nav aria-label="Projects" class="flex flex-col gap-2 flex-1 min-h-0">
	<!-- Search input -->
	<div class="px-1">
		<GlassContainer variant="input" fullWidth size="small">
			<input
				type="text"
				class="w-full bg-transparent border-none outline-none text-text text-sm placeholder:text-overlay1"
				placeholder="Search projects..."
				bind:value={search}
				aria-label="Search projects"
			/>
		</GlassContainer>
	</div>

	{#if (filteredProjects?.length || 0) === 0}
		<p class="text-xs px-2 py-1">
			{projects.length === 0
				? "No projects yet. Create one to begin."
				: "No matches."}
		</p>
	{:else}
		<ul role="list" class="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1">
			{#each filteredProjects as proj, i}
				<li class="list-none">
					<div class="flex items-center gap-2 min-w-0">
						<!-- Primary: Open project -->
						<button
							use:register={i}
							type="button"
							onfocus={() => (focusedIndex = i)}
							onkeydown={(e) => onItemKeyDown(e, i, filteredProjects.length)}
							class="glass-project-button flex-1 min-w-0 text-left text-sm px-3 py-2 rounded outline-hidden focus:outline-hidden focus:ring-2 focus:ring-blue/70 transition-all {focusedIndex === i ? 'glass-project-focused' : 'glass-project-normal'}"
							data-index={i}
							onclick={() => activateProject(proj)}
							aria-label={`Load project ${proj[0]}`}
							title={`Open ${proj[0]}`}
						>
							<span class="truncate block">{proj[0]}</span>
						</button>

						<!-- Secondary: Edit (project options) -->
						<Button
							variant="icon"
							size="small"
							aria-label={`Edit project ${proj[0]}`}
							title="Project options"
							onclick={() => editProject(proj)}
							class="text-xs"
						>
							{#snippet children()}
								⋮
							{/snippet}
						</Button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</nav>

<style>
	.glass-project-button {
		border: 1px solid rgba(137, 180, 250, 0.05);
		transition: all 0.15s ease-out;
	}

	.glass-project-normal {
		background: rgba(30, 30, 46, 0.1);
		color: rgb(205, 214, 244);
	}

	.glass-project-normal:hover {
		background: rgba(30, 30, 46, 0.25);
		border-color: rgba(137, 180, 250, 0.15);
		transform: translateX(2px);
		box-shadow: 2px 0 8px rgba(137, 180, 250, 0.1);
		transition: none;
	}

	.glass-project-focused {
		background: rgba(137, 180, 250, 0.15);
		border-color: rgba(137, 180, 250, 0.3);
		color: rgb(205, 214, 244);
		transform: translateX(2px);
		box-shadow: 2px 0 8px rgba(137, 180, 250, 0.15);
	}
</style>