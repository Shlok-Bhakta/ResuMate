<script lang="ts">
	/**
	 * Topbar
	 * Reset action moved into Project Options dialog; top bar only exposes Edit / Duplicate / Save.
	 */
	import ModeSwitcher from "./ModeSwitcher.svelte";
	import {
		saveCurrentProject,
		saveState,
		modalState,
		duplicateProject,
		projectId
	} from "$utils";

	// Props from LayoutRoot
	const { collapsed = false, onShowSidebar = () => {} } = $props<{ collapsed?: boolean; onShowSidebar?: () => void }>();

	function openEdit() {
		$modalState = "Project Options";
	}

	async function onDuplicate() {
		await duplicateProject($projectId);
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
	<!-- Sidebar show when collapsed -->
	{#if collapsed}
		<button
			type="button"
			onclick={onShowSidebar}
			class="p-1 rounded bg-mantle text-text hover:bg-overlay0 transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue/70"
			aria-label="Show sidebar"
			title="Show sidebar"
		>
			<img
				src="/ResuMate/icons/sidebaropen.svg"
				alt=""
				aria-hidden="true"
				class="w-5 h-5 pointer-events-none"
			/>
		</button>
	{/if}

	<!-- Project actions (Edit / Duplicate) -->
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
			class="px-2 py-1 rounded bg-mantle text-text text-sm hover:bg-overlay0 transition-colors"
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
			class="px-2 py-1 rounded bg-blue text-mantle text-sm hover:bg-sapphire transition-colors relative"
			aria-describedby="save-status-text"
			aria-label="Save project"
		>
			Save
			<span
				class={"absolute -top-1 -right-1 w-3 h-3 rounded-full " + saveStatusTone($saveState)}
				aria-hidden="true"
			/>
		</button>
		<div
			id="save-status-text"
			role="status"
			aria-live="polite"
			class="text-xs min-w-[4ch]"
		>
			{saveStatusText($saveState)}
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