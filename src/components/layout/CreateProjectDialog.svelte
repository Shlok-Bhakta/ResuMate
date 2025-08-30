<script lang="ts">
	/**
	 * CreateProjectDialog
	 * Simplified to use $store sugar.
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
	import Button from "$ui/Button.svelte";

	let name = $state("");
	let url = $state("");
	let fromTemplate = $state(true);
	let creating = $state(false);
	let errorMsg = $state("");

	function close() {
		$modalState = "None";
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
			$jobName = name.trim();
			$jobUrl = url.trim() || "https://example.com/";
			if (fromTemplate) {
				$resumeMd = $resumeTemplate;
			} else {
				$resumeMd = "";
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
	class="glass-dialog w-[min(480px,92vw)] p-6"
	role="document"
	aria-labelledby="create-project-title"
>
	<header class="mb-4">
		<div class="flex items-center gap-3 mb-2">
			<div class="w-3 h-3 rounded-full bg-green animate-pulse"></div>
			<h2 id="create-project-title" class="text-xl font-bold text-text">Create New Project</h2>
		</div>
		<p class="text-sm text-subtext0">Choose a name. Optionally start from your saved template.</p>
	</header>

	<form onsubmit={onSubmit} class="space-y-4">
		<div class="flex flex-col gap-2">
			<label for="create-project-name" class="text-sm font-medium text-text">Project name</label>
			<input
				id="create-project-name"
				class="glass-input px-3 py-2 focus:glass-input-focus transition-all duration-300"
				bind:value={name}
				placeholder="e.g., Company - Role"
				autofocus
			/>
		</div>

		<div class="flex flex-col gap-2">
			<label for="create-project-url" class="text-sm font-medium text-text">Job URL (optional)</label>
			<input
				id="create-project-url"
				class="glass-input px-3 py-2 focus:glass-input-focus transition-all duration-300"
				bind:value={url}
				placeholder="https://example.com/job"
				inputmode="url"
				spellcheck="false"
			/>
			<p class="text-xs text-subtext1">Used by the fetch tool to grab job description later.</p>
		</div>

		<label class="glass-checkbox-label">
			<input
				type="checkbox"
				class="glass-checkbox"
				bind:checked={fromTemplate}
			/>
			<span class="text-sm font-medium text-text">Start from template</span>
		</label>

		{#if errorMsg}
			<div role="alert" class="glass-error flex items-center gap-2 p-3">
				<svg class="w-4 h-4 text-red flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
				</svg>
				<span class="text-sm text-red">{errorMsg}</span>
			</div>
		{/if}

		<div class="flex justify-end gap-3 pt-4">
			<Button
				variant="style1"
				size="medium"
				onclick={close}
				aria-label="Cancel"
			>
				{#snippet children()}
					Cancel
				{/snippet}
			</Button>
			<Button
				variant="style2"
				size="medium"
				type="submit"
				loading={creating}
				loadingText="Creating..."
				aria-label="Create project"
				class="min-w-[100px] justify-center"
			>
				{#snippet children()}
					<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
					</svg>
					<span>Create</span>
				{/snippet}
			</Button>
		</div>
	</form>
</div>

<style>
	.glass-dialog {
		background: rgba(22, 18, 32, 0.95);
		border-radius: 0.75rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
		color: rgb(205, 214, 244);
		position: relative;
	}

	.glass-dialog::before {
		content: '';
		position: absolute;
		inset: -1px;
		padding: 1px;
		background: linear-gradient(135deg, 
			rgba(180, 120, 250, 0.35) 0%,
			rgba(203, 166, 247, 0.3) 25%,
			rgba(160, 110, 240, 0.25) 50%,
			rgba(203, 166, 247, 0.3) 75%,
			rgba(180, 120, 250, 0.35) 100%
		);
		border-radius: 0.75rem;
		mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask-composite: subtract;
		z-index: -1;
	}

	.glass-input {
		background: rgba(18, 16, 28, 0.85);
		border: 2px solid rgba(180, 120, 250, 0.4) !important;
		border-radius: 0.5rem;
		color: rgb(205, 214, 244);
		font-size: 0.875rem;
		outline: none;
		transition: all 0.2s ease;
	}

	.glass-input::placeholder {
		color: rgb(108, 112, 134);
	}

	.glass-input:focus {
		border-color: rgba(180, 120, 250, 0.8) !important;
		box-shadow: 0 0 0 2px rgba(180, 120, 250, 0.3);
		background: rgba(18, 16, 28, 0.9);
	}

	.glass-checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.5rem;
		transition: all 0.2s ease;
	}

	.glass-checkbox-label:hover {
		background: rgba(17, 17, 27, 0.4);
	}

	.glass-checkbox {
		width: 1rem;
		height: 1rem;
		border-radius: 0.25rem;
		border: 1px solid rgba(137, 180, 250, 0.4);
		background: rgba(17, 17, 27, 0.6);
		cursor: pointer;
		accent-color: rgb(137, 180, 250);
	}

	.glass-button-secondary {
		background: rgba(17, 17, 27, 0.6);
		border: 1px solid rgba(137, 180, 250, 0.3);
		border-radius: 0.5rem;
		color: rgb(205, 214, 244);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.glass-button-secondary:hover {
		background: rgba(17, 17, 27, 0.8);
		border-color: rgba(137, 180, 250, 0.5);
		transform: translateY(-1px);
	}

	.glass-button-primary {
		background: linear-gradient(135deg, 
			rgba(137, 180, 250, 0.8) 0%, 
			rgba(116, 199, 236, 0.9) 100%
		);
		border: 1px solid rgba(137, 180, 250, 0.4);
		border-radius: 0.5rem;
		color: rgb(17, 17, 27);
		font-size: 0.875rem;
		font-weight: 600;
		box-shadow: 0 2px 8px rgba(137, 180, 250, 0.2);
	}

	.glass-button-primary:hover:not(:disabled) {
		background: linear-gradient(135deg, 
			rgba(137, 180, 250, 0.9) 0%, 
			rgba(116, 199, 236, 1) 100%
		);
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(137, 180, 250, 0.3);
	}

	.glass-button-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.glass-error {
		background: rgba(243, 139, 168, 0.1);
		border: 1px solid rgba(243, 139, 168, 0.3);
		border-radius: 0.5rem;
	}
</style>