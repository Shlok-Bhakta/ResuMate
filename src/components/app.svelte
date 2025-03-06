<script lang="ts">
    import Sidebar from "./nav/sidebar.svelte";
    import ResumeEditor from "./resume/resumeeditor.svelte";
    import Pdfpreview from "./resume/pdfpreview.svelte";
    import Displayscores from "./resume/displayscores.svelte";
    import { jobUrl, jobDescription, keywords, navstate, saveCurrentProject, jobName, header, createHeader, resumeHtml, downloadDBasJSON, importIndexedDBs } from "$utils";
    import Settings from "./settings.svelte";

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

    function handleFileUpload(event: any) {
        console.log("file upload");
        console.log(event);
        if (!(event)) return;
        if (!(event.target)) return;
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                if(!(e.target)) return;
                if(!(e.target.result)) return;
                // const jsonContent = JSON.parse(e.target.result);
                if(typeof e.target.result !== "string") return;
                importIndexedDBs(e.target.result);
            } catch (error) {
                console.error("Error parsing JSON file:", error);
            }
        };
        reader.onerror = function(e) {
            console.error("Error reading file:", e);
        };
        reader.readAsText(file);
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
            <div>
                <input class="text-mantle px-2 py-1 bg-blue rounded-sm" bind:value={$jobName}>
                <button class="text-mantle px-2 py-1 bg-blue rounded-sm" onclick={() => {saveCurrentProject()}}>
                    save
                </button>
                <button class="text-mantle px-2 py-1 bg-blue rounded-sm" onclick={() => {downloadDBasJSON()}}>
                    download
                </button>
            <!-- file upload that runs importIndexedDBs with the string of the content as input-->
                <input type="file" id="file-input" accept=".json" onchange={handleFileUpload} />
            
            </div>
        </div>
        <div class="grid grid-cols-[1fr_1fr] w-full h-full">
            
            <div class="bg-base w-full h-full">
                <ResumeEditor />
            </div>
            
            <div>
                <textarea class="w-full h-fit" bind:value={$jobUrl}></textarea>
                <button onclick={fetchContent}>fetch</button>
                <textarea class="w-full h-full" bind:value={$jobDescription}></textarea>
                
            </div>
            <div>
                <Displayscores />
            </div>
            
            <div class="w-full h-full">
                {#await $resumeHtml then content}
                <Pdfpreview html={content}/>
                {/await}
            </div>
        </div>
        {#if $navstate === "None"}
        <div>
            This will be a modal
        </div>
        {:else}
            <!-- Mode To Show Settings Modal --> 
            {#if $navstate === "Settings"}
                <Settings />
            {:else if $navstate === "Project Options"}
                <div>Other Stuff</div>
            {/if}

        {/if}
    </div>
</div>
