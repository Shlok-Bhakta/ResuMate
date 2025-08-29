<!-- Unified Button Component -->
<script lang="ts">
	import type { ComponentProps } from 'svelte';

	interface Props extends Omit<ComponentProps<'button'>, 'class'> {
		variant?: 'style1' | 'style2' | 'danger' | 'warning' | 'success' | 'icon';
		size?: 'small' | 'medium' | 'large';
		fullWidth?: boolean;
		loading?: boolean;
		loadingText?: string;
		children?: import('svelte').Snippet;
		onclick?: (event: MouseEvent) => void;
	}

	let {
		variant = 'style1',
		size = 'medium',
		fullWidth = false,
		loading = false,
		loadingText = 'Loading...',
		disabled = false,
		type = 'button',
		onclick,
		children,
		...restProps
	}: Props = $props();

	const handleClick = (event: MouseEvent) => {
		if (!disabled && !loading && onclick) {
			onclick(event);
		}
	};

	const buttonClass = $derived(() => {
		const base = 'button-base';
		const variantClass = `button-${variant}`;
		const sizeClass = `button-${size}`;
		const widthClass = fullWidth ? 'button-full-width' : '';
		
		return [base, variantClass, sizeClass, widthClass].filter(Boolean).join(' ');
	});
</script>

<button
	{...restProps}
	{type}
	class={buttonClass}
	disabled={disabled || loading}
	onclick={handleClick}
	aria-busy={loading}
	aria-disabled={disabled || loading}
>
	{#if loading}
		<span class="loading-spinner" aria-hidden="true"></span>
		{loadingText}
	{:else if children}
		{@render children()}
	{/if}
</button>

<style>
	.button-base {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		border-radius: 4px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease-out;
		outline: none;
		position: relative;
		overflow: hidden;
		text-decoration: none;
		user-select: none;
	}

	.button-base:focus-visible {
		outline: 2px solid rgba(137, 180, 250, 0.7);
		outline-offset: 2px;
	}

	.button-base:disabled {
		cursor: not-allowed;
		opacity: 0.6;
		transform: none !important;
		box-shadow: none !important;
	}

	/* Style1 - Dark button */
	.button-style1 {
		background: rgba(30, 30, 46, 0.3);
		border: 1px solid rgba(116, 199, 236, 0.15);
		color: rgb(205, 214, 244);
	}

	.button-style1:hover:not(:disabled) {
		background: rgba(30, 30, 46, 0.5);
		border-color: rgba(116, 199, 236, 0.3);
		transform: translateY(-1px);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
		transition: none;
	}

	.button-style1:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
	}

	/* Style2 - Blue gradient button */
	.button-style2 {
		background: linear-gradient(135deg, 
			rgba(137, 180, 250, 0.8) 0%, 
			rgba(116, 199, 236, 0.9) 50%,
			rgba(94, 196, 188, 0.85) 100%
		);
		border: 1px solid rgba(116, 199, 236, 0.4);
		color: rgb(17, 17, 27);
		font-weight: 600;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}

	.button-style2:hover:not(:disabled) {
		background: linear-gradient(135deg, 
			rgba(137, 180, 250, 0.9) 0%, 
			rgba(116, 199, 236, 1) 50%,
			rgba(94, 196, 188, 0.95) 100%
		);
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(137, 180, 250, 0.3);
		transition: none;
	}

	.button-style2:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(137, 180, 250, 0.2);
	}

	/* Danger variant */
	.button-danger {
		background: rgba(243, 139, 168, 0.15);
		border: 1px solid rgba(243, 139, 168, 0.3);
		color: rgb(243, 139, 168);
	}

	.button-danger:hover:not(:disabled) {
		background: rgba(243, 139, 168, 0.2);
		border-color: rgba(243, 139, 168, 0.5);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(243, 139, 168, 0.2);
	}

	.button-danger:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 1px 4px rgba(243, 139, 168, 0.15);
	}

	/* Warning variant */
	.button-warning {
		background: rgba(251, 179, 135, 0.15);
		border: 1px solid rgba(251, 179, 135, 0.3);
		color: rgb(251, 179, 135);
	}

	.button-warning:hover:not(:disabled) {
		background: rgba(251, 179, 135, 0.2);
		border-color: rgba(251, 179, 135, 0.5);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(251, 179, 135, 0.2);
	}

	.button-warning:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 1px 4px rgba(251, 179, 135, 0.15);
	}

	/* Success variant */
	.button-success {
		background: rgba(166, 227, 161, 0.15);
		border: 1px solid rgba(166, 227, 161, 0.3);
		color: rgb(166, 227, 161);
	}

	.button-success:hover:not(:disabled) {
		background: rgba(166, 227, 161, 0.2);
		border-color: rgba(166, 227, 161, 0.5);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(166, 227, 161, 0.2);
	}

	.button-success:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 1px 4px rgba(166, 227, 161, 0.15);
	}

	/* Icon variant */
	.button-icon {
		background: rgba(17, 17, 27, 0.6);
		border: 1px solid rgba(137, 180, 250, 0.3);
		color: rgb(205, 214, 244);
		padding: 0.5rem;
		border-radius: 4px;
	}

	.button-icon:hover:not(:disabled) {
		background: rgba(17, 17, 27, 0.8);
		border-color: rgba(137, 180, 250, 0.5);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.button-icon:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
	}

	/* Size variants */
	.button-small {
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		min-height: 2rem;
	}

	.button-medium {
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		min-height: 2.5rem;
	}

	.button-large {
		padding: 1rem 1.5rem;
		font-size: 1rem;
		min-height: 3rem;
	}

	/* Full width */
	.button-full-width {
		width: 100%;
	}

	/* Loading spinner */
	.loading-spinner {
		width: 1em;
		height: 1em;
		border: 2px solid transparent;
		border-top: 2px solid currentColor;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.button-style1 {
			border-color: currentColor;
		}
		
		.button-style2 {
			background: rgb(137, 180, 250);
			border-color: rgb(116, 199, 236);
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.button-base {
			transition: none;
		}
		
		.button-base:hover:not(:disabled) {
			transform: none;
		}
		
		.loading-spinner {
			animation: none;
		}
	}

	/* Touch device optimizations */
	@media (hover: none) and (pointer: coarse) {
		.button-base {
			min-height: 44px; /* Minimum touch target size */
			padding: 0.75rem 1rem;
		}
		
		.button-small {
			min-height: 44px;
			padding: 0.75rem 1rem;
		}
	}
</style>