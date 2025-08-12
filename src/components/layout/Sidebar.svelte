<script lang="ts">
	/**
	 * Sidebar (simplified)
	 * - Uses $modalState directly (no manual subscribe / set)
	 * - Callback props via $props
	 */
	import ProjectList from "./ProjectList.svelte";
	import { modalState } from "$utils";

	let {
		collapsed = false,
		width = 288,
		onToggleSidebar = () => {},
		onSelect = () => {},
		onNewproject = () => {},
		onEditProject = () => {}
	} = $props<{
		collapsed?: boolean;
		width?: number;
		onToggleSidebar?: () => void;
		onSelect?: (detail: { name: string; id: number }) => void;
		onNewproject?: () => void;
		onEditProject?: (detail: { name: string; id: number }) => void;
	}>();

	function openCreateDialog() {
		$modalState = "CreateProject";
		onNewproject();
	}

	function toggleSettings() {
		$modalState = $modalState === "Settings" ? "None" : "Settings";
	}
</script>

<aside
	class="flex flex-col gap-4 p-3 h-svh border-r-1 border-overlay0 bg-crust overflow-hidden"
	aria-label="Primary"
	style={`width:${collapsed ? '0px' : width + 'px'}; ${collapsed ? 'padding:0;border-right-width:0' : ''}`}
	aria-hidden={collapsed}
>
	<header class="flex items-center gap-2">
		<button
			type="button"
			class="p-1 rounded hover:bg-overlay0 transition-colors text-text focus:outline-hidden focus:ring-2 focus:ring-blue/70"
			onclick={onToggleSidebar}
			aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
			aria-expanded={!collapsed}
			title={collapsed ? "Show sidebar" : "Hide sidebar"}
		>
			<img
				src={collapsed ? "/ResuMate/icons/sidebaropen.svg" : "/ResuMate/icons/sidebarclose.svg"}
				alt=""
				class="w-5 h-5 pointer-events-none"
				aria-hidden="true"
			/>
		</button>

		<button
			type="button"
			onclick={openCreateDialog}
			class="text-left"
			aria-label="Create new project"
		>
			<h1 class="text-blue text-2xl font-bold tracking-tight">ResuMate</h1>
		</button>
	</header>

	<!-- Primary actions -->
	<div class="flex flex-col gap-2" aria-hidden={collapsed}>
		<button
			type="button"
			class="px-2 py-1 rounded text-sm bg-blue text-mantle hover:bg-sapphire transition-colors w-full text-left"
			onclick={openCreateDialog}
			aria-label="New Project"
		>
			<span class="font-semibold">New Project</span> <span aria-hidden="true">+</span>
		</button>
	</div>

	<div class="flex flex-col gap-2 flex-1 min-h-0" aria-hidden={collapsed}>
		<h2 class="text-xs uppercase tracking-wide opacity-70 px-1">Projects</h2>
		<ProjectList
			{onSelect}
			{onNewproject}
			{onEditProject}
		/>
	</div>

	<footer class="mt-auto pt-2 flex flex-col gap-2" aria-hidden={collapsed}>
		<button
			type="button"
			class="px-2 py-1 rounded text-sm bg-mantle hover:bg-overlay0 transition-colors text-text w-full text-left"
			onclick={toggleSettings}
			aria-pressed={$modalState === "Settings"}
			aria-label="Toggle settings"
		>
			Settings
		</button>
	</footer>
</aside>

<style>
	/* Resizing handled by parent. When collapsed, we hide padding/borders. */
</style>