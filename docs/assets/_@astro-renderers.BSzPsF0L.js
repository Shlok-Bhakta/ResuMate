import 'clsx';

const HYDRATION_START = '[';
const HYDRATION_END = ']';

const BLOCK_OPEN = `<!--${HYDRATION_START}-->`;
const BLOCK_CLOSE = `<!--${HYDRATION_END}-->`;

/** @import { ComponentType, SvelteComponent } from 'svelte' */
/** @import { Component, Payload, RenderOutput } from '#server' */
/** @import { Store } from '#shared' */

/**
 * Array of `onDestroy` callbacks that should be called at the end of the server render function
 * @type {Function[]}
 */
let on_destroy = [];

function props_id_generator() {
	let uid = 1;
	return () => 's' + uid++;
}

/**
 * Only available on the server and when compiling with the `server` option.
 * Takes a component and returns an object with `body` and `head` properties on it, which you can use to populate the HTML when server-rendering your app.
 * @template {Record<string, any>} Props
 * @param {import('svelte').Component<Props> | ComponentType<SvelteComponent<Props>>} component
 * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any> }} [options]
 * @returns {RenderOutput}
 */
function render(component, options = {}) {
	const uid = props_id_generator();
	/** @type {Payload} */
	const payload = {
		out: '',
		css: new Set(),
		head: { title: '', out: '', css: new Set(), uid },
		uid
	};

	const prev_on_destroy = on_destroy;
	on_destroy = [];
	payload.out += BLOCK_OPEN;

	if (options.context) {
		push();
		/** @type {Component} */ (current_component).c = options.context;
	}

	// @ts-expect-error
	component(payload, options.props ?? {}, {}, {});

	if (options.context) {
		pop();
	}

	payload.out += BLOCK_CLOSE;
	for (const cleanup of on_destroy) cleanup();
	on_destroy = prev_on_destroy;

	let head = payload.head.out + payload.head.title;

	for (const { hash, code } of payload.css) {
		head += `<style id="${hash}">${code}</style>`;
	}

	return {
		head,
		html: payload.out,
		body: payload.out
	};
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function stringify(value) {
	return typeof value === 'string' ? value : value == null ? '' : value + '';
}

/**
 * @param {Payload} payload
 * @param {Record<string, any>} $$props
 * @param {string} name
 * @param {Record<string, unknown>} slot_props
 * @param {null | (() => void)} fallback_fn
 * @returns {void}
 */
function slot(payload, $$props, name, slot_props, fallback_fn) {
	var slot_fn = $$props.$$slots?.[name];
	// Interop: Can use snippets to fill slots
	if (slot_fn === true) {
		slot_fn = $$props['children' ];
	}

	if (slot_fn !== undefined) {
		slot_fn(payload, slot_props);
	}
}

/** @param {any} array_like_or_iterator */
function ensure_array_like(array_like_or_iterator) {
	if (array_like_or_iterator) {
		return array_like_or_iterator.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}
	return [];
}

/** @import { Component } from '#server' */

/** @type {Component | null} */
var current_component = null;

/**
 * @param {Function} [fn]
 */
function push(fn) {
	current_component = { p: current_component, c: null, d: null };
}

function pop() {
	var component = /** @type {Component} */ (current_component);

	var ondestroy = component.d;

	if (ondestroy) {
		on_destroy.push(...ondestroy);
	}

	current_component = component.p;
}

/** @import { Snippet } from 'svelte' */
/** @import { Payload } from '#server' */
/** @import { Getters } from '#shared' */

/**
 * Create a snippet programmatically
 * @template {unknown[]} Params
 * @param {(...params: Getters<Params>) => {
 *   render: () => string
 *   setup?: (element: Element) => void | (() => void)
 * }} fn
 * @returns {Snippet<Params>}
 */
function createRawSnippet(fn) {
	// @ts-expect-error the types are a lie
	return (/** @type {Payload} */ payload, /** @type {Params} */ ...args) => {
		var getters = /** @type {Getters<Params>} */ (args.map((value) => () => value));
		payload.out += fn(...getters)
			.render()
			.trim();
	};
}

function check(Component) {
	if (typeof Component !== 'function') return false;
	// Svelte 5 generated components always accept a `$$payload` prop.
	// This assumes that the SSR build does not minify it (which Astro enforces by default).
	// This isn't the best check, but the only other option otherwise is to try to render the
	// component, which is taxing. We'll leave it as a last resort for the future for now.
	return Component.toString().includes('$$payload');
}

function needsHydration(metadata) {
	// Adjust how this is hydrated only when the version of Astro supports `astroStaticSlot`
	return metadata.astroStaticSlot ? !!metadata.hydrate : true;
}

async function renderToStaticMarkup(Component, props, slotted, metadata) {
	const tagName = needsHydration(metadata) ? 'astro-slot' : 'astro-static-slot';

	let children = undefined;
	let $$slots = undefined;
	const renderProps = {};

	for (const [key, value] of Object.entries(slotted)) {
		// Legacy slot support
		$$slots ??= {};
		if (key === 'default') {
			$$slots.default = true;
			children = createRawSnippet(() => ({
				render: () => `<${tagName}>${value}</${tagName}>`,
			}));
		} else {
			$$slots[key] = createRawSnippet(() => ({
				render: () => `<${tagName} name="${key}">${value}</${tagName}>`,
			}));
		}
		// @render support for Svelte ^5.0
		const slotName = key === 'default' ? 'children' : key;
		renderProps[slotName] = createRawSnippet(() => ({
			render: () => `<${tagName}${key !== 'default' ? ` name="${key}"` : ''}>${value}</${tagName}>`,
		}));
	}

	const result = render(Component, {
		props: {
			...props,
			children,
			$$slots,
			...renderProps,
		},
	});
	return { html: result.body };
}

const _renderer0 = {
	name: '@astrojs/svelte',
	check,
	renderToStaticMarkup,
	supportsAstroStaticSlot: true,
};

const renderers = [Object.assign({"name":"@astrojs/svelte","clientEntrypoint":"@astrojs/svelte/client.js","serverEntrypoint":"@astrojs/svelte/server.js"}, { ssr: _renderer0 }),];

export { pop as a, stringify as b, ensure_array_like as e, push as p, renderers as r, slot as s };
