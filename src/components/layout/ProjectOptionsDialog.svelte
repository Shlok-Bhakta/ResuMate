<script lang="ts">
	/**
	 * ProjectOptionsDialog (Svelte 5 runes mode)
	 * - Replaces legacy $store sugar with explicit subscriptions + $state
	 * - Uses event attributes (onclick, onsubmit, onkeydown)
	 */
	import {
		modalState,
		jobName,
		jobUrl,
		projectId,
		saveCurrentProject,
		resumeTemplate,
		resumeMd
	} from "$utils";
	import { renameProject, duplicateProject, deleteProject } from "$utils";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

	// Local reactive state
	let name = $state("");
	let url = $state("");
	let working = $state(false);
	let errorMsg = $state("");

	// Track project id
	let currentProjectId = $state(-1);

	// Subscribe to stores (no $store sugar in runes mode)
	jobName.subscribe(v => (name = v));
	jobUrl.subscribe(v => (url = v));
	projectId.subscribe(v => (currentProjectId = v));

	function close() {
		modalState.set("None");
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === "Escape") {
			e.stopPropagation();
			close();
		}
	}

	onMount(() => {
		const el = document.getElementById("po-name") as HTMLInputElement | null;
		el?.focus();
	});

	async function onSave(e?: Event) {
		e?.preventDefault();
		errorMsg = "";
		const trimmed = name.trim();
		if (!trimmed) {
			errorMsg = "Please enter a project name.";
			return;
		}
		working = true;
		try {
			await renameProject(currentProjectId, trimmed);
			jobUrl.set(url.trim());
			await saveCurrentProject();
			close();
		} catch (err) {
			console.error(err);
			errorMsg = "Failed to save changes.";
		} finally {
			working = false;
		}
	}

	async function onDuplicate() {
		errorMsg = "";
		working = true;
		try {
			const trimmed = name.trim();
			await duplicateProject(currentProjectId, trimmed || undefined);
			close();
		} catch (err) {
			console.error(err);
			errorMsg = "Failed to duplicate project.";
		} finally {
			working = false;
		}
	}

	async function onReset() {
		if (!confirm("Reset resume to template? This will discard current resume content.")) return;
		errorMsg = "";
		working = true;
		try {
			resumeMd.set(get(resumeTemplate));
			// Leave dialog open so user can still rename / save / duplicate or cancel.
		} catch (err) {
			console.error(err);
			errorMsg = "Failed to reset content.";
		} finally {
			working = false;
		}
	}
	
	async function onDelete() {
		if (!confirm("Delete this project? This cannot be undone.")) return;
		errorMsg = "";
		working = true;
		try {
			await deleteProject(currentProjectId);
			close();
		} catch (err) {
			console.error(err);
			errorMsg = "Failed to delete project.";
		} finally {
			working = false;
		}
	}
</script>

<!-- Dialog Panel -->
<div
	class="bg-crust text-text rounded-md shadow-lg w-[min(560px,92vw)] p-4"
	role="document"
	aria-labelledby="project-options-title"
	onkeydown={onKeydown}
>
	<header class="mb-3">
		<div class="flex items-start justify-between gap-3">
			<div>
				<h2 id="project-options-title" class="text-lg font-semibold">Project options</h2>
				<p class="text-xs opacity-70">Rename, set job URL, duplicate or delete.</p>
			</div>
			<button
				type="button"
				class="p-1 rounded bg-mantle hover:bg-overlay0 transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue/70"
				onclick={close}
				aria-label="Close dialog"
				title="Close"
			>
				<img
					src="/ResuMate/icons/cancel.svg"
					alt=""
					aria-hidden="true"
					class="w-5 h-5 pointer-events-none"
				/>
			</button>
		</div>
	</header>

	<form class="space-y-3" onsubmit={onSave}>
		<div class="flex flex-col gap-1">
			<label for="po-name" class="text-sm">Project name</label>
			<input
				id="po-name"
				class="px-2 py-1 rounded bg-mantle text-text text-sm focus:outline-none focus:ring-1 focus:ring-blue"
				bind:value={name}
				placeholder="e.g., Company – Role"
			/>
		</div>

		<div class="flex flex-col gap-1">
			<label for="po-url" class="text-sm">Job URL (optional)</label>
			<input
				id="po-url"
				class="px-2 py-1 rounded bg-mantle text-text text-sm focus:outline-none focus:ring-1 focus:ring-blue"
				bind:value={url}
				placeholder="https://example.com/job"
				inputmode="url"
				spellcheck="false"
			/>
			<p class="text-xs opacity-70">Used by the fetch tool to grab job description later.</p>
		</div>

		{#if errorMsg}
			<div role="alert" class="text-sm text-red">{errorMsg}</div>
		{/if}

		<div class="flex flex-wrap items-center justify-between gap-2 pt-2">
			<div class="flex items-center gap-2">
				<button
					type="button"
					class="px-3 py-1 rounded bg-red/80 hover:bg-red text-mantle text-sm transition-colors"
					onclick={onDelete}
					disabled={working}
					aria-label="Delete project"
				>
					Delete
				</button>
				<button
					type="button"
					class="px-3 py-1 rounded bg-red/80 hover:bg-red text-mantle text-sm transition-colors"
					onclick={onReset}
					disabled={working}
					aria-label="Reset resume to template"
					title="Reset resume content to template"
				>
					Reset
				</button>
			</div>
			<div class="flex items-center gap-2">
				<button
					type="button"
					class="px-3 py-1 rounded bg-mantle hover:bg-overlay0 text-text text-sm transition-colors"
					onclick={onDuplicate}
					disabled={working}
					aria-label="Duplicate project"
					title="Create a copy"
				>
					Duplicate
				</button>
				<button
					type="submit"
					class="px-3 py-1 rounded bg-blue hover:bg-sapphire text-mantle text-sm transition-colors disabled:opacity-60"
					disabled={working}
					aria-label="Save changes"
				>
					{working ? "Working…" : "Save"}
				</button>
			</div>
		</div>
	</form>
</div>

<style>
	/* Panel styling only; overlay/escape handled by parent LayoutRoot */
</style>