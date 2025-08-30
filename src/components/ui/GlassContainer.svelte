<!-- Glass Container Component -->
<script lang="ts">
	interface Props {
		variant?: 'panel' | 'container' | 'dialog' | 'input' | 'textarea' | 'badge' | 'error' | 'success' | 'warning' | 'overlay';
		size?: 'small' | 'medium' | 'large';
		fullHeight?: boolean;
		fullWidth?: boolean;
		children?: import('svelte').Snippet;
		class?: string;
		role?: string;
		'aria-label'?: string;
		'aria-labelledby'?: string;
		'aria-describedby'?: string;
		id?: string;
		tabindex?: number;
	}

	let {
		variant = 'panel',
		size = 'medium',
		fullHeight = false,
		fullWidth = false,
		children,
		class: className = '',
		...restProps
	}: Props = $props();

	const containerClass = $derived.by(() => {
		const base = 'glass-base';
		const variantClass = `glass-${variant}`;
		const sizeClass = `glass-${size}`;
		const heightClass = fullHeight ? 'glass-full-height' : '';
		const widthClass = fullWidth ? 'glass-full-width' : '';
		
		return [base, variantClass, sizeClass, heightClass, widthClass, className].filter(Boolean).join(' ');
	});
</script>

<div
	{...restProps}
	class={containerClass}
>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.glass-base {
		border-radius: 8px;
		transition: all 0.15s ease-out;
		position: relative;
		overflow: hidden;
	}

	/* Container variants */
	.glass-container {
		background: linear-gradient(135deg, 
			rgba(137, 180, 250, 0.02) 0%, 
			rgba(116, 199, 236, 0.02) 30%,
			rgba(180, 190, 254, 0.015) 70%,
			rgba(137, 180, 250, 0.025) 100%
		);
		border: 1px solid rgba(137, 180, 250, 0.08);
	}

	.glass-panel {
		background: rgba(30, 30, 46, 0.15);
		border: 1px solid rgba(116, 199, 236, 0.08);
		color: rgb(205, 214, 244);
	}

	.glass-dialog {
		background: rgba(30, 30, 46, 0.95);
		border: 1px solid rgba(137, 180, 250, 0.3);
		color: rgb(205, 214, 244);
		box-shadow: 0 8px 32px rgba(17, 17, 27, 0.8);
	}

	.glass-input {
		background: rgba(30, 30, 46, 0.3);
		border: 1px solid rgba(116, 199, 236, 0.15);
		color: rgb(205, 214, 244);
		padding: 0.5rem 0.75rem;
	}

	.glass-input:focus-within {
		border-color: rgba(116, 199, 236, 0.4);
		box-shadow: inset 0 0 0 1px rgba(116, 199, 236, 0.3);
		transition: none;
	}

	.glass-textarea {
		background: rgba(30, 30, 46, 0.1);
		border: 1px solid rgba(116, 199, 236, 0.08);
		color: rgb(205, 214, 244);
		padding: 1rem;
	}

	.glass-textarea:focus-within {
		box-shadow: inset 0 0 0 1px rgba(137, 180, 250, 0.3);
	}

	.glass-badge {
		background: rgba(49, 50, 68, 0.8);
		border: 1px solid rgba(137, 180, 250, 0.2);
		color: rgb(205, 214, 244);
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
	}

	.glass-error {
		background: rgba(243, 139, 168, 0.1);
		border: 1px solid rgba(243, 139, 168, 0.3);
		color: rgb(243, 139, 168);
	}

	.glass-success {
		background: rgba(166, 227, 161, 0.1);
		border: 1px solid rgba(166, 227, 161, 0.3);
		color: rgb(166, 227, 161);
	}

	.glass-warning {
		background: rgba(249, 226, 175, 0.1);
		border: 1px solid rgba(249, 226, 175, 0.3);
		color: rgb(249, 226, 175);
	}

	.glass-overlay {
		background: rgba(30, 30, 46, 0.8);
		border: none;
		color: rgb(205, 214, 244);
	}

	/* Size variants */
	.glass-small {
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
	}

	.glass-medium {
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
	}

	.glass-large {
		padding: 1.5rem 2rem;
		font-size: 1rem;
	}

	/* Layout utilities */
	.glass-full-height {
		height: 100%;
	}

	.glass-full-width {
		width: 100%;
	}

	/* Input/textarea specific overrides */
	.glass-input.glass-small {
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
	}

	.glass-input.glass-medium {
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
	}

	.glass-input.glass-large {
		padding: 0.75rem 1rem;
		font-size: 1rem;
	}

	.glass-textarea.glass-small {
		padding: 0.5rem;
		font-size: 0.75rem;
	}

	.glass-textarea.glass-medium {
		padding: 1rem;
		font-size: 0.875rem;
	}

	.glass-textarea.glass-large {
		padding: 1.5rem;
		font-size: 1rem;
	}

	/* Badge specific overrides */
	.glass-badge.glass-small {
		padding: 0.125rem 0.375rem;
		font-size: 0.625rem;
	}

	.glass-badge.glass-medium {
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
	}

	.glass-badge.glass-large {
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
	}

	/* Scrollbar styling for containers */
	.glass-base::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}

	.glass-base::-webkit-scrollbar-track {
		background: transparent;
	}

	.glass-base::-webkit-scrollbar-thumb {
		background: rgba(137, 180, 250, 0.3);
		border-radius: 4px;
	}

	.glass-base::-webkit-scrollbar-thumb:hover {
		background: rgba(137, 180, 250, 0.5);
	}

	/* Placeholder styling for inputs/textareas */
	.glass-base::placeholder {
		color: rgb(108, 112, 134);
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.glass-panel,
		.glass-dialog,
		.glass-input,
		.glass-textarea {
			border-color: currentColor;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.glass-base {
			transition: none;
		}
	}

	/* Touch device optimizations */
	@media (hover: none) and (pointer: coarse) {
		.glass-input,
		.glass-textarea {
			min-height: 44px;
		}
	}
</style>