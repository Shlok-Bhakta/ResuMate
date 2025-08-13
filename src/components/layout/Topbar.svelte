<script lang="ts">
	/**
	 * Topbar
	 * Reset action in Project Options; includes Edit / Duplicate / Save / PDF Download.
	 * Download: opens a new printable window with injected HTML + inlined stylesheet for accessibility / scraping.
	 */
	import ModeSwitcher from "./ModeSwitcher.svelte";
	import {
		saveCurrentProject,
		saveState,
		modalState,
		duplicateProject,
		projectId,
		resumeHtml,
		jobName
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

	let stylesheetContent = $state("");

	async function loadStylesheet() {
		try {
			const response = await fetch("/ResuMate/style.css");
			if (response.ok) {
				stylesheetContent = await response.text();
			} else {
				console.error("Failed to load stylesheet");
			}
		} catch (error) {
			console.error("Error loading stylesheet:", error);
		}
	}
	loadStylesheet();

	async function downloadPdf() {
		// if $resumeHtml's promise is not resolved yet, don't download
		if ($resumeHtml && stylesheetContent !== "") {
			const content = `
			         <!DOCTYPE html>
			         <html>
			         <head>
			             <style>
			                 ${stylesheetContent}
			                 body, html {
			                     margin: 0;
			                     padding: 0;
			                     height: 100%;
			                     }
			                     .pdf-page {
			                         width: 8.5in;
			                         height: 11in;
			                         background-color: white;
			                         padding-top: 0.0in;
			                         padding-left: 0.2in;
			                         padding-right: 0.2in;
			                         box-sizing: border-box;
			                         overflow: hidden;
			                         max-height: 11in;
			                     @page {
			                         size: letter;
			                         scale: 1;
			                         margin: 0;
			                         width: 8.5in;
			                         height: 11in;
			                     }
			                     
			                     .pdf-page {
			                         overflow: hidden;
			                         max-height: 11in;
			                     }

			                     }

			                     </style>
			                 </head>
			                 <body>
			                     <div class="pdf-page">${await $resumeHtml}</div>
			                 </body>
			             </html>
			         `;

			const blob = new Blob([content], {
				type: "text/html;charset=utf-8",
			});
			const url = URL.createObjectURL(blob);

			const newWindow = window.open(url, "_blank");
			if (newWindow) {
				newWindow.onload = () => {
					newWindow.document.title = $jobName || "ResuMate";
					setTimeout(() => {
						newWindow.focus();
						newWindow.print();
						// Clean up after printing
						setTimeout(() => {
							newWindow.close();
							URL.revokeObjectURL(url);
						}, 100);
					}, 100);
				};
			}
		}
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

	<!-- Project Name show -->
	<div class="w-fit nerdfont">{$jobName}</div>

	<!-- Spacer -->
	<div class="flex-1" />

	
	<!-- Mode Switcher -->
	<ModeSwitcher />

	<!-- Download PDF (prints HTML) -->
	<button
		type="button"
		onclick={downloadPdf}
		class="ml-2 px-2 py-1 rounded bg-mantle text-text text-sm hover:bg-overlay0 transition-colors"
		aria-label="Download / Print resume"
		title="Download / Print resume"
	>
		Download
	</button>
</div>

<style>
	/* Minimal top bar specific overrides (none for now). */
</style>