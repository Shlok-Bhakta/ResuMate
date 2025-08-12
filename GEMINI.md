# Gemini Project Context: ResuMate

This document outlines the key architectural patterns, technologies, and conventions for the ResuMate project, with a focus on the `src/components` directory.

## 1. Core Technologies

-   **Framework**: Svelte (using Svelte 5 Runes syntax: `$state`, `$effect`, etc.). The project also uses Astro, but the primary interactive components are Svelte.
-   **Language**: TypeScript.
-   **Styling**: Tailwind CSS with a custom, token-based color theme (e.g., `bg-crust`, `text-text`, `bg-blue`).
-   **State Management**: Centralized Svelte stores, persisted to IndexedDB via `@macfja/svelte-persistent-store`.
-   **Editor**: `carta-md` is used for the Markdown editing experience.
-   **Database**: Dexie.js is used for client-side database management (`src/components/utils/db.ts`). There is no server-side anything. all this runs in the browser.

## 2. Directory Focus: `src/components`

As requested, all work should primarily be contained within the `src/components` directory.

### Key Subdirectories:

-   `layout/`: Contains the main application shell components like `LayoutRoot.svelte`, `Sidebar.svelte`, and `Topbar.svelte`. This is the modern layout structure.
-   `resume/`: Holds components central to the resume creation process, such as `resumeeditor.svelte`, `displayscores.svelte`, and `pdfpreview.svelte`.
-   `utils/`: Contains the core application logic, broken into modules:
    -   `stores.ts`: Defines all reactive Svelte stores. This is the single source of truth for application state.
    -   `db.ts`: Manages all IndexedDB interactions (CRUD operations for projects, import/export).
    -   `scoring.ts`: Logic for calculating the keyword match score.
    -   `header.ts`: Logic for building the resume header from user settings.
    -   `tune.ts`: Handles the AI-based resume tuning via the OpenRouter API.
    -   `editorShortcuts.ts`: Keyboard shortcuts for the Carta editor.

### Key Files:

-   `app.svelte`: The main entry-point component that assembles the entire UI.
-   `settings.svelte`: The comprehensive settings modal.
-   `utils.svelte.ts`: A "barrel" file that re-exports all functions and stores from the `utils/` directory. This is aliased as `$utils` in the project configuration.

## 3. Architectural Patterns & Conventions

-   **State Management**: All application state (e.g., `resumeMd`, `jobDescription`, `modalState`) is managed in `src/components/utils/stores.ts`. Components should import stores from `$utils` and subscribe to them.
-   **Modularity**: Logic is decoupled from UI. Core functionality (DB, scoring, AI) resides in the `utils` directory and is exposed through the `$utils` barrel.
-   **Component Structure**: Components are written using Svelte 5 Runes. State is declared with `$state`, and side effects are managed with `$effect`.
-   **Styling**: Apply styles using Tailwind CSS utility classes directly in the Svelte components.

## 4. Naming Conventions

- Variables: camelCase
- Components: PascalCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case for non-component files

## 5. Styling

- Use Tailwind classes primarily
- Custom styles in component-specific CSS files
- Responsive design with Tailwind's breakpoints

## 6. Svelte 5 Stuff
Just gonna paste in some documentation for you (note this is sveltekit and we are using astro and everything is client side so some things may not be relevant):
New in SvelteKit 5:
# Runes
## Reactivity
Reactivity with
let x = "hello
at compontnt top-level is replaced with
let x: string = $state("hello")
This makes x reactive in the component, and also in any js functions that operate on it.
Don't use $state<T>() to pass the type. Always use let x: Type =
Variables declared with let x  = "hello" are no longer reactive.

## Derived values
Old style:
$: b = a + 1
New style:
let b = $derived(a + 1)
Or
let b = $derived.by( ( ) => {
    ....
    return  a + 1;
} )
For more complex use cases.
$derived() takes an expression. $derived.by() takes a function.
If there is a return in your expression, then use $derived.by(()=>{return 1;})

## Effect

let a = $state(1);
let b = $state(2);
let c;

// This will run when the component is mounted, and for every updates to a and b.
$effect(() => { 
    c = a + b;  // it will run if a, b, or c changes.
   untrack(()=>{console.log(d)}) // use untrack function if you don't want run the effect if that variable changes.  It will not run if d changes.
});

Note: This does not apply to values that are read asynchronously (promises, setTimeout) inside $effect, they are not tracked.
Note: Values inside the objects are not tracked inside $effect:
This will run once, because `state` is never reassigned (only mutated)
$effect(() => {
	state;
});

This will run whenever `state.value` changes...
$effect(() => {
	state.value;
});
An effect only depends on the values that it read the last time it ran.
$effect(() => {
	if (a || b) { ...}
});
If a was true, b was not read, and the effect won't run when b changes.

## Props
Old way to pass props to a component:
export let a = "hello";
export let b;
New way:
let {a = "hello", b, ...everythingElse} = $props()
a and b are reactive.
Types:
let {a = "hello", b}: {a: string, b: number} = $props()
Note: Do NOT use this syntax for types:
let { x = 42 } = $props<{ x?: string }>();

# Slots and snippets
Instead of using <slot /> in a component, you should now do
let { children } = $props()
...
{@render children()} - this replaces <slot />

# Event Handling In Svelte 5 the events do not use on:event syntax, they do onevent syntax
In Svelte 5 on:click syntax is not allowed.
Event handlers have been given a facelift in Svelte 5. Whereas in Svelte 4 we use the on: directive to attach an event listener to an element, in Svelte 5 they are properties like any other (in other words - remove the colon)
<button onclick={() => count++}>
	clicks: {count}
</button>

preventDefault and once is removed in svelte 5 . Normal HTML event management is advised
<script>
	function once(fn) {
		return function (event) {
			if (fn) fn.call(this, event);
			fn = null;
		};
	}

	function preventDefault(fn) {
		return function (event) {
			event.preventDefault();
			fn.call(this, event);
		};
	}
</script>

<button onclick={once(preventDefault(handler))}>...</button>

## 7. Aditional notes

- Architecture is a bit unique, but i dont want to have to store junk on a server that I have to upkeep and github pages is nice for that.
- I dont want to have to deal with a server, so I am using IndexedDB for persistence.
- I am using Dexie.js for IndexedDB management.
- I am using carta-md for the markdown editor. But I am ready to switch to something else honestly.
- I am using OpenRouter for the AI tuning. I need to work more on this as it is kinda in its infancy.
- More features are coming soon but for now we are just redoing the UI and stuff for cleaner code and prettier interface.
- We are using the Catppuccin Mocha theme. there is no light mode and one is not needed.
- make extra sure you are using the runes! I am more than willing to paste in some documentation so just ask.