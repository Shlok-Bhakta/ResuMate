<script lang="ts">
    const props = $props<{
        text: string;
        onclick: () => void;
    }>();
</script>

<button class="bg-base px-4 py-2 mx-1 my-1 rounded-md hover:bg-overlay0 transition-all duration-200 h-10" onclick={props.onclick}>{props.text}</button>