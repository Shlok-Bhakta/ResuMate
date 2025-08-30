<script lang="ts">
	/**
	 * Topbar
	 * Reset action in Project Options; includes Edit / Duplicate / Save / PDF Download.
	 * Download: opens a new printable window with injected HTML + inlined stylesheet for accessibility / scraping.
	 */
	import ModeSwitcher from "./ModeSwitcher.svelte";
	import { calculateOptimalSpacing } from "$lib/components/utils/measurementSpacing.ts";
	import {
		saveCurrentProject,
		saveState,
		modalState,
		duplicateProject,
		projectId,
		resumeHtml,
		jobName
	} from "$utils";
	import Button from "$ui/Button.svelte";

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
			const htmlContent = await $resumeHtml;
			
			// Calculate optimal spacing using the same function as preview
			let adaptiveCSS = "";
			try {
				const result = await calculateOptimalSpacing(htmlContent, stylesheetContent);
				adaptiveCSS = result.css;
				console.log(`PDF optimal spacing: ${result.multiplier.toFixed(3)}x (estimated height: ${result.estimatedHeight}px)`);
			} catch (error) {
				console.error("Error optimizing PDF spacing:", error);
			}

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

			                     /* Adaptive spacing overrides */
			                     ${adaptiveCSS}

			                     </style>
			                 </head>
			                 <body>
			                     <div class="pdf-page">${htmlContent}</div>
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
							// newWindow.close();
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
	class="glass-topbar flex items-center gap-3 px-4 py-3 relative overflow-hidden h-12"
	role="banner"
	aria-label="Application top bar"
>
	<!-- Sidebar show when collapsed -->
	{#if collapsed}
		<Button
			variant="icon"
			size="small"
			onclick={onShowSidebar}
			aria-label="Show sidebar"
			title="Show sidebar"
		>
			{#snippet children()}
				<img
					src="/ResuMate/icons/sidebaropen.svg"
					alt=""
					aria-hidden="true"
					class="w-5 h-5 pointer-events-none"
				/>
			{/snippet}
		</Button>
	{/if}

	<!-- Project actions (Edit / Duplicate) -->
	<div class="flex items-center gap-2">
		<Button
			variant="style1"
			size="small"
			onclick={openEdit}
			aria-label="Edit project"
			title="Edit project"
		>
			{#snippet children()}
				Edit
			{/snippet}
		</Button>
		<Button
			variant="style1"
			size="small"
			onclick={onDuplicate}
			aria-label="Duplicate project"
			title="Duplicate project"
		>
			{#snippet children()}
				Duplicate
			{/snippet}
		</Button>
	</div>

	<!-- Save -->
	<div class="flex items-center gap-2">
		<Button
			variant="style2"
			size="small"
			onclick={saveProject}
			class="relative"
			aria-describedby="save-status-text"
			aria-label="Save project"
		>
			{#snippet children()}
				Save
				<span
					class={"absolute -top-1 -right-1 w-3 h-3 rounded-full " + saveStatusTone($saveState)}
					aria-hidden="true"
				></span>
			{/snippet}
		</Button>
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
	<div class="flex-1"></div>

	<!-- Project Name show -->
	<div class="w-fit nerdfont">{$jobName.length < 60 ? $jobName : $jobName.slice(0, 60) + "..."}</div>

	<!-- Spacer -->
	<div class="flex-1"></div>

	
	<!-- Mode Switcher -->
	<ModeSwitcher />

	<!-- Download PDF (prints HTML) -->
	<Button
		variant="style1"
		size="small"
		onclick={downloadPdf}
		class="ml-2"
		aria-label="Download / Print resume"
		title="Download / Print resume"
	>
		{#snippet children()}
			Download
		{/snippet}
	</Button>
</div>

<style>
	.glass-topbar {
		background: linear-gradient(135deg, 
			rgba(180, 120, 250, 0.08) 0%, 
			rgba(160, 110, 240, 0.06) 25%, 
			rgba(203, 166, 247, 0.05) 50%, 
			rgba(140, 100, 230, 0.06) 75%, 
			rgba(180, 120, 250, 0.08) 100%
		);
		border-bottom: 1px solid rgba(180, 120, 250, 0.2);
		box-shadow: 0 4px 32px rgba(0, 0, 0, 0.1);
	}

	.glass-topbar::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, 
			transparent,
			rgba(180, 120, 250, 0.35) 20%,
			rgba(203, 166, 247, 0.4) 50%,
			rgba(160, 110, 240, 0.35) 80%,
			transparent
		);
	}

	.glass-topbar::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 10%;
		right: 10%;
		height: 1px;
		background: linear-gradient(90deg, 
			transparent,
			rgba(180, 120, 250, 0.18) 50%,
			transparent
		);
	}

	.glass-button-small {
		background: rgba(30, 30, 46, 0.3);
		border: 1px solid rgba(116, 199, 236, 0.2);
		border-radius: 4px;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.15s ease-out;
	}

	.glass-button-small:hover {
		background: rgba(30, 30, 46, 0.5);
		border-color: rgba(116, 199, 236, 0.4);
		transform: translateY(-1px);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
		transition: none;
	}

	.glass-button {
		background: rgba(30, 30, 46, 0.3);
		border: 1px solid rgba(116, 199, 236, 0.15);
		border-radius: 4px;
		color: rgb(205, 214, 244);
		transition: all 0.15s ease-out;
	}

	.glass-button:hover {
		background: rgba(30, 30, 46, 0.5);
		border-color: rgba(116, 199, 236, 0.3);
		transform: translateY(-1px);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
		transition: none;
	}

	.glass-button-primary {
		background: linear-gradient(135deg, 
			rgba(137, 180, 250, 0.8) 0%, 
			rgba(116, 199, 236, 0.9) 50%,
			rgba(94, 196, 188, 0.85) 100%
		);
		border: 1px solid rgba(116, 199, 236, 0.4);
		border-radius: 4px;
		color: rgb(17, 17, 27);
		font-weight: 600;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		transition: all 0.15s ease-out;
	}

	.glass-button-primary:hover {
		background: linear-gradient(135deg, 
			rgba(137, 180, 250, 0.9) 0%, 
			rgba(116, 199, 236, 1) 50%,
			rgba(94, 196, 188, 0.95) 100%
		);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		transition: none;
	}
</style>