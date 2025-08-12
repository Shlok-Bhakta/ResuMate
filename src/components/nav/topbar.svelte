<!--
DEPRECATED LEGACY COMPONENT: Topbar
Replaced by rewritten components:
- New Topbar: [`Topbar.svelte`](src/components/layout/Topbar.svelte)
- Integrated Shell: [`LayoutRoot.svelte`](src/components/layout/LayoutRoot.svelte)
- App integration: [`app.svelte`](src/components/app.svelte)

Do NOT extend this legacy file. It is retained temporarily for reference and will be removed after rewrite tasks #15 & #16 complete (see a11y checklist: [`nav-a11y-checklist.md`](nav-a11y-checklist.md)).

Functional differences vs new implementation:
- Lacks labeled project name input.
- Tooltip hack via ::before, no aria-live status text (dot only).
- Mode switching via multiple buttons (not proper tab semantics).
- Inline download component (will be reintroduced post-rewrite).
-->
<script>
  import "../fonts.css";
  import {
    jobName,
    saveCurrentProject,
    projectEditingStage,
    saveState,
    resumeHtml,
    resumeTemplate,
    resumeMd,
  } from "$utils";
  import Download from "./download.svelte";
  function save() {
    saveCurrentProject();
  }
  let modes = ["Content", "Tuning", "Preview"];
</script>

<div class="flex flex-row bg-crust p-1 border-b-1 border-overlay0">
  <button
    class="text-text px-2 py-1 mr-1 bg-mantle rounded-xs hover:bg-overlay0 transition-all duration-200 flex flex-row items-center justify-center gap-2 group relative before:content-[attr(data-tooltip)] before:absolute before:px-1.5 before:py-0.5 before:left-1/2 before:-translate-x-1/2 before:top-full before:mt-1 before:whitespace-nowrap before:rounded before:bg-crust before:text-xs before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200 before:z-50"
    onclick={() => {
      $resumeMd = $resumeTemplate;
    }}
    data-tooltop="Reset to resume to template"
  >
    Reset
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-5 h-5"
      viewBox="0 0 24 24"
      ><path
        fill="currentColor"
        d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z"
      /></svg
    >
  </button>

  <input
    class="text-text px-2 py-1 bg-mantle rounded"
    placeholder="Project Name"
    bind:value={$jobName}
  />
  <div class="relative">
    <button
      class="text-text px-2 py-1 ml-1 bg-mantle rounded-xs hover:bg-overlay0 transition-all duration-200 flex flex-row items-center justify-center gap-2 group relative before:content-[attr(data-tooltip)] before:absolute before:px-1.5 before:py-0.5 before:left-1/2 before:-translate-x-1/2 before:top-full before:mt-1 before:whitespace-nowrap before:rounded before:bg-crust before:text-xs before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200 before:z-50"
      onclick={() => {
        save();
      }}
      data-tooltip={$saveState === -1
        ? "Error Saving: Try changing the name of the project and trying again"
        : $saveState === 0
          ? "Currently saving..."
          : "Saved successfully!"}
    >
      Save
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5"
        viewBox="0 0 24 24"
        ><!-- Icon from All by undefined - undefined --><path
          fill="currentColor"
          d="M14 24v-2h8v2zm4-3l-4-4l1.4-1.4l1.6 1.6v-4.175h2V17.2l1.6-1.6L22 17zM6 20q-.825 0-1.412-.587T4 18V4q0-.825.588-1.412T6 2h7l6 6v3.025h-7V20zm6-11h5l-5-5z"
        /></svg
      >
    </button>
    <div class="absolute -top-1 -right-1">
      {#if $saveState === -1}
        <div class="bg-red rounded-full w-3 h-3"></div>
      {:else if $saveState === 0}
        <div class="bg-yellow rounded-full w-3 h-3"></div>
      {:else if $saveState === 1}
        <div class="bg-green rounded-full w-3 h-3"></div>
      {:else if $saveState === 2}
        <div class="bg-green rounded-full w-3 h-3"></div>
      {/if}
    </div>
  </div>

  <div class="w-full"></div>
  {#each modes as mode}
    <button
      class="px-2 py-1 {$projectEditingStage == mode
        ? 'bg-blue text-mantle hover:bg-sapphire'
        : 'bg-mantle text-text hover:bg-overlay0'} rounded text-nowrap transition-all duration-200 group flex flex-row justify-center items-center gap-2"
      onclick={() => {
        $projectEditingStage = mode;
      }}
    >
      {mode}
      {#if mode === "Content"}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          viewBox="0 0 24 24"
          ><path
            class={$projectEditingStage == mode ? "fill-mantle" : "fill-text"}
            d="M3 21v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21zM17.6 7.8L19 6.4L17.6 5l-1.4 1.4z"
          /></svg
        >
      {:else if mode === "Tuning"}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          viewBox="0 0 24 24"
          ><path
            class={$projectEditingStage == mode ? "fill-mantle" : "fill-text"}
            d="M8.267 1.618a.75.75 0 0 1 1.027-.264l.832.492l9.247 5.307a.75.75 0 1 1-.747 1.301l-.843-.484l-1.505 2.598l-.002-.002l-2.558-1.471a.75.75 0 1 0-.748 1.3l2.556 1.47l-.961 1.66l-.002-.001l-4.203-2.418a.75.75 0 1 0-.748 1.3l4.2 2.417l-.885 1.529l-.002-.002l-2.613-1.503a.75.75 0 0 0-.748 1.3l2.611 1.502l-1.12 1.932a4.86 4.86 0 0 1-6.628 1.77a4.827 4.827 0 0 1-1.776-6.605L9.373 3.143l-.006-.003l-.836-.494a.75.75 0 0 1-.264-1.028M20 17c1.105 0 2-.933 2-2.083c0-.72-.783-1.681-1.37-2.3a.86.86 0 0 0-1.26 0c-.587.619-1.37 1.58-1.37 2.3c0 1.15.895 2.083 2 2.083"
          /></svg
        >
      {:else if mode === "Preview"}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          viewBox="0 0 24 24"
          ><path
            class={$projectEditingStage == mode ? "fill-mantle" : "fill-text"}
            d="M6 23H3q-.825 0-1.412-.587T1 21v-3h2v3h3zm12 0v-2h3v-3h2v3q0 .825-.587 1.413T21 23zm-6-4.5q-3 0-5.437-1.775T3 12q1.125-2.95 3.563-4.725T12 5.5t5.438 1.775T21 12q-1.125 2.95-3.562 4.725T12 18.5m0-3q1.45 0 2.475-1.025T15.5 12t-1.025-2.475T12 8.5T9.525 9.525T8.5 12t1.025 2.475T12 15.5m0-2q-.625 0-1.062-.437T10.5 12t.438-1.062T12 10.5t1.063.438T13.5 12t-.437 1.063T12 13.5M1 6V3q0-.825.588-1.412T3 1h3v2H3v3zm20 0V3h-3V1h3q.825 0 1.413.588T23 3v3z"
          /></svg
        >
      {/if}
    </button>
    <img
      src="https://api.iconify.design/material-symbols:arrow-right-rounded.svg?color=%237f849c"
      alt="arrow"
      class="w-6 h-6 place-self-center"
    />
  {/each}

  <Download />
</div>
