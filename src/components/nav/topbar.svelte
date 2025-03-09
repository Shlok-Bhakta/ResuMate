<script>
    import "../fonts.css";
    import { jobName, saveCurrentProject, projectState, saveState } from "$utils";
    // import Button from "$ui/button.svelte";
    function save() {
        saveCurrentProject();
    }
</script>

<div class="flex flex-row bg-crust p-1 border-b-1 border-overlay0">
    <input class="text-text px-2 py-1 bg-mantle rounded" bind:value={$jobName}>
    <div class="relative">
        <button class="text-text px-2 py-1 ml-1 bg-mantle rounded-xs hover:bg-overlay0 border-1 border-overlay1 transition-all duration-200" onclick={() => {save()}}>
            save
        </button>
        <!-- display different icons based on the save state -->
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
    <!-- sets up template + settings + job url and stuff -->
    <button class="px-2 py-1 ml-1 {($projectState == "Content") ? "bg-blue text-mantle" : "bg-mantle text-text"} rounded text-nowrap" onclick="{() => {$projectState = "Content"}}">
        Content
    </button>
    <!-- a less than sign for subltley showing the expected process -->
    <!-- Fine tune to a set of skills -->
    <button class="px-2 py-1 ml-1 {($projectState == "Tuning") ? "bg-blue text-mantle" : "bg-mantle text-text"} rounded text-nowrap" onclick="{() => {$projectState = "Tuning"}}">
        Tuning
    </button>
    <!-- Export to PDF -->
    <button class=" px-2 py-1 ml-1 {($projectState == "Export") ? "bg-blue text-mantle" : "bg-mantle text-text"} rounded text-nowrap" onclick="{() => {$projectState = "Export"}}">
        Export
    </button>

</div>