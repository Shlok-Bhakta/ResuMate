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
	import Button from "$ui/Button.svelte";
	import GlassContainer from "$ui/GlassContainer.svelte";

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
<GlassContainer
	variant="dialog"
	size="large"
	class="w-[min(560px,92vw)]"
	role="document"
	aria-labelledby="project-options-title"
	onkeydown={onKeydown}
>
	<header class="mb-4">
		<div class="flex items-start justify-between gap-4">
			<div class="flex items-center gap-3">
				<div class="w-3 h-3 rounded-full bg-yellow animate-pulse"></div>
				<div>
					<h2 id="project-options-title" class="text-xl font-bold text-text">Project Options</h2>
					<p class="text-sm text-subtext0">Rename, set job URL, duplicate or delete.</p>
				</div>
			</div>
			<Button
				variant="icon"
				size="small"
				onclick={close}
				aria-label="Close dialog"
				title="Close"
			>
				{#snippet children()}
					<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				{/snippet}
			</Button>
		</div>
	</header>

	<form class="space-y-4" onsubmit={onSave}>
		<div class="flex flex-col gap-2">
			<label for="po-name" class="text-sm font-medium text-text">Project name</label>
			<GlassContainer variant="input" fullWidth>
				<input
					id="po-name"
					class="w-full bg-transparent border-none outline-none"
					bind:value={name}
					placeholder="e.g., Company – Role"
				/>
			</GlassContainer>
		</div>

		<div class="flex flex-col gap-2">
			<label for="po-url" class="text-sm font-medium text-text">Job URL (optional)</label>
			<GlassContainer variant="input" fullWidth>
				<input
					id="po-url"
					class="w-full bg-transparent border-none outline-none"
					bind:value={url}
					placeholder="https://example.com/job"
					inputmode="url"
					spellcheck="false"
				/>
			</GlassContainer>
			<p class="text-xs text-subtext1">Used by the fetch tool to grab job description later.</p>
		</div>

		{#if errorMsg}
			<GlassContainer variant="error" role="alert" class="flex items-center gap-2">
				<svg class="w-4 h-4 text-red flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
				</svg>
				<span class="text-sm text-red">{errorMsg}</span>
			</GlassContainer>
		{/if}

		<div class="flex flex-wrap items-center justify-between gap-3 pt-4">
			<div class="flex items-center gap-2">
				<Button
					variant="danger"
					size="small"
					onclick={onDelete}
					disabled={working}
					aria-label="Delete project"
				>
					{#snippet children()}
						<img
							src="/ResuMate/icons/trash.svg"
							alt=""
							aria-hidden="true"
							class="w-4 h-4 pointer-events-none"
						/>
						<span>Delete</span>
					{/snippet}
				</Button>
				<Button
					variant="warning"
					size="small"
					onclick={onReset}
					disabled={working}
					aria-label="Reset resume to template"
					title="Reset resume content to template"
				>
					{#snippet children()}
						<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
						</svg>
						<span>Reset</span>
					{/snippet}
				</Button>
			</div>
			<div class="flex items-center gap-3">
				<Button
					variant="style1"
					size="small"
					onclick={onDuplicate}
					disabled={working}
					aria-label="Duplicate project"
					title="Create a copy"
				>
					{#snippet children()}
						<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
							<path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
							<path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
						</svg>
						<span>Duplicate</span>
					{/snippet}
				</Button>
				<Button
					variant="style2"
					size="small"
					type="submit"
					loading={working}
					loadingText="Working..."
					aria-label="Save changes"
					class="min-w-[90px] justify-center"
				>
					{#snippet children()}
						<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
							<path d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 8l3.707-3.707a1 1 0 011.414 0z" />
						</svg>
						<span>Save</span>
					{/snippet}
				</Button>
			</div>
		</div>
	</form>
</GlassContainer>

