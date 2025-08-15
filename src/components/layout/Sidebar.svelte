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
	class="glass-sidebar flex flex-col gap-4 p-4 h-svh overflow-hidden relative"
	aria-label="Primary"
	style={`width:${collapsed ? '0px' : width + 'px'}; ${collapsed ? 'padding:0;border-right-width:0' : ''}`}
	aria-hidden={collapsed}
>
	<header class="flex items-center gap-2">
		<button
			type="button"
			class="glass-icon-button p-2 text-text transition-all focus:outline-hidden focus:ring-2 focus:ring-blue/70"
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
			class="glass-button-primary px-3 py-2 rounded text-sm w-full text-left transition-all"
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
			class="glass-button px-3 py-2 rounded text-sm text-text w-full text-left transition-all"
			onclick={toggleSettings}
			aria-pressed={$modalState === "Settings"}
			aria-label="Toggle settings"
		>
			Settings
		</button>
	</footer>
</aside>

<style>
	.glass-sidebar {
		background: linear-gradient(180deg, 
			rgba(137, 180, 250, 0.05) 0%, 
			rgba(30, 30, 46, 0.03) 25%, 
			rgba(116, 199, 236, 0.02) 50%, 
			rgba(30, 30, 46, 0.04) 75%, 
			rgba(166, 227, 161, 0.03) 100%
		);
		backdrop-filter: blur(24px) saturate(180%);
		-webkit-backdrop-filter: blur(24px) saturate(180%);
		border-right: 1px solid rgba(137, 180, 250, 0.15);
		box-shadow: 
			4px 0 32px rgba(137, 180, 250, 0.05),
			inset 0 0 0 1px rgba(137, 180, 250, 0.08);
	}

	.glass-sidebar::before {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		width: 1px;
		height: 100%;
		background: linear-gradient(180deg, 
			rgba(137, 180, 250, 0.3) 0%,
			rgba(116, 199, 236, 0.2) 25%,
			transparent 50%,
			rgba(166, 227, 161, 0.2) 75%,
			rgba(137, 180, 250, 0.3) 100%
		);
	}

	.glass-sidebar::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, 
			rgba(137, 180, 250, 0.2),
			rgba(116, 199, 236, 0.3) 50%,
			rgba(137, 180, 250, 0.2)
		);
	}

	.glass-icon-button {
		background: rgba(30, 30, 46, 0.2);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(137, 180, 250, 0.15);
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.glass-icon-button {
		transition: all 0.15s ease-out;
	}

	.glass-icon-button:hover {
		background: rgba(30, 30, 46, 0.4);
		border-color: rgba(137, 180, 250, 0.3);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(137, 180, 250, 0.1);
		transition: none;
	}

	.glass-button {
		background: rgba(30, 30, 46, 0.15);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(137, 180, 250, 0.1);
		border-radius: 0.5rem;
		transition: all 0.15s ease-out;
	}

	.glass-button:hover {
		background: rgba(30, 30, 46, 0.3);
		border-color: rgba(137, 180, 250, 0.25);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(137, 180, 250, 0.1);
		transition: none;
	}

	.glass-button-primary {
		background: linear-gradient(135deg, 
			rgba(137, 180, 250, 0.5) 0%, 
			rgba(116, 199, 236, 0.6) 100%
		);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(137, 180, 250, 0.3);
		border-radius: 0.5rem;
		color: rgb(30, 30, 46);
		font-weight: 600;
		box-shadow: 0 2px 12px rgba(137, 180, 250, 0.2);
		position: relative;
		overflow: hidden;
		transition: all 0.15s ease-out;
	}

	.glass-button-primary::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, 
			transparent,
			rgba(255, 255, 255, 0.2),
			transparent
		);
		transition: left 0.3s ease;
	}

	.glass-button-primary:hover::before {
		left: 100%;
	}

	.glass-button-primary:hover {
		background: linear-gradient(135deg, 
			rgba(137, 180, 250, 0.7) 0%, 
			rgba(116, 199, 236, 0.8) 100%
		);
		transform: translateY(-2px);
		box-shadow: 0 4px 20px rgba(137, 180, 250, 0.3);
		transition: none;
	}

	/* Custom rounded corner for sidebar corner where it meets topbar */
	.glass-sidebar {
		border-top-right-radius: 16px;
		border-bottom-right-radius: 16px;
	}
</style>