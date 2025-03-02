<script>
    import Pill from "$ui/pill.svelte";
    import Scrollbox from "$ui/scrollbox.svelte";
    let i = $state("1");
    function increment() {
        i += "1";
    }
</script>

<div class="h-svh w-60 col-span-1 bg-crust grid grid-cols-1 grid-rows-[auto_1fr_auto]">
<!-- A button to make a new project -->
<Pill text="New Project" onclick={increment}/>
<!-- A list of recent projects -->

<Scrollbox >
    {#each Array(100) as _, i}
        <Pill text="Project a{i}"/>
    {/each}
</Scrollbox>

<!-- buttons at bottom -->
<div class="grid grid-cols-3 place-self-end">
    <!-- A clear button -->
    <Pill text="Clear"/>
    <!-- A download button -->
    <Pill text="Downlaod"/>
    <!-- A button to open the settings -->
    <Pill text="Settings"/>
</div>
</div>