<script>
    import "../fonts.css";

    import Button from "$ui/button.svelte";
    let jobName = $state("banana");
</script>

<div class="flex flex-row justify-between">
    <input class="text-mantle px-2 py-1 bg-blue rounded-sm" bind:value={jobName}>
    <Button text="New Project" onclick={() => {
        console.log("new project");
    }}/>
</div>