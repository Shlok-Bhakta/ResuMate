<script lang="ts">
    import Sidebar from "./nav/sidebar.svelte";
    import ResumeEditor from "./resume/resumeeditor.svelte";
    import Pdfpreview from "./resume/pdfpreview.svelte";
    import Displayscores from "./resume/displayscores.svelte";
    import { jobUrl, jobDescription, keywords, modalState, header, createHeader, resumeHtml, projectEditingStage, tuneResume, resumeMd, resumeTemplate} from "$utils";
    import Settings from "./settings.svelte";
    import Topbar from "./nav/topbar.svelte";
    import "./fonts.css";
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

    if ($header == ""){
        createHeader();
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
<button onclick={() => {console.log($keywords)}}>
    print
</button>
<div class="flex flex-row grid-cols-[auto_1fr] w-full h-full">
    <Sidebar />
    <div class="w-full h-full">
        <Topbar />
        <div class="grid grid-cols-[1fr_1fr] w-full h-full ">
            
            <div class="w-full h-full overflow-clip">
                <ResumeEditor />
            </div>
            <!-- <div class="bg-base w-full h-full">
            </div> -->
            

            {#if $projectEditingStage === "Content"}
                <div class="w-full h-full bg-crust">
                    <!-- Job Url and description -->
                    <div class="w-full h-fit bg-base p-2 rounded-xs">
                        <div class="w-full h-fit flex flex-row mb-2 gap-2">
                            <input class="text-text px-2 py-1 w-full bg-mantle rounded" bind:value={$jobUrl} placeholder="try to fetch with a link" />
                            <button class="text-text px-2 py-1 ml-1 bg-mantle rounded hover:bg-overlay0 transition-all duration-200 " onclick={fetchContent}>fetch</button>
                        </div>
                        <textarea class="w-full h-80 overflow-y-scroll bg-mantle p-2" bind:value={$jobDescription}></textarea>
                    </div>
                    <button class="text-text px-2 py-1 bg-red rounded hover:bg-overlay0 transition-all duration-200 w-full " onclick={() => {$resumeMd = $resumeTemplate }}>Reset to Template</button>
                    <!-- Future Resume Builder -->
                </div>
            {:else if $projectEditingStage === "Tuning"}
                <div>
                    <Displayscores />
                </div>
            {:else if $projectEditingStage === "Preview"}
            {#await $resumeHtml then content}
                <div>
                    <Pdfpreview html={content}/>
                </div>
            {/await}
            {/if}
        </div>
        {#if $modalState === "None"}
        <div></div>
        {:else}
            <!-- Mode To Show Settings Modal --> 
            {#if $modalState === "Settings"}
                <Settings />
            {:else if $modalState === "Project Options"}
                <div>Other Stuff</div>
            {/if}

        {/if}
    </div>
</div>
