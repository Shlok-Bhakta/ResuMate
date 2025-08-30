<!-- Unified Button Component -->
<script lang="ts">
	interface Props {
		variant?: 'style1' | 'style2' | 'purple' | 'danger' | 'warning' | 'success' | 'icon';
		size?: 'small' | 'medium' | 'large';
		fullWidth?: boolean;
		loading?: boolean;
		loadingText?: string;
		children?: import('svelte').Snippet;
		onclick?: (event: MouseEvent) => void;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		'aria-label'?: string;
		'aria-busy'?: boolean;
		'aria-disabled'?: boolean;
		title?: string;
		id?: string;
		class?: string;
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

	const buttonClass = $derived.by(() => {
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
		border-radius: 8px;
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
		outline: 2px solid rgba(203, 166, 247, 0.7);
		outline-offset: 2px;
	}

	.button-base:disabled {
		cursor: not-allowed;
		opacity: 0.6;
		transform: none !important;
		box-shadow: none !important;
	}

	/* Style1 - Dark button with purple accent */
	.button-style1 {
		background: rgba(30, 30, 46, 0.4);
		border: 1px solid rgba(203, 166, 247, 0.2);
		color: rgb(205, 214, 244);
	}

	.button-style1:hover:not(:disabled) {
		background: rgba(30, 30, 46, 0.6);
		border-color: rgba(203, 166, 247, 0.4);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(203, 166, 247, 0.15);
		transition: none;
	}

	.button-style1:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 1px 4px rgba(203, 166, 247, 0.1);
	}

	/* Style2 - Purple gradient button */
	.button-style2 {
		background: linear-gradient(135deg, 
			rgba(203, 166, 247, 0.85) 0%, 
			rgba(137, 180, 250, 0.9) 30%,
			rgba(180, 190, 254, 0.88) 70%,
			rgba(203, 166, 247, 0.9) 100%
		);
		border: 1px solid rgba(203, 166, 247, 0.5);
		color: rgb(17, 17, 27);
		font-weight: 600;
		box-shadow: 0 2px 6px rgba(203, 166, 247, 0.2);
	}

	.button-style2:hover:not(:disabled) {
		background: linear-gradient(135deg, 
			rgba(203, 166, 247, 0.95) 0%, 
			rgba(137, 180, 250, 1) 30%,
			rgba(180, 190, 254, 0.98) 70%,
			rgba(203, 166, 247, 1) 100%
		);
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(203, 166, 247, 0.35);
		transition: none;
	}

	.button-style2:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(203, 166, 247, 0.25);
	}

	/* Danger variant - Red gradient */
	.button-danger {
		background: linear-gradient(135deg,
			rgba(243, 139, 168, 0.2) 0%,
			rgba(243, 139, 168, 0.15) 50%,
			rgba(210, 100, 130, 0.18) 100%
		);
		border: 1px solid rgba(243, 139, 168, 0.3);
		color: rgb(243, 139, 168);
		box-shadow: 0 1px 4px rgba(243, 139, 168, 0.1);
	}

	.button-danger:hover:not(:disabled) {
		background: linear-gradient(135deg,
			rgba(243, 139, 168, 0.25) 0%,
			rgba(243, 139, 168, 0.2) 50%,
			rgba(210, 100, 130, 0.22) 100%
		);
		border-color: rgba(243, 139, 168, 0.5);
		transform: translateY(-1px);
		box-shadow: 0 3px 12px rgba(243, 139, 168, 0.25);
	}

	.button-danger:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 1px 4px rgba(243, 139, 168, 0.15);
	}

	/* Warning variant - Orange gradient */
	.button-warning {
		background: linear-gradient(135deg,
			rgba(251, 179, 135, 0.2) 0%,
			rgba(251, 179, 135, 0.15) 50%,
			rgba(220, 140, 90, 0.18) 100%
		);
		border: 1px solid rgba(251, 179, 135, 0.3);
		color: rgb(251, 179, 135);
		box-shadow: 0 1px 4px rgba(251, 179, 135, 0.1);
	}

	.button-warning:hover:not(:disabled) {
		background: linear-gradient(135deg,
			rgba(251, 179, 135, 0.25) 0%,
			rgba(251, 179, 135, 0.2) 50%,
			rgba(220, 140, 90, 0.22) 100%
		);
		border-color: rgba(251, 179, 135, 0.5);
		transform: translateY(-1px);
		box-shadow: 0 3px 12px rgba(251, 179, 135, 0.25);
	}

	.button-warning:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 1px 4px rgba(251, 179, 135, 0.15);
	}

	/* Success variant - Green gradient */
	.button-success {
		background: linear-gradient(135deg,
			rgba(166, 227, 161, 0.2) 0%,
			rgba(166, 227, 161, 0.15) 50%,
			rgba(130, 190, 125, 0.18) 100%
		);
		border: 1px solid rgba(166, 227, 161, 0.3);
		color: rgb(166, 227, 161);
		box-shadow: 0 1px 4px rgba(166, 227, 161, 0.1);
	}

	.button-success:hover:not(:disabled) {
		background: linear-gradient(135deg,
			rgba(166, 227, 161, 0.25) 0%,
			rgba(166, 227, 161, 0.2) 50%,
			rgba(130, 190, 125, 0.22) 100%
		);
		border-color: rgba(166, 227, 161, 0.5);
		transform: translateY(-1px);
		box-shadow: 0 3px 12px rgba(166, 227, 161, 0.25);
	}

	.button-success:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 1px 4px rgba(166, 227, 161, 0.15);
	}

	/* Purple variant - Purple gradient */
	.button-purple {
		background: linear-gradient(135deg,
			rgba(203, 166, 247, 0.2) 0%,
			rgba(203, 166, 247, 0.15) 50%,
			rgba(170, 130, 200, 0.18) 100%
		);
		border: 1px solid rgba(203, 166, 247, 0.3);
		color: rgb(203, 166, 247);
		box-shadow: 0 1px 4px rgba(203, 166, 247, 0.1);
	}

	.button-purple:hover:not(:disabled) {
		background: linear-gradient(135deg,
			rgba(203, 166, 247, 0.25) 0%,
			rgba(203, 166, 247, 0.2) 50%,
			rgba(170, 130, 200, 0.22) 100%
		);
		border-color: rgba(203, 166, 247, 0.5);
		transform: translateY(-1px);
		box-shadow: 0 3px 12px rgba(203, 166, 247, 0.25);
	}

	.button-purple:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 1px 4px rgba(203, 166, 247, 0.15);
	}

	/* Icon variant */
	.button-icon {
		background: rgba(17, 17, 27, 0.6);
		border: 1px solid rgba(203, 166, 247, 0.3);
		color: rgb(205, 214, 244);
		padding: 0.4rem;
		border-radius: 8px;
	}

	.button-icon:hover:not(:disabled) {
		background: rgba(17, 17, 27, 0.8);
		border-color: rgba(203, 166, 247, 0.5);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(203, 166, 247, 0.2);
	}

	.button-icon:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 1px 4px rgba(203, 166, 247, 0.15);
	}

	/* Size variants */
	.button-small {
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		min-height: 1.75rem;
	}

	.button-medium {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		min-height: 2rem;
	}

	.button-large {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		min-height: 2.5rem;
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
			background: rgb(203, 166, 247);
			border-color: rgb(180, 190, 254);
		}
		
		.button-purple {
			border-color: currentColor;
		}
		
		.button-icon {
			border-color: currentColor;
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