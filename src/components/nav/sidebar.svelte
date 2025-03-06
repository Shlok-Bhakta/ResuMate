<script>
    import Pill from "$ui/pill.svelte";
    import Scrollbox from "$ui/scrollbox.svelte";
    import {
        availableProjects,
        getProjectNames,
        loadProject,
        clearProject,
        navstate,
    } from "$utils";
    import { get } from "svelte/store";

    $effect(() => {
        getProjectNames();
    });


    $inspect($navstate);
</script>

<div
    class="h-svh w-60 col-span-1 bg-crust grid grid-cols-1 grid-rows-[auto_1fr_auto]"
>
    <!-- A button to make a new project -->
    <Pill
        text="New Project"
        onclick={() => {
            clearProject();
        }}
    />
    <!-- A list of recent projects -->

    <Scrollbox>
        {#await $availableProjects}
            Loading...
        {:then projects}
            {#if projects.length == 0}
                <div>Get started by creating a new project!</div>
            {:else}
                <!-- <div>{projects}</div> -->
                {#each projects as i}
                    <Pill text={i[0]} onclick={() => {loadProject(i[1])}}/>
                {/each}
            {/if}
        {/await}
    </Scrollbox>

    <!-- buttons at bottom -->
    <div class="grid grid-cols-3 place-self-end">
        <!-- A clear button -->
        <Pill
            text="Refresh"
            onclick={() => {
                getProjectNames();
            }}
        />
        <!-- A download button -->
        <Pill text="Downlaod" />
        <!-- A button to open the settings -->
        <Pill
            text="Settings"
            onclick={() => {
                $navstate = $navstate == "None" ? "Settings" : "None";
            }}
        />
    </div>
</div>
