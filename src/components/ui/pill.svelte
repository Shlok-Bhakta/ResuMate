<script>
    const props = $props();
</script>
<div class="overflow-x-clip bg-mantle px-4 py-2 mx-1 my-1 rounded-md hover:bg-overlay0 transition-all duration-200">  
    {props.text.substring(0, 13)}...
</div>