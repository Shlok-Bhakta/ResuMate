<!--
DEPRECATED LEGACY COMPONENT: Scrollbox
Superseded by planned ScrollArea primitive (see rewrite tasks #19–#23 and theming plan).
Purpose of retention:
- Temporary reference for original overflow & scrollbar styling.
Removal Plan:
- Delete after verification phase (tasks #15 & #16) once new primitives are introduced.
Do NOT extend or rely on this component for new functionality.
Related Files:
- New layout shell: [`LayoutRoot.svelte`](src/components/layout/LayoutRoot.svelte)
- A11y checklist: [`nav-a11y-checklist.md`](nav-a11y-checklist.md)
-->
<div class="flex flex-col overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-corner-base scrollbar-thumb-overlay0 scrollbar-track-crust scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
<slot/>
</div>