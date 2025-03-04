<script lang="ts">
    import Sidebar from "./nav/sidebar.svelte";
    import ResumeEditor from "./resume/Resumeeditor.svelte";
    import Pdfpreview from "./resume/pdfpreview.svelte";
    import { jobUrl, jobDescription, keywords, navstate } from "$utils";

    if ($keywords.length === 0) {
        fetch("/ResuMate/keywords.txt")
            .then((response) => response.text())
            .then((text) => {
                // split skills by new line set all to lowercase and remove duplicates
                let textcleaned = text
                    .split("\n")
                    .map((skill) => skill.toLowerCase())
                    .filter(
                        (skill, index, self) => self.indexOf(skill) === index,
                    );
                // sort the skills by length for comparison later
                textcleaned.sort((a, b) => b.length - a.length);
                $keywords = textcleaned;
                // $keywords = text.split("\n").map((skill) => skill.toLowerCase());
            })
            .catch((err) => {
                console.log(err);
            });
    }


    function fetchContent() {
        // bypass cors for this. may remove if I dont like the safety
        fetch("https://api.cors.lol/?url=" + $jobUrl)
            .then((response) => response.text())
            .then((text) => {
                // Parse the HTML and extract meaningful text content
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                // Remove elements that typically don't contain relevant content
                const elementsToRemove = doc.querySelectorAll('script, style, header, footer, nav');
                elementsToRemove.forEach(el => el.remove());
                // Get text content from body
                const textContent = doc.body.textContent || '';
                // Clean the text by removing excessive whitespace
                const cleanedText = textContent
                    .replace(/\s+/g, ' ')
                    .trim();
                text = cleanedText;
                $jobDescription = text;
            })
            .catch((err) => {
                console.log(err);
            });
    }
</script>

<div class="flex flex-row grid-cols-[auto_1fr] w-full h-full">
    <Sidebar />
    <div class="w-full h-full">
        <div class="h-fit">
            <!-- <button
                class="bg-base px-4 py-2 mx-1 my-1 rounded-md hover:bg-overlay0 transition-all duration-200 h-10"
                onclick={() => {
                    $navstate.tab = "Resume";
                }}
            >
                Resume
            </button>
            <button
                class="bg-base px-4 py-2 mx-1 my-1 rounded-md hover:bg-overlay0 transition-all duration-200 h-10"
                onclick={() => {
                    $navstate.tab = "Job Description";
                }}
            >
                Job Editor
            </button> -->
        </div>
        {#if $navstate.mode === "Edit"}
            <div class="grid grid-cols-[1fr_1fr] w-full h-full">

                    <div class="bg-base w-full h-full">
                        <ResumeEditor />
                    </div>

                    <div>
                        <textarea class="w-full h-fit" bind:value={$jobUrl}></textarea>
                        <button onclick={fetchContent}>fetch</button>
                        <textarea class="w-full h-full" bind:value={$jobDescription}></textarea>

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
