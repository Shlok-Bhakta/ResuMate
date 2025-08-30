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
			rgba(180, 120, 250, 0.03) 0%, 
			rgba(160, 110, 240, 0.025) 30%,
			rgba(140, 100, 230, 0.02) 70%,
			rgba(180, 120, 250, 0.035) 100%
		);
		position: relative;
	}

	.glass-container::before {
		content: '';
		position: absolute;
		inset: -1px;
		padding: 1px;
		background: linear-gradient(135deg, 
			rgba(180, 120, 250, 0.15) 0%,
			rgba(203, 166, 247, 0.12) 25%,
			rgba(160, 110, 240, 0.1) 50%,
			rgba(203, 166, 247, 0.12) 75%,
			rgba(180, 120, 250, 0.15) 100%
		);
		border-radius: 8px;
		mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask-composite: subtract;
		z-index: -1;
	}

	.glass-panel {
		background: rgba(26, 20, 38, 0.25);
		color: rgb(205, 214, 244);
		position: relative;
	}

	.glass-panel::before {
		content: '';
		position: absolute;
		inset: -1px;
		padding: 1px;
		background: linear-gradient(135deg, 
			rgba(180, 120, 250, 0.15) 0%,
			rgba(203, 166, 247, 0.12) 25%,
			rgba(160, 110, 240, 0.1) 50%,
			rgba(203, 166, 247, 0.12) 75%,
			rgba(180, 120, 250, 0.15) 100%
		);
		border-radius: 8px;
		mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask-composite: subtract;
		z-index: -1;
	}

	.glass-dialog {
		background: rgba(22, 18, 32, 0.95);
		color: rgb(205, 214, 244);
		box-shadow: 0 12px 40px rgba(13, 11, 21, 0.85);
		position: relative;
	}

	.glass-dialog::before {
		content: '';
		position: absolute;
		inset: -1px;
		padding: 1px;
		background: linear-gradient(135deg, 
			rgba(180, 120, 250, 0.4) 0%,
			rgba(203, 166, 247, 0.35) 25%,
			rgba(160, 110, 240, 0.3) 50%,
			rgba(203, 166, 247, 0.35) 75%,
			rgba(180, 120, 250, 0.4) 100%
		);
		border-radius: 8px;
		mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask-composite: subtract;
		z-index: -1;
	}

	.glass-input {
		background: rgba(18, 16, 28, 0.8);
		color: rgb(205, 214, 244);
		padding: 0.5rem 0.75rem;
		border: 2px solid rgba(180, 120, 250, 0.4) !important;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.glass-input:focus {
		border-color: rgba(180, 120, 250, 0.8) !important;
		box-shadow: 0 0 0 2px rgba(180, 120, 250, 0.3);
		transition: none;
	}

	.glass-textarea {
		background: rgba(18, 16, 28, 0.85);
		color: rgb(205, 214, 244);
		padding: 1rem;
		border: 2px solid rgba(180, 120, 250, 0.4) !important;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.glass-textarea:focus {
		border-color: rgba(180, 120, 250, 0.8) !important;
		box-shadow: 0 0 0 2px rgba(180, 120, 250, 0.3);
	}

	.glass-badge {
		background: rgba(42, 38, 58, 0.85);
		border: 1px solid rgba(180, 120, 250, 0.25);
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
		background: rgba(22, 18, 32, 0.85);
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
		background: rgba(180, 120, 250, 0.35);
		border-radius: 4px;
	}

	.glass-base::-webkit-scrollbar-thumb:hover {
		background: rgba(180, 120, 250, 0.55);
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