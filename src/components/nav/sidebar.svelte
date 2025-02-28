<script>
    import Pill from "$ui/pill.svelte";
    import Scrollbox from "$ui/scrollbox.svelte";
</script>

<div class="h-svh w-60 col-span-1 bg-crust">
<!-- A button to make a new project -->
<Pill text="New Project"/>
<!-- A list of recent projects -->
<Scrollbox >
    {#each Array(1000) as _, i}
        <Pill text="Project a{i}"/>
    {/each}
</Scrollbox>

<!-- A clear button -->
<Pill text="Clear"/>
<!-- A download button -->
<Pill text="Downlaod"/>
<!-- A button to open the settings -->
<Pill text="Settings"/>
</div>