<script lang="ts">
	/**
	 * LayoutRoot (Svelte 5 runes mode)
	 * - Sidebar (collapsible + resizable)
	 * - Topbar
	 * - Main content
	 * - Modal router (Settings, CreateProject, Project Options)
	 *
	 * Converted to:
	 *  - $state for all reactive local state
	 *  - event attributes (onclick, onmousedown, etc.) instead of on: directive
	 *  - no store $ prefix sugar (manual subscribe + setters)
	 */
	import Sidebar from "./Sidebar.svelte";
	import Topbar from "./Topbar.svelte";
	import { modalState } from "$utils";
	import Settings from "../settings.svelte";
	import CreateProjectDialog from "./CreateProjectDialog.svelte";
	import ProjectOptionsDialog from "./ProjectOptionsDialog.svelte";
	import { tick } from "svelte";

	// Callback props (kept; parent may supply)
	const {
		onNewproject = () => {},
		onSelect = () => {},
		onEditProject = () => {},
		children
	} = $props<{
		onNewproject?: () => void;
		onSelect?: (detail: { name: string; id: number }) => void;
		onEditProject?: (detail: { name: string; id: number }) => void;
		children?: import('svelte').Snippet;
	}>();

	// Modal (mirror of store)
	let modal = $state("None");
	modalState.subscribe(v => (modal = v));
	function setModal(v: string) {
		modalState.set(v);
	}

	// Sidebar layout state
	let collapsed = $state(false);
	let width = $state(288); // px
	let dragging = $state(false);
	let startX = 0;        // not referenced in template (no need for $state)
	let startWidth = 288;
	const minW = 0;
	const maxW = 480;
	let lastWidth = 288;

	function toggleSidebar() {
		if (!collapsed) {
			lastWidth = width;
			collapsed = true;
			width = 0;
			sidebarAnnouncement = "Sidebar collapsed";
		} else {
			collapsed = false;
			width = lastWidth || 288;
			sidebarAnnouncement = "Sidebar expanded";
		}
	}

	function onResizerMousedown(e: MouseEvent) {
		if (collapsed) return;
		dragging = true;
		startX = e.clientX;
		startWidth = width;
		window.addEventListener("mousemove", onResizerMousemove);
		window.addEventListener("mouseup", onResizerMouseup, { once: true });
	}

	function onResizerMousemove(e: MouseEvent) {
		if (!dragging) return;
		const delta = e.clientX - startX;
		width = Math.min(maxW, Math.max(minW, startWidth + delta));
	}

	function onResizerMouseup() {
		dragging = false;
		window.removeEventListener("mousemove", onResizerMousemove);
		if (width <= 48) {
			collapsed = true;
			width = 0;
			sidebarAnnouncement = "Sidebar collapsed";
		} else {
			if (collapsed) sidebarAnnouncement = "Sidebar expanded";
			collapsed = false;
			lastWidth = width;
		}
	}

	function onResizerDblClick() {
		toggleSidebar();
	}

	function onShowSidebar() {
		collapsed = false;
		if (width === 0) width = lastWidth || 288;
		sidebarAnnouncement = "Sidebar expanded";
	}

	function onGlobalKeydown(e: KeyboardEvent) {
		if (e.key === "Escape" && modal !== "None") {
			setModal("None");
		}
	}

	// A11y live announcement for sidebar state
	let sidebarAnnouncement = $state("");

	// Modal focus trap
	let modalContainerEl: HTMLDivElement | null = $state(null);
	let prevFocusedEl: HTMLElement | null = null;

	function getFocusable(container: HTMLElement): HTMLElement[] {
		const selectors = [
			'a[href]',
			'button:not([disabled])',
			'textarea:not([disabled])',
			'input:not([disabled]):not([type="hidden"])',
			'select:not([disabled])',
			'[tabindex]:not([tabindex="-1"])'
		].join(",");
		return Array.from(container.querySelectorAll<HTMLElement>(selectors)).filter((el) => {
			return el === container || el.offsetParent !== null;
		});
	}

	function onModalKeydown(e: KeyboardEvent) {
		if (modal === "None" || !modalContainerEl) return;
		if (e.key !== "Tab") return;

		const focusables = getFocusable(modalContainerEl);
		if (focusables.length === 0) {
			e.preventDefault();
			modalContainerEl.focus();
			return;
		}
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		const active = document.activeElement as HTMLElement | null;

		if (e.shiftKey) {
			if (active === first || !modalContainerEl.contains(active)) {
				e.preventDefault();
				last.focus();
			}
		} else {
			if (active === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	$effect(() => {
		if (modal !== "None") {
			prevFocusedEl = document.activeElement as HTMLElement | null;
			tick().then(() => {
				if (!modalContainerEl) return;
				const first = getFocusable(modalContainerEl)[0];
				(first ?? modalContainerEl).focus();
			});
		} else {
			if (prevFocusedEl) prevFocusedEl.focus();
			prevFocusedEl = null;
		}
	});
</script>

<svelte:window onkeydown={onGlobalKeydown} />
<div class="sr-only" role="status" aria-live="polite">{sidebarAnnouncement}</div>

<div class="flex flex-row w-full h-full">
	<Sidebar
		{collapsed}
		{width}
		onToggleSidebar={toggleSidebar}
		{onSelect}
		{onNewproject}
		{onEditProject}
	/>

	<!-- Vertical resizer -->
	<div
		class="glass-resizer w-1 cursor-ew-resize relative"
		role="separator"
		aria-orientation="vertical"
		aria-label="Resize sidebar"
		onmousedown={onResizerMousedown}
		ondblclick={onResizerDblClick}
		aria-hidden={collapsed}
	></div>

	<div class="flex flex-col flex-1 min-w-0 h-full">
		<Topbar {collapsed} onShowSidebar={onShowSidebar} />

		<main class="flex-1 min-h-0 overflow-hidden" tabindex="-1" aria-label="Main content">
			{@render children?.()}
		</main>

		{#if modal !== "None"}
			<!-- Modal region -->
			<div
				class="fixed inset-0 z-50 flex items-start justify-center p-8 glass-modal-backdrop"
				role="dialog"
				aria-modal="true"
				onclick={() => setModal("None")}
				bind:this={modalContainerEl}
				tabindex="0"
				onkeydown={onModalKeydown}
			>
				{#if modal === "Settings"}
					<div 
						onclick={(e) => e.stopPropagation()}
						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
						role="button"
						tabindex="0"
					>
						<Settings />
					</div>
				{:else if modal === "CreateProject"}
					<div 
						onclick={(e) => e.stopPropagation()}
						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
						role="button"
						tabindex="0"
					>
						<CreateProjectDialog />
					</div>
				{:else if modal === "Project Options"}
					<div 
						onclick={(e) => e.stopPropagation()}
						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
						role="button"
						tabindex="0"
					>
						<ProjectOptionsDialog />
					</div>
				{:else}
					<div 
						class="bg-crust p-4 rounded shadow text-text" 
						onclick={(e) => e.stopPropagation()}
						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
						role="button"
						tabindex="0"
					>
						Unimplemented modal: {modal}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.glass-resizer {
		background: linear-gradient(180deg,
			rgba(137, 180, 250, 0.1) 0%,
			rgba(137, 180, 250, 0.2) 50%,
			rgba(137, 180, 250, 0.1) 100%
		);
		transition: all 0.3s ease;
	}

	.glass-resizer:hover {
		background: linear-gradient(180deg,
			rgba(137, 180, 250, 0.2) 0%,
			rgba(137, 180, 250, 0.4) 50%,
			rgba(137, 180, 250, 0.2) 100%
		);
		width: 4px;
		box-shadow: 0 0 16px rgba(137, 180, 250, 0.3);
	}

	/* Interaction effects with background blobs */
	.glass-resizer::before {
		content: '';
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 2px;
		height: 100%;
		background: linear-gradient(180deg,
			transparent 0%,
			rgba(137, 180, 250, 0.6) 20%,
			rgba(116, 199, 236, 0.8) 50%,
			rgba(137, 180, 250, 0.6) 80%,
			transparent 100%
		);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.glass-resizer:hover::before {
		opacity: 1;
	}

	.glass-modal-backdrop {
		background: linear-gradient(135deg, 
			rgba(17, 17, 27, 0.85) 0%, 
			rgba(24, 24, 37, 0.9) 50%, 
			rgba(17, 17, 27, 0.85) 100%
		);
		backdrop-filter: saturate(180%) contrast(120%);
	}
</style>