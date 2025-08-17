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
	class="glass-topbar flex items-center gap-3 px-4 py-3 relative overflow-hidden h-12"
	role="banner"
	aria-label="Application top bar"
>
	<!-- Sidebar show when collapsed -->
	{#if collapsed}
		<button
			type="button"
			onclick={onShowSidebar}
			class="glass-button-small p-2 text-text transition-all focus:outline-hidden focus:ring-2 focus:ring-blue/70"
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
			class="glass-button px-3 py-2 text-text text-sm transition-all"
			aria-label="Edit project"
			title="Edit project"
		>
			Edit
		</button>
		<button
			type="button"
			onclick={onDuplicate}
			class="glass-button px-3 py-2 text-text text-sm transition-all"
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
			class="glass-button-primary px-3 py-2 text-sm transition-all relative"
			aria-describedby="save-status-text"
			aria-label="Save project"
		>
			Save
			<span
				class={"absolute -top-1 -right-1 w-3 h-3 rounded-full " + saveStatusTone($saveState)}
				aria-hidden="true"
			></span>
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
	<div class="flex-1"></div>

	<!-- Project Name show -->
	<div class="w-fit nerdfont">{$jobName.length < 60 ? $jobName : $jobName.slice(0, 60) + "..."}</div>

	<!-- Spacer -->
	<div class="flex-1"></div>

	
	<!-- Mode Switcher -->
	<ModeSwitcher />

	<!-- Download PDF (prints HTML) -->
	<button
		type="button"
		onclick={downloadPdf}
		class="glass-button px-3 py-2 text-text text-sm transition-all ml-2"
		aria-label="Download / Print resume"
		title="Download / Print resume"
	>
		Download
	</button>
</div>

<style>
	.glass-topbar {
		background: linear-gradient(135deg, 
			rgba(137, 180, 250, 0.08) 0%, 
			rgba(116, 199, 236, 0.06) 25%, 
			rgba(166, 227, 161, 0.04) 50%, 
			rgba(250, 179, 135, 0.06) 75%, 
			rgba(243, 139, 168, 0.08) 100%
		);
		border-bottom: 1px solid rgba(137, 180, 250, 0.2);
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
			rgba(137, 180, 250, 0.3) 20%,
			rgba(116, 199, 236, 0.4) 50%,
			rgba(137, 180, 250, 0.3) 80%,
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
			rgba(137, 180, 250, 0.15) 50%,
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