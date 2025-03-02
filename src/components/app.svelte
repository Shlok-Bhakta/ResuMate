<script lang="ts">   
import Sidebar from './nav/sidebar.svelte';
import CodeEditor from './resume/codeeditor.svelte';    
import Pdfpreview from "./resume/pdfpreview.svelte";
import { content } from "$utils";
let mode = $state("Edit");
</script>

<div class="flex flex-row grid-cols-[auto_1fr] w-full h-full">
    <Sidebar/>
    <div class="w-full h-full">
        {#if mode === "Edit"}
            <div class="grid grid-cols-[1fr_1fr] w-full h-full">
                <div class="bg-base w-full h-full">
                    <CodeEditor/>
                </div>
                <!-- <div class="w-full h-full">
                    {#await content.html then content}
                        <Pdfpreview html={content}/>
                    {/await}
                </div> -->
            </div>
        {:else}
            <div>Other Stuff</div>
        {/if}
    </div>


</div>