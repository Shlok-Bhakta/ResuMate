<script>
    const props = $props();
    let cleanText = $derived((props.text.length > 13) ? props.text.substring(0, 13) + "..." : props.text);
</script>

<div class="w-full h-10 flex flex-row mx-1 my-1">

    <button
        class="overflow-x-clip bg-mantle px-4 py-2 rounded-xs hover:bg-overlay0 transition-all duration-200 h-full w-full ml-2 mr-4"
        onclick={props.onclick}
    >
        {cleanText}
    </button>
    <!-- {#if props.del}
    <button class="aspect-square bg-mantle hover:bg-overlay0 rounded-md w-10 h-10 flex flex-row justify-center items-center -ml-2 mr-2">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'%3E%3C!-- Icon from All by undefined - undefined --%3E%3Cpath fill='%23f38ba8' d='M7.616 20q-.667 0-1.141-.475T6 18.386V6h-.5q-.213 0-.356-.144T5 5.499t.144-.356T5.5 5H9q0-.31.23-.54t.54-.23h4.46q.31 0 .54.23T15 5h3.5q.213 0 .356.144t.144.357t-.144.356T18.5 6H18v12.385q0 .666-.475 1.14t-1.14.475zm2.692-3q.213 0 .357-.144t.143-.356v-8q0-.213-.144-.356T10.307 8t-.356.144t-.143.356v8q0 .213.144.356q.144.144.356.144m3.385 0q.213 0 .356-.144t.143-.356v-8q0-.213-.144-.356Q13.904 8 13.692 8q-.213 0-.357.144t-.143.356v8q0 .213.144.356t.357.144'/%3E%3C/svg%3E" alt="Trash">
    </button>
    {/if} -->
</div>
