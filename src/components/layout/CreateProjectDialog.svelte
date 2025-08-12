<script lang="ts">
	/**
	 * CreateProjectDialog (Svelte 5 runes mode)
	 * - Replaces store $prefix sugar with explicit .set / subscribe
	 * - Uses event attributes (onsubmit / onclick)
	 */
	import {
		clearProject,
		jobName,
		jobUrl,
		resumeMd,
		resumeTemplate,
		saveCurrentProject,
		modalState
	} from "$utils";
	import { get } from "svelte/store";

	let name = $state("");
	let url = $state("");
	let fromTemplate = $state(true);
	let creating = $state(false);
	let errorMsg = $state("");

	function close() {
		modalState.set("None");
	}

	async function onSubmit(e: Event) {
		e.preventDefault();
		errorMsg = "";
		if (!name.trim()) {
			errorMsg = "Please enter a project name.";
			return;
		}
		creating = true;
		try {
			clearProject();
			jobName.set(name.trim());
			jobUrl.set(url.trim() || "https://example.com/");
			if (fromTemplate) {
				resumeMd.set(get(resumeTemplate));
			} else {
				resumeMd.set("");
			}
			await saveCurrentProject();
			close();
		} catch (err) {
			console.error(err);
			errorMsg = "Failed to create project. Try again.";
		} finally {
			creating = false;
		}
	}
</script>

<!-- Dialog Panel -->
<div
	class="bg-crust text-text rounded-md shadow-lg w-[min(480px,92vw)] p-4"
	role="document"
	aria-labelledby="create-project-title"
>
	<header class="mb-3">
		<h2 id="create-project-title" class="text-lg font-semibold">Create new project</h2>
		<p class="text-xs opacity-70">Choose a name. Optionally start from your saved template.</p>
	</header>

	<form onsubmit={onSubmit} class="space-y-3">
		<div class="flex flex-col gap-1">
			<label for="create-project-name" class="text-sm">Project name</label>
			<input
				id="create-project-name"
				class="px-2 py-1 rounded bg-mantle text-text text-sm focus:outline-none focus:ring-1 focus:ring-blue"
				bind:value={name}
				placeholder="e.g., Company - Role"
				autofocus
			/>
		</div>

		<div class="flex flex-col gap-1">
			<label for="create-project-url" class="text-sm">Job URL (optional)</label>
			<input
				id="create-project-url"
				class="px-2 py-1 rounded bg-mantle text-text text-sm focus:outline-none focus:ring-1 focus:ring-blue"
				bind:value={url}
				placeholder="https://example.com/job"
				inputmode="url"
				spellcheck="false"
			/>
			<p class="text-xs opacity-70">Used by the fetch tool to grab job description later.</p>
		</div>
	
		<label class="flex items-center gap-2 text-sm">
			<input
				type="checkbox"
				class="accent-blue"
				bind:checked={fromTemplate}
			/>
			Start from template
		</label>

		{#if errorMsg}
			<div role="alert" class="text-sm text-red">{errorMsg}</div>
		{/if}

		<div class="flex justify-end gap-2 pt-2">
			<button
				type="button"
				class="px-3 py-1 rounded bg-mantle hover:bg-overlay0 transition-colors text-sm"
				onclick={close}
				aria-label="Cancel"
			>
				Cancel
			</button>
			<button
				type="submit"
				class="px-3 py-1 rounded bg-blue text-mantle hover:bg-sapphire transition-colors text-sm disabled:opacity-60"
				disabled={creating}
				aria-label="Create project"
			>
				{creating ? "Creating…" : "Create"}
			</button>
		</div>
	</form>
</div>

<style>
	/* Panel styling only; overlay provided by parent LayoutRoot */
</style>