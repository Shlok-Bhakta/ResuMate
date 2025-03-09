<script>
    import Pill from "$ui/pill.svelte";
    import Scrollbox from "$ui/scrollbox.svelte";
    import Seperator from "$ui/seperator.svelte";
    import "../fonts.css";
    import {
        availableProjects,
        getProjectNames,
        loadProject,
        clearProject,
        moadalState,
    } from "$utils";

    $effect(() => {
        getProjectNames();
    });


    $inspect($moadalState);
</script>

<div
    class="h-svh w-70 col-span-1 bg-crust grid grid-cols-1 grid-rows-[auto_auto_auto_1fr_auto_auto] border-r-1 border-overlay0"
>
    <button class="flex flex-row justify-center" onclick={() => {clearProject()}}>
        <h1 class="text-blue text-3xl aspect-auto p-4 nerdfont font-bold">
            ResuMate 
        </h1>
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'%3E%3Cmask id='lineMdFileDocumentPlusFilled0'%3E%3Cg fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Cpath fill='%23fff' fill-opacity='0' stroke-dasharray='64' stroke-dashoffset='64' d='M13.5 3l5.5 5.5v11.5c0 0.55 -0.45 1 -1 1h-12c-0.55 0 -1 -0.45 -1 -1v-16c0 -0.55 0.45 -1 1 -1Z'%3E%3Canimate fill='freeze' attributeName='fill-opacity' begin='0.6s' dur='0.5s' values='0;1'/%3E%3Canimate fill='freeze' attributeName='stroke-dashoffset' dur='0.6s' values='64;0'/%3E%3C/path%3E%3Cpath fill='%23000' stroke='%23000' d='M14.5 3.5l0 4.5l4.5 0z' opacity='0'%3E%3Cset fill='freeze' attributeName='opacity' begin='0.6s' to='1'/%3E%3C/path%3E%3Cpath d='M13.5 3l5.5 5.5' opacity='0'%3E%3Cset fill='freeze' attributeName='opacity' begin='0.6s' to='1'/%3E%3C/path%3E%3Cpath stroke='%23000' stroke-dasharray='12' stroke-dashoffset='12' d='M7 13h10'%3E%3Canimate fill='freeze' attributeName='stroke-dashoffset' begin='1.1s' dur='0.2s' values='12;0'/%3E%3C/path%3E%3Cpath stroke='%23000' stroke-dasharray='8' stroke-dashoffset='8' d='M7 17h7'%3E%3Canimate fill='freeze' attributeName='stroke-dashoffset' begin='1.3s' dur='0.2s' values='8;0'/%3E%3C/path%3E%3Cpath fill='%23000' fill-opacity='0' stroke='none' d='M19 13c3.31 0 6 2.69 6 6c0 3.31 -2.69 6 -6 6c-3.31 0 -6 -2.69 -6 -6c0 -3.31 2.69 -6 6 -6Z'%3E%3Cset fill='freeze' attributeName='fill-opacity' begin='1.5s' to='1'/%3E%3C/path%3E%3Cpath stroke-dasharray='8' stroke-dashoffset='8' d='M16 19h6'%3E%3Canimate fill='freeze' attributeName='stroke-dashoffset' begin='1.5s' dur='0.2s' values='8;0'/%3E%3C/path%3E%3Cpath stroke-dasharray='8' stroke-dashoffset='8' d='M19 16v6'%3E%3Canimate fill='freeze' attributeName='stroke-dashoffset' begin='1.7s' dur='0.2s' values='8;0'/%3E%3C/path%3E%3C/g%3E%3C/mask%3E%3Crect width='24' height='24' fill='%2389b4fa' mask='url(%23lineMdFileDocumentPlusFilled0)'/%3E%3C/svg%3E" alt="Resume" class="aspect-auto w-10"/>
    </button>
    <!-- A button to make a new project -->
    <Pill
        text="New Project"
        onclick={() => {
            clearProject();
        }}
    />
    <Seperator />
    <!-- A list of recent projects -->

    <Scrollbox>
        {#await $availableProjects}
            Loading...
        {:then projects}
            {#if projects.length == 0}
                <div>Get started by creating a new project!</div>
            {:else}
                <!-- <div>{projects}</div> -->
                <!-- {#each Array(100) as i} -->
                    {#each projects as i}
                        <Pill text={i[0]} onclick={() => {loadProject(i[1])}} del={i}/>
                    {/each}
                <!-- {/each} -->
            {/if}
        {/await}
    </Scrollbox>

    <Seperator />
    <!-- buttons at bottom -->
        <Pill
            text="Settings"
            onclick={() => {
                $moadalState = $moadalState == "None" ? "Settings" : "None";
            }}
        />
</div>
