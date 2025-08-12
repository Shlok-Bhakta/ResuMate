<script lang="ts">
	/**
	 * Topbar (fresh rewrite)
	 * Updated to avoid $store sugar (manual subscriptions) for Svelte 5 runes mode consistency.
	 */
	import ModeSwitcher from "./ModeSwitcher.svelte";
	import {
		resumeTemplate,
		resumeMd,
		saveCurrentProject,
		saveState,
		modalState,
		duplicateProject,
		projectId
	} from "$utils";
	import { get } from "svelte/store";
	import { onDestroy } from "svelte";
	
	// Props from LayoutRoot
	const { collapsed = false, onShowSidebar = () => {} } = $props<{ collapsed?: boolean; onShowSidebar?: () => void }>();
	
	// Local reactive copies of store values
	let modal = "None";
	let saveStateVal = $state(0);
	let currentProjectId = -1;
	
	const unsubModal = modalState.subscribe(v => modal = v);
	const unsubSaveState = saveState.subscribe(v => saveStateVal = v);
	const unsubProjectId = projectId.subscribe(v => currentProjectId = v);
	
	onDestroy(() => {
		unsubModal();
		unsubSaveState();
		unsubProjectId();
	});
	
	function openEdit() {
		modalState.set("Project Options");
	}
	
	async function onDuplicate() {
		await duplicateProject(currentProjectId);
	}
	
	function resetToTemplate() {
		resumeMd.set(get(resumeTemplate));
	}
	
	function saveProject() {
		saveCurrentProject();
	}
	
	function saveStatusText(v: number): string {
		switch (v) {
			case -1:
				return "Error saving";
			case 0:
				return "Saving...";
			case 1:
			case 2:
				return "Saved";
			default:
				return "";
		}
	}
	
	function saveStatusTone(v: number): string {
		switch (v) {
			case -1:
				return "bg-red";
			case 0:
				return "bg-yellow";
			case 1:
			case 2:
				return "bg-green";
			default:
				return "bg-overlay0";
		}
	}
</script>

<div
	class="flex items-center gap-3 px-3 py-2 border-b-1 border-overlay0 bg-crust bg-[linear-gradient(90deg,rgba(137,180,250,0.12),rgba(203,166,247,0.12))]"
	role="banner"
	aria-label="Application top bar"
>
	<!-- Reset -->
	<button
		type="button"
		onclick={resetToTemplate}
		class="px-2 py-1 rounded bg-mantle text-text text-sm hover:bg-overlay0 transition-colors"
		aria-label="Reset resume content to template"
	>
		Reset
	</button>

	<!-- Sidebar show when collapsed -->
	{#if collapsed}
		<button
			type="button"
			onclick={onShowSidebar}
			class="px-2 py-1 rounded bg-blue text-mantle text-sm hover:bg-sapphire transition-colors"
			aria-label="Show sidebar"
			title="Show sidebar"
		>
			Show Sidebar
		</button>
	{/if}

	<!-- Project actions -->
	<div class="flex items-center gap-2">
		<button
			type="button"
			onclick={openEdit}
			class="px-2 py-1 rounded bg-mantle text-text text-sm hover:bg-overlay0 transition-colors"
			aria-label="Edit project"
			title="Edit project"
		>
			Edit
		</button>
		<button
			type="button"
			onclick={onDuplicate}
			class="px-2 py-1 rounded bg-sapphire text-mantle text-sm hover:bg-blue transition-colors"
			aria-label="Duplicate project"
			title="Duplicate project"
		>
			Duplicate
		</button>
	</div>

	<!-- Save -->
	<div class="flex items-center gap-2">
		<button
			type="button"
			onclick={saveProject}
			class="px-2 py-1 rounded bg-mantle text-text text-sm hover:bg-overlay0 transition-colors relative"
			aria-describedby="save-status-text"
			aria-label="Save project"
		>
			Save
			<span
				class={"absolute -top-1 -right-1 w-3 h-3 rounded-full " + saveStatusTone(saveStateVal)}
				aria-hidden="true"
			/>
		</button>
		<!-- Visible textual status (kept concise) -->
		<div
			id="save-status-text"
			role="status"
			aria-live="polite"
			class="text-xs min-w-[4ch]"
		>
			{saveStatusText(saveStateVal)}
		</div>
	</div>

	<!-- Spacer -->
	<div class="flex-1" />

	<!-- Mode Switcher -->
	<ModeSwitcher />

	<!-- Download Placeholder -->
	<button
		type="button"
		class="ml-2 px-2 py-1 rounded bg-mantle text-text text-sm opacity-60 cursor-not-allowed"
		aria-disabled="true"
		aria-label="Download (disabled placeholder)"
		title="Download (coming soon in rewrite integration)"
	>
		Download
	</button>
</div>

<style>
	/* Minimal top bar specific overrides (none for now). */
</style>