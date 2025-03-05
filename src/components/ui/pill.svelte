<script>
    const props = $props();
</script>

{#if props.text.length > 13}
    {#if props.onclick}
        <button
            class="overflow-x-clip bg-mantle px-4 py-2 mx-1 my-1 rounded-md hover:bg-overlay0 transition-all duration-200 h-10"
            onclick={props.onclick}
        >
            {props.text.substring(0, 13)}...
        </button>
    {:else}
        <button
            class="overflow-x-clip bg-mantle px-4 py-2 mx-1 my-1 rounded-md hover:bg-overlay0 transition-all duration-200 h-10"
        >
            {props.text.substring(0, 13)}...
        </button>
    {/if}
{:else if props.onclick}
    <button
        class="overflow-x-clip bg-mantle px-4 py-2 mx-1 my-1 rounded-md hover:bg-overlay0 transition-all duration-200 h-10"
        onclick={props.onclick}
    >
        {props.text}
    </button>
{:else}
    <button
        class="overflow-x-clip bg-mantle px-4 py-2 mx-1 my-1 rounded-md hover:bg-overlay0 transition-all duration-200 h-10"
    >
        {props.text}
    </button>
{/if}
